# 🤖 AI Investment System

> Sistema multiagente de inteligência artificial para análise e suporte a decisões de investimento em múltiplos ativos (ações BR, criptomoedas e renda fixa).

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Claude API](https://img.shields.io/badge/Claude%20API-Sonnet%204-CC785C?style=flat)](https://anthropic.com)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=flat)](https://github.com/marco4SC/PortfolioHUB)

---

## 📐 Arquitetura

```
Fontes de dados (B3, BCB, CoinGecko, RSS)
        ↓
  Data Pipeline (ETL, cache Redis, TimescaleDB)
        ↓
┌─────────────────────────────────────────┐
│         Agentes Especializados (LLM)    │
│  📈 Técnico  │  📊 Fundamentalista      │
│  📰 Sentimento │  🌍 Macro & Risco      │
└─────────────────────────────────────────┘
        ↓
  Orquestrador — "Chief Investment Officer IA"
  (agrega sinais, gera tese de investimento)
        ↓
  Gestão de Portfólio (Markowitz, Risk Parity)
        ↓
  Monitoramento + Alertas Telegram
```

---

## 🧠 Agentes de IA

| Agente | Responsabilidade | Indicadores |
|---|---|---|
| **Técnico** | Análise de preço e padrões | RSI, MACD, Bollinger Bands, Médias móveis, Volume |
| **Fundamentalista** | Valuation e qualidade do negócio | P/L, P/VPA, ROE, ROIC, Dívida/EBITDA, DY |
| **Sentimento** | NLP em notícias e redes sociais | Score de sentimento, eventos-chave, intensidade |
| **Macro & Risco** | Ambiente macroeconômico | Selic, IPCA, câmbio, taxa real, correlações |
| **Orquestrador** | Decisão final com tese auditável | Sinal consolidado, stop-loss, preço-alvo, sizing |

---

## 🗂️ Estrutura do projeto

```
ai-investment-system/
├── data/
│   └── sources/
│       ├── market.py        # Preços via brapi.dev e CoinGecko
│       ├── macro.py         # BCB/SGS: Selic, IPCA, câmbio
│       ├── news.py          # RSS financeiro
│       └── onchain.py       # Dados on-chain para cripto
├── agents/
│   ├── base.py              # Classe base + AgentSignal
│   ├── technical.py         # Análise técnica + cálculo de indicadores
│   ├── fundamental.py       # Valuation fundamentalista
│   ├── sentiment.py         # NLP em notícias
│   ├── macro.py             # Avaliação macroeconômica
│   └── orchestrator.py      # Orquestrador CIO
├── portfolio/
│   ├── optimizer.py         # Markowitz + Risk Parity (scipy)
│   ├── risk.py              # Stop-loss, VaR, drawdown, Kelly sizing
│   └── executor.py          # Execução e backtesting
├── monitoring/
│   └── alerts.py            # Alertas via Telegram Bot API
├── api/
│   └── main.py              # FastAPI REST API
├── config.py                # Configurações centralizadas
├── requirements.txt
└── .env.example
```

---

## 🚀 Como executar

```bash
# 1. Clone e entre na pasta
git clone https://github.com/marco4SC/PortfolioHUB.git
cd PortfolioHUB/pessoais/ai-investment-system

# 2. Ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac | venv\Scripts\activate no Windows

# 3. Dependências
pip install -r requirements.txt

# 4. Configuração
cp .env.example .env
# Edite .env com sua ANTHROPIC_API_KEY

# 5. Iniciar a API
uvicorn api.main:app --reload --port 8000

# 6. Testar análise
curl -X POST http://localhost:8000/analyze/PETR4
```

---

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/health` | Status do sistema |
| `GET` | `/market/quotes?tickers=PETR4,VALE3` | Cotações em tempo real |
| `GET` | `/market/scan?tickers=PETR4,VALE3` | Varredura limitada da watchlist, sem ordens |
| `GET` | `/macro/snapshot` | Selic, IPCA, câmbio atuais |
| `POST` | `/analyze/{ticker}` | Análise completa com todos os agentes |
| `GET` | `/portfolio/summary` | Resumo do portfólio |

### Exemplo de resposta — `POST /analyze/VALE3`

```json
{
  "asset": "VALE3",
  "final_signal": "BUY",
  "consolidated_confidence": 0.74,
  "position_size_pct": 0.12,
  "price_target": 68.50,
  "stop_loss": 57.20,
  "time_horizon": "medium",
  "investment_thesis": "VALE3 apresenta valuaton atrativo (P/L 5.8x vs. histórico 7.2x) com suporte técnico em R$59...",
  "key_risks": ["Queda do minério de ferro", "Risco cambial BRL/USD", "Ambiente macro restritivo"],
  "catalysts": ["Resultado 2T25 acima do esperado", "Retomada chinesa"],
  "consensus_score": 0.81
}
```

---

## 🛠️ Stack tecnológico

- **Backend**: Python 3.11, FastAPI, Uvicorn
- **IA/LLM**: Anthropic Claude (claude-sonnet-4)
- **Dados**: brapi.dev, CoinGecko API, BCB/SGS API, feedparser
- **Análise**: Pandas, NumPy, Scipy (otimização de portfólio)
- **Armazenamento**: SQLAlchemy (foundation for a relational database integration)
- **Alertas**: HTTP-based Telegram notification module
- **Deployment target**: VPS or cloud API deployment

---

## 🎯 Produto e aplicações reais

O objetivo do projeto é evoluir de um estudo de agentes para uma camada de **inteligência de investimentos com revisão humana**. O primeiro valor entregue não é “prever o mercado”, mas reduzir trabalho repetitivo, tornar as premissas comparáveis e registrar por que uma decisão foi tomada.

Aplicações priorizadas:

1. **Research assistido**: gerar um dossiê reproduzível de um ativo com fontes, sinais, riscos e perguntas para revisão.
2. **Monitoramento de risco**: acompanhar concentração, drawdown, mudanças macro e quebra de premissas com alertas explicáveis.
3. **Paper trading**: testar teses com dados históricos e carteira virtual antes de envolver capital real.
4. **Operação auditável**: manter versões de prompts, dados, decisões e aprovações para facilitar revisão e conformidade.

O sistema não promete rentabilidade, não substitui um profissional habilitado e não deve executar ordens automaticamente sem validação jurídica, controles de risco e aprovação explícita.

## 🧠 Pipeline de LLM

O fluxo de análise é dividido em etapas:

1. **Brief de pesquisa**: normaliza ativo, objetivo, horizonte, perfil de risco, fontes e evidências.
2. **Agentes especializados**: técnico, fundamentalista, sentimento e macro produzem sinais com confiança e justificativa.
3. **Consolidação**: o LLM recebe somente o brief e os sinais resumidos; deve responder em JSON estruturado.
4. **Validação**: sinais, confiança, sizing, riscos e catalisadores são normalizados e limitados antes de chegar à API.
5. **Revisão humana**: toda saída mantém `review_required=true`. Se o LLM falhar, o resultado vira `REVIEW` em modo `fallback`, sem recomendação silenciosa.

O módulo `llm_pipeline.py` não depende diretamente de um provedor específico. O chamador LLM é injetado, o que permite testar respostas sem rede e trocar Anthropic por outro provedor no futuro. A API expõe `analysis_mode` e `validation_warnings` para manter a rastreabilidade.

## 🧪 Rodada de testes de mercado

`GET /market/scan` usa a API pública `brapi.dev` para consultar uma watchlist de até 20 ações. A resposta informa fonte, horário, ativos bem-sucedidos, falhas individuais e confirma que nenhuma ordem foi enviada. O endpoint não representa conexão de negociação com a B3 e não deve ser usado como fonte única para decisões financeiras.

Para analisar uma watchlist específica:

```bash
curl "http://localhost:8000/market/scan?tickers=PETR4,VALE3,ITUB4"
```

## 🗺️ Roadmap de crescimento

- [x] Fundação de API REST, fontes de dados e agentes especializados
- [x] Primeiros controles de risco e orquestração de sinais
- [x] Demo pública com modo simulado e exportação de relatório
- [ ] Normalizar fontes, timestamps e qualidade dos dados
- [ ] Backtesting com dados históricos e métricas de benchmark
- [ ] Paper trading com ledger imutável e reconciliação
- [ ] Scheduler, alertas e observabilidade
- [ ] Autenticação, segregação de dados e trilha de auditoria
- [ ] Dashboard operacional para revisão humana
- [ ] Integração com corretora somente após validação de segurança e compliance

---

## ⚠️ Aviso importante

Este sistema é uma **ferramenta de apoio à decisão**, não um consultor de investimentos registrado. Nenhum algoritmo garante retorno positivo. Sempre use gestão de risco, nunca invista mais do que pode perder, e comece com **paper trading** antes de usar capital real.

---

## 👨‍💻 Autor

**Marco Antonio de Souza Carvalho**  
Estudante de Engenharia da Computação — UniCEUB  
[LinkedIn](https://linkedin.com/in/marco-antonio-souza-carvalho-614bb3329) · [Portfólio](https://marco4sc.github.io/PortfolioHUB/)
---
## 📦 CI/CD & Deployment

This repository includes a Dockerfile and a GitHub Actions workflow to build and publish the backend container image to GitHub Container Registry (GHCR):

- Image tags: ghcr.io/<your-user>/ai-investment:latest and ghcr.io/<your-user>/ai-investment:<sha>

Optional: automatic Render deploy

- Create a Render service (Web Service) and set the Repo as container or use GHCR image.
- Add repository secrets: RENDER_API_KEY and RENDER_SERVICE_ID (see Render docs).
- The workflow will POST to Render to trigger a deploy when those secrets are present.

Security note: restrict CORS origins in api/main.py before deploying to production (replace allow_origins=["*"] with your domain).
