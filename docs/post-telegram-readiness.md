# Post → Mensageiro em tempo real (estilo Telegram)

## Diagnóstico rápido do estado atual

Com base no código atual do Lyv/ZIOS:

- A tela `Messages` já tem UI de conversa, contatos e input, mas depende de dados/funções (`users`, `messages`, `sendMessage`) que não existem no `LyvContext` atual.
- A tela `Notifications` também depende de `notifications` e `markNotificationRead`, igualmente ausentes no `LyvContext`.
- O backend `zios/main.py` não possui endpoints de mensagens nem WebSocket/SSE.
- O arquivo `zios/routers/v1/interaction.py` está vazio.

**Conclusão:** o Post hoje é uma interface visual de chat, mas ainda não é um sistema de mensageria funcional em tempo real.

---

## O que é necessário para virar "Telegram-like"

## 1) Fundamentos de domínio de mensagens

Implementar entidades e regras de negócio:

- `Conversation` (1:1 e grupos)
- `Participant` (papéis/permissões em grupo)
- `Message` (texto, mídia, reply, forward, edição)
- `ReadReceipt` (entregue/lido)
- `Presence` (online, last_seen, typing)
- `DeviceSession` (multi-dispositivo)

Sem esse modelo, os recursos avançados (reply, busca, pin, não lidas, sincronização) ficam frágeis.

## 2) Backend real-time

Adicionar no backend:

- Gateway **WebSocket** (principal) para eventos bidirecionais de baixa latência.
- Fallback opcional **SSE** para ambientes restritos.
- Serviço de publicação/assinatura (ex.: Redis Pub/Sub) para escalar múltiplas instâncias.
- API HTTP para:
  - criar/listar conversas
  - histórico paginado
  - envio de mídia e anexos
  - gerenciamento de membros de grupo

Eventos mínimos:

- `message.created`
- `message.updated`
- `message.deleted`
- `message.delivered`
- `message.read`
- `presence.changed`
- `typing.started` / `typing.stopped`

## 3) Persistência e performance

Banco relacional (PostgreSQL) com índices adequados:

- Índices por `(conversation_id, created_at DESC)`
- Índices para caixa de entrada por usuário e status de leitura
- Estratégia de paginação por cursor

Para mídia:

- Armazenamento em objeto (S3 compatível)
- Upload assinado
- Processamento assíncrono (thumbnail/transcoding)

## 4) Segurança (nível mensageiro)

- Autenticação forte (JWT/refresh + rotação)
- Autorização por conversa/grupo
- Rate limiting anti-spam
- Auditoria de ações sensíveis
- Criptografia em trânsito (TLS)
- Se objetivo for Telegram/Signal-like premium: planejar E2EE (chaves por dispositivo)

## 5) Frontend funcional

Evoluir o `LyvContext` para um estado de mensageria real:

- Store unificada de conversas/mensagens/presença
- Integração WebSocket com reconexão e backoff
- Sincronização offline-first (cache local)
- Estratégias de otimização (optimistic UI, deduplicação por `client_id`)

Recursos de UX esperados:

- contador de não lidas
- confirmação de envio/entrega/leitura
- digitação em tempo real
- busca de mensagens
- envio de arquivos/imagens/áudio
- edição/exclusão de mensagem

## 6) Observabilidade e operação

- Métricas: latência ponta a ponta, taxa de entrega, taxa de reconexão
- Logs estruturados com `conversation_id/message_id/user_id`
- Tracing distribuído no fluxo HTTP + WebSocket
- Alertas (p95 latência, erro de entrega, backlog de fila)

## 7) Qualidade e rollout

- Testes de contrato de eventos WebSocket
- Testes de carga (milhares de conexões concorrentes)
- Testes E2E de envio/recebimento multi-aba/multi-dispositivo
- Feature flags para rollout progressivo

---

## Lacunas objetivas encontradas no repositório

1. `Messages.tsx` depende de campos/funções que não existem no `LyvContext` atual.
2. `Notifications.tsx` idem para notificações.
3. `zios/main.py` não expõe rotas de chat nem canal real-time.
4. `zios/routers/v1/interaction.py` vazio (sem implementação de interação de mensagens).

---

## Plano recomendado (90 dias)

### Fase 1 (Semanas 1–3) — MVP funcional

- Modelagem de banco para conversa/mensagem/leitura.
- Endpoints HTTP básicos + WebSocket de sala por conversa.
- `LyvContext` com store de mensagens real.
- Tela Post enviando e recebendo em tempo real.

**Meta:** chat 1:1 funcional com histórico + status de entrega.

### Fase 2 (Semanas 4–7) — Escala e UX

- Presença, typing, unread count, busca.
- Upload de mídia.
- Redis Pub/Sub + workers.
- Melhorias de reconexão e resiliência offline.

**Meta:** experiência comparável a mensageiro moderno básico.

### Fase 3 (Semanas 8–12) — Recursos avançados

- Grupos (admin/moderação)
- Reply/forward/edit/delete
- Push notifications móveis/web
- Hardening de segurança + observabilidade completa

**Meta:** plataforma pronta para crescer com qualidade de produção.

---

## Critérios de pronto (DoD)

Um "Post Telegram-like" pode ser considerado pronto quando:

- Mensagens chegam em < 500ms p95 entre usuários online.
- Reconexão automática recupera estado sem perda visível.
- Entrega/leitura confiável e consistente entre dispositivos.
- Histórico paginado estável em conversas longas.
- Monitoramento detecta degradação antes do usuário final.

