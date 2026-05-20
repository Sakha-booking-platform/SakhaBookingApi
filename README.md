# Sakha Api Documentation
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/badge/Framework-NestJS%20v11-E0234E?style=flat&logo=nestjs" alt="NestJS" /></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/Language-TypeScript%20v5-3178C6?style=flat&logo=typescript" alt="TypeScript" /></a>
  <a href="https://www.postgresql.org/" target="_blank"><img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql" alt="PostgreSQL" /></a>
  <a href="https://orm.drizzle.team/" target="_blank"><img src="https://img.shields.io/badge/ORM-Drizzle%20ORM-C5F74F?style=flat&logo=typescript&logoColor=black" alt="Drizzle ORM" /></a>
  <a href="https://www.docker.com/" target="_blank"><img src="https://img.shields.io/badge/Container-Docker-2496ED?style=flat&logo=docker" alt="Docker" /></a>
</p>

<p align="center">
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" target="_blank"><img src="https://img.shields.io/badge/Realtime-Raw%20WebSockets%20(platform--ws)-010101?style=flat" alt="WebSockets" /></a>
  <a href="https://github.com/expressjs/multer" target="_blank"><img src="https://img.shields.io/badge/Uploads-Multer%20Storage-007ACC?style=flat" alt="Multer File Upload" /></a>
  <a href="https://jwt.io/" target="_blank"><img src="https://img.shields.io/badge/Security-JWT%20Authentication-black?style=flat&logo=json-web-tokens" alt="JWT" /></a>
  <a href="https://www.passportjs.org/" target="_blank"><img src="https://img.shields.io/badge/Auth-Passport%20Strategy-34E2A1?style=flat&logo=passport" alt="Passport" /></a>
  <a href="https://resend.com/" target="_blank"><img src="https://img.shields.io/badge/Mailing-Resend%20Service-232323?style=flat" alt="Resend" /></a>
</p>

<p align="center">
  <a href="https://github.com/typestack/class-validator" target="_blank"><img src="https://img.shields.io/badge/Validation-Class%20Validator-F2A900?style=flat" alt="Class Validator" /></a>
  <a href="https://github.com/typestack/class-transformer" target="_blank"><img src="https://img.shields.io/badge/Transformer-Class%20Transformer-orange?style=flat" alt="Class Transformer" /></a>
  <a href="https://node-postgres.com/" target="_blank"><img src="https://img.shields.io/badge/Driver-node--postgres%20(pg)-336791?style=flat" alt="PG Driver" /></a>
  <a href="https://rxjs.dev/" target="_blank"><img src="https://img.shields.io/badge/Reactive-RxJS-B71C1C?style=flat&logo=reactivex" alt="RxJS" /></a>
</p>

## Description

Sakha is a production-grade, multi-sector appointment scheduling and queue management platform engine built on top of NestJS and structured around Clean Architecture principles. Engineered to replace legacy, rigid booking scripts, Sakha delivers an enterprise-ready API tailored for medical clinics, service hubs, and fast-paced commercial facilities.

At its core, the platform transitions businesses from unverified offline booking methods into an automated, verified, and transparent operational workflow.

### Key Architectural Solutions:

*   **Strict Booking Safeguards:** Features native business rules designed to prevent slot hoarding, preventing any single user from out-booking active slots globally or within specific individual clinics.
*   **Conditional Financial Verification Layer:** Implements an adaptive billing check framework. For premium facilities or services demanding upfront validation, the system mandates a verifiable transactional link (financial reference data and a dynamic image upload of the transfer receipt, matching networks like Al-Kuraimi Bank) before committing a reservation slot under a pending review state.
*   **Stateless Real-Time Sync:** Employs high-speed, raw WebSockets for immediate live data broadcasting. When an administrative operator confirms an invoice reference or updates an appointment status, active patient apps and dash-boards capture the operational mutation instantly without unnecessary poll cycles.
*   **Persistent Media Containment:** Isolates system media handling (such as clinical documentation, doctor credentials, and payment captures) into decoupled storage zones mapped via native system constraints for continuous container tracking.

---

## Project Installation & Setup

Before running the application, ensure all project dependencies are installed correctly on your host environment:

```bash
# Install local node modules and dependencies
$ npm install
```

---

## Compile and Run the Project

You can compile, debug, and execute the core NestJS application using the standard production and development routines:

```bash
# Run the application in development mode
$ npm run start

# Run in development mode with active watch/reload capabilities
$ npm run start:dev

# Run in debug mode with watch capabilities
$ npm run start:debug

```

---

## Database Management via Drizzle ORM

The project utilizes Drizzle ORM to maintain schemas and apply data structures against the PostgreSQL instance. Below are the commands to manage your database lifecycle, separated for **Local Development** and **Docker Environment**.

### Local Development (Assuming Local PostgreSQL Setup)

If you have a *local PostgreSQL* instance running and configured, you can execute Drizzle ORM commands directly:

```bash
# Generate SQL delta migration files based on schema changes
$ npm run db:generate

# Execute and apply generated SQL migrations directly to the local database
$ npm run db:migrate

# Push local schema modifications directly to the local database (for rapid prototyping)
$ npm run db:push

# Populate the target local database tables with baseline seed data
$ npm run db:seed

```

### Docker Environment

When running your project within a Docker environment, Drizzle ORM commands need to be executed inside the `api` service container, which has direct access to the database service (`sakha_postgres`).

```bash
# Generate SQL delta migration files based on schema changes
$ docker compose exec api npm run db:generate

# Execute and apply generated SQL migrations directly to the Docker database
$ docker compose exec api npm run db:migrate

# Push local schema modifications directly to the Docker database (for rapid prototyping)
$ docker compose exec api npm run db:push

# Populate the target Docker database tables with baseline seed data
$ docker compose exec api npm run db:seed

```

### 💡 Quick Engineering Tip (First-time Setup Order):

When setting up the project from scratch using `docker compose up --build`, always follow this order in your terminal to prepare the system for Flutter and frontend applications:

1.  **`docker compose exec sakha_api npm run db:generate`** (To prepare SQL migration files).
2.  **`docker compose exec sakha_api npm run db:migrate`** (To build tables in the Docker container).
3.  **`docker compose exec sakha_api npm run db:seed`** (To successfully populate initial data).

---

## Code Quality & Testing Suite

Maintain syntax consistency and run localized isolation tests across the application layer:

```bash
# Format the codebase structure using Prettier
$ npm run format

# Run ESLint to scan and automatically fix structural code issues
$ npm run lint

# Execute centralized unit tests using Jest
$ npm run test

# Run unit tests continuously in watch mode
$ npm run test:watch

# Generate full unit test coverage reports
$ npm run test:cov

# Run full End-to-End (E2E) integration test sequences
$ npm run test:e2e
```

---

## Deployment & Production Operations

When migrating the Dori API into a live production environment, it is highly recommended to leverage the pre-configured containerized architecture to guarantee isolation, high availability, and consistent environment variable execution.

### Production Build Optimization
The core Dockerfile utilizes a multi-stage compilation routine. Before initializing production execution nodes, ensure your production environmental variables are securely bound within your host management layer (e.g., AWS ECS, DigitalOcean, or private VPS systems).

To compile the TypeScript source into standalone optimized JavaScript binaries (`dist/`) and spin up the production ecosystem, execute the standard orchestration stack:

```bash
# Build and execute the container pipeline optimized for production release
$ docker-compose -f docker-compose.yml up --build -d
```

### Essential Production Checklists:

*   **Database Volume Persistency:** Ensure that the local storage mapping `./uploads` and the PostgreSQL data clusters are mapped to reliable system block storages to avoid data loss during automated scale-downs.
*   **Process Management:** The container architecture is designed to map execution nodes directly through the `start:prod` engine script, minimizing execution footprint and keeping memory usage predictable under heavy incoming booking queues.
*   **Security Layering:** In a production matrix, ensure that your `JWT_SECRET` is rotated away from standard values and that your HTTP entry points sit securely behind an SSL-terminated reverse proxy (such as Nginx or Cloudflare).

For alternative native cloud deployments or manual infrastructure clustering configurations, you can explore the official [NestJS Deployment Documentation](https://docs.nestjs.com/deployment) for deep-dive optimization protocols.

---

## Environment Variables Configuration

Before launching the Docker container or local server, you must create a standard `.env` file in the root directory of the project. This file configures your database connectivity, security primitives, and email service keys:

```env
# Database Infrastructure Config
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sakha_booking_db

# Drizzle Connection URL (Points to the active database container inside Docker network)
DATABASE_URL="postgresql://postgres:postgres@sakha_postgres:5432/sakha_booking_db?schema=public"

# Authentication Security (JWT Tokens)
JWT_SECRET=your_very_secure_secret_here
JWT_EXPIRES_SECRET=1d

# Mailing Service Integration (Resend API Key)
RESEND_API_KEY=re_d5JFy4DQ_BNC6tL64fZTz8PPcGB2J5Q4x

# Base Application Routing (Used for constructing authentication verification links)
APP_URL=http://localhost:3000/auth/verify/
```

---


### 📘 Detailed Explanation of Each Variable (How the Server and Docker Read Them)

1.  **`POSTGRES_USER` & `POSTGRES_PASSWORD`:** These are the default username and password for the database. They are passed to the PostgreSQL container during its build to secure permissions.
2.  **`POSTGRES_DB`:** Specifies the name of the database that will be automatically created inside the container.
3.  **`DATABASE_URL`:** This is the magic link used by **Drizzle ORM**. Note that we replaced the word `db` with **`sakha_postgres`** (which is the name of the database service inside the `docker-compose.yml` file), because containers within a Docker network do not recognize `localhost` but rather identify each other via the service names written in the Compose file.
4.  **`JWT_SECRET` & `JWT_EXPIRES_SECRET`:** The secret key for encrypting patient and clinic tokens, and the token's validity period (here, it expires after one day `1d`).
5.  **`RESEND_API_KEY`:** The token for Resend to enable the server to actually send verification emails to users.
6.  **`APP_URL`:** The base URL for the server, used by the server to create **Magic Links** and embed them in emails sent to users for successful account activation.

---

## API Documentation (Swagger)

This project integrates Swagger for comprehensive API documentation, allowing developers to easily understand and interact with the API endpoints. Once the application is running, you can access the Swagger UI at:

`http://localhost:3000/api`

This interface provides detailed information about each endpoint, including request/response schemas, authentication methods, and example values.

---

## Prerequisites

Before you begin, ensure you have the following software installed on your system:

*   **Node.js:** `v18.x` or higher
*   **npm:** `v8.x` or higher (comes with Node.js)
*   **Docker:** Latest stable version
*   **Docker Compose:** Latest stable version
*   **PostgreSQL:** (Optional, for local development without Docker) `v14.x` or higher

---


---

## Project Structure

This project adheres to **Clean Architecture** principles, promoting separation of concerns and maintainability. The core structure is organized as follows:

```text
sakha_booking_api/
├── .env
├── .gitignore
├── .prettierrc
├── Dockerfile
├── README.md
├── docker-compose.yml
├── drizzle.config.ts
├── eslint.config.mjs
├── nest-cli.json
├── package-lock.json
├── package.json
├── tsconfig.build.json
├── tsconfig.json
└── src/
    ├── app.controller.spec.ts
    ├── app.controller.ts
    ├── app.module.ts
    ├── app.service.ts
    ├── main.ts
    ├── appointments/
    │   ├── appointments.controller.ts
    │   ├── appointments.module.ts
    │   ├── appointments.service.ts
    │   ├── dtos/
    │   └── enum/
    ├── auth/
    │   ├── auth.constants.ts
    │   ├── auth.module.ts
    │   ├── controllers/
    │   ├── decorators/
    │   ├── dto/
    │   ├── enums/
    │   ├── guards/
    │   ├── interfaces/
    │   ├── services/
    │   ├── strategies/
    │   └── utils/
    ├── availability/
    │   ├── availability.controller.ts
    │   ├── availability.module.ts
    │   ├── availability.service.ts
    │   ├── dto/
    │   ├── entities/
    │   └── enum/
    ├── clinics/
    │   ├── clinics.controller.spec.ts
    │   ├── clinics.controller.ts
    │   ├── clinics.module.ts
    │   ├── clinics.service.spec.ts
    │   ├── clinics.service.ts
    │   └── dto/
    ├── common/
    │   ├── decorators/
    │   ├── filters/
    │   ├── interceptors/
    │   └── pipes/
    ├── db/
    │   ├── db.module.ts
    │   ├── index.ts
    │   ├── schema.ts
    │   └── seeds.ts
    ├── notifications/
    │   ├── dtos/
    │   ├── notifications.controller.ts
    │   ├── notifications.module.ts
    │   └── notifications.service.ts
    ├── profiles/
    │   ├── controllers/
    │   ├── dto/
    │   ├── entities/
    │   ├── interceptors/
    │   ├── profiles.module.ts
    │   └── services/
    ├── reviews/
    │   ├── dtos/
    │   ├── reviews.controller.ts
    │   ├── reviews.module.ts
    │   └── reviews.service.ts
    ├── socket/
    │   ├── socket.gateway.ts
    │   └── socket.module.ts
    ├── upload/
    │   ├── upload.controller.spec.ts
    │   ├── upload.controller.ts
    │   └── upload.module.ts
    ├── users/
    │   ├── controllers/
    │   ├── dto/
    │   ├── entities/
    │   ├── enums/
    │   ├── services/
    │   └── users.module.ts
    └── utils/
        ├── conistants.ts
        ├── messages.ts
        └── types.ts
``` 

## 🛠️ Developer Profile

### Bashar Al-himyary
**Technical Team Leader & System Architect**

<p align="left">
  <a href="https://github.com/BashargalalAlhimyari" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="Github Profile" />
  </a>
  <a href="https://www.linkedin.com/in/bashar-galal-alhimyari-1204603a9?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Profile" />
  </a>
</p>

### 📞 Contact Information

* **📧 Email:** bashargalal77@gmail.com
* **📱 Phone:** [+967 772971739](tel:+967772971739)
* **📍 Location:** Taiz, Yemen

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
