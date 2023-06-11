/* eslint-disable node/no-unsupported-features/es-builtins */
import * as grpc from '@grpc/grpc-js';
import {
  ConnectOptions,
  connect,
  Gateway,
  checkpointers,
} from '@hyperledger/fabric-gateway';
import {init as kafkaInit, send as kafkaSend} from './lib/kafka';
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

let client: grpc.Client | undefined;
let grpcConnectionOptions: ConnectOptions | undefined;
let gateway: Gateway | undefined;

function displayAppName(): void {
  logger.info('\n\n' + figlet.textSync('Paratonnerre'));
}

async function setBlocklisteners(gateway: Gateway, channels: string[]) {
  for (let index = 0; index < channels.length; index++) {
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
  ccInfos: ChaincodeEventInfo[]
) {
  for (let index = 0; index < ccInfos.length; index++) {
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

  client = await newGrpcConnection();
  grpcConnectionOptions = await newConnectOptions(client);
  gateway = connect(grpcConnectionOptions);

  logger.warn({channelsForBlockEvent});
  logger.warn({chaincodesForEvents});

  await setBlocklisteners(gateway, channelsForBlockEvent);
  await setChaincodeListeners(gateway, chaincodesForEvents);

  startBlockListening(kafkaSend);
  const promises = startChaincodeEventListening(kafkaSend);

  logger.debug('Stg after awaited for loop');
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
