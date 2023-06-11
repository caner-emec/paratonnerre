import {
  ChaincodeEvent,
  CloseableAsyncIterable,
  EventsOptions,
  Gateway,
} from '@hyperledger/fabric-gateway';

const getChaincodeEvents = async (
  gateway: Gateway,
  channelName: string,
  chaincodeName: string,
  options: EventsOptions
): Promise<CloseableAsyncIterable<ChaincodeEvent>> => {
  const network = gateway.getNetwork(channelName);

  return await network.getChaincodeEvents(chaincodeName, options);
};

export {getChaincodeEvents};
