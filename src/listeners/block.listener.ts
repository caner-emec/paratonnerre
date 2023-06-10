import {
  CloseableAsyncIterable,
  EventsOptions,
  Gateway,
} from '@hyperledger/fabric-gateway';
import {Block} from '@hyperledger/fabric-protos/lib/common';
import {
  BlockAndPrivateData,
  FilteredBlock,
} from '@hyperledger/fabric-protos/lib/peer';

const getBlocks = async (
  gateway: Gateway,
  channelName: string,
  options: EventsOptions
): Promise<CloseableAsyncIterable<Block>> => {
  const network = gateway.getNetwork(channelName);
  return await network.getBlockEvents(options);
};

const getFilteredBlocks = async (
  gateway: Gateway,
  channelName: string,
  options: EventsOptions
): Promise<CloseableAsyncIterable<FilteredBlock>> => {
  const network = gateway.getNetwork(channelName);
  return await network.getFilteredBlockEvents(options);
};

const getBlockAndPrivateData = async (
  gateway: Gateway,
  channelName: string,
  options: EventsOptions
): Promise<CloseableAsyncIterable<BlockAndPrivateData>> => {
  const network = gateway.getNetwork(channelName);
  return await network.getBlockAndPrivateDataEvents(options);
};

export {getBlocks, getFilteredBlocks, getBlockAndPrivateData};
