#!/bin/bash
docker-compose -f docker-compose.prod.yml up --build -d
echo "PulseBoard running at http://localhost"
