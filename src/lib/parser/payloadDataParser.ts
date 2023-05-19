import {common, ledger, msp, peer} from '@hyperledger/fabric-protos';
import {checkUndefined, toHexString} from '../../utils/utils';
import {ProcessedSignatureHeader, ProcessedId} from '../../types/default.types';
import {p_DeserializeIdentity} from './parserUtils';

function p_getPayloadData(payload: common.Payload): object {
  const payloadHeader = checkUndefined(
    payload.getHeader(),
    'Payload header not found!'
  );
  const channelHeader = common.ChannelHeader.deserializeBinary(
    payloadHeader.getChannelHeader_asU8()
  );

  if (channelHeader.getType() !== common.HeaderType.ENDORSER_TRANSACTION) {
    // throw new Error('This is not endorser transaction!');
    return {};
  }

  const actions: object[] = [];
  const tx = peer.Transaction.deserializeBinary(payload.getData_asU8());
  tx.getActionsList().forEach(action => {
    const chaincodeActionPayload =
      peer.ChaincodeActionPayload.deserializeBinary(action.getPayload_asU8());

    // Actions ...
    if (chaincodeActionPayload.hasAction()) {
      const action = checkUndefined(
        chaincodeActionPayload.getAction(),
        'Action is undefined!'
      );
      const endorsers = p_getEndorsments(action, 'Base64');

      const proposalRespPayload =
        peer.ProposalResponsePayload.deserializeBinary(
          action.getProposalResponsePayload_asU8()
        );

      console.log(
        'Proposal Hash: ',
        toHexString(proposalRespPayload.getProposalHash_asU8())
      );

      const ccAction = peer.ChaincodeAction.deserializeBinary(
        proposalRespPayload.getExtension_asU8()
      );

      console.log(
        'Event::: ',
        peer.ChaincodeEvent.deserializeBinary(
          ccAction.getEvents_asU8()
        ).getEventName()
      );
      p_getChaincodeEventInfo(ccAction);

      actions.push({
        endorsers: endorsers,
        proposalResponsePayload: {
          proposalHash: toHexString(proposalRespPayload.getProposalHash_asU8()),
        },
        chaincodeInfo: p_getChaincodeInfo(proposalRespPayload),
      });
    }
  });

  console.log(JSON.stringify(actions, null, 2));

  return {
    actions: actions,
  };
}

function p_getChaincodeEventInfo(
  chaincodeAction: peer.ChaincodeAction
): object {
  const ccEvent = peer.ChaincodeEvent.deserializeBinary(
    chaincodeAction.getEvents_asU8()
  );

  console.log('CC Ev JSON', ccEvent.getTxId());
  return {
    eventName: ccEvent.getEventName(),
  };
}

function p_getChaincodeInfo(proposalRP: peer.ProposalResponsePayload): object {
  const ccAction = peer.ChaincodeAction.deserializeBinary(
    proposalRP.getExtension_asU8()
  );
  return {
    chaincodeName: ccAction.getChaincodeId()?.getName(),
    chaincodePath: ccAction.getChaincodeId()?.getPath(),
    chaincodeVersion: ccAction.getChaincodeId()?.getVersion(),
  };
}

function p_getEndorsments(
  action: peer.ChaincodeEndorsedAction,
  format: 'byteArray' | 'Base64' | 'hexString'
): object[] {
  const endorsers: object[] = [];
  action.getEndorsementsList().forEach(endorsment => {
    const endorser = msp.SerializedIdentity.deserializeBinary(
      endorsment.getEndorser_asU8()
    );
    endorsers.push(p_DeserializeIdentity(endorser, format));
  });
  return endorsers;
}

export {p_getPayloadData};
