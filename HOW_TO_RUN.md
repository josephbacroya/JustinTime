# How to Run the JIT Workflow Overlay

Welcome to the **Interactive "Just-in-Time" Workflow Overlay** project. This guide outlines the steps necessary to set up your environment, initialize the database, run the backend/dashboard, and load the browser extension.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher) and **npm**
- **PostgreSQL** (must have the `pgvector` extension installed for AI capabilities)
- **Redis** (optional, for local caching of Context Rules)
- A modern Chromium-based browser (Google Chrome, Microsoft Edge, Brave)

---

## 📦 1. Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/josephbacroya/JustinTime.git
   cd JustinTime
   ```

2. **Install all dependencies:**
   This project uses a monorepo structure via Turborepo. Installing at the root will bootstrap all workspaces.
   ```bash
   npm install
   ```

---

## 🗄️ 2. Environment Configuration

You need to provide the database connection string for Prisma. 

1. Create a `.env` file at the root of the project.
2. Add your PostgreSQL connection string. Note that your Postgres instance must support the `pgvector` extension.
   
   ```env
   # .env
   DATABASE_URL="postgresql://username:password@localhost:5432/jit_overlay?schema=public"
   ```

---

## 💽 3. Database Initialization

We use Prisma ORM to manage the database schema. Run the following commands to initialize the tables and generate the TypeScript client:

1. **Push the schema to your database:**
   ```bash
   npx prisma db push --schema=src/shared/infrastructure/database/schema.prisma
   ```

2. **Generate the Prisma Client:**
   ```bash
   npx prisma generate --schema=src/shared/infrastructure/database/schema.prisma
   ```

---

## 🚀 4. Running the Project

Because the project is built on **Turborepo**, you can easily run all the frontend and backend services simultaneously from the root directory.

1. **Start the Development Servers (API + Admin Dashboard):**
   ```bash
   npm run dev
   ```
   *Note: This command relies on the Turborepo configuration (`turbo.json`) to spin up the React dashboard and Node API.*

2. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🧩 5. Loading the Browser Extension (MVP)

The browser extension needs to be loaded directly into your browser during development.

1. Open your Chromium-based browser (e.g., Chrome).
2. Navigate to the extensions page by typing `chrome://extensions/` in the URL bar.
3. Toggle **Developer mode** on (usually located in the top-right corner).
4. Click the **Load unpacked** button.
5. In the file explorer dialog, select the `src/extension` directory inside your cloned repository.
6. The **JIT Workflow Overlay** extension will now appear in your list. Pin it to your browser toolbar.

### Testing the Extension:
- Navigate to one of the target URLs defined in the mock data (e.g., a dummy Salesforce Opportunity page).
- The Content Script will observe the URL and DOM, triggering the glassmorphic Shadow DOM overlay injected by the Background Service Worker.

---

## 🩺 Troubleshooting

- **Prisma `vector` error:** Ensure your Postgres installation has `pgvector` installed (`CREATE EXTENSION vector;`).
- **Extension not showing:** Check the background worker console (click "service worker" on the extension card in `chrome://extensions/`) to see if the WebSocket connection is failing.
