from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from io import BytesIO
from urllib.parse import quote
from uuid import uuid4

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/infraestrutura", tags=["infraestrutura"])

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "condominio-docs")

INFRA_ITEMS_KEY = "infraestrutura/itens.json"
INFRA_IMAGE_PREFIX = "infraestrutura/imagens/"
INFRA_DEMO_ITEMS: list[dict[str, str]] = []


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


def _sanitize_filename(filename: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]", "_", filename)


def _image_download_path(key: str) -> str:
    return f"/api/infraestrutura/imagem?key={quote(key)}"


def _load_items(client) -> list[dict]:
    try:
        response = client.get_object(Bucket=MINIO_BUCKET_NAME, Key=INFRA_ITEMS_KEY)
        payload = json.loads(response["Body"].read().decode("utf-8"))
        items = payload.get("items", [])
        if not isinstance(items, list):
            return []
        normalized = []
        for item in items:
            if not isinstance(item, dict):
                continue
            normalized.append(
                {
                    "id": str(item.get("id") or uuid4()),
                    "title": str(item.get("title") or ""),
                    "description": str(item.get("description") or ""),
                    "imageKey": str(item.get("imageKey") or ""),
                    "createdAt": str(item.get("createdAt") or datetime.now(tz=timezone.utc).isoformat()),
                    "updatedAt": str(item.get("updatedAt") or datetime.now(tz=timezone.utc).isoformat()),
                }
            )
        return normalized
    except ClientError as err:
        code = str(err.response.get("Error", {}).get("Code", ""))
        if code in {"NoSuchKey", "404", "NotFound"}:
            return []
        raise


def _save_items(client, items: list[dict]) -> None:
    content = json.dumps({"items": items, "updatedAt": datetime.now(tz=timezone.utc).isoformat()}, ensure_ascii=False).encode("utf-8")
    client.put_object(
        Bucket=MINIO_BUCKET_NAME,
        Key=INFRA_ITEMS_KEY,
        Body=BytesIO(content),
        ContentLength=len(content),
        ContentType="application/json",
    )


@router.get("/items")
def list_infra_items():
    if not _is_configured():
        items = []
        for item in INFRA_DEMO_ITEMS:
            item_copy = dict(item)
            if item_copy.get("imageKey"):
                item_copy["imageUrl"] = _image_download_path(item_copy["imageKey"])
            else:
                item_copy["imageUrl"] = "/img/viva-sobre.jpg"
            items.append(item_copy)
        return {"items": items, "demo": True}

    try:
        client = _create_s3_client()
        _ensure_bucket(client)
        items = _load_items(client)
        for item in items:
            item["imageUrl"] = _image_download_path(item["imageKey"]) if item.get("imageKey") else None
        return {"items": items}
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao listar infraestrutura: {err}") from err


@router.post("/upload-imagem")
async def upload_infra_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo invalido")

    timestamp = int(datetime.now(tz=timezone.utc).timestamp() * 1000)
    safe_name = _sanitize_filename(file.filename)
    key = f"{INFRA_IMAGE_PREFIX}{timestamp}-{safe_name}"
    content = await file.read()

    if not _is_configured():
        return {
            "success": True,
            "demo": True,
            "key": key,
            "imageUrl": "/img/viva-sobre.jpg",
            "originalName": file.filename,
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
                "type": "infraestrutura_imagem",
            },
        )
        return {
            "success": True,
            "key": key,
            "imageUrl": _image_download_path(key),
            "originalName": file.filename,
        }
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload da imagem: {err}") from err


@router.post("/items")
async def create_infra_item(payload: dict | None = None):
    data = payload or {}
    title = str(data.get("title") or "").strip()
    description = str(data.get("description") or "").strip()
    image_key = str(data.get("imageKey") or "").strip()

    if not title:
        raise HTTPException(status_code=400, detail="Titulo obrigatorio")
    if not description:
        raise HTTPException(status_code=400, detail="Descricao obrigatoria")

    now = datetime.now(tz=timezone.utc).isoformat()
    item = {
        "id": str(uuid4()),
        "title": title,
        "description": description,
        "imageKey": image_key,
        "createdAt": now,
        "updatedAt": now,
    }

    if not _is_configured():
        INFRA_DEMO_ITEMS.append(item)
        item["imageUrl"] = "/img/viva-sobre.jpg" if not image_key else _image_download_path(image_key)
        return {"success": True, "item": item, "demo": True}

    try:
        client = _create_s3_client()
        _ensure_bucket(client)
        items = _load_items(client)
        items.append(item)
        _save_items(client, items)
        item["imageUrl"] = _image_download_path(image_key) if image_key else None
        return {"success": True, "item": item}
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao criar item: {err}") from err


@router.put("/items/{item_id}")
async def update_infra_item(item_id: str, payload: dict | None = None):
    data = payload or {}
    title = str(data.get("title") or "").strip()
    description = str(data.get("description") or "").strip()
    image_key = str(data.get("imageKey") or "").strip()

    if not title:
        raise HTTPException(status_code=400, detail="Titulo obrigatorio")
    if not description:
        raise HTTPException(status_code=400, detail="Descricao obrigatoria")

    if not _is_configured():
        for item in INFRA_DEMO_ITEMS:
            if item["id"] == item_id:
                item["title"] = title
                item["description"] = description
                item["imageKey"] = image_key
                item["updatedAt"] = datetime.now(tz=timezone.utc).isoformat()
                item["imageUrl"] = "/img/viva-sobre.jpg" if not image_key else _image_download_path(image_key)
                return {"success": True, "item": item, "demo": True}
        raise HTTPException(status_code=404, detail="Item nao encontrado")

    try:
        client = _create_s3_client()
        _ensure_bucket(client)
        items = _load_items(client)
        for item in items:
            if item["id"] == item_id:
                item["title"] = title
                item["description"] = description
                item["imageKey"] = image_key
                item["updatedAt"] = datetime.now(tz=timezone.utc).isoformat()
                _save_items(client, items)
                item["imageUrl"] = _image_download_path(image_key) if image_key else None
                return {"success": True, "item": item}
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    except HTTPException:
        raise
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar item: {err}") from err


@router.delete("/items/{item_id}")
def delete_infra_item(item_id: str):
    if not _is_configured():
        before = len(INFRA_DEMO_ITEMS)
        INFRA_DEMO_ITEMS[:] = [item for item in INFRA_DEMO_ITEMS if item["id"] != item_id]
        if len(INFRA_DEMO_ITEMS) == before:
            raise HTTPException(status_code=404, detail="Item nao encontrado")
        return {"success": True, "demo": True}

    try:
        client = _create_s3_client()
        _ensure_bucket(client)
        items = _load_items(client)
        filtered = [item for item in items if item["id"] != item_id]
        if len(filtered) == len(items):
            raise HTTPException(status_code=404, detail="Item nao encontrado")
        _save_items(client, filtered)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao excluir item: {err}") from err


@router.get("/imagem")
def download_infra_image(key: str = Query(...)):
    if not key.startswith(INFRA_IMAGE_PREFIX):
        raise HTTPException(status_code=400, detail="Chave de imagem invalida")

    if not _is_configured():
        raise HTTPException(status_code=400, detail="MinIO nao configurado")

    try:
        client = _create_s3_client()
        response = client.get_object(Bucket=MINIO_BUCKET_NAME, Key=key)
        content_type = response.get("ContentType", "application/octet-stream")
        headers = {"Cache-Control": "public, max-age=60"}
        return StreamingResponse(response["Body"], media_type=content_type, headers=headers)
    except Exception as err:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao carregar imagem: {err}") from err
