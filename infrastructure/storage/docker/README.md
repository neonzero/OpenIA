# Local Docker Definitions

The files in this folder provide optional container definitions when you need direct access to Redis or Kafka outside of the main `docker-compose.yml` stack.

- `redis/` includes a Dockerfile and configuration that extends the official Redis image with a sample configuration enabling append-only persistence.
- `kafka/docker-compose.yml` runs a single-node Kafka cluster together with Zookeeper using Bitnami images.

These resources are referenced by the root-level Compose file but can also be used independently for quick experiments.
