# 🐦 GORJEIO: SUPRA-MESSENGER ECOSYSTEM

Este documento traduz a visão de produto para decisões implementáveis no stack atual.

## 1. Visão

Gorjeio é um mensageiro de **estado dual**:
- **Cloud Mode:** máxima conveniência e sincronização.
- **Secret Mode:** foco em privacidade com criptografia ponta a ponta.

## 2. Design System "Neo-Mint"

- Surface: `#FFFFFF`
- Sub-surface: `#F5F7F6`
- Primary Action: `#00C853`
- Cloud indicator: azul sutil
- Secret indicator: borda verde-esmeralda

No MVP atual, essas convenções já foram aplicadas na UI principal de `templates/gorjeio/index_gorjeio.html`.

## 3. Segurança

### Transporte
- TLS 1.3 obrigatório em produção.
- Pinning de certificado para apps móveis/desktop.

### Secret Mode (roadmap)
- Double Ratchet por conversa/dispositivo.
- Rotação de chaves por mensagem (forward secrecy).
- Metadata stripping no roteamento secreto.

## 4. Back-end de alta concorrência (FastAPI Core)

Implementado no MVP:
- Endpoint: `POST /v1/message/send`
- Headers: `Authorization`, `X-Gorjeio-Mode`, `X-ZIOS-Intelligent`
- Payload base64 com timer efêmero.
- WebSocket: `/v1/message/ws/{recipient_id}`

Escala prevista:
- Redis Pub/Sub para fanout em múltiplas instâncias.
- Kubernetes para autoscaling.

## 5. Front-end/Cliente

MVP web atual inclui:
- Inbox + painel de chat em tempo real.
- Indicador visual Cloud/Secret.
- Digitação em tempo real.
- Mensagens lidas.

Roadmap:
- Flutter (mobile)
- Tauri/Rust (desktop)
- SQLCipher (local-first encrypted DB)

## 6. Integração ZIOS

Por header `X-ZIOS-Intelligent: True`, o envio pode acionar rotas de processamento contextual sem persistir dados sensíveis.

## 7. Exemplo de requisição

```http
POST /v1/message/send
Authorization: Bearer <JWT_TOKEN>
X-Gorjeio-Mode: Secret
X-ZIOS-Intelligent: True
Content-Type: application/json
```

```json
{
  "recipient_id": "1f4ad8a4-5d72-4eb6-b9cd-1d38b6c84f64",
  "content_type": "text/encrypted_blob",
  "payload": "QmFzZTY0X0VuY29kZWRfRGF0YQ==",
  "ephemeral_timer": 3600
}
```

## 8. Roadmap

### Fase 1 — Core
- [x] UI Neo-Mint no Gorjeio web
- [x] API FastAPI de envio com modo Cloud/Secret
- [x] WebSocket de eventos base
- [ ] Handshake Double Ratchet

### Fase 2 — Ecossistema
- [ ] ZIOS Vocal Engine on-device
- [ ] Desktop com sync de chaves por QR
- [ ] Voz/vídeo de baixa latência

### Fase 3 — Mesh
- [ ] Bluetooth/Wi-Fi Direct offline
- [ ] Integração educacional NioCortex

## 9. Licença

Propriedade intelectual do projeto/organização mantenedora.
