# FIAP Arch Analyzer Integrated Project

An MVP application for automated analysis of software architecture diagrams using AI. It identifies architectural components, detects risks, and provides structured recommendations.

## Overview

This repository contains the full-stack monorepo for the Arch Analyzer, satisfying the integrated hackathon requirements for IADT (AI processing) and SOAT (Software Architecture).

## Architecture

The system utilizes a microservices architecture for scalability and isolation:

*   **API Gateway (NestJS):** The entry point for clients, routing traffic and validating authentication tokens.
*   **Auth Service (NestJS):** Manages user authentication and issues JWT tokens.
*   **Upload Service (NestJS):** Handles incoming diagram uploads, persists metadata (PostgreSQL), and triggers asynchronous processing via RabbitMQ.
*   **AI Processing Service (Python/FastAPI):** Consumes upload events, processes diagrams via OCR/LLM (mocked logic integrated), and generates structured JSON reports sent via webhooks.
*   **Report Service (NestJS):** Persists and serves the generated AI reports.
*   **Frontend (Next.js):** A user interface for uploading diagrams and viewing architectural reports.
*   **RabbitMQ:** Message broker for asynchronous service communication.
*   **PostgreSQL:** Relational database with isolated schemas per service.

## Trade-offs and MVP Limitations

*   **Mocked AI Pipeline:** For the purpose of this hackathon MVP, the AI extraction (OCR) and LLM classification are simulated with realistic delays and structured JSON responses. The pipeline is ready to accept real models (like OpenAI GPT-4 Vision).
*   **Shared Storage:** A local Docker volume `shared-uploads` is used across services instead of AWS S3 to maintain local operability without cloud dependencies, although it's architecturally prepared for S3.
*   **RabbitMQ Connections:** Connections are established per upload in the mock. In a production scenario, these connections must be pooled and kept alive.

## Security

*   **Authentication:** JWT-based stateless authentication verified at the API Gateway.
*   **Input Validation:** File uploads are restricted by MIME type (`.jpg`, `.png`, `.pdf`) and proxy limits.
*   **Network Isolation:** All internal microservices operate within a private Docker network and are unreachable directly from the host except via the API Gateway.
*   **Secrets:** Credentials are provided via environment variables, ready to be injected dynamically in cloud deployments (e.g., AWS Secrets Manager).

## Instructions to Run

Ensure you have Docker and Docker Compose installed.

1. Build and start the services in the background:
   ```bash
   docker-compose up -d --build
   ```
2. Access the Frontend UI at `http://localhost:3004`.
3. To login, use `admin` / `admin`.

## CI/CD
A GitHub Actions workflow is provided (`.github/workflows/ci.yml`) to perform linting, testing, and container builds on push or pull requests.
