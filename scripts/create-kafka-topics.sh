#!/bin/bash

docker exec kafka-1 kafka-topics --create  --replication-factor 1 --partitions 1 --topic hlf_blocks --bootstrap-server localhost:9092

docker exec kafka-1 kafka-topics --create  --replication-factor 1 --partitions 1 --topic hlf_txs --bootstrap-server localhost:9092