from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Query

from app import store

RelatorioCategory = Literal["consumo", "financeiro", "manutencao"]

router = APIRouter(prefix="/api/relatorios", tags=["relatorios"])


@router.get("")
def list_relatorios(category: RelatorioCategory | None = Query(default=None)):
    items = store.RELATORIOS.copy()
    if category:
        items = [r for r in items if r["category"] == category]
    return {"items": items}


@router.get("/consumo")
def get_consumo_data():
    return {"items": store.CONSUMO_DATA}


@router.get("/visao-geral")
def get_overview():
    data = store.CONSUMO_DATA
    agua_variation = ((data[-1]["agua"] - data[-2]["agua"]) / data[-2]["agua"]) * 100
    energia_variation = ((data[-1]["energia"] - data[-2]["energia"]) / data[-2]["energia"]) * 100

    return {
        "stats": {
            "aguaAtual": data[-1]["agua"],
            "aguaVariacaoPct": round(agua_variation, 2),
            "energiaAtual": data[-1]["energia"],
            "energiaVariacaoPct": round(energia_variation, 2),
            "manutencoesMes": 12,
            "saldoCaixa": 45320.0,
        },
        "consumo": data,
    }
