import {common, ledger, msp, peer} from '@hyperledger/fabric-protos';
import {checkUndefined, toHexString} from '../../utils/utils';
import {
  ProcessedBlockHeader,
  ProcessedSignatureHeader,
  ProcessedBlockMetadataSignature,
  ProcessedHeaderTypeEnum,
} from '../../types/default.types';
import {Buffer} from 'node:buffer';
import {p_DeserializeIdentity} from './parserUtils';
import {p_getPayloadData} from './payloadDataParser';

//
function p_getBlockHeader(
  block: common.Block,
  format: 'byteArray' | 'Base64' | 'hexString'
): ProcessedBlockHeader {
  const header = checkUndefined(block.getHeader(), 'Missing block header');
  const prevHash: Uint8Array | string =
    format === 'byteArray'
      ? header.getPreviousHash_asU8()
      : format === 'Base64'
      ? header.getPreviousHash_asB64()
      : toHexString(header.getPreviousHash_asU8());

  const dataHash: Uint8Array | string =
    format === 'byteArray'
      ? header.getDataHash_asU8()
      : format === 'Base64'
      ? header.getDataHash_asB64()
      : toHexString(header.getDataHash_asU8());

  return {
    number: header.getNumber(),
    previousHash: prevHash,
    dataHash: dataHash,
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

function p_getBlockMetadataSignature(
  signature: common.MetadataSignature,
  format: 'byteArray' | 'Base64' | 'hexString'
): ProcessedBlockMetadataSignature {
  const sigHeader = common.SignatureHeader.deserializeBinary(
    signature.getSignatureHeader_asU8()
  );
  const sig =
    format === 'byteArray'
      ? signature.getSignature_asU8()
      : format === 'Base64'
      ? signature.getSignature_asB64()
      : toHexString(signature.getSignature_asU8());

  return {
    signatureHeader: p_getSignatureHeader(sigHeader, format),
    signature: sig,
  };
}

function p_getBlockMetadata(
  block: common.Block,
  format: 'byteArray' | 'Base64' | 'hexString'
): object {
  const metadata = checkUndefined(
    block.getMetadata(),
    'Metadata is not defined!'
  );

  const deserializedMetadata = common.Metadata.deserializeBinary(
    metadata.getMetadataList_asU8()[common.BlockMetadataIndex.SIGNATURES]
  );

  const mValue =
    format === 'Base64'
      ? deserializedMetadata.getValue_asB64()
      : format === 'byteArray'
      ? deserializedMetadata.getValue_asU8()
      : toHexString(deserializedMetadata.getValue_asU8());

  const metadataSignatureList = deserializedMetadata.getSignaturesList();

  const signatureObjArray: object[] = [];
  metadataSignatureList.forEach(metadataSig => {
    signatureObjArray.push(p_getBlockMetadataSignature(metadataSig, format));
  });

  return {
    value: mValue,
    numOfSignatures: metadataSignatureList.length,
    signatures: signatureObjArray,
    metadataCommitHash: toHexString(
      metadata.getMetadataList_asU8()[common.BlockMetadataIndex.COMMIT_HASH]
    ),
  };
}

function p_getPayloadHeader(payload: common.Payload): object {
  const payloadHeader = checkUndefined(
    payload.getHeader(),
    'Payload header not found!'
  );
  const channelHeader = common.ChannelHeader.deserializeBinary(
    payloadHeader.getChannelHeader_asU8()
  );

  return {
    header: {
      channelHeader: {
        type: ProcessedHeaderTypeEnum[channelHeader.getType()], // Header types 0-10000 are reserved and defined by HeaderType
        version: channelHeader.getVersion(), // Version indicates message protocol version
        timestamp: channelHeader.getTimestamp()?.toDate(),
        channelId: channelHeader.getChannelId(),
        txId: channelHeader.getTxId(),
        epoch: channelHeader.getEpoch(),
        tlsCertHash: toHexString(channelHeader.getTlsCertHash_asU8()),
      },
      signatureHeader: p_getSignatureHeader(
        common.SignatureHeader.deserializeBinary(
          payloadHeader.getSignatureHeader_asU8()
        ),
        'Base64'
      ),
    },
  };
}

///////////////////////////////////
function getTransactionValidationCodes(block: common.Block): Uint8Array {
  const metadata = checkUndefined(
    block.getMetadata(),
    'Missing block metadata'
  );
  return metadata.getMetadataList_asU8()[
    common.BlockMetadataIndex.TRANSACTIONS_FILTER
  ];
}

function getPayloads(block: common.Block): common.Payload[] {
  return (block.getData()?.getDataList_asU8() ?? [])
    .map(bytes => common.Envelope.deserializeBinary(bytes))
    .map(envelope => envelope.getPayload_asU8())
    .map(bytes => common.Payload.deserializeBinary(bytes));
}

function getChannelHeader(payload: common.Payload): common.ChannelHeader {
  const header = checkUndefined(payload.getHeader(), 'Missing payload header');
  return common.ChannelHeader.deserializeBinary(header.getChannelHeader_asU8());
}

function getSignatureHeader(payload: common.Payload): common.SignatureHeader {
  const header = checkUndefined(payload.getHeader(), 'Missing payload header');
  return common.SignatureHeader.deserializeBinary(
    header.getSignatureHeader_asU8()
  );
}

function getChaincodeActionPayloads(
  transaction: peer.Transaction
): peer.ChaincodeActionPayload[] {
  return transaction
    .getActionsList()
    .map(transactionAction => transactionAction.getPayload_asU8())
    .map(bytes => peer.ChaincodeActionPayload.deserializeBinary(bytes));
}

export {
  getChaincodeActionPayloads,
  getChannelHeader,
  getPayloads,
  getSignatureHeader,
  getTransactionValidationCodes,
  p_getBlockHeader,
  p_getBlockMetadataSignature,
  p_getBlockMetadata,
  p_getPayloadHeader,
  p_getPayloadData,
};
