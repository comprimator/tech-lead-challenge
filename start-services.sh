#!/bin/sh
### shell script for running app services

docker compose up -d log-query log-processor log-alerting log-indexer log-ingestor