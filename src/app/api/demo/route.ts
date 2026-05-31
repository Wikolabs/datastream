import { NextResponse } from "next/server";
import { chat, isConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_FR = `Tu es DataStream, une plateforme d'orchestration de pipelines data low-code (style Airflow + dbt + Great Expectations sans la complexite). A partir d'une description de pipeline (source, transformation, destination), tu generes un plan d'execution DAG complet avec validations declaratives et alerting.

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

Tu DOIS inventer un plan realiste pour la demo (jamais "je n'ai pas access aux sources"). Tu joues l'agent de configuration qui a deja analyse la description. Style data engineer senior, technique mais lisible. Maximum 320 mots.`;

const SYSTEM_PROMPT_EN = `You are DataStream, a low-code data pipeline orchestration platform (Airflow + dbt + Great Expectations without the complexity). From a pipeline description (source, transformation, destination), you generate a complete DAG execution plan with declarative validations and alerting.

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

You MUST invent a realistic plan for the demo (never "I have no source access"). You play the configuration agent that has already analyzed the description. Senior data engineer tone, technical but readable. Maximum 320 words.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const source: string = typeof body.source === "string" ? body.source.trim().slice(0, 100) : "";
    const destination: string = typeof body.destination === "string" ? body.destination.trim().slice(0, 100) : "";
    const transform: string = typeof body.transform === "string" ? body.transform.trim().slice(0, 400) : "";
    const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

    if (!source || !destination) {
      return NextResponse.json(
        { error: lang === "fr" ? "Indiquez au moins une source et une destination." : "Provide at least source and destination." },
        { status: 400 }
      );
    }

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error: "llm_not_configured",
          message: lang === "fr"
            ? "Demo en mode statique — la cle LLM sera configuree au prochain deploiement."
            : "Static demo mode — LLM key will be configured at next deploy.",
          mockBrief: buildMockBrief(source, destination, transform, lang),
        },
        { status: 200 }
      );
    }

    const userMsg = lang === "fr"
      ? `Source : ${source}\nDestination : ${destination}\nTransformation souhaitee : ${transform || "passe-plat avec deduplication"}\nGenere le plan DAG complet.`
      : `Source: ${source}\nDestination: ${destination}\nDesired transformation: ${transform || "passthrough with dedup"}\nGenerate the full DAG plan.`;

    const { text, model } = await chat(
      [
        { role: "system", content: lang === "fr" ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN },
        { role: "user", content: userMsg },
      ],
      900
    );

    return NextResponse.json({ brief: text, model, generatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildMockBrief(source: string, destination: string, transform: string, lang: "fr" | "en"): string {
  if (lang === "en") {
    return `**🔌 Configured pipeline**\n- DAG \`${source.toLowerCase().replace(/\W+/g, "_")}_to_${destination.toLowerCase().replace(/\W+/g, "_")}_daily\`, run every 4h, 2 vCPU / 4Gi memory.\n\n**🧱 Generated steps**\n- Step 1 — extract: ${source} via native connector, incremental cursor on \`updated_at\`, batch 50k rows.\n- Step 2 — transform: ${transform || "deduplicate on primary key, add audit cols (ingested_at, source_hash)"}, written in SQL.\n- Step 3 — validate: Great Expectations rules — non-null on \`id, customer_id, amount\`; \`amount\` between 0 and 1e9; \`email\` regex RFC5322.\n- Step 4 — load: ${destination}, mode \`upsert\` on PK \`id\`, target table \`analytics.fact_events\`.\n\n**🛡️ Quality rules**\n- Freshness SLA: data must land within 30 min of trigger.\n- Schema drift threshold: pipeline halts if >2 new columns appear without manifest update.\n- Alert if rejected row ratio exceeds 1.5%.\n\n**⚡ Configured alerts**\n- Slack \`#data-platform-alerts\` for warnings, PagerDuty escalation P2 for hard failures.\n- Recipient on-call rotation: data-eng-pager, escalates after 15 min unacked.`;
  }
  return `**🔌 Pipeline configure**\n- DAG \`${source.toLowerCase().replace(/\W+/g, "_")}_to_${destination.toLowerCase().replace(/\W+/g, "_")}_daily\`, execution toutes les 4h, 2 vCPU / 4Gi memoire.\n\n**🧱 Etapes generees**\n- Etape 1 — extract : ${source} via connecteur natif, curseur incremental sur \`updated_at\`, batch 50k lignes.\n- Etape 2 — transform : ${transform || "deduplication sur PK, ajout colonnes audit (ingested_at, source_hash)"}, en SQL.\n- Etape 3 — validate : regles Great Expectations — non-null sur \`id, customer_id, amount\` ; \`amount\` entre 0 et 1e9 ; \`email\` regex RFC5322.\n- Etape 4 — load : ${destination}, mode \`upsert\` sur PK \`id\`, table cible \`analytics.fact_events\`.\n\n**🛡️ Regles de qualite**\n- SLA freshness : les donnees doivent arriver sous 30 min apres trigger.\n- Seuil de derive schema : pipeline halte si >2 nouvelles colonnes apparaissent sans manifeste mis a jour.\n- Alerte si ratio de lignes rejetees > 1.5%.\n\n**⚡ Alertes configurees**\n- Slack \`#data-platform-alerts\` pour warnings, PagerDuty escalation P2 pour failures dur.\n- Rotation d'astreinte : data-eng-pager, escalade apres 15 min sans ack.`;
}
