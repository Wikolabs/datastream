"""DataStream demo backend — production-ready POC.

In production: this service would generate real Airflow/Dagster DAGs, deploy
them to a managed scheduler, push declarative validations into Great
Expectations, and stream alerts to Slack/PagerDuty. For the demo: it only
invokes the LLM and returns a simulated pipeline plan.
"""
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .llm import chat, is_configured

app = FastAPI(
    title="DataStream Demo Backend",
    description="POC backend — Groq/Gemini LLM. No third-party connections.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT_FR = """Tu es DataStream, une plateforme d'orchestration de pipelines data low-code (style Airflow + dbt + Great Expectations sans la complexite). A partir d'une description de pipeline (source, transformation, destination), tu generes un plan d'execution DAG complet avec validations declaratives et alerting.

Format de sortie exact en MARKDOWN :
**🔌 Pipeline configure**
- [Nom du DAG genere, frequence d'execution recommandee, ressources allouees]

**🧱 Etapes generees**
- [Etape 1 : extract — source + connecteur natif + cadence]
- [Etape 2 : transform — SQL/Python applique + colonnes derivees]
- [Etape 3 : validate — regles Great Expectations declaratives (non-null, range, regex)]
- [Etape 4 : load — destination + mode (append/upsert/replace) + table cible]

**🛡️ Regles de qualite**
- [3 puces : SLA freshness, seuil de derive schema, alerte declenchee si >X% lignes rejetees]

**⚡ Alertes configurees**
- [2 puces : canal Slack + PagerDuty, conditions de declenchement]

Tu DOIS inventer un plan realiste pour la demo (jamais "je n'ai pas access aux sources"). Tu joues l'agent de configuration qui a deja analyse la description. Style data engineer senior, technique mais lisible. Maximum 320 mots."""

SYSTEM_PROMPT_EN = """You are DataStream, a low-code data pipeline orchestration platform (Airflow + dbt + Great Expectations without the complexity). From a pipeline description (source, transformation, destination), you generate a complete DAG execution plan with declarative validations and alerting.

Exact MARKDOWN output format:
**🔌 Configured pipeline**
- [Generated DAG name, recommended run frequency, allocated resources]

**🧱 Generated steps**
- [Step 1: extract — source + native connector + cadence]
- [Step 2: transform — SQL/Python applied + derived columns]
- [Step 3: validate — declarative Great Expectations rules (non-null, range, regex)]
- [Step 4: load — destination + mode (append/upsert/replace) + target table]

**🛡️ Quality rules**
- [3 bullets: freshness SLA, schema drift threshold, alert triggered if >X% rows rejected]

**⚡ Configured alerts**
- [2 bullets: Slack channel + PagerDuty, trigger conditions]

You MUST invent a realistic plan for the demo (never "I have no source access"). You play the configuration agent that has already analyzed the description. Senior data engineer tone, technical but readable. Maximum 320 words."""


# ─────────────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    source: str = Field(..., min_length=1, max_length=100)
    destination: str = Field(..., min_length=1, max_length=100)
    transform: str = Field("", max_length=400)
    lang: Literal["fr", "en"] = "fr"


class GenerateResponse(BaseModel):
    brief: str
    model: str
    generated_at: str
    static_mode: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "datastream-backend",
        "llm_configured": is_configured(),
    }


@app.post("/process", response_model=GenerateResponse)
async def process(req: GenerateRequest) -> GenerateResponse:
    source = req.source.strip()
    destination = req.destination.strip()
    transform = (req.transform or "").strip()
    if not source or not destination:
        raise HTTPException(status_code=400, detail="source_and_destination_required")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_msg = (
        f"Source : {source}\nDestination : {destination}\nTransformation souhaitee : {transform or 'passe-plat avec deduplication'}\nGenere le plan DAG complet."
        if req.lang == "fr"
        else f"Source: {source}\nDestination: {destination}\nDesired transformation: {transform or 'passthrough with dedup'}\nGenerate the full DAG plan."
    )

    if not is_configured():
        return GenerateResponse(
            brief=_build_mock_brief(source, destination, transform, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    try:
        text, model = await chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT_FR if req.lang == "fr" else SYSTEM_PROMPT_EN},
                {"role": "user", "content": user_msg},
            ],
            max_tokens=900,
        )
    except Exception:
        return GenerateResponse(
            brief=_build_mock_brief(source, destination, transform, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    return GenerateResponse(brief=text, model=model, generated_at=now_iso)


# ─────────────────────────────────────────────────────────────────────────────
# Mock brief (used when no LLM key configured)
# ─────────────────────────────────────────────────────────────────────────────
def _slug(s: str) -> str:
    out = "".join(c.lower() if c.isalnum() else "_" for c in s)
    return out.strip("_") or "src"


def _build_mock_brief(source: str, destination: str, transform: str, lang: str) -> str:
    dag = f"{_slug(source)}_to_{_slug(destination)}_daily"
    if lang == "en":
        return (
            f"**🔌 Configured pipeline**\n"
            f"- DAG `{dag}`, run every 4h, 2 vCPU / 4Gi memory.\n\n"
            f"**🧱 Generated steps**\n"
            f"- Step 1 — extract: {source} via native connector, incremental cursor on `updated_at`, batch 50k rows.\n"
            f"- Step 2 — transform: {transform or 'deduplicate on primary key, add audit cols (ingested_at, source_hash)'}, written in SQL.\n"
            f"- Step 3 — validate: Great Expectations rules — non-null on `id, customer_id, amount`; `amount` between 0 and 1e9; `email` regex RFC5322.\n"
            f"- Step 4 — load: {destination}, mode `upsert` on PK `id`, target table `analytics.fact_events`.\n\n"
            f"**🛡️ Quality rules**\n"
            f"- Freshness SLA: data must land within 30 min of trigger.\n"
            f"- Schema drift threshold: pipeline halts if >2 new columns appear without manifest update.\n"
            f"- Alert if rejected row ratio exceeds 1.5%.\n\n"
            f"**⚡ Configured alerts**\n"
            f"- Slack `#data-platform-alerts` for warnings, PagerDuty escalation P2 for hard failures.\n"
            f"- Recipient on-call rotation: data-eng-pager, escalates after 15 min unacked."
        )
    return (
        f"**🔌 Pipeline configure**\n"
        f"- DAG `{dag}`, execution toutes les 4h, 2 vCPU / 4Gi memoire.\n\n"
        f"**🧱 Etapes generees**\n"
        f"- Etape 1 — extract : {source} via connecteur natif, curseur incremental sur `updated_at`, batch 50k lignes.\n"
        f"- Etape 2 — transform : {transform or 'deduplication sur PK, ajout colonnes audit (ingested_at, source_hash)'}, en SQL.\n"
        f"- Etape 3 — validate : regles Great Expectations — non-null sur `id, customer_id, amount` ; `amount` entre 0 et 1e9 ; `email` regex RFC5322.\n"
        f"- Etape 4 — load : {destination}, mode `upsert` sur PK `id`, table cible `analytics.fact_events`.\n\n"
        f"**🛡️ Regles de qualite**\n"
        f"- SLA freshness : les donnees doivent arriver sous 30 min apres trigger.\n"
        f"- Seuil de derive schema : pipeline halte si >2 nouvelles colonnes apparaissent sans manifeste mis a jour.\n"
        f"- Alerte si ratio de lignes rejetees > 1.5%.\n\n"
        f"**⚡ Alertes configurees**\n"
        f"- Slack `#data-platform-alerts` pour warnings, PagerDuty escalation P2 pour failures dur.\n"
        f"- Rotation d'astreinte : data-eng-pager, escalade apres 15 min sans ack."
    )
