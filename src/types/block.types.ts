import {common} from '@hyperledger/fabric-protos';
import {
  ProcessedBlockHeader,
  ProcessedBlockMetadataSignature,
  ProcessedHeaderTypeEnum,
  ProcessedId,
  ProcessedSignatureHeader,
} from './default.types';

type ProcessedEnvelope = {
  txValidationStatus: string | TxValidationCode;
  signature: string;
  payload: ProcessedPayload;
};

// TODO!! header and data type
type ProcessedPayload = {
  header: object;
  data: object;
};

type ProcessedPayloadHeader = {
  header: {
    channelHeader: {
      type: ProcessedHeaderTypeEnum | string;
      version: number;
      timestamp: Date | undefined;
      channelId: string;
      txId: string;
      epoch: number;
      tlsCertHash: string;
    };
    signatureHeader: ProcessedSignatureHeader;
  };
};

type ProcessedEndorsmentEntry = {
  endorser: ProcessedId;
  signature: string;
};

type ProcessedBlockMetadata = {
  value: string | Uint8Array;
  numOfSignatures: number;
  signatures: ProcessedBlockMetadataSignature[];
  metadataCommitHash: string;
};

type ProcessedBlockConstruction = {
  block: {
    metadata: ProcessedBlockMetadata;
    header: ProcessedBlockHeader;
    data: ProcessedEnvelope[];
  };
};

enum TxValidationCode {
  VALID = 0,
  NIL_ENVELOPE = 1,
  BAD_PAYLOAD = 2,
  BAD_COMMON_HEADER = 3,
  BAD_CREATOR_SIGNATURE = 4,
  INVALID_ENDORSER_TRANSACTION = 5,
  INVALID_CONFIG_TRANSACTION = 6,
  UNSUPPORTED_TX_PAYLOAD = 7,
  BAD_PROPOSAL_TXID = 8,
  DUPLICATE_TXID = 9,
  ENDORSEMENT_POLICY_FAILURE = 10,
  MVCC_READ_CONFLICT = 11,
  PHANTOM_READ_CONFLICT = 12,
  UNKNOWN_TX_TYPE = 13,
  TARGET_CHAIN_NOT_FOUND = 14,
  MARSHAL_TX_ERROR = 15,
  NIL_TXACTION = 16,
  EXPIRED_CHAINCODE = 17,
  CHAINCODE_VERSION_CONFLICT = 18,
  BAD_HEADER_EXTENSION = 19,
  BAD_CHANNEL_HEADER = 20,
  BAD_RESPONSE_PAYLOAD = 21,
  BAD_RWSET = 22,
  ILLEGAL_WRITESET = 23,
  INVALID_WRITESET = 24,
  INVALID_CHAINCODE = 25,
  NOT_VALIDATED = 254,
  INVALID_OTHER_REASON = 255,
}

export {
  ProcessedEnvelope,
  ProcessedPayload,
  ProcessedPayloadHeader,
  ProcessedEndorsmentEntry,
  TxValidationCode,
  ProcessedBlockMetadata,
  ProcessedBlockConstruction,
};
