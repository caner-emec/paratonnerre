import {common, ledger, msp, peer} from '@hyperledger/fabric-protos';
import {checkUndefined, toHexString} from '../../utils/utils';
import {
  ProcessedChaincodeEventInfo,
  ProcessedChaincodeInfo,
  ProcessedId,
} from '../../types/default.types';

import {ProcessedKVWriteEntry} from '../../types/rwset.types';
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

      const ccAction = peer.ChaincodeAction.deserializeBinary(
        proposalRespPayload.getExtension_asU8()
      );

      console.log('KV RW Set: ', p_getKVRWSet(ccAction));

      actions.push({
        endorsers: endorsers,
        proposalResponsePayload: {
          proposalHash: toHexString(proposalRespPayload.getProposalHash_asU8()),
        },
        chaincodeInfo: p_getChaincodeInfo(proposalRespPayload),
        chaincodeEvents: p_getChaincodeEventInfo(ccAction),
        kvReadWriteSet: p_getKVRWSet(ccAction),
      });
    }
  });

  console.log(JSON.stringify(actions, null, 2));

  return {
    actions: actions,
  };
}

function p_getKVRWSet(ccAction: peer.ChaincodeAction): ProcessedKVWriteEntry[] {
  const txRWSet = ledger.rwset.TxReadWriteSet.deserializeBinary(
    ccAction.getResults_asU8()
  );

  const kvRWSet: ProcessedKVWriteEntry[] = [];
  if (txRWSet.getDataModel() === ledger.rwset.TxReadWriteSet.DataModel.KV) {
    txRWSet.getNsRwsetList().forEach(nsRW => {
      const kvWset = ledger.rwset.kvrwset.KVRWSet.deserializeBinary(
        nsRW.getRwset_asU8()
      ).getWritesList();

      // return p_getKVWriteList(kvWset);

      kvWset.forEach(kv => {
        kvRWSet.push({
          key: kv.getKey(),
          value: {
            asByte: kv.getValue_asU8(),
            asBase64: kv.getValue_asB64(),
            asString: String.fromCharCode(...kv.getValue_asU8()),
          },
          isDeleted: kv.getIsDelete(),
        });
      });
      //
    });
  }

  return kvRWSet;
}

function p_getNamespaceRWSet(nsRWSet: ledger.rwset.NsReadWriteSet): object {
  const rwSet = ledger.rwset.kvrwset.KVRWSet.deserializeBinary(
    nsRWSet.getRwset_asU8()
  );
  rwSet.getWritesList();
  return {};
}

function p_getKVWriteList(
  kvwrite: ledger.rwset.kvrwset.KVWrite[]
): ProcessedKVWriteEntry[] {
  const ret: ProcessedKVWriteEntry[] = [];
  kvwrite.forEach(kv => {
    ret.push({
      key: kv.getKey(),
      value: {
        asByte: kv.getValue_asU8(),
        asBase64: kv.getValue_asB64(),
        asString: String.fromCharCode(...kv.getValue_asU8()),
      },
      isDeleted: kv.getIsDelete(),
    });
  });

  return ret;
}

function p_getChaincodeEventInfo(
  chaincodeAction: peer.ChaincodeAction
): ProcessedChaincodeEventInfo {
  const ccEvent = peer.ChaincodeEvent.deserializeBinary(
    chaincodeAction.getEvents_asU8()
  );

  return {
    eventName: ccEvent.getEventName(),
    eventPayload: String.fromCharCode(...ccEvent.getPayload_asU8()),
    eventTxId: ccEvent.getTxId(),
  };
}

function p_getChaincodeInfo(
  proposalRP: peer.ProposalResponsePayload
): ProcessedChaincodeInfo {
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
): ProcessedId[] {
  const endorsers: ProcessedId[] = [];
  action.getEndorsementsList().forEach(endorsment => {
    const endorser = msp.SerializedIdentity.deserializeBinary(
      endorsment.getEndorser_asU8()
    );
    endorsers.push(p_DeserializeIdentity(endorser, format));
  });
  return endorsers;
}

export {p_getPayloadData};
