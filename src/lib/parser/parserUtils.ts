import {common, ledger, msp, peer} from '@hyperledger/fabric-protos';
import {checkUndefined, toHexString} from '../../utils/utils';
import {ProcessedId} from '../../types/default.types';

function p_DeserializeIdentity(
  id: msp.SerializedIdentity,
  format: 'byteArray' | 'Base64' | 'hexString'
): ProcessedId {
  const idFormatted =
    format === 'byteArray'
      ? id.getIdBytes_asU8()
      : format === 'Base64'
      ? id.getIdBytes_asB64()
      : toHexString(id.getIdBytes_asU8());

  return {
    mspId: id.getMspid(),
    id: idFormatted,
  };
}

export {p_DeserializeIdentity};
