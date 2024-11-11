#How to install and run the project

## Prerequisites
Docker and docker-compose must be installed on your machine. If you don't have it, you can download it [here](https://docs.docker.com/get-docker/).

## Installation
1. Clone the repository

2. Go to the project directory

3. Run the following command to build the project:

Run docker-compose up to start the infrastructure:
```bash
./start-infra.sh
```

Run the following command to build the project:
```bash
cd log-analysis
npm install
npm run build:all
```

Then, run the following command to start the project:
```bash
npm run start:all
```
or just run the following command to start the project as docker containers:

```bash
./start-services.sh
```

## Accessing the project
As API gateway is not implemented, you can access the services directly:

Query service: http://localhost:3004 and  Swagger UI: http://localhost:3004/api
Ingestion service: http://localhost:3005 and Swagger UI: http://localhost:3005/api
Alerting service: http://localhost:3006 and Swagger UI: http://localhost:3006/api

Enjoy! :)
```