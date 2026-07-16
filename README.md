# Sakha Booking API 🏥

This is the backend API for the **Sakha Booking System**, built with [NestJS](https://nestjs.com/), [Drizzle ORM](https://orm.drizzle.team/), PostgreSQL, and Docker.

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### 1. Prerequisites
- **Docker** and **Docker Compose** installed on your machine.
- Node.js (v18+) and npm (optional, if you want to run it outside Docker).

### 2. Environment Variables (.env) ⚙️
Before running the project, you MUST create a `.env` file in the root directory. You can copy the provided `.env.example`:
```bash
cp .env.example .env
```

Open the `.env` file and fill in the following values:

```env
POSTGRES_USER=sakha_user
POSTGRES_PASSWORD=sakha_password
POSTGRES_DB=sakha_db
DATABASE_URL=postgres://sakha_user:sakha_password@db:5432/sakha_db
JWT_SECRET=Your_Super_Secret_Key_Here

# Email Sending (Resend)
RESEND_API_KEY=re_your_api_key_here
```

⚠️ **CRITICAL: Setting up Resend (Email Service)**
The API uses [Resend](https://resend.com/) to send Magic Links for authentication. 
1. Go to [Resend.com](https://resend.com) and create a free account.
2. Go to **API Keys** and generate a new key.
3. Paste the key into your `.env` file as `RESEND_API_KEY`.
4. **Important Note on Free Accounts:** If you haven't verified a custom domain on Resend, they will restrict you to sending emails **ONLY to the email address you registered your Resend account with**. 
   - *Example:* If you signed up to Resend using `myemail@gmail.com`, you MUST use `myemail@gmail.com` when testing the Login endpoint in Swagger. Otherwise, Resend will reject the email.

### 3. Running the Application (Docker) 🐳
To start the database and the NestJS API server together, run:

```bash
docker compose up -d
```
*Note: If you ever change the `.env` file later, you MUST run `docker compose up -d --force-recreate api` to apply the new variables.*

### 4. Database Setup 🗄️
Once the containers are running, you need to push the database schema to create the tables in PostgreSQL:

```bash
docker compose exec api npm run db:push
```

### 5. Accessing the API (Swagger) 📖
The API is fully documented using Swagger UI. Once the server is running, you can explore and test all endpoints directly from your browser:

👉 **Swagger URL:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## 🔑 Authentication Flow (How to Login)
This API uses passwordless authentication (Magic Links).
1. Open **Swagger** in your browser.
2. Go to the **Auth** section and find `POST /auth/login`.
3. Enter your email and role (e.g., `PATIENT`). *(Remember to use your Resend registered email if you don't have a verified domain!)*
4. Check your email inbox. You will receive a Magic Link containing a secure token.
5. Copy the token from the link (or click it if the frontend is connected).
6. Go back to Swagger, find `POST /auth/verify`, and enter the token.
7. You will receive an `access_token`.
8. Scroll to the top of Swagger, click the green **Authorize** button, and paste your `access_token` to unlock the protected routes.


---
<br/>
<br/>

# Official NestJS Documentation Below

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
