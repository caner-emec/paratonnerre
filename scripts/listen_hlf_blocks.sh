#!/bin/bash

docker exec kafka-1 kafka-console-consumer --topic hlf_blocks --from-beginning --bootstrap-server localhost:9092