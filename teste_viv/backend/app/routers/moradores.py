from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app import store

router = APIRouter(prefix="/api/moradores", tags=["moradores"])


@router.get("")
def list_moradores(
    search: str | None = Query(default=None),
    block: str | None = Query(default=None),
):
    items = store.MORADORES.copy()

    if search:
        term = search.lower()

        def _match(item: dict) -> bool:
            if term in item["name"].lower() or term in item["unit"].lower():
                return True
            return any(term in v["plate"].lower() for v in item["vehicles"])

        items = [m for m in items if _match(m)]

    if block and block != "todos":
        items = [m for m in items if m["block"] == block]

    unique_blocks = sorted({m["block"] for m in store.MORADORES})
    total_vehicles = sum(len(m["vehicles"]) for m in store.MORADORES)

    return {
        "items": items,
        "summary": {
            "totalMoradores": len(store.MORADORES),
            "blocks": unique_blocks,
            "totalVehicles": total_vehicles,
        },
    }


@router.get("/{morador_id}")
def get_morador(morador_id: str):
    morador = next((m for m in store.MORADORES if m["id"] == morador_id), None)
    if not morador:
        raise HTTPException(status_code=404, detail="Morador nao encontrado")
    return morador
