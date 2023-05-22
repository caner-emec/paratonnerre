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

// ??
/*type ProcessedChaincodeEventInfo = {
  eventName: string;
  eventPayload: string;
  eventTxId: string;
};

type ProcessedChaincodeInfo = {
  chaincodeName: string | undefined;
  chaincodePath: string | undefined;
  chaincodeVersion: string | undefined;
};*/

type ProcessedPayloadDataForEndorsedTx = {
  transactionActions: ProcessedTxActionsEntry[];
};

type ProcessedTxActionsEntry = {
  proposalActionHeader: ProcessedSignatureHeader;
  chaincodeActionPayload: ProcessedChaincodeActionPayload;
};

// TODO!!
type ProcessedChaincodeActionPayload = {
  chaincodeEndorsedAction: object; // p_getChaincodeEndorsedAction
  chaincodeProposalPayload: ProcessedChaincodeProposalPayload;
};

// TODO!!
type ProcessedChaincodeProposalPayload = {
  chaincodeInvocationSpecInput: object; //p_getChaincodeInvocationSpec(chaincodeInput),
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
  // ProcessedChaincodeEventInfo,
  // ProcessedChaincodeInfo,
  ChaincodeSpecType,
  ProcessedPayloadDataForEndorsedTx,
  ProcessedTxActionsEntry,
  ProcessedChaincodeActionPayload,
  ProcessedChaincodeProposalPayload,
};
