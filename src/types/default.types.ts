import {ProcessedEndorsmentEntry} from './block.types';
import {ProcessedTxPvtRWSet, ProcessedTxRWSet} from './txrwset.types';

// ??
type Identity = {
  credentials: string; // user certificate --> cert.pem
  mspId: string;
};

type HLFCredentialsPaths = {
  userCert: string;
  userPrivKey: string;
  peerTlsCert: string;
};

type ProcessedBlockHeader = {
  number: number;
  previousHash: Uint8Array | string;
  dataHash: Uint8Array | string;
};

type ProcessedBlockMetadataSignature = {
  signatureHeader: ProcessedSignatureHeader;
  signature: string | Uint8Array;
};

type ProcessedId = {
  mspId: string;
  id: string | Uint8Array;
};

type ProcessedSignatureHeader = {
  creator: ProcessedId;
  nonce: Number;
};

type ProcessedPayloadDataForEndorsedTx = {
  transactionActions: ProcessedTxActionsEntry[];
};

type ProcessedTxActionsEntry = {
  proposalActionHeader: ProcessedSignatureHeader;
  chaincodeActionPayload: ProcessedChaincodeActionPayload;
};

type ProcessedChaincodeActionPayload = {
  chaincodeEndorsedAction: ProcessedChaincodeEndorsedAction;
  chaincodeProposalPayload: ProcessedChaincodeProposalPayload;
};

type ProcessedChaincodeProposalPayload = {
  chaincodeInvocationSpecInput: ProcessedChaincodeInvocationSpec;
};

type ProcessedChaincodeInvocationSpec = {
  ChaincodeSpec: {
    type: string;
    chaincodeId: ProcessedChaincodeId;
    input: ProcessedChaincodeInput;
    timeout: number;
  };
};

type ProcessedChaincodeInput = {
  args: string[];
  isInit: boolean;
};

type ProcessedChaincodeId = {
  name: string;
  path: string;
  version: string;
};

type ProcessedChaincodeEndorsedAction = {
  endorsments: ProcessedEndorsmentEntry[];
  proposalResponsePayload: ProcessedProposalResponsePayload;
};

type ProcessedProposalResponsePayload = {
  proposalHash: string;
  extensionChaincodeAction: ProcessedChaincodeAction;
};

type ProcessedChaincodeAction = {
  chaincodeId: ProcessedChaincodeId;
  chaincodeEvent: ProcessedChaincodeEvent;
  chaincodeResponse: ProcessedChaincodeResponse;
  chaincodeResults: ProcessedResultsRWs;
};

type ProcessedChaincodeEvent = {
  chaincodeId: string;
  txId: string;
  eventName: string;
  payload: string;
};

type ProcessedChaincodeResponse = {
  status: number | undefined;
  message: string;
};

type ProcessedResultsRWs = {
  txRWSet: ProcessedTxRWSet;
  txPvtRWSet: ProcessedTxPvtRWSet;
};

enum ProcessedHeaderTypeEnum {
  MESSAGE = 0, // Used for messages which are signed but opaque
  CONFIG = 1, // Used for messages which express the channel config
  CONFIG_UPDATE = 2, // Used for transactions which update the channel config
  ENDORSER_TRANSACTION = 3, // Used by the SDK to submit endorser based transactions
  ORDERER_TRANSACTION = 4, // Used internally by the orderer for management
  DELIVER_SEEK_INFO = 5, // Used as the type for Envelope messages submitted to instruct the Deliver API to seek
  CHAINCODE_PACKAGE = 6,
}

enum ChaincodeSpecType {
  UNDEFINED = 0,
  GOLANG = 1,
  NODE = 2,
  CAR = 3,
  JAVA = 4,
}

export {
  HLFCredentialsPaths,
  Identity,
  ProcessedBlockHeader,
  ProcessedSignatureHeader,
  ProcessedBlockMetadataSignature,
  ProcessedHeaderTypeEnum,
  ProcessedId,
  ChaincodeSpecType,
  ProcessedPayloadDataForEndorsedTx,
  ProcessedTxActionsEntry,
  ProcessedChaincodeActionPayload,
  ProcessedChaincodeProposalPayload,
  ProcessedChaincodeInvocationSpec,
  ProcessedChaincodeInput,
  ProcessedChaincodeId,
  ProcessedChaincodeEndorsedAction,
  ProcessedProposalResponsePayload,
  ProcessedChaincodeEvent,
  ProcessedChaincodeResponse,
  ProcessedResultsRWs,
  ProcessedChaincodeAction,
};
