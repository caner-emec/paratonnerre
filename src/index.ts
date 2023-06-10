/* eslint-disable node/no-unsupported-features/es-builtins */
import * as grpc from '@grpc/grpc-js';
import {
  ConnectOptions,
  connect,
  Gateway,
  checkpointers,
  CloseableAsyncIterable,
} from '@hyperledger/fabric-gateway';
import {Block} from '@hyperledger/fabric-protos/lib/common';
import {
  init as kafkaInit,
  connect as kafkaConnect,
  getProducer,
  disconnect as kafkaDisconnect,
  send as kafkaSend,
} from './lib/kafka';
import {channelName} from './configs/default.configs';
import {newGrpcConnection, newConnectOptions} from './lib/connection';
import {p_constructBlock} from './lib/parser/blockParser';
import {logger} from './lib/logger';
import * as figlet from 'figlet';
import {
  newBlockListener,
  startBlockListening,
} from './listeners/listener.manager';

let client: grpc.Client | undefined;
let grpcConnectionOptions: ConnectOptions | undefined;
let gateway: Gateway | undefined;
// let blocks: CloseableAsyncIterable<Block> | undefined;

function displayAppName(): void {
  logger.info('\n\n' + figlet.textSync('Paratonnerre'));
}

async function main(): Promise<void> {
  displayAppName();

  // set kafka settings
  kafkaInit();
  const producer = getProducer();
  kafkaConnect(producer);

  client = await newGrpcConnection();
  grpcConnectionOptions = await newConnectOptions(client);
  gateway = connect(grpcConnectionOptions);

  await newBlockListener(gateway, channelName, {
    checkpoint: await checkpointers.file(
      `${
        process.env.KAFKA_TOPIC_HLF_BLOCKS_PREFIX ?? 'hlf_blocks'
      }_${channelName}_checkpoint.json`
    ),
    startBlock: BigInt(0), // Used only if there is no checkpoint block number
  });

  const promises = startBlockListening(kafkaSend);

  // Do stg.
  // export environment variables..
  // connect peer
  // set kafka broker, create topics
  // subscribe to events
  // start to listen events
  // process events
  // push to kafka
  logger.debug('Stg after awaited for loop');
  Promise.all(promises).catch(e => {
    logger.error(e);
  });
}

main().catch(error => {
  client?.close();
  gateway?.close();
  kafkaDisconnect(getProducer());

  if (error instanceof Error) {
    console.log(error);
  } else {
    console.error('\nUnexpected application error:', error);
    process.exitCode = 1;
  }
});
