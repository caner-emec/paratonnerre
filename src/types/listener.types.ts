import {
  ChaincodeEvent,
  CloseableAsyncIterable,
} from '@hyperledger/fabric-gateway';
import {Block} from '@hyperledger/fabric-protos/lib/common';
import {
  BlockAndPrivateData,
  FilteredBlock,
} from '@hyperledger/fabric-protos/lib/peer';
import {Producer} from 'kafkajs';

type BlockProcessor = (
  blocks: CloseableAsyncIterable<Block>,
  callback: KafkaSenderCallback,
  topic: string
) => Promise<void>;

type BlockAndPrivateDataProcessor = (
  blocks: CloseableAsyncIterable<BlockAndPrivateData>,
  callback: KafkaSenderCallback,
  topic: string
) => Promise<void>;

type FilteredBlockProcessor = (
  blocks: CloseableAsyncIterable<FilteredBlock>,
  callback: KafkaSenderCallback,
  topic: string
) => Promise<void>;

type ChaincodeEventProcessor = (
  blocks: CloseableAsyncIterable<ChaincodeEvent>,
  callback: KafkaSenderCallback,
  topic: string
) => Promise<void>;

type KafkaSenderCallback = (
  prod: Producer,
  topic: string,
  msg: string | Buffer | null
) => Promise<void>;

type KafkaCreateTopicCallback = (topic: string) => Promise<boolean>;

type ListenerConfiguration = {
  iter:
    | CloseableAsyncIterable<Block>
    | CloseableAsyncIterable<BlockAndPrivateData>
    | CloseableAsyncIterable<FilteredBlock>
    | CloseableAsyncIterable<ChaincodeEvent>;
  topic: string;
};

export {
  KafkaSenderCallback,
  BlockProcessor,
  BlockAndPrivateDataProcessor,
  FilteredBlockProcessor,
  ChaincodeEventProcessor,
  ListenerConfiguration,
  KafkaCreateTopicCallback,
};
