from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app import store

ReservaStatus = Literal["confirmada", "pendente", "cancelada"]

router = APIRouter(prefix="/api/reservas", tags=["reservas"])


class ReservaCreate(BaseModel):
    espacoId: str
    date: str
    startTime: str
    endTime: str
    unit: str


@router.get("/espacos")
def list_espacos():
    return {"items": store.ESPACOS}


@router.get("")
def list_reservas(
    unit: str | None = Query(default=None),
    date: str | None = Query(default=None),
):
    items = store.RESERVAS.copy()
    if unit:
        items = [r for r in items if r["unit"] == unit]
    if date:
        items = [r for r in items if r["date"] == date]
    return {"items": items}


@router.post("")
def create_reserva(payload: ReservaCreate):
    espaco_exists = any(e["id"] == payload.espacoId for e in store.ESPACOS)
    if not espaco_exists:
        raise HTTPException(status_code=400, detail="Espaco invalido")

    new_id = store.next_id("r", [r["id"] for r in store.RESERVAS])
    record = {
        "id": new_id,
        "espacoId": payload.espacoId,
        "date": payload.date,
        "startTime": payload.startTime,
        "endTime": payload.endTime,
        "status": "pendente",
        "unit": payload.unit,
    }
    store.RESERVAS.append(record)
    return record


@router.patch("/{reserva_id}/cancel")
def cancel_reserva(reserva_id: str):
    reserva = next((r for r in store.RESERVAS if r["id"] == reserva_id), None)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva nao encontrada")
    reserva["status"] = "cancelada"
    return reserva
