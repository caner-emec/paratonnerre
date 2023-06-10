/* eslint-disable node/no-unsupported-features/es-builtins */
import {
  checkpointers,
  CloseableAsyncIterable,
  EventsOptions,
  Gateway,
} from '@hyperledger/fabric-gateway';
import {Block} from '@hyperledger/fabric-protos/lib/common';
import {connect, getProducer} from '../lib/kafka';
import {logger} from '../lib/logger';
import {p_constructBlock} from '../lib/parser/blockParser';
import {getBlocks} from './block.listener';
import {
  BlockProcessor,
  ListenerConfiguration,
  KafkaSenderCallback,
} from '../types/listener.types';

const blocklisteners: ListenerConfiguration[] = [];
const promisses: Promise<void>[] = [];

const newBlockListener = async (
  gateway: Gateway,
  channelName: string,
  options: EventsOptions
) => {
  blocklisteners.push({
    iter: await getBlocks(gateway, channelName, options),
    topic: `${
      process.env.KAFKA_TOPIC_HLF_BLOCKS_PREFIX ?? 'hlf_blocks'
    }_${channelName}`,
  });
};

const startBlockListening = (
  kafkaCallback: KafkaSenderCallback,
  processingFunc?: BlockProcessor
): Promise<void>[] => {
  const pFunc = processingFunc === undefined ? blockProcessor : processingFunc;

  blocklisteners.forEach(listenerConfig => {
    promisses.push(
      pFunc(
        listenerConfig.iter as CloseableAsyncIterable<Block>,
        kafkaCallback,
        listenerConfig.topic
      )
    );
  });

  return promisses;
};

const blockProcessor: BlockProcessor = async (blocks, callback, topic) => {
  const checkpointer = await checkpointers.file(`${topic}_checkpoint.json`);
  const producer = getProducer();
  await connect(producer);

  for await (const blockProto of blocks) {
    logger.info(
      '\n*******************************************************  New block received!  *******************************************************'
    );

    const total = p_constructBlock(blockProto);
    logger.debug(`Block Number : ${total.block.header.number}`);

    logger.debug(
      `Block ${total.block.header.number} sending to kafka topic: ${topic} ..`
    );

    callback(producer, topic, JSON.stringify(total)).catch(e => {
      logger.error(`Producer has an error. Producer Topic: ${topic}`);
      logger.error(e);
    });

    checkpointer.checkpointBlock(BigInt(total.block.header.number));
  }
};

export {blockProcessor, newBlockListener, startBlockListening};
