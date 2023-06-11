#!/bin/bash

docker exec kafka-1 kafka-console-consumer --topic hlf_blocks --from-beginning --bootstrap-server localhost:9092

docker exec kafka-1 kafka-console-consumer --topic hlf_txs_mychannel_events --from-beginning --bootstrap-server localhost:9092
docker exec kafka-1 kafka-console-consumer --topic hlf_txs_mychannel_basic --from-beginning --bootstrap-server localhost:9092
docker exec kafka-1 kafka-console-consumer --topic hlf_blocks_mychannel --from-beginning --bootstrap-server localhost:9092