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

let client: grpc.Client | undefined;
let grpcConnectionOptions: ConnectOptions | undefined;
let gateway: Gateway | undefined;
let blocks: CloseableAsyncIterable<Block> | undefined;

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

  logger.debug('Gateway connection OK, getting Network.');
  const network = gateway.getNetwork(channelName);
  const checkpointer = await checkpointers.file('checkpoint.json');

  logger.info(
    `Starting event listening from block ${
      checkpointer.getBlockNumber() ?? BigInt(0)
    }`
  );

  logger.debug(
    'Last processed transaction ID within block:',
    checkpointer.getTransactionId() ?? 'There is no processed tx.'
  );

  blocks = await network.getBlockEvents({
    checkpoint: checkpointer,
    startBlock: BigInt(0), // Used only if there is no checkpoint block number
  });

  for await (const blockProto of blocks) {
    logger.info(
      '\n*******************************************************  New block received!  *******************************************************'
    );

    const total = p_constructBlock(blockProto);
    logger.debug(`Block Number : ${total.block.header.number}`);

    logger.debug(
      `Block ${total.block.header.number} sending to kafka topic: ${process.env.KAFKA_TOPIC_HLF_BLOCKS} ..`
    );

    kafkaSend(
      producer,
      process.env.KAFKA_TOPIC_HLF_BLOCKS ?? 'hlf_blocks',
      JSON.stringify(total)
    );

    checkpointer.checkpointBlock(BigInt(total.block.header.number));
  }

  // Do stg.
  // export environment variables..
  // connect peer
  // set kafka broker, create topics
  // subscribe to events
  // start to listen events
  // process events
  // push to kafka
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
