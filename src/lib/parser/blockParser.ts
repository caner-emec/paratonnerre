import {common, msp, peer} from '@hyperledger/fabric-protos';
import {checkUndefined, toHexString} from '../../utils/utils';
import {
  ProcessedBlockHeader,
  ProcessedSignatureHeader,
  ProcessedBlockMetadataSignature,
  ProcessedHeaderTypeEnum,
} from '../../types/default.types';
import {Buffer} from 'node:buffer';
import {p_DeserializeIdentity} from './parserUtils';
import {p_getPayloadData} from './payloadDataParser2';
import {
  ProcessedBlockConstruction,
  ProcessedBlockMetadata,
  ProcessedEnvelope,
  ProcessedPayload,
  ProcessedPayloadHeader,
  TxValidationCode,
} from '../../types/block.types';

function p_constructBlock(block: common.Block): ProcessedBlockConstruction {
  const blockData = checkUndefined(
    block.getData(),
    'Block not contain any data!'
  );

  const validationCodes = getTransactionValidationCodes(block);

  const processedEnvelopes = blockData
    .getDataList_asU8()
    .map(dataBytes => common.Envelope.deserializeBinary(dataBytes))
    .map((envelope, i) => p_getEnvelope(envelope, validationCodes[i]));

  return {
    block: {
      metadata: p_getBlockMetadata(block, 'Base64'),
      header: p_getBlockHeader(block, 'hexString'),
      data: processedEnvelopes,
    },
  };
}

function p_getEnvelope(
  envelope: common.Envelope,
  statusCode: number
): ProcessedEnvelope {
  return {
    txValidationStatus: TxValidationCode[statusCode],
    signature: toHexString(envelope.getSignature_asU8()),
    payload: p_getPayload(
      common.Payload.deserializeBinary(envelope.getPayload_asU8())
    ),
  };
}

function p_getPayload(payload: common.Payload): ProcessedPayload {
  const typeTx = common.ChannelHeader.deserializeBinary(
    checkUndefined(
      payload.getHeader(),
      'There is no header!'
    ).getChannelHeader_asU8()
  ).getType();
  return {
    header: p_getPayloadHeader(payload),
    data: p_getPayloadData(payload, typeTx),
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

function p_getPayloadHeader(payload: common.Payload): ProcessedPayloadHeader {
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
): ProcessedBlockMetadata {
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

  const signatureObjArray: ProcessedBlockMetadataSignature[] = [];
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

function getTransactionValidationCodes(block: common.Block): Uint8Array {
  const metadata = checkUndefined(
    block.getMetadata(),
    'Missing block metadata'
  );
  return metadata.getMetadataList_asU8()[
    common.BlockMetadataIndex.TRANSACTIONS_FILTER
  ];
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
  getSignatureHeader,
  getTransactionValidationCodes,
  p_getBlockHeader,
  p_getBlockMetadataSignature,
  p_getBlockMetadata,
  p_getPayloadHeader,
  p_getPayloadData,
  p_constructBlock,
};
