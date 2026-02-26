# Gorjeio

Módulo raiz da mensageria do Bird, estruturado como serviço de domínio (similar a `zios`, `tas`, `mercurio`).

## Estrutura

- `gorjeio/api/router.py`: contratos FastAPI do mensageiro (`/v1/message/send` e websocket `/v1/message/ws/{recipient_id}`).
- `gorjeio/__init__.py`: marca o pacote de domínio.

## Objetivo

Centralizar a lógica do ecossistema Gorjeio em uma pasta própria, mantendo compatibilidade com os pontos de integração já existentes.
