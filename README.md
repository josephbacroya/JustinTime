# Interactive "Just-in-Time" Workflow Overlay

The **Interactive "Just-in-Time" (JIT) Workflow Overlay** is an enterprise SaaS platform that eliminates the need for employees to search internal documentation. It delivers exact guidance directly inside the application they are using, exactly when they need it.

---

## 🌟 The STAR Method Breakdown

### 🎯 Situation (The Problem)
Employees waste significant time switching tabs, searching internal wikis, asking teammates, or guessing how to complete complex workflows. This context switching increases operational cost, slows onboarding, introduces compliance risks, and creates inconsistent execution. In the current enterprise landscape, documentation requires the user to hunt for it, rather than coming to the user automatically.

### 📋 Task (The MVP Objective)
To design and build an MVP (Minimum Viable Product) system that:
- Seamlessly detects which application and route the user is viewing via a secure browser extension.
- Understands the workflow context in real time without lagging the host application.
- Matches that context against a structured Knowledge Base using URL/DOM metadata and an AI-powered Retrieval-Augmented Generation (RAG) pipeline.
- Displays contextual guidance through a lightweight, non-intrusive, premium overlay UI.

### 🚀 Action (How We Built It)
We implemented a robust, horizontally scalable architecture using **Domain-Driven Design (DDD)** and **Clean Architecture** principles:
- **Monorepo Foundation:** Utilized Turborepo and TypeScript to strictly decouple our Browser Extension, Core Business Engine, and UI packages.
- **Context Detection Engine:** Built a Manifest V3 browser extension. The Background Service Worker maintains state and caches rules, while a lightweight Content Script uses a `MutationObserver` to track SPA (Single Page Application) route changes without performance degradation.
- **AI & RAG Integration:** Integrated `pgvector` natively into PostgreSQL via Prisma. When an SOP is published via the Knowledge Base, the `EmbeddingService` generates a 1536-dimensional semantic vector. If deterministic rules fail to find a match, the `RAGSearchService` performs a blazing-fast cosine similarity search (`<=>`) to infer the best guidance.
- **Shadow DOM Overlay:** Engineered a premium, glassmorphic React/Preact interface injected safely into a `Shadow Root`. This guarantees complete CSS isolation, ensuring host applications (like Salesforce or Workday) never break our UI, and we never break theirs.
- **Solid Error Handling:** Implemented the `Result` Monad pattern across all services to predictably handle business logic without throwing untraceable exceptions.

### 🏆 Result
The resulting MVP establishes a secure, multi-tenant SaaS foundation capable of supporting massive scale. By combining deterministic O(1) rule matching with semantic vector search fallback, the platform achieves a true **"Zero-Search"** experience. Employees now receive the exact SOP, checklist, or decision tree they need at the exact moment of workflow execution.

---

## 🏗️ System Architecture & Tech Stack

- **Database:** PostgreSQL (Relational Data) + `pgvector` (Vector Database).
- **ORM:** Prisma v5 with Preview Features (`postgresqlExtensions`).
- **Caching:** Redis adapter (`CacheService`) for high-throughput rule lookups.
- **Client Application:** Manifest V3 Browser Extension (Content Script, Background Worker, Shadow DOM Injector).
- **Frontend / UI:** React, Vanilla CSS (Glassmorphism), embedded Decision Trees.
- **Observability:** Centralized `Logger` for tracing and security alerts.

## 📂 Enterprise Folder Structure

The project strictly follows a feature-first Vertical Slice architecture to ensure long-term maintainability:

```text
src/
├── api/                     # REST/GraphQL Controllers and Routes
├── extension/               # Browser Extension Client
│   ├── background/          # State management and API connections
│   ├── content_script/      # DOM/URL Observers
│   └── overlay_ui/          # Shadow DOM injection and Premium React UI
├── features/                # Bounded Contexts (Domain Logic)
│   ├── ai_rag/              # Embedding Service & Cosine Similarity Search
│   ├── analytics/           # Telemetry and Engagement Tracking
│   ├── detection_rules/     # URL Pattern and DOM selector matching
│   ├── identity/            # Tenant and User isolation
│   └── knowledge_base/      # SOP CRUD, Versioning, and Dashboards
└── shared/
    ├── core/                # Clean Architecture Utilities (Result Monad)
    ├── infrastructure/      # Prisma DB, CacheService, Logger
    └── middleware/          # Auth guards and Rate limiting
```

## 🛡️ Security & Scalability

- **Multi-Tenancy:** Enforced via `TenantService` logic and PostgreSQL RLS readiness.
- **Zero-Trust Client:** The extension is treated as an untrusted client; all rule evaluations and analytics are verified by the API Gateway.
- **Performance:** `MutationObserver` is deeply optimized to prevent layout thrashing on host pages. Database calls for Context Rules are bypassed via in-memory Redis caching.

---
*Built with Engineering Excellence in mind—optimized for maintainability, developer experience, and the next 5 years of enterprise scale.*
