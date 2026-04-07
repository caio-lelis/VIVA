from __future__ import annotations

import os
import re
from datetime import datetime, timezone
from io import BytesIO
from typing import Literal
from urllib.parse import quote

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

from app import store

BoletoStatus = Literal["pago", "pendente", "vencido"]

router = APIRouter(prefix="/api/financeiro", tags=["financeiro"])

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "condominio-docs")
OCR_PROVIDER = os.getenv("OCR_PROVIDER", "mock")
AI_PROVIDER = os.getenv("AI_PROVIDER", "mock")

DATE_REF_RE = re.compile(r"^(0[1-9]|1[0-2])-\d{4}$")
AMOUNT_RE = re.compile(r"(\d+[\.,]\d{2})")


def _is_configured() -> bool:
    return bool(MINIO_ENDPOINT and MINIO_ACCESS_KEY and MINIO_SECRET_KEY)


def _create_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=MINIO_ENDPOINT,
        aws_access_key_id=MINIO_ACCESS_KEY,
        aws_secret_access_key=MINIO_SECRET_KEY,
        region_name="us-east-1",
        config=Config(s3={"addressing_style": "path"}),
    )


def _ensure_bucket(client) -> None:
    try:
        client.head_bucket(Bucket=MINIO_BUCKET_NAME)
    except ClientError as err:
        code = str(err.response.get("Error", {}).get("Code", ""))
        if code in {"404", "NoSuchBucket", "NotFound"}:
            client.create_bucket(Bucket=MINIO_BUCKET_NAME)
        else:
            raise


def _validate_date_ref(date_ref: str) -> str:
    cleaned = date_ref.strip()
    if not DATE_REF_RE.match(cleaned):
        raise HTTPException(status_code=400, detail="date_ref invalido. Use MM-AAAA")
    return cleaned


def _sanitize_filename(filename: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]", "_", filename)


def _notes_prefix(date_ref: str) -> str:
    return f"notas_fiscais{date_ref}/"


def _format_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.1f} MB"


def _escape_pdf_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_pdf_report(lines: list[str]) -> bytes:
    stream_lines = ["BT", "/F1 12 Tf", "50 790 Td", "16 TL"]
    for line in lines:
        stream_lines.append(f"({_escape_pdf_text(line[:150])}) Tj")
        stream_lines.append("T*")
    stream_lines.append("ET")
    stream = "\n".join(stream_lines).encode("latin-1", errors="replace")

    objects: list[bytes] = []
    objects.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    objects.append(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    objects.append(
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n"
    )
    objects.append(b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    objects.append(
        f"5 0 obj\n<< /Length {len(stream)} >>\nstream\n".encode("ascii")
        + stream
        + b"\nendstream\nendobj\n"
    )

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)

    xref_start = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))

    pdf.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n".encode("ascii")
    )
    return bytes(pdf)


def _extract_mock_ocr_text(content: bytes, content_type: str | None, fallback_name: str) -> str:
    if content_type and content_type.startswith("text/"):
        text = content.decode("utf-8", errors="ignore")[:500].strip()
        if text:
            return text.replace("\n", " ")
    return f"OCR nao configurado para {fallback_name}. Configure OCR_PROVIDER para integrar API real."


def _extract_amount(text: str) -> float | None:
    match = AMOUNT_RE.search(text)
    if not match:
        return None
    raw = match.group(1).replace(".", "").replace(",", ".")
    try:
        return float(raw)
    except ValueError:
        return None


@router.get("/boletos")
def list_boletos(status: BoletoStatus | None = Query(default=None)):
    items = store.BOLETOS.copy()
    if status:
        items = [b for b in items if b["status"] == status]
    return {"items": items}


@router.get("/extrato")
def list_extrato():
    return {"items": store.EXTRATO}


@router.get("/resumo")
def resumo_financeiro():
    pending_amount = sum(b["amount"] for b in store.BOLETOS if b["status"] in {"pendente", "vencido"})
    paid_this_year = sum(b["amount"] for b in store.BOLETOS if b["status"] == "pago")

    return {
        "pendingAmount": pending_amount,
        "paidThisYear": paid_this_year,
        "monthlyFee": 850.0,
    }


@router.get("/notas-fiscais/meses")
def list_nota_fiscal_months():
    if not _is_configured():
        now = datetime.now(tz=timezone.utc)
        return {"items": [now.strftime("%m-%Y")], "demo": True}

    try:
        client = _create_s3_client()
        _ensure_bucket(client)
        prefixes: set[str] = set()
        paginator = client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=MINIO_BUCKET_NAME, Prefix="notas_fiscais"):
            for item in page.get("Contents", []):
                key = item.get("Key", "")
                match = re.match(r"^notas_fiscais(\d{2}-\d{4})/", key)
                if match:
                    prefixes.add(match.group(1))
        return {"items": sorted(prefixes)}
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao listar meses: {err}") from err


@router.get("/notas-fiscais")
def list_notas_fiscais(date_ref: str = Query(...)):
    parsed_date_ref = _validate_date_ref(date_ref)
    prefix = _notes_prefix(parsed_date_ref)

    if not _is_configured():
        return {"dateRef": parsed_date_ref, "directory": prefix, "items": [], "demo": True}

    try:
        client = _create_s3_client()
        _ensure_bucket(client)
        paginator = client.get_paginator("list_objects_v2")
        items = []
        for page in paginator.paginate(Bucket=MINIO_BUCKET_NAME, Prefix=prefix):
            for obj in page.get("Contents", []):
                key = obj["Key"]
                if key.endswith("/"):
                    continue
                filename = key.split("/", 1)[-1]
                last_modified = obj.get("LastModified")
                items.append(
                    {
                        "key": key,
                        "fileName": filename,
                        "size": obj.get("Size", 0),
                        "sizeLabel": _format_size(obj.get("Size", 0)),
                        "lastModified": last_modified.isoformat() if last_modified else None,
                        "downloadPath": f"/api/financeiro/notas-fiscais/download?key={quote(key)}",
                    }
                )

        items.sort(key=lambda item: item.get("lastModified") or "", reverse=True)
        return {"dateRef": parsed_date_ref, "directory": prefix, "items": items}
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao listar notas fiscais: {err}") from err


@router.post("/notas-fiscais/upload")
async def upload_nota_fiscal(
    file: UploadFile = File(...),
    date_ref: str = Form(...),
):
    parsed_date_ref = _validate_date_ref(date_ref)
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo invalido")

    timestamp = int(datetime.now(tz=timezone.utc).timestamp() * 1000)
    safe_name = _sanitize_filename(file.filename)
    key = f"{_notes_prefix(parsed_date_ref)}{timestamp}-{safe_name}"
    content = await file.read()

    if not _is_configured():
        return {
            "success": True,
            "demo": True,
            "message": "Upload efetuado em modo demonstracao",
            "data": {
                "dateRef": parsed_date_ref,
                "directory": _notes_prefix(parsed_date_ref),
                "key": key,
                "originalName": file.filename,
                "size": len(content),
                "type": file.content_type or "application/octet-stream",
            },
        }

    try:
        client = _create_s3_client()
        _ensure_bucket(client)
        client.put_object(
            Bucket=MINIO_BUCKET_NAME,
            Key=key,
            Body=content,
            ContentType=file.content_type or "application/octet-stream",
            Metadata={
                "originalName": file.filename,
                "uploadedAt": datetime.now(tz=timezone.utc).isoformat(),
                "dateRef": parsed_date_ref,
                "folder": _notes_prefix(parsed_date_ref),
            },
        )
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro no upload: {err}") from err

    return {
        "success": True,
        "message": "Nota fiscal enviada com sucesso",
        "data": {
            "dateRef": parsed_date_ref,
            "directory": _notes_prefix(parsed_date_ref),
            "key": key,
            "originalName": file.filename,
            "size": len(content),
            "type": file.content_type or "application/octet-stream",
        },
    }


@router.get("/notas-fiscais/download")
def download_nota_fiscal(key: str = Query(...)):
    if not _is_configured():
        raise HTTPException(status_code=400, detail="MinIO nao configurado")

    if not key.startswith("notas_fiscais") and not key.startswith("relatorios_financeiros"):
        raise HTTPException(status_code=400, detail="Chave de arquivo invalida")

    try:
        client = _create_s3_client()
        response = client.get_object(Bucket=MINIO_BUCKET_NAME, Key=key)
        content_type = response.get("ContentType", "application/octet-stream")
        filename = key.split("/")[-1]
        headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"}
        return StreamingResponse(response["Body"], media_type=content_type, headers=headers)
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao baixar arquivo: {err}") from err


@router.post("/notas-fiscais/gerar-relatorio")
def gerar_relatorio_notas_fiscais(date_ref: str = Query(...)):
    parsed_date_ref = _validate_date_ref(date_ref)
    prefix = _notes_prefix(parsed_date_ref)

    if not _is_configured():
        return {
            "success": False,
            "message": "MinIO nao configurado. Relatorio indisponivel em modo demo.",
            "dateRef": parsed_date_ref,
        }

    try:
        client = _create_s3_client()
        _ensure_bucket(client)

        list_response = client.list_objects_v2(Bucket=MINIO_BUCKET_NAME, Prefix=prefix)
        objects = [obj for obj in list_response.get("Contents", []) if not obj["Key"].endswith("/")]
        if not objects:
            raise HTTPException(status_code=404, detail="Nenhuma nota fiscal encontrada para este mes")

        extracted_items = []
        total_detected = 0.0

        for obj in objects:
            key = obj["Key"]
            file_name = key.split("/")[-1]
            object_response = client.get_object(Bucket=MINIO_BUCKET_NAME, Key=key)
            raw_content = object_response["Body"].read()
            content_type = object_response.get("ContentType", "application/octet-stream")

            extracted_text = _extract_mock_ocr_text(raw_content, content_type, file_name)
            amount = _extract_amount(extracted_text)
            if amount is not None:
                total_detected += amount

            extracted_items.append(
                {
                    "fileName": file_name,
                    "contentType": content_type,
                    "detectedAmount": amount,
                    "ocrSnippet": extracted_text[:180],
                }
            )

        summary_text = (
            f"Resumo gerado por AI provider '{AI_PROVIDER}' (modo mock). "
            f"Foram processadas {len(extracted_items)} notas fiscais para {parsed_date_ref}."
        )

        timestamp = datetime.now(tz=timezone.utc)
        lines = [
            "RELATORIO FINANCEIRO - NOTAS FISCAIS",
            f"Referencia: {parsed_date_ref}",
            f"Gerado em: {timestamp.strftime('%d/%m/%Y %H:%M:%S UTC')}",
            "",
            summary_text,
            f"Valor total detectado (regex): R$ {total_detected:.2f}",
            "",
            "Detalhamento por arquivo:",
        ]

        for idx, item in enumerate(extracted_items, start=1):
            detected = f"R$ {item['detectedAmount']:.2f}" if item["detectedAmount"] is not None else "Nao detectado"
            lines.append(f"{idx}. {item['fileName']} | Valor: {detected}")
            lines.append(f"   OCR: {item['ocrSnippet']}")

        pdf_data = _build_pdf_report(lines)

        report_key = f"relatorios_financeiros/{parsed_date_ref}/relatorio-{timestamp.strftime('%Y%m%d-%H%M%S')}.pdf"
        client.put_object(
            Bucket=MINIO_BUCKET_NAME,
            Key=report_key,
            Body=BytesIO(pdf_data),
            ContentLength=len(pdf_data),
            ContentType="application/pdf",
            Metadata={
                "dateRef": parsed_date_ref,
                "reportType": "notas_fiscais",
                "ocrProvider": OCR_PROVIDER,
                "aiProvider": AI_PROVIDER,
                "generatedAt": timestamp.isoformat(),
            },
        )

        return {
            "success": True,
            "dateRef": parsed_date_ref,
            "directory": prefix,
            "ocrProvider": OCR_PROVIDER,
            "aiProvider": AI_PROVIDER,
            "processedFiles": len(extracted_items),
            "totalDetectedAmount": round(total_detected, 2),
            "summary": summary_text,
            "report": {
                "key": report_key,
                "downloadPath": f"/api/financeiro/notas-fiscais/download?key={quote(report_key)}",
            },
            "items": extracted_items,
        }
    except HTTPException:
        raise
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatorio: {err}") from err
