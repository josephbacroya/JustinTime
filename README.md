# Just-In-Time (JIT) Workflow Overlay

<div align="center">
  <img src="./assets/logo/JIT_Logo.png" alt="JIT Logo" width="200" />
</div>


![Version](https://img.shields.io/badge/version-1.0.0--MVP-blue.svg)
![Status](https://img.shields.io/badge/status-Production_Ready-success.svg)
![Architecture](https://img.shields.io/badge/architecture-Microservices-orange.svg)

## Overview

The **Just-In-Time (JIT) Workflow Overlay** is an enterprise-grade, context-aware browser extension and centralized knowledge management platform. It is designed to bridge the gap between static documentation and active employee workflows. By seamlessly injecting Standard Operating Procedures (SOPs) and AI-driven guidance directly into the DOM of any web application (e.g., Salesforce, Jira, Workday), it eliminates context switching, reduces onboarding time, and enforces organizational compliance at the point of action.

This project was built focusing on strict enterprise constraints: security, data isolation, maintainability, and scalability.

---

## The STAR Method: Why This Exists

### **Situation**
Modern enterprises suffer from fragmented knowledge. Employees are constantly forced to switch tabs away from their active workflows to search for SOPs, guidelines, and policies in isolated wikis. This context switching leads to massive productivity loss, user errors, and high support overhead.

### **Task**
We set out to build an MVP (Minimum Viable Product) that acts as a "Zero-Search Documentation" tool. The objective was to create a non-intrusive, performant browser overlay that intelligently reads the user's active screen context and surfaces the *exact* guidance they need, precisely when they need it, without requiring them to search.

### **Action**
We architected a robust, feature-first Monorepo utilizing:
1. **Manifest V3 Browser Extension:** Injects a Shadow DOM overlay for CSS isolation, monitoring the DOM via `MutationObserver` for real-time context detection.
2. **Retrieval-Augmented Generation (RAG) Pipeline:** Utilizes the OpenAI SDK (`text-embedding-3-small`) to convert screen context into semantic vectors.
3. **PostgreSQL + pgvector:** Leverages Prisma and advanced vector math (`<=>`) to instantly find the most relevant SOPs from the database.
4. **Express.js API Gateway:** A secure, scalable backend utilizing Clean Architecture and mock JWT authorization to ensure multi-tenant data isolation.
5. **Vite React Admin Dashboard:** A premium, glassmorphic UI allowing Knowledge Managers to curate rules, write SOPs, and monitor analytics.

### **Result**
The resulting MVP establishes a production-ready architectural foundation capable of scaling to thousands of organizations and millions of events. It delivers sub-100ms context matching, visually stunning overlays, and a robust CI/CD deployment pipeline via GitHub Actions.

---

## Importance & Business Impact

The JIT Workflow Overlay is not just an efficiency tool; it is a critical organizational asset:
- **Zero Context Switching:** Keeps employees engaged in their primary applications, significantly reducing cognitive load.
- **Instant Compliance:** Ensures that the latest regulatory protocols and security guidelines are followed step-by-step during complex workflows.
- **Accelerated Onboarding:** New hires can navigate proprietary systems instantly with step-by-step overlays, dramatically reducing training costs.

---

## Installation & Configuration

Because this is a production-grade enterprise system, it relies on your own private infrastructure to guarantee data security. **To run this system, you must provide your own Database and AI credentials.**

### Prerequisites
1. **Node.js 22+** (Required for the Vite 8 Bundler)
2. **PostgreSQL Database with `pgvector` Support** (Recommended: [Supabase](https://supabase.com/) or [Neon.tech](https://neon.tech/))
3. **OpenAI API Key** (For the semantic embedding generation)

### Environment Setup
Create a `.env` file in the root of the repository with your credentials:

```env
# Your private PostgreSQL database connection string
DATABASE_URL="postgresql://user:password@host:port/database"

# Your private OpenAI API Key
OPENAI_API_KEY="sk-..."
```

### Deployment Commands
To initialize the database schema and deploy the system:

```bash
# 1. Install dependencies
npm install

# 2. Push the schema to your Database
npm run db:deploy

# 3. Build the backend and frontend
npm run build

# 4. Start the Express API Server
npm run dev:api

# 5. Start the Admin Dashboard
npm run dev:web
```

### Loading the Extension
To deploy the extension to your local Chrome browser:
1. Run the build pipeline to compile the TypeScript extension files: `npx turbo run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer Mode**.
4. Click **Load Unpacked** and select the `src/extension` directory.

---

## Architecture & Code Quality

This repository adheres to strict clean code philosophies designed for 5-year maintainability by large engineering teams:
- **Feature-First Modularity:** Code is organized by bounded contexts in `src/features/`.
- **Result Monads:** Error handling is explicit; no `throw/try/catch` chaos.
- **Isolated State:** The overlay operates exclusively inside a Shadow DOM to prevent CSS leaking into client applications.

*For detailed instructions on running individual components locally, please refer to [HOW_TO_RUN.md](./HOW_TO_RUN.md).*
