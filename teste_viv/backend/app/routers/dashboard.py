from __future__ import annotations

from fastapi import APIRouter

from app import store

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard():
    unique_units = {(m["block"], m["unit"]) for m in store.MORADORES}
    chamados_abertos = sum(1 for c in store.CHAMADOS if c["status"] in {"aberto", "em_andamento"})
    return {
        "modules": store.MODULES,
        "recentActivity": store.RECENT_ACTIVITY,
        "summary": {
            "unidades": len(unique_units),
            "moradores": len(store.MORADORES),
            "chamadosAbertos": chamados_abertos,
            "documentos": 27,
        },
    }
