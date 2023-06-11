import {ChaincodeEvent} from '@hyperledger/fabric-gateway';
import {ProcessedChaincodeEvent} from '../../types/chaincodeEvent.types';
import {logger} from '../logger';

function p_constructChaincodeEvent(
  chaincodeEvent: ChaincodeEvent
): ProcessedChaincodeEvent {
  logger.info('Chaincode Event Data contruction started!');

  return {
    chaincodeEvent: {
      transactionId: chaincodeEvent.transactionId,
      blockNumber: Number(chaincodeEvent.blockNumber),
      eventName: chaincodeEvent.eventName,
      chaincodeName: chaincodeEvent.chaincodeName,
      payload: String.fromCharCode(...chaincodeEvent.payload),
    },
  };
}

export {p_constructChaincodeEvent};
