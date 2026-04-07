from __future__ import annotations

import os
import re
from datetime import datetime, timezone

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.routers.avisos import router as avisos_router
from app.routers.chamados import router as chamados_router
from app.routers.dashboard import router as dashboard_router
from app.routers.enquetes import router as enquetes_router
from app.routers.financeiro import router as financeiro_router
from app.routers.moradores import router as moradores_router
from app.routers.relatorios import router as relatorios_router
from app.routers.reservas import router as reservas_router

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "condominio-docs")
APP_PORT = int(os.getenv("PORT", "8000"))

app = FastAPI(title="Condominio Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(avisos_router)
app.include_router(chamados_router)
app.include_router(enquetes_router)
app.include_router(financeiro_router)
app.include_router(moradores_router)
app.include_router(reservas_router)
app.include_router(relatorios_router)


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


def _sanitize_filename(filename: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]", "_", filename)


def _ensure_bucket(client) -> None:
    try:
        client.head_bucket(Bucket=MINIO_BUCKET_NAME)
    except ClientError as err:
        code = str(err.response.get("Error", {}).get("Code", ""))
        if code in {"404", "NoSuchBucket", "NotFound"}:
            client.create_bucket(Bucket=MINIO_BUCKET_NAME)
        else:
            raise


@app.get("/api/health")
def health():
    return {"status": "ok", "port": APP_PORT}


@app.get("/api/upload")
def upload_info():
    return {
        "message": "API de upload de arquivos do condomínio",
        "endpoints": {"POST": "Enviar arquivo para o MinIO"},
        "config": {
            "bucket": MINIO_BUCKET_NAME,
            "endpoint": MINIO_ENDPOINT,
            "minioConfigured": _is_configured(),
        },
    }


@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form("outros"),
    service: str = Form("outros"),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nenhum arquivo enviado")

    timestamp = int(datetime.now(tz=timezone.utc).timestamp() * 1000)
    safe_name = _sanitize_filename(file.filename)
    key = f"{folder}/{timestamp}-{safe_name}"

    content = await file.read()

    if not _is_configured():
        return {
            "success": True,
            "message": "Arquivo enviado com sucesso (modo demonstração)",
            "demo": True,
            "data": {
                "key": key,
                "originalName": file.filename,
                "size": len(content),
                "type": file.content_type or "application/octet-stream",
                "service": service,
                "folder": folder,
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
                "service": service,
                "folder": folder,
            },
        )
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao enviar arquivo: {err}") from err

    return {
        "success": True,
        "message": "Arquivo enviado com sucesso",
        "data": {
            "key": key,
            "originalName": file.filename,
            "size": len(content),
            "type": file.content_type or "application/octet-stream",
            "service": service,
            "folder": folder,
        },
    }
