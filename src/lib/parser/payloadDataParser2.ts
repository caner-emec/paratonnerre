import {common, ledger, msp, peer} from '@hyperledger/fabric-protos';
import {checkUndefined, toHexString} from '../../utils/utils';
import {
  ChaincodeSpecType,
  ProcessedHeaderTypeEnum,
  ProcessedSignatureHeader,
} from '../../types/default.types';
import {p_DeserializeIdentity} from './parserUtils';
import {ProcessedEndorsmentEntry} from '../../types/block.types';
import {parseTxPvtRWSet, parseTxRWSet} from './txrwsetParser';

function p_getPayloadData(payload: common.Payload, txType: number): object {
  let result: object = {};
  switch (txType) {
    case common.HeaderType.ENDORSER_TRANSACTION:
      result = p_getPayloadDataForEndorsedTx(payload);
      break;

    case common.HeaderType.ORDERER_TRANSACTION:
      break;

    case common.HeaderType.CONFIG:
      console.log('This is a CONFIG TYPE TX');
      break;

    case common.HeaderType.CONFIG_UPDATE:
      break;

    case common.HeaderType.MESSAGE:
      break;

    case common.HeaderType.CHAINCODE_PACKAGE:
      break;

    case common.HeaderType.DELIVER_SEEK_INFO:
      break;

    default:
      break;
  }

  return result;
}

function p_getPayloadDataForEndorsedTx(payload: common.Payload): object {
  const actions: object[] = [];
  const tx = peer.Transaction.deserializeBinary(payload.getData_asU8());
  console.log('i m here: p_getPayloadDataForEndorsedTx');
  return {
    transactionActions: p_getTxActions(tx),
  };

  /*
  tx.getActionsList().forEach(action => {
    // skip header for now..

    // continue with chaincode action payload
    const chaincodeActionPayload =
      peer.ChaincodeActionPayload.deserializeBinary(action.getPayload_asU8());

    // get chaincode proposal payload
    const ccProposalPayload = p_getChaincodeProposalPayload(
      peer.ChaincodeProposalPayload.deserializeBinary(
        chaincodeActionPayload.getChaincodeProposalPayload_asU8()
      )
    );

    // check chaincode endorsed actions ..
    let endorsments: ProcessedEndorsmentEntry[] = [];
    let processedProposalResponsePayload: object = {};
    if (chaincodeActionPayload.hasAction()) {
      const chaincodeEndorsedAction = checkUndefined(
        chaincodeActionPayload.getAction(),
        'chaincode endorsed actions are undefined!'
      );

      // Get endorsments
      endorsments = p_getEndorsments(chaincodeEndorsedAction, 'Base64');

      // Get proposal response payload
      const proposalResponsePayload =
        peer.ProposalResponsePayload.deserializeBinary(
          chaincodeEndorsedAction.getProposalResponsePayload_asU8()
        );

      processedProposalResponsePayload = {
        proposalHash: toHexString(
          proposalResponsePayload.getProposalHash_asU8()
        ),
        proposalExtension: p_getChaincodeAction(
          peer.ChaincodeAction.deserializeBinary(
            proposalResponsePayload.getExtension_asU8()
          )
        ),
      };
    }

    // construct stg.
    actions.push({
      payload: {
        endorsments: endorsments,
        proposalResponsePayload: processedProposalResponsePayload,
      },
    });
  });

  // return template ..
  return {
    header: {},
    txActions: [
      {
        header: {},
        chaincodeActionPayload: {
          chaincodeEndorsedAction: {
            endorsments: [
              {
                endorser: {
                  mspId: '',
                  id: '',
                },
                signature: '',
              },
            ],
            proposalResponsePayload: {
              proposalHash: '',
              proposalExtension: {}, //peer.ChaincodeAction
            },
          },
          chaincodeProposalPayload: {}, // TO DO !!
        },
      },
    ],
  };

  */

  /* return {
    actions: actions,
  }; */
}

function p_getTxActions(transaction: peer.Transaction): object[] {
  const result: object[] = [];
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
): object {
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
): object {
  const chaincodeInput = peer.ChaincodeInvocationSpec.deserializeBinary(
    chaincodePropasalPayload.getInput_asU8()
  );

  return {
    chaincodeInvocationSpecInput: p_getChaincodeInvocationSpec(chaincodeInput),
  };
}

function p_getChaincodeInvocationSpec(
  ccInvokeSpec: peer.ChaincodeInvocationSpec
): object {
  //
  return {
    ChaincodeSpec: {
      type: ChaincodeSpecType[ccInvokeSpec.getChaincodeSpec()?.getType() ?? 0],
      chaincodeId: p_getChaincodeId(
        ccInvokeSpec.getChaincodeSpec()?.getChaincodeId()
      ),
      input: p_getChaincodeInput(ccInvokeSpec.getChaincodeSpec()?.getInput()),
      timeout: ccInvokeSpec.getChaincodeSpec()?.getTimeout(),
    },
  };
}

function p_getChaincodeInput(ccInput: peer.ChaincodeInput | undefined): object {
  if (ccInput === undefined) {
    return {};
  }

  return {
    args: ccInput.getArgsList_asU8().map(byte => String.fromCharCode(...byte)),
    isInit: ccInput.getIsInit(),
  };
}

function p_getChaincodeEndorsedAction(
  ccEndorsedAction: peer.ChaincodeEndorsedAction
): object {
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
): object {
  //

  const chaincodeAction = peer.ChaincodeAction.deserializeBinary(
    proposalResponsePayload.getExtension_asU8()
  );

  return {
    proposalHash: toHexString(proposalResponsePayload.getProposalHash_asU8()),
    extensionChaincodeAction: p_getChaincodeAction(chaincodeAction),
  };
}

// TODO
function p_getChaincodeAction(ccAction: peer.ChaincodeAction): object {
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

function p_getResultsRWs(results: Uint8Array): object {
  return {
    txRWSet: parseTxRWSet(
      ledger.rwset.TxReadWriteSet.deserializeBinary(results)
    ),
    txPvtRWSet: parseTxPvtRWSet(
      ledger.rwset.TxPvtReadWriteSet.deserializeBinary(results)
    ),
  };
}

function p_getChaincodeResponse(response: peer.Response | undefined): object {
  //
  // const payload: Uint8Array = response?.getPayload_asU8() ?? new Uint8Array();
  return {
    status: response?.getStatus(),
    message: response?.getMessage(),
    // payload: String.fromCharCode(...payload),
  };
}

function p_getChaincodeEvent(ccEvent: peer.ChaincodeEvent): object {
  //
  return {
    chaincodeId: ccEvent.getChaincodeId(),
    txId: ccEvent.getTxId(),
    eventName: ccEvent.getEventName(),
    payload: String.fromCharCode(...ccEvent.getPayload_asU8()),
  };
}

function p_getChaincodeId(ccId: peer.ChaincodeID | undefined): object {
  return {
    name: ccId?.getName(),
    path: ccId?.getPath(),
    version: ccId?.getVersion(),
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
