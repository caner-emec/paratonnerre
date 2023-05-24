import * as grpc from '@grpc/grpc-js';
import {
  ConnectOptions,
  connect,
  Gateway,
  checkpointers,
  CloseableAsyncIterable,
} from '@hyperledger/fabric-gateway';
import {Block} from '@hyperledger/fabric-protos/lib/common';
import {channelName} from './configs/default.configs';
import {newGrpcConnection, newConnectOptions} from './lib/connection';
import {p_constructBlock} from './lib/parser/blockParser';

//
let client: grpc.Client | undefined;
let grpcConnectionOptions: ConnectOptions | undefined;
let gateway: Gateway | undefined;
let blocks: CloseableAsyncIterable<Block> | undefined;

async function main(): Promise<void> {
  client = await newGrpcConnection();
  grpcConnectionOptions = await newConnectOptions(client);
  gateway = connect(grpcConnectionOptions);

  const network = gateway.getNetwork(channelName);
  const checkpointer = await checkpointers.file('checkpoint.json');

  console.log(
    `Starting event listening from block ${
      checkpointer.getBlockNumber() ?? BigInt(0)
    }`
  );
  console.log(
    'Last processed transaction ID within block:',
    checkpointer.getTransactionId()
  );

  blocks = await network.getBlockEvents({
    checkpoint: checkpointer,
    startBlock: BigInt(0), // Used only if there is no checkpoint block number
  });

  for await (const blockProto of blocks) {
    console.log(
      '\n\n*******************************************************\n\n'
    );

    const total = p_constructBlock(blockProto);

    console.log(JSON.stringify(total, null, 2));

    // console.log(blockProto.getData()?.getDataList_asB64());
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

  if (error instanceof Error) {
    console.log(error);
  } else {
    console.error('\nUnexpected application error:', error);
    process.exitCode = 1;
  }
});
