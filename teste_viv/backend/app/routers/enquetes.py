from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app import store

EnqueteStatus = Literal["ativa", "encerrada"]

router = APIRouter(prefix="/api/enquetes", tags=["enquetes"])


class VoteInput(BaseModel):
    optionId: str


@router.get("")
def list_enquetes(status: EnqueteStatus | None = Query(default=None)):
    items = store.ENQUETES.copy()
    if status:
        items = [e for e in items if e["status"] == status]

    return {
        "items": items,
        "activeCount": sum(1 for e in store.ENQUETES if e["status"] == "ativa"),
    }


@router.get("/{enquete_id}")
def get_enquete(enquete_id: str):
    enquete = next((e for e in store.ENQUETES if e["id"] == enquete_id), None)
    if not enquete:
        raise HTTPException(status_code=404, detail="Enquete nao encontrada")
    return enquete


@router.post("/{enquete_id}/vote")
def vote(enquete_id: str, payload: VoteInput):
    enquete = next((e for e in store.ENQUETES if e["id"] == enquete_id), None)
    if not enquete:
        raise HTTPException(status_code=404, detail="Enquete nao encontrada")
    if enquete["status"] != "ativa":
        raise HTTPException(status_code=400, detail="Enquete encerrada")
    if enquete["userVoted"]:
        raise HTTPException(status_code=400, detail="Usuario ja votou")

    option = next((o for o in enquete["options"] if o["id"] == payload.optionId), None)
    if not option:
        raise HTTPException(status_code=400, detail="Opcao invalida")

    option["votes"] += 1
    enquete["totalVotes"] += 1
    enquete["userVoted"] = True
    enquete["userVote"] = payload.optionId
    return enquete
