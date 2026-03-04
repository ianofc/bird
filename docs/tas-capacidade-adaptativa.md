# TAS — capacidade crescente sem perder velocidade

## Objetivo
Evoluir o TAS para ficar **mais robusto e adaptativo** sem degradar latência nem virar um sistema pesado de operar.

## Princípios de arquitetura
1. **Camadas com orçamento de tempo (latency budget)**
   - Definir metas por etapa (`Thalamus`, `SARA`, `Accumbens`) e cortar processamento excedente por timeout.
   - Exemplo: 10ms (filtro), 35ms (candidatos), 25ms (ranking) = p95 alvo de 70ms.

2. **Pipeline em dois estágios (retrieve -> rerank)**
   - Stage 1 rápido: busca de candidatos com ANN/índice vetorial + regras mínimas.
   - Stage 2 inteligente: rerank apenas top-K (ex.: 200), nunca em corpus inteiro.
   - Ganha qualidade sem multiplicar custo.

3. **Degradação elegante (graceful degradation)**
   - Se embeddings/feature store estiverem lentos, usar fallback precomputado (trending + afinidade histórica).
   - Priorizar disponibilidade sobre perfeição.

4. **Arquitetura de features "barata" em online e "rica" em offline**
   - Online: poucas features críticas e baratas.
   - Offline: geração pesada de features, agregados, embeddings e estatísticas.
   - Resultado: inferência rápida, aprendizado contínuo.

## Como aprender com o tempo sem ficar pesado

### 1) Treino incremental e assíncrono
- Consumir eventos em fila (click, like, dwell, hide, report).
- Atualizar pesos de ranking periodicamente (ex.: a cada 15 min) em jobs batch/lightweight.
- Evitar retreinar modelo completo a cada requisição.

### 2) Feedback loop com memória em níveis
- **Curto prazo (sessão):** interesses recentes com TTL curto.
- **Médio prazo (dias):** perfil de tópicos/entidades.
- **Longo prazo (semanas):** preferências estáveis.
- Misturar sinais com decaimento temporal para evitar "congelamento" do perfil.

### 3) Exploração controlada (bandit)
- Reservar pequena fração do tráfego (2–5%) para explorar conteúdos novos.
- Usar contextual bandits para balancear exploração vs. exploração.
- Assim o TAS aprende novos padrões sem arriscar toda a experiência.

### 4) Atualização seletiva de embeddings
- Re-embed apenas itens alterados/recentes.
- Reprocessamento completo só em janelas programadas.
- Mantém custo sob controle com qualidade aceitável.

## Robustez operacional

### 1) SLOs e observabilidade
- Medir p50/p95/p99 por endpoint e por estágio do pipeline.
- Monitorar taxa de fallback, erro de feature lookup e tamanho de fila.
- Alertas acionáveis por sintoma (latência, erro, drift, backlog).

### 2) Circuit breakers e bulkheads
- Isolar dependências críticas (DB vetorial, cache, feature store).
- Quando uma dependência degrada, limitar impacto local e ativar caminho alternativo.

### 3) Cache estratégico
- Cache de candidatos por segmento de usuário + janela curta.
- Cache de features quentes e contadores agregados.
- Invalidar por evento relevante para evitar stale excessivo.

### 4) Controle de custo por requisição
- Impor limites explícitos: top-K máximo, tamanho de contexto, chamadas externas.
- Evitar N+1 em buscas e features.

## Roadmap sugerido (90 dias)

### Fase 1 (0–30 dias): Base de performance
- Definir SLO de latência e erro.
- Instrumentar tracing por estágio (T/S/A).
- Implementar fallback e timeout por dependência.

### Fase 2 (31–60 dias): Aprendizado contínuo leve
- Pipeline de eventos para atualização incremental.
- Feature store com agregados de curto e médio prazo.
- Primeiro experimento com exploração de 2% via bandit.

### Fase 3 (61–90 dias): Qualidade + escala
- Otimizar retrieve+rerrank com top-K dinâmico por orçamento.
- Introduzir monitoramento de drift e recalibração automática de pesos.
- Testes A/B contínuos com guardrails de latência e retenção.

## KPIs para não "abandonar" o TAS no futuro
- **Latência p95** por recomendação (meta rígida).
- **CTR/tempo de sessão/retorno D1-D7** (qualidade).
- **Custo por 1k recomendações** (sustentabilidade).
- **Taxa de fallback** e **erro por dependência** (resiliência).
- **Tempo de atualização de modelo** (cadência de aprendizado).

## Regra de ouro
> Tudo que melhora qualidade deve entrar com um **orçamento de latência e custo** explícito.
> Se passar do orçamento, o recurso entra em modo offline, assíncrono, ou top-K limitado.
