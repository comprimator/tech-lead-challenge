#!/bin/sh
### shell script for running the infrastructure services

docker compose -f docker-compose-infra.yml up -d