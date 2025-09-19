# Storage Stubs and Configuration

This directory contains configuration templates and lightweight client stubs for integrating with cloud storage providers and message/cache infrastructure. They are intended to be replaced with production-ready implementations while keeping a consistent contract for local development and testing.

## Contents

- `config.example.yml` – template for environment-specific settings covering PostgreSQL, Redis, Kafka, and storage backends.
- `s3_stub.py` – a minimal client that mimics upload/download/delete behavior against Amazon S3.
- `blob_stub.py` – a similar stub for Azure Blob Storage.
- `docker/` – sample Docker definitions that can be used as overrides when running Redis and Kafka locally.

Copy `config.example.yml` to `config.yml` and adapt the values for your environment before running the bootstrap script.
