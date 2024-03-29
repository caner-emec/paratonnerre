import {common, ledger, msp, peer} from '@hyperledger/fabric-protos';
import {checkUndefined, toHexString} from '../../utils/utils';
import {
  ChaincodeSpecType,
  ProcessedChaincodeActionPayload,
  ProcessedChaincodeEndorsedAction,
  ProcessedChaincodeInput,
  ProcessedChaincodeInvocationSpec,
  ProcessedChaincodeProposalPayload,
  ProcessedHeaderTypeEnum,
  ProcessedPayloadDataForEndorsedTx,
  ProcessedProposalResponsePayload,
  ProcessedSignatureHeader,
  ProcessedTxActionsEntry,
  ProcessedChaincodeId,
  ProcessedChaincodeEvent,
  ProcessedChaincodeResponse,
  ProcessedResultsRWs,
  ProcessedChaincodeAction,
} from '../../types/default.types';
import {p_DeserializeIdentity} from './parserUtils';
import {ProcessedEndorsmentEntry} from '../../types/block.types';
import {parseTxPvtRWSet, parseTxRWSet} from './txrwsetParser';
import {logger} from '../logger';

function p_getPayloadData(
  payload: common.Payload,
  txType: number
): ProcessedPayloadDataForEndorsedTx | object {
  let result: object = {};
  switch (txType) {
    case common.HeaderType.ENDORSER_TRANSACTION:
      logger.info('Transaction Type: ENDORSER_TRANSACTION TX');

      result = p_getPayloadDataForEndorsedTx(payload);
      break;

    case common.HeaderType.ORDERER_TRANSACTION:
      logger.info('Transaction Type: ORDERER_TRANSACTION TX');

      break;

    case common.HeaderType.CONFIG:
      logger.info('Transaction Type: CONFIG TX');
      break;

    case common.HeaderType.CONFIG_UPDATE:
      logger.info('Transaction Type: CONFIG_UPDATE TX');

      break;

    case common.HeaderType.MESSAGE:
      logger.info('Transaction Type: MESSAGE TX');

      break;

    case common.HeaderType.CHAINCODE_PACKAGE:
      logger.info('Transaction Type: CHAINCODE_PACKAGE TX');

      break;

    case common.HeaderType.DELIVER_SEEK_INFO:
      logger.info('Transaction Type: DELIVER_SEEK_INFO TX');

      break;

    default:
      break;
  }

  return result;
}

function p_getPayloadDataForEndorsedTx(
  payload: common.Payload
): ProcessedPayloadDataForEndorsedTx {
  const tx = peer.Transaction.deserializeBinary(payload.getData_asU8());
  return {
    transactionActions: p_getTxActions(tx),
  };
}

function p_getTxActions(
  transaction: peer.Transaction
): ProcessedTxActionsEntry[] {
  const result: ProcessedTxActionsEntry[] = [];
  transaction.getActionsList().forEach(txAction => {
    //

    const chaincodeActionPayload =
      peer.ChaincodeActionPayload.deserializeBinary(txAction.getPayload_asU8());

    result.push({
      proposalActionHeader: p_getSignatureHeader(
        common.SignatureHeader.deserializeBinary(txAction.getHeader_asU8()),
        'Base64'
      ),
      chaincodeActionPayload: p_getChaincodeActionPayload(
        chaincodeActionPayload
      ),
    });
  });

  return result;
}

function p_getChaincodeActionPayload(
  ccActionPayload: peer.ChaincodeActionPayload
): ProcessedChaincodeActionPayload {
  //

  return {
    chaincodeEndorsedAction: p_getChaincodeEndorsedAction(
      checkUndefined(ccActionPayload.getAction(), 'Error')
    ),
    chaincodeProposalPayload: p_getChaincodeProposalPayload(
      peer.ChaincodeProposalPayload.deserializeBinary(
        ccActionPayload.getChaincodeProposalPayload_asU8()
      )
    ),
  };
}

function p_getChaincodeProposalPayload(
  chaincodePropasalPayload: peer.ChaincodeProposalPayload
): ProcessedChaincodeProposalPayload {
  const chaincodeInput = peer.ChaincodeInvocationSpec.deserializeBinary(
    chaincodePropasalPayload.getInput_asU8()
  );

  return {
    chaincodeInvocationSpecInput: p_getChaincodeInvocationSpec(chaincodeInput),
  };
}

function p_getChaincodeInvocationSpec(
  ccInvokeSpec: peer.ChaincodeInvocationSpec
): ProcessedChaincodeInvocationSpec {
  //

  const chaincodeInvokeSpec = checkUndefined(
    ccInvokeSpec.getChaincodeSpec(),
    'Chaincode spec not defined!'
  );

  const chaincodeInput = checkUndefined(
    chaincodeInvokeSpec.getInput(),
    'CC input not defined!'
  );

  return {
    ChaincodeSpec: {
      type: ChaincodeSpecType[chaincodeInvokeSpec.getType()],
      chaincodeId: p_getChaincodeId(chaincodeInvokeSpec.getChaincodeId()),
      input: p_getChaincodeInput(chaincodeInput),
      timeout: chaincodeInvokeSpec.getTimeout(),
    },
  };
}

function p_getChaincodeInput(
  ccInput: peer.ChaincodeInput
): ProcessedChaincodeInput {
  return {
    args: ccInput.getArgsList_asU8().map(byte => String.fromCharCode(...byte)),
    isInit: ccInput.getIsInit(),
  };
}

function p_getChaincodeEndorsedAction(
  ccEndorsedAction: peer.ChaincodeEndorsedAction
): ProcessedChaincodeEndorsedAction {
  //
  const proposalResponsePayload =
    peer.ProposalResponsePayload.deserializeBinary(
      ccEndorsedAction.getProposalResponsePayload_asU8()
    );

  return {
    endorsments: p_getEndorsments(ccEndorsedAction, 'Base64'),
    proposalResponsePayload: p_getProposalResponsePayload(
      proposalResponsePayload
    ),
  };
}

function p_getProposalResponsePayload(
  proposalResponsePayload: peer.ProposalResponsePayload
): ProcessedProposalResponsePayload {
  //

  const chaincodeAction = peer.ChaincodeAction.deserializeBinary(
    proposalResponsePayload.getExtension_asU8()
  );

  return {
    proposalHash: toHexString(proposalResponsePayload.getProposalHash_asU8()),
    extensionChaincodeAction: p_getChaincodeAction(chaincodeAction),
  };
}

function p_getChaincodeAction(
  ccAction: peer.ChaincodeAction
): ProcessedChaincodeAction {
  const ccEvent = peer.ChaincodeEvent.deserializeBinary(
    ccAction.getEvents_asU8()
  );

  return {
    chaincodeId: p_getChaincodeId(ccAction.getChaincodeId()),
    chaincodeEvent: p_getChaincodeEvent(ccEvent),
    chaincodeResponse: p_getChaincodeResponse(ccAction.getResponse()),
    chaincodeResults: p_getResultsRWs(ccAction.getResults_asU8()),
  };
}

function p_getResultsRWs(results: Uint8Array): ProcessedResultsRWs {
  return {
    txRWSet: parseTxRWSet(
      ledger.rwset.TxReadWriteSet.deserializeBinary(results)
    ),
    txPvtRWSet: parseTxPvtRWSet(
      ledger.rwset.TxPvtReadWriteSet.deserializeBinary(results)
    ),
  };
}

function p_getChaincodeResponse(
  response: peer.Response | undefined
): ProcessedChaincodeResponse {
  //
  return {
    status: response?.getStatus(),
    message: response?.getMessage() ?? '',
  };
}

function p_getChaincodeEvent(
  ccEvent: peer.ChaincodeEvent
): ProcessedChaincodeEvent {
  //
  return {
    chaincodeId: ccEvent.getChaincodeId(),
    txId: ccEvent.getTxId(),
    eventName: ccEvent.getEventName(),
    payload: String.fromCharCode(...ccEvent.getPayload_asU8()),
  };
}

function p_getChaincodeId(
  ccId: peer.ChaincodeID | undefined
): ProcessedChaincodeId {
  return {
    name: ccId?.getName() ?? '',
    path: ccId?.getPath() ?? '',
    version: ccId?.getVersion() ?? '',
  };
}

function p_getHeader(header: common.Header): object {
  const channelHeader = common.ChannelHeader.deserializeBinary(
    header.getChannelHeader_asU8()
  );

  const signatureHeader = common.SignatureHeader.deserializeBinary(
    header.getSignatureHeader_asU8()
  );

  return {
    channelHeader: p_getChannelHeader(channelHeader),
    signatureHeader: p_getSignatureHeader(signatureHeader, 'Base64'),
  };
}

function p_getChannelHeader(channelHeader: common.ChannelHeader): object {
  return {
    type: ProcessedHeaderTypeEnum[channelHeader.getType()], // Header types 0-10000 are reserved and defined by HeaderType
    version: channelHeader.getVersion(), // Version indicates message protocol version
    timestamp: channelHeader.getTimestamp()?.toDate(),
    channelId: channelHeader.getChannelId(),
    txId: channelHeader.getTxId(),
    epoch: channelHeader.getEpoch(),
    tlsCertHash: toHexString(channelHeader.getTlsCertHash_asU8()),
  };
}

function p_getSignatureHeader(
  signatureHeader: common.SignatureHeader,
  format: 'byteArray' | 'Base64' | 'hexString'
): ProcessedSignatureHeader {
  const deserializedIdentity = msp.SerializedIdentity.deserializeBinary(
    signatureHeader.getCreator_asU8()
  );

  const id = p_DeserializeIdentity(deserializedIdentity, format);

  return {
    creator: id,
    nonce: Number(
      Buffer.from(signatureHeader.getNonce_asU8()).readBigInt64LE()
    ),
  };
}

function p_getEndorsments(
  action: peer.ChaincodeEndorsedAction,
  format: 'byteArray' | 'Base64' | 'hexString'
): ProcessedEndorsmentEntry[] {
  const endorsers: ProcessedEndorsmentEntry[] = [];
  action.getEndorsementsList().forEach(endorsment => {
    const endorser = msp.SerializedIdentity.deserializeBinary(
      endorsment.getEndorser_asU8()
    );

    endorsers.push({
      endorser: p_DeserializeIdentity(endorser, format),
      signature: toHexString(endorsment.getSignature_asU8()),
    });
  });
  return endorsers;
}

export {p_getPayloadData};
