/* eslint-disable node/no-unsupported-features/es-builtins */
import {
  ChaincodeEvent,
  checkpointers,
  CloseableAsyncIterable,
  EventsOptions,
  Gateway,
} from '@hyperledger/fabric-gateway';
import {Block} from '@hyperledger/fabric-protos/lib/common';
import {connect, getProducer} from '../lib/kafka';
import {logger} from '../lib/logger';
import {p_constructBlock} from '../lib/parser/blockParser';
import {
  getBlockAndPrivateData,
  getBlocks,
  getFilteredBlocks,
} from './block.listener';
import {
  BlockProcessor,
  ListenerConfiguration,
  KafkaSenderCallback,
  BlockAndPrivateDataProcessor,
  FilteredBlockProcessor,
  ChaincodeEventProcessor,
} from '../types/listener.types';
import {
  BlockAndPrivateData,
  FilteredBlock,
} from '@hyperledger/fabric-protos/lib/peer';
import {getChaincodeEvents} from './chaincode.listener';
import {p_constructChaincodeEvent} from '../lib/parser/chaincodeEventParser';

const listeners: ListenerConfiguration[] = [];
const promisses: Promise<void>[] = [];

/*
    Block Listener Functions
    - newBlockListener
    - startBlockListening
    - blockProcessor
*/

const newBlockListener = async (
  gateway: Gateway,
  channelName: string,
  options: EventsOptions
) => {
  listeners.push({
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

  listeners.forEach(listenerConfig => {
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

/*
    Block And Private Data Listener Functions
    - newBlockAndPrivateDataListener
    - startBlockAndPrivateDataListening
    - blockAndPrivateDataProcessor
*/

const newBlockAndPrivateDataListener = async (
  gateway: Gateway,
  channelName: string,
  options: EventsOptions
) => {
  listeners.push({
    iter: await getBlockAndPrivateData(gateway, channelName, options),
    topic: `${
      process.env.KAFKA_TOPIC_HLF_BLOCK_AND_PRIVDATA_PREFIX ??
      'hlf_blockAndPrivData'
    }_${channelName}`,
  });
};

const startBlockAndPrivateDataListening = (
  kafkaCallback: KafkaSenderCallback,
  processingFunc?: BlockAndPrivateDataProcessor
): Promise<void>[] => {
  const pFunc =
    processingFunc === undefined
      ? blockAndPrivateDataProcessor
      : processingFunc;

  listeners.forEach(listenerConfig => {
    promisses.push(
      pFunc(
        listenerConfig.iter as CloseableAsyncIterable<BlockAndPrivateData>,
        kafkaCallback,
        listenerConfig.topic
      )
    );
  });

  return promisses;
};

// TODO!
const blockAndPrivateDataProcessor: BlockAndPrivateDataProcessor = async (
  blocks,
  callback,
  topic
) => {
  const checkpointer = await checkpointers.file(`${topic}_checkpoint.json`);
  const producer = getProducer();
  await connect(producer);

  /*
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
  } */
};

/*
    Filtered Block Listener Functions
    - newFilteredBlockListener
    - startFilteredBlockListening
    - filteredBlockProcessor
*/

const newFilteredBlockListener = async (
  gateway: Gateway,
  channelName: string,
  options: EventsOptions
) => {
  listeners.push({
    iter: await getFilteredBlocks(gateway, channelName, options),
    topic: `${
      process.env.KAFKA_TOPIC_HLF_FILTERED_BLOCK_PREFIX ?? 'hlf_filteredBlock'
    }_${channelName}`,
  });
};

const startFilteredBlockListening = (
  kafkaCallback: KafkaSenderCallback,
  processingFunc?: FilteredBlockProcessor
): Promise<void>[] => {
  const pFunc =
    processingFunc === undefined ? filteredBlockProcessor : processingFunc;

  listeners.forEach(listenerConfig => {
    promisses.push(
      pFunc(
        listenerConfig.iter as CloseableAsyncIterable<FilteredBlock>,
        kafkaCallback,
        listenerConfig.topic
      )
    );
  });

  return promisses;
};

// TODO!
const filteredBlockProcessor: FilteredBlockProcessor = async (
  blocks,
  callback,
  topic
) => {
  const checkpointer = await checkpointers.file(`${topic}_checkpoint.json`);
  const producer = getProducer();
  await connect(producer);

  /*
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
    } */
};

/*
    Chaincode Event Listener Functions
    - newChaincodeEventListener
    - startChaincodeEventListening
    - chaincodeEventProcessor
*/

const newChaincodeEventListener = async (
  gateway: Gateway,
  channelName: string,
  chaincodeName: string,
  options: EventsOptions
) => {
  listeners.push({
    iter: await getChaincodeEvents(
      gateway,
      channelName,
      chaincodeName,
      options
    ),
    topic: `${
      process.env.KAFKA_TOPIC_HLF_TRANSACTION_PREFIX ?? 'hlf_txs'
    }_${channelName}_${chaincodeName}`,
  });
};

const startChaincodeEventListening = (
  kafkaCallback: KafkaSenderCallback,
  processingFunc?: ChaincodeEventProcessor
): Promise<void>[] => {
  const pFunc =
    processingFunc === undefined ? chaincodeEventProcessor : processingFunc;
  listeners.forEach(listenerConfig => {
    promisses.push(
      pFunc(
        listenerConfig.iter as CloseableAsyncIterable<ChaincodeEvent>,
        kafkaCallback,
        listenerConfig.topic
      )
    );
  });

  return promisses;
};

const chaincodeEventProcessor: ChaincodeEventProcessor = async (
  ccEvents,
  callback,
  topic
) => {
  const checkpointer = await checkpointers.file(`${topic}_checkpoint.json`);
  const producer = getProducer();
  await connect(producer);

  for await (const ccEvent of ccEvents) {
    logger.info(
      '\n*******************************************************  New chaincode event received!  *******************************************************'
    );

    const total = p_constructChaincodeEvent(ccEvent);
    logger.debug(
      `Event:  Name: ${total.chaincodeEvent.eventName}, Tx Id:${total.chaincodeEvent.transactionId}`
    );

    logger.info(total);

    logger.debug(
      `Event:  Name: ${total.chaincodeEvent.eventName} sending to kafka topic: ${topic} ..`
    );

    callback(producer, topic, JSON.stringify(total)).catch(e => {
      logger.error(`Producer has an error. Producer Topic: ${topic}`);
      logger.error(e);
    });

    await checkpointer.checkpointChaincodeEvent(ccEvent);
  }
};

export {
  newBlockListener,
  startBlockListening,
  newBlockAndPrivateDataListener,
  startBlockAndPrivateDataListening,
  newFilteredBlockListener,
  startFilteredBlockListening,
  newChaincodeEventListener,
  startChaincodeEventListening,
};
