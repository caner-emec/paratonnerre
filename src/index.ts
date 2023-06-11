/* eslint-disable node/no-unsupported-features/es-builtins */
import * as grpc from '@grpc/grpc-js';
import {
  ConnectOptions,
  connect,
  Gateway,
  checkpointers,
} from '@hyperledger/fabric-gateway';
import {createTopic, init as kafkaInit, send as kafkaSend} from './lib/kafka';
import {
  ChaincodeEventInfo,
  chaincodesForEvents,
  channelsForBlockEvent,
} from './configs/default.configs';
import {newGrpcConnection, newConnectOptions} from './lib/connection';
import {logger} from './lib/logger';
import * as figlet from 'figlet';
import {
  newBlockListener,
  newChaincodeEventListener,
  startBlockListening,
  startChaincodeEventListening,
} from './listeners/listener.manager';
import {KafkaCreateTopicCallback} from './types/listener.types';

let client: grpc.Client | undefined;
let grpcConnectionOptions: ConnectOptions | undefined;
let gateway: Gateway | undefined;

function displayAppName(): void {
  logger.info('\n\n' + figlet.textSync('Paratonnerre'));
}

async function setBlocklisteners(
  gateway: Gateway,
  channels: string[],
  createTopic: KafkaCreateTopicCallback
) {
  for (let index = 0; index < channels.length; index++) {
    logger.info(`Setting new Block Listener for channel: ${channels[index]}`);
    const result = await createTopic(
      `${process.env.KAFKA_TOPIC_HLF_BLOCKS_PREFIX ?? 'hlf_blocks'}_${
        channels[index]
      }`
    );
    logger.warn({result});
    await newBlockListener(gateway, channels[index], {
      checkpoint: await checkpointers.file(
        `${process.env.KAFKA_TOPIC_HLF_BLOCKS_PREFIX ?? 'hlf_blocks'}_${
          channels[index]
        }_checkpoint.json`
      ),
      startBlock: BigInt(0), // Used only if there is no checkpoint block number
    });
  }
}

async function setChaincodeListeners(
  gateway: Gateway,
  ccInfos: ChaincodeEventInfo[],
  createTopic: KafkaCreateTopicCallback
) {
  for (let index = 0; index < ccInfos.length; index++) {
    logger.info(
      `Setting new Chaincode Event Listener for chaincode: ${ccInfos[index].chaincode} in channel: ${ccInfos[index].channel}`
    );
    const result = await createTopic(
      `${process.env.KAFKA_TOPIC_HLF_TRANSACTION_PREFIX ?? 'hlf_txs'}_${
        ccInfos[index].channel
      }_${ccInfos[index].chaincode}`
    );
    logger.warn({result});

    await newChaincodeEventListener(
      gateway,
      ccInfos[index].channel,
      ccInfos[index].chaincode,
      {
        checkpoint: await checkpointers.file(
          `${process.env.KAFKA_TOPIC_HLF_TRANSACTION_PREFIX ?? 'hlf_txs'}_${
            ccInfos[index].channel
          }_${ccInfos[index].chaincode}checkpoint.json`
        ),
        startBlock: BigInt(0), // Used only if there is no checkpoint block number
      }
    );
  }
}

async function main(): Promise<void> {
  displayAppName();

  // set kafka settings
  kafkaInit();

  // set grpc connection
  client = await newGrpcConnection();
  grpcConnectionOptions = await newConnectOptions(client);
  gateway = connect(grpcConnectionOptions);

  logger.debug({channelsForBlockEvent});
  logger.debug({chaincodesForEvents});

  // add listeners
  await setBlocklisteners(gateway, channelsForBlockEvent, createTopic);
  await setChaincodeListeners(gateway, chaincodesForEvents, createTopic);

  // start listeners
  startBlockListening(kafkaSend);
  const promises = startChaincodeEventListening(kafkaSend);

  Promise.all(promises).catch(e => {
    logger.error(`Some error occured: ${e}`);
  });
}

main().catch(error => {
  client?.close();
  gateway?.close();

  if (error instanceof Error) {
    console.log(error);
  } else {
    console.error('\nUnexpected application error:', error);
    process.exitCode = 1;
  }
});
