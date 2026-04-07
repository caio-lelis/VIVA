from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app import store

AvisoType = Literal["urgente", "importante", "informativo"]

router = APIRouter(prefix="/api/avisos", tags=["avisos"])


class AvisoCreate(BaseModel):
    title: str
    content: str
    type: AvisoType = "informativo"
    pinned: bool = False


@router.get("")
def list_avisos(
    type: AvisoType | None = Query(default=None),
    only_unread: bool = Query(default=False),
):
    items = store.AVISOS.copy()
    if type:
        items = [a for a in items if a["type"] == type]
    if only_unread:
        items = [a for a in items if not a["read"]]

    items.sort(key=lambda a: (not a["pinned"], a["date"]), reverse=True)
    return {
        "items": items,
        "unreadCount": sum(1 for a in store.AVISOS if not a["read"]),
    }


@router.get("/{aviso_id}")
def get_aviso(aviso_id: str):
    aviso = next((a for a in store.AVISOS if a["id"] == aviso_id), None)
    if not aviso:
        raise HTTPException(status_code=404, detail="Aviso nao encontrado")
    return aviso


@router.post("")
def create_aviso(payload: AvisoCreate):
    new_id = store.next_id("", [a["id"] for a in store.AVISOS])
    record = {
        "id": new_id,
        "title": payload.title,
        "content": payload.content,
        "type": payload.type,
        "date": store.today_iso(),
        "pinned": payload.pinned,
        "read": False,
    }
    store.AVISOS.insert(0, record)
    return record


@router.patch("/{aviso_id}/read")
def mark_as_read(aviso_id: str):
    aviso = next((a for a in store.AVISOS if a["id"] == aviso_id), None)
    if not aviso:
        raise HTTPException(status_code=404, detail="Aviso nao encontrado")

    aviso["read"] = True
    return aviso
