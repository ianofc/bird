
from gorjeio.api.router import router

__all__ = ["router"]
=======
from __future__ import annotations

import base64
import os
from datetime import datetime, timezone
from typing import Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Header, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

router = APIRouter(prefix="/v1/message", tags=["Gorjeio Supra-Messenger"])


class SendMessagePayload(BaseModel):
    recipient_id: UUID
    content_type: str = Field(default="text/encrypted_blob")
    payload: str = Field(min_length=1)
    ephemeral_timer: int = Field(default=0, ge=0, le=604800)


class SendMessageResponse(BaseModel):
    message_id: UUID
    mode: Literal["Secret", "Cloud"]
    zios_intelligent: bool
    accepted_at: datetime
    expires_at: datetime | None
    delivery_channel: Literal["redis_pubsub", "in_memory_mock"]


class ConnectionManager:
    """Gerencia conexões websocket por recipient_id (MVP em memória)."""

    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, recipient_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(recipient_id, []).append(websocket)

    def disconnect(self, recipient_id: str, websocket: WebSocket):
        if recipient_id not in self.active:
            return
        self.active[recipient_id] = [ws for ws in self.active[recipient_id] if ws is not websocket]
        if not self.active[recipient_id]:
            del self.active[recipient_id]

    async def fanout(self, recipient_id: str, message: dict):
        for ws in self.active.get(recipient_id, []):
            await ws.send_json(message)


manager = ConnectionManager()


def _validate_bearer(auth_header: str | None) -> str:
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization Bearer token ausente ou inválido.")
    token = auth_header.split(" ", 1)[1].strip()
    if len(token) < 16:
        raise HTTPException(status_code=401, detail="JWT inválido.")
    return token


def _is_base64_payload(value: str) -> bool:
    try:
        base64.b64decode(value, validate=True)
        return True
    except Exception:
        return False


@router.post("/send", response_model=SendMessageResponse)
async def send_message(
    body: SendMessagePayload,
    authorization: str | None = Header(default=None, alias="Authorization"),
    x_gorjeio_mode: Literal["Secret", "Cloud"] = Header(default="Cloud", alias="X-Gorjeio-Mode"),
    x_zios_intelligent: Literal["True", "False"] = Header(default="False", alias="X-ZIOS-Intelligent"),
):
    """
    Endpoint de envio conforme a spec do Gorjeio Supra-Messenger.

    Segurança/validação MVP:
    - Bearer token obrigatório
    - payload precisa ser Base64
    - modo Secret exige payload criptografado (simulado por content_type)
    """

    _validate_bearer(authorization)

    if not _is_base64_payload(body.payload):
        raise HTTPException(status_code=422, detail="payload deve ser Base64 válido.")

    if x_gorjeio_mode == "Secret" and "encrypted" not in body.content_type:
        raise HTTPException(
            status_code=422,
            detail="No modo Secret, content_type deve indicar blob criptografado.",
        )

    accepted_at = datetime.now(timezone.utc)
    expires_at = None
    if body.ephemeral_timer > 0:
        expires_at = datetime.fromtimestamp(
            accepted_at.timestamp() + body.ephemeral_timer,
            tz=timezone.utc,
        )

    message_id = uuid4()

    await manager.fanout(
        str(body.recipient_id),
        {
            "event": "message.created",
            "message_id": str(message_id),
            "mode": x_gorjeio_mode,
            "zios_intelligent": x_zios_intelligent == "True",
            "content_type": body.content_type,
            "accepted_at": accepted_at.isoformat(),
            "expires_at": expires_at.isoformat() if expires_at else None,
        },
    )

    return SendMessageResponse(
        message_id=message_id,
        mode=x_gorjeio_mode,
        zios_intelligent=(x_zios_intelligent == "True"),
        accepted_at=accepted_at,
        expires_at=expires_at,
        delivery_channel="redis_pubsub" if os.getenv("REDIS_URL") else "in_memory_mock",
    )


@router.websocket("/ws/{recipient_id}")
async def message_ws(websocket: WebSocket, recipient_id: str):
    token = websocket.query_params.get("token")
    if not token or len(token) < 16:
        await websocket.close(code=4401)
        return

    await manager.connect(recipient_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            event = data.get("event", "ping")
            if event == "ping":
                await websocket.send_json({"event": "pong", "ts": datetime.now(timezone.utc).isoformat()})
            elif event == "typing":
                await manager.fanout(
                    recipient_id,
                    {
                        "event": "typing.started",
                        "at": datetime.now(timezone.utc).isoformat(),
                    },
                )
    except WebSocketDisconnect:
        manager.disconnect(recipient_id, websocket)

