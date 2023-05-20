import {common, ledger, msp, peer} from '@hyperledger/fabric-protos';
import {checkUndefined, toHexString} from '../../utils/utils';
import {
  ProcessedChaincodeEventInfo,
  ProcessedChaincodeInfo,
  ProcessedId,
} from '../../types/default.types';
import {p_DeserializeIdentity} from './parserUtils';
import {ProcessedEndorsmentEntry} from '../../types/block.types';

function p_getPayloadData(payload: common.Payload, txType: number): object {
  switch (txType) {
    case common.HeaderType.ENDORSER_TRANSACTION:
      break;

    case common.HeaderType.ORDERER_TRANSACTION:
      break;

    case common.HeaderType.CONFIG:
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

  return {};
}

function p_getPayloadDataForEndorsedTx(payload: common.Payload): object {
  const actions: object[] = [];
  const tx = peer.Transaction.deserializeBinary(payload.getData_asU8());
  tx.getActionsList().forEach(action => {
    // skip header for now..

    // continue with chaincode action payload
    const chaincodeActionPayload =
      peer.ChaincodeActionPayload.deserializeBinary(action.getPayload_asU8());

    // check chaincode endorsed actions ..
    let endorsments: ProcessedEndorsmentEntry[] = [];
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

      proposalResponsePayload.getProposalHash_asU8();
      proposalResponsePayload.getExtension_asU8();
    }

    // construct stg.
    actions.push({
      payload: {
        endorsments: endorsments,
      },
    });
  });
  return {
    actions: actions,
  };
}

//////////////////////////777

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
