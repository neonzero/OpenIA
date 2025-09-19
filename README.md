# OpenIA

## Backend services

The `backend/` folder contains an Express-style implementation of the Governance, Risk and Compliance (GRC) services, including:

- Auth, Risk, Audit, and Report APIs with OpenAPI documentation exposed at `/openapi.json`.
- Domain models with validation, PostgreSQL-style repositories, Redis caching, and Kafka/RabbitMQ-inspired event publishing stubs.
- Business services such as `RiskEngine`, `AuditEngine`, `Feedback`, `CoreIntegration`, `COSO`, and `IIA`.

### Development

```bash
cd backend
npm test
```

Run `npm start` to launch the API server (defaults to port `3000`).
