# Post

Módulo raiz da mensageria do Lyv, estruturado como serviço de domínio (similar a `zios`, `tas`, `mercurio`).

## Estrutura

- `post/api/router.py`: contratos FastAPI do mensageiro (`/v1/message/send` e websocket `/v1/message/ws/{recipient_id}`).
- `post/__init__.py`: marca o pacote de domínio.

## Objetivo

Centralizar a lógica do ecossistema Post em uma pasta própria, mantendo compatibilidade com os pontos de integração já existentes.
