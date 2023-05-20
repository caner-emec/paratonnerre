import {common} from '@hyperledger/fabric-protos';
import {
  ProcessedHeaderTypeEnum,
  ProcessedId,
  ProcessedSignatureHeader,
} from './default.types';

type ProcessedEnvelope = {
  signature: string;
  payload: ProcessedPayload;
};

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

export {
  ProcessedEnvelope,
  ProcessedPayload,
  ProcessedPayloadHeader,
  ProcessedEndorsmentEntry,
};
