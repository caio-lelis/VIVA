from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app import store

ChamadoStatus = Literal["aberto", "em_andamento", "concluido", "cancelado"]
ChamadoCategory = Literal["hidraulica", "eletrica", "estrutural", "limpeza", "outros"]

router = APIRouter(prefix="/api/chamados", tags=["chamados"])


class ChamadoCreate(BaseModel):
    title: str
    description: str
    category: ChamadoCategory
    location: str
    unit: str


class ChamadoStatusUpdate(BaseModel):
    status: ChamadoStatus


@router.get("")
def list_chamados(
    status: ChamadoStatus | None = Query(default=None),
    unit: str | None = Query(default=None),
):
    items = store.CHAMADOS.copy()
    if status:
        items = [c for c in items if c["status"] == status]
    if unit:
        items = [c for c in items if c["unit"] == unit]
    return {
        "items": items,
        "openCount": sum(1 for c in store.CHAMADOS if c["status"] in {"aberto", "em_andamento"}),
    }


@router.get("/{chamado_id}")
def get_chamado(chamado_id: str):
    chamado = next((c for c in store.CHAMADOS if c["id"] == chamado_id), None)
    if not chamado:
        raise HTTPException(status_code=404, detail="Chamado nao encontrado")
    return chamado


@router.post("")
def create_chamado(payload: ChamadoCreate):
    new_id = store.next_id("c", [c["id"] for c in store.CHAMADOS])
    record = {
        "id": new_id,
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "status": "aberto",
        "location": payload.location,
        "createdAt": store.today_iso(),
        "updatedAt": store.today_iso(),
        "unit": payload.unit,
    }
    store.CHAMADOS.insert(0, record)
    return record


@router.patch("/{chamado_id}/status")
def update_status(chamado_id: str, payload: ChamadoStatusUpdate):
    chamado = next((c for c in store.CHAMADOS if c["id"] == chamado_id), None)
    if not chamado:
        raise HTTPException(status_code=404, detail="Chamado nao encontrado")

    chamado["status"] = payload.status
    chamado["updatedAt"] = store.today_iso()
    return chamado
