# DataStream — Pipeline ETL temps réel et streaming de données

> 40+ connecteurs. Ingestion, transformation, livraison. En temps réel.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![Apache Kafka](https://img.shields.io/badge/Kafka-3.7-231F20?style=flat&logo=apache-kafka)](https://kafka.apache.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org)

---

## Vue d'ensemble

DataStream est une plateforme ETL (Extract, Transform, Load) temps réel avec streaming. Elle connecte 40+ sources (bases de données, APIs, fichiers), applique des transformations SQL/Python configurable, et livre les données vers les destinations cibles en temps réel via Kafka. Interface visuelle pour construire les pipelines sans code.

**Domaine :** Data Engineering / DataOps  
**Port VM :** 3018 | **Sous-domaine :** datastream.wikolabs.com

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts | Pipeline builder, monitoring, lineage |
| Backend | FastAPI (Python 3.11), Uvicorn | API pipelines, exécution, monitoring |
| Streaming | Apache Kafka 3.7 | Message bus temps réel |
| Transform | Apache Spark (PySpark) / pandas | Transformations batch + streaming |
| Orchestration | Airflow (optionnel) / APScheduler | Scheduling pipelines |
| Base de données | PostgreSQL 16 | Catalogue pipelines, run logs |
| Cache | Redis 7 | État pipelines, rate limiting |
| Infra | Docker Compose, Nginx | VM mono-repo (port 3018) |

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
kafka-python==2.0.2
pyspark==3.5.1
pandas==2.2.2
numpy==1.26.4
apscheduler==3.10.4
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.30
redis==5.0.4
pydantic==2.7.1
httpx==0.27.0
```

---

## Architecture mono-repo

```
datastream/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx              # Dashboard pipelines + status
│   │   ├── pipelines/new/        # Visual pipeline builder
│   │   ├── pipelines/[id]/       # Monitoring + logs
│   │   └── catalog/              # Catalogue sources/destinations
│   └── src/components/
│       ├── PipelineCanvas.tsx    # Builder visuel (nodes + edges)
│       ├── NodeConnector.tsx     # Source / Transform / Sink nodes
│       ├── ThroughputChart.tsx   # Events/sec en temps réel
│       ├── DataLineage.tsx       # Lineage graphe source → dest
│       └── RunHistory.tsx        # Historique runs + durées
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── pipelines.py      # CRUD + run/pause/stop
│   │   │   ├── connectors.py     # 40+ source connectors
│   │   │   └── monitoring.py     # Métriques + logs
│   │   ├── services/
│   │   │   ├── pipeline_engine.py# Orchestration ETL
│   │   │   ├── kafka_producer.py # Publication Kafka
│   │   │   ├── kafka_consumer.py # Consommation Kafka
│   │   │   ├── transformer.py    # SQL / Python transforms
│   │   │   └── connectors/       # PostgreSQL, MySQL, S3, REST...
│   │   └── models/
│   │       └── pipeline.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Diagrammes UML

### Architecture système

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#134e4a', 'primaryTextColor': '#fff', 'primaryBorderColor': '#0f766e', 'lineColor': '#374151', 'secondaryColor': '#f0fdfa'}}}%%
flowchart TB
    subgraph VM["🖥️ VM — Docker Compose (port 3018)"]
        NEXT["Next.js 14\nPipeline Builder"]
        API["FastAPI"]

        subgraph ETL["⚡ ETL Engine"]
            KAFKA["Apache Kafka 3.7\nMessage streaming"]
            SPARK["PySpark\nBatch + stream transforms"]
            SCHED["APScheduler\nCron pipelines"]
        end

        PG[("PostgreSQL\nPipeline catalog")]
        REDIS[("Redis\nPipeline state")]
    end

    SOURCES["Sources\nDB / API / Files"] --> KAFKA
    KAFKA --> SPARK
    SPARK --> SINKS["Destinations\nDWH / S3 / API"]
```

### Séquence — Exécution d'un pipeline ETL

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#134e4a', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
sequenceDiagram
    participant USER as Data Engineer
    participant API as FastAPI
    participant ENGINE as Pipeline Engine
    participant KAFKA as Kafka
    participant SPARK as PySpark
    participant SINK as Destination

    USER->>API: POST /pipelines/{id}/run

    API->>ENGINE: execute_pipeline(pipeline_config)
    ENGINE->>ENGINE: validate_config()

    ENGINE->>KAFKA: create_topic(pipeline_id)
    ENGINE->>ENGINE: extract(source_connector)
    ENGINE->>KAFKA: produce(raw_events, topic=pipeline_id)

    KAFKA->>SPARK: consume(topic=pipeline_id)
    SPARK->>SPARK: apply_transforms(sql="SELECT id, UPPER(name) AS name FROM raw")
    SPARK->>SPARK: validate_schema(output)
    SPARK->>SINK: write(transformed_data, mode=append)
    SINK-->>SPARK: rows_written=15000

    SPARK->>API: run_complete(rows=15000, duration=4.2s, errors=0)
    API-->>USER: {run_id: "r_xyz", status: "success", throughput: "3571 rows/s"}
```

### Modèle de données (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#134e4a', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
erDiagram
    PIPELINE {
        uuid id PK
        string name
        string status
        jsonb source_config
        jsonb transform_config
        jsonb sink_config
        string schedule_cron
        int last_run_rows
        float last_run_duration_s
        timestamp last_run_at
    }
    PIPELINE_RUN {
        uuid id PK
        uuid pipeline_id FK
        string status
        int rows_extracted
        int rows_loaded
        int errors_count
        float duration_seconds
        text error_log
        timestamp started_at
        timestamp finished_at
    }
    CONNECTOR {
        uuid id PK
        string name
        string connector_type
        string version
        jsonb config_schema
        boolean is_active
    }

    PIPELINE ||--o{ PIPELINE_RUN : "has"
    PIPELINE }o--|| CONNECTOR : "uses_source"
    PIPELINE }o--|| CONNECTOR : "uses_sink"
```

---

## PRD

### Problème
Les équipes data passent 60% de leur temps sur des tâches d'ingestion et nettoyage répétitives. Chaque pipeline est codé from scratch, difficile à maintenir, et impossible à monitorer sans expertise Spark/Kafka. Les pipelines cassent silencieusement.

### Solution
DataStream propose un constructeur visuel de pipelines ETL avec 40+ connecteurs préconfigurés, des transformations SQL/Python déclaratives, et un monitoring temps réel. Les Data Analysts construisent leurs propres pipelines sans help des ingénieurs.

### Utilisateurs cibles
| Persona | Besoin |
|---------|--------|
| Data Engineer | Pipeline réutilisables, monitoring, alertes automatiques |
| Data Analyst | Construire ses propres pipelines sans code Spark |
| Ops | Visibilité sur les transferts de données en prod |

### OKRs
- Temps de création pipeline < 15 minutes (vs 2 jours en code)
- Taux d'erreur pipeline < 0.1%
- SLA data freshness : données disponibles < 5 min après source

---

## User Stories

```
US-01 [Data Engineer] En tant que Data Engineer,
      je veux construire visuellement un pipeline PostgreSQL → S3
      avec une transformation "dédupliquer par email"
      afin d'avoir mes données propres dans le lake en < 15 minutes.

US-02 [Data Analyst] En tant que Data Analyst,
      je veux connecter l'API Stripe (webhooks) à PostgreSQL
      en définissant le mapping des champs visuellement
      afin d'avoir mes données de paiement en temps réel.

US-03 [Ops] En tant qu'Ops,
      je veux recevoir une alerte quand un pipeline a 0 lignes depuis 1h
      afin de détecter les échecs silencieux.

US-04 [Data Engineer] En tant que Data Engineer,
      je veux voir le lineage de mes données
      (quelle source → quelle transformation → quelle destination)
      afin de tracer l'origine d'une anomalie.

US-05 [Analyst] En tant qu'analyste,
      je veux planifier l'exécution de mon pipeline toutes les heures
      afin que mes dashboards soient toujours frais.
```

---

## Règles métier

| # | Règle | Description | Simulable UI |
|---|-------|-------------|-------------|
| R1 | Validation schema | Schema source validé avant premier run | ✅ Schema preview |
| R2 | Idempotence | Transforms idempotentes (upsert par clé primaire) | ✅ Idempotency toggle |
| R3 | Dead letter queue | Erreurs de transform → DLQ pour retraitement | ✅ DLQ viewer |
| R4 | Throughput monitor | Events/sec en temps réel | ✅ Throughput chart |
| R5 | Zero-downtime | Mise à jour pipeline sans arrêt (blue/green) | ✅ Update demo |
| R6 | Row count alert | 0 lignes depuis N minutes → alerte email | ✅ Alert config |
| R7 | Data freshness | Metric : latence source → destination | ✅ Freshness badge |
| R8 | Retry policy | Échec run → retry 3x avec backoff | ✅ Retry log |
| R9 | Schema evolution | Nouvelles colonnes source → propagées automatiquement | ✅ Schema diff |
| R10 | Watermark | Streaming avec watermark pour gestion late events | ✅ Watermark config |

---

## Spécification API

**Base URL :** `http://datastream.wikolabs.com/api/v1`

### POST /pipelines/{id}/run
```json
// Response: {"run_id": "r_xyz", "status": "running", "started_at": "2024-03-15T09:00:00Z"}
```

### GET /pipelines/{id}/metrics
```json
// Response: {"throughput_eps": 3571, "rows_extracted": 15000, "rows_loaded": 14998, "errors": 0, "latency_ms": 280}
```

### GET /pipelines/{id}/lineage
```json
// Response: {"source": "PostgreSQL orders", "transforms": ["filter active", "join customers"], "sink": "S3 data lake"}
```

---

## Simulation UI

| Composant | Description |
|-----------|-------------|
| **Pipeline Canvas** | Drag-and-drop nodes : Source → Transform → Sink avec edges |
| **Throughput Chart** | Recharts area chart : events/second en temps réel |
| **Connector Catalog** | Grille 40+ connecteurs avec status (configuré/non) |
| **Data Lineage** | Graphe orienté source → transformations → destinations |
| **Run History** | Tableau runs avec durée, lignes, erreurs, status |

---

## Déploiement

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_DB: datastream, POSTGRES_USER: ds_user, POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"}
  redis:
    image: redis:7-alpine
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    environment: {ZOOKEEPER_CLIENT_PORT: 2181}
  kafka:
    image: confluentinc/cp-kafka:7.6.0
    depends_on: [zookeeper]
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://ds_user:${POSTGRES_PASSWORD}@postgres/datastream
      KAFKA_BOOTSTRAP_SERVERS: kafka:9092
    depends_on: [postgres, kafka, redis]
    expose: ["8000"]
  frontend:
    build: ./frontend
    expose: ["3000"]
  nginx:
    image: nginx:alpine
    ports: ["3018:80"]
volumes:
  pg_data:
```

---

## Roadmap

### Phase 1 — MVP
- [ ] 5 connecteurs (PostgreSQL, MySQL, CSV, REST API, S3)
- [ ] Transformations SQL basiques
- [ ] Pipeline runner + monitoring

### Phase 2 — Streaming
- [ ] Kafka streaming mode
- [ ] 20+ connecteurs supplémentaires
- [ ] Visual pipeline builder

### Phase 3 — Enterprise
- [ ] PySpark distributed processing
- [ ] Data lineage automatique
- [ ] Intégration Data Catalog

---

*Un produit [Wikolabs](https://wikolabs.com) — Intelligence artificielle appliquée aux métiers*
