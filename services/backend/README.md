# Backend Service Stub

This directory provides a minimal Docker build context for API and background services. It installs dependencies from `requirements.txt` and leaves the container running so you can attach and start your preferred application server manually during local development.

Replace the placeholder command in the root `docker-compose.yml` with the entrypoint for your framework (e.g., Django, FastAPI, Express).
