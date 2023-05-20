//
import * as grpc from '@grpc/grpc-js';
import {
  ConnectOptions,
  connect,
  Gateway,
  checkpointers,
  CloseableAsyncIterable,
} from '@hyperledger/fabric-gateway';
import {common, msp} from '@hyperledger/fabric-protos';
import {
  Block,
  BlockData,
  BlockHeader,
} from '@hyperledger/fabric-protos/lib/common';
import {channelName} from './configs/default.configs';
import {newGrpcConnection, newConnectOptions} from './lib/connection';
import {checkUndefined} from './utils/utils';
import {
  p_getBlockHeader,
  p_getBlockMetadata,
  p_getPayloadHeader,
  p_getPayloadData,
} from './lib/parser/blockParser';

//
let client: grpc.Client | undefined;
let grpcConnectionOptions: ConnectOptions | undefined;
let gateway: Gateway | undefined;
let blocks: CloseableAsyncIterable<Block> | undefined;

async function main(): Promise<void> {
  client = await newGrpcConnection();
  grpcConnectionOptions = await newConnectOptions(client);
  gateway = connect(grpcConnectionOptions);

  console.log(gateway);
  console.log(client);

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

    const blockData = checkUndefined(
      blockProto.getData(),
      'Block not contain any data!'
    );

    const blockDataDeserialized = blockData
      .getDataList_asU8()
      .map(dataBytes => common.Envelope.deserializeBinary(dataBytes));

    const blockPayloads: object[] = [];
    blockDataDeserialized.forEach(bData => {
      const payload = common.Payload.deserializeBinary(bData.getPayload_asU8());

      blockPayloads.push({
        payloadHeader: p_getPayloadHeader(payload),
        payloadData: p_getPayloadData(payload),
      });
    });

    const total = {
      block: {
        metadata: p_getBlockMetadata(blockProto, 'Base64'),
        header: p_getBlockHeader(blockProto, 'hexString'),
        data: blockPayloads,
      },
    };
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
