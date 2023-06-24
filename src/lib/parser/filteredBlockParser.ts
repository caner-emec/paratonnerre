import {
  FilteredBlock,
  FilteredTransaction,
  FilteredTransactionActions,
} from '@hyperledger/fabric-protos/lib/peer';
import {TxValidationCode} from '../../types/block.types';
import {ProcessedHeaderTypeEnum} from '../../types/default.types';
import {
  ProcessedFilteredBlock,
  ProcessedFilteredTx,
  ProcessedTxAction,
} from '../../types/filteredBlock.types';
import {logger} from '../logger';

function p_constructFilteredBlock(
  filteredBlock: FilteredBlock
): ProcessedFilteredBlock {
  logger.info('Filtered Block Data contruction started!');

  return {
    channelID: filteredBlock.getChannelId(),
    number: filteredBlock.getNumber(),
    filteredTxs: p_filteredTxList(filteredBlock.getFilteredTransactionsList()),
  };
}

function p_filteredTxList(
  filteredTxs: FilteredTransaction[]
): ProcessedFilteredTx[] {
  const processedTxs: ProcessedFilteredTx[] = [];
  filteredTxs.forEach(filteredTx => {
    processedTxs.push({
      txId: filteredTx.getTxid(),
      type: ProcessedHeaderTypeEnum[filteredTx.getType()], // headerType
      validationCode: TxValidationCode[filteredTx.getTxValidationCode()],
      actions: p_filteredTxActions(filteredTx.getTransactionActions()),
    });
  });
  return processedTxs;
}

function p_filteredTxActions(
  fTxActions: FilteredTransactionActions | undefined
): ProcessedTxAction[] | undefined {
  if (fTxActions === undefined) {
    return undefined;
  }

  const processedTxctions: ProcessedTxAction[] = [];

  fTxActions.getChaincodeActionsList().forEach(ccAction => {
    const ccEvent = ccAction.getChaincodeEvent();
    if (ccAction.hasChaincodeEvent() && ccEvent !== undefined) {
      processedTxctions.push({
        chaincodeEvent: {
          transactionId: ccEvent.getTxId(),
          eventName: ccEvent.getEventName(),
          chaincodeName: ccEvent.getChaincodeId(),
          payload: String.fromCharCode(...ccEvent.getPayload_asU8()),
        },
      });
    }
    ccAction.getChaincodeEvent();
  });

  return processedTxctions;
}

export {p_constructFilteredBlock};
