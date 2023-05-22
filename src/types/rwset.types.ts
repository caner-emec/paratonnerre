type ProcessedKVWriteEntry = {
  key: string;
  value: {
    asByte: Uint8Array;
    asBase64: string;
    asString: string;
  };
  isDeleted: boolean;
};

// type ProcessedKVWriteSet = ProcessedKVWriteEntry[];

type ProcessedKVReadEntry = {
  key: string;
  version: {
    blockNum: number | undefined;
    txNum: number | undefined;
  };
};

type ProcessedKVReadHashEntry = {
  keyHash: string;
  version: {
    blockNum: number | undefined;
    txNum: number | undefined;
  };
};

type ProcessedKVWriteHashEntry = {
  keyHAsh: string;
  valueHash: string;
  isDelete: boolean;
  isPurge: boolean;
};

type ProcessedKVMetadataEntry = {
  name: string;
  value: string;
};

type ProcessedKVMetadataWriteEntry = {
  key: string;
  kvMetadataEntries: ProcessedKVMetadataEntry[];
};

type ProcessedKVMetadataWriteHashEntry = {
  keyHash: string;
  kvMetadataEntries: ProcessedKVMetadataEntry[];
};

type ProcessedMerkleSummary = {
  maxDegree: number | undefined;
  maxLevel: number | undefined;
  maxLevelHashes: string[] | undefined;
};

type ProcessedRangeQueryInfo = {
  startKey: string;
  endKey: string;
  itrExhausted: boolean;
  other: ProcessedMerkleSummary | ProcessedKVReadEntry[];
};

type ProcessedHashedRWSet = {
  hashedReadList: ProcessedKVReadHashEntry[];
  hashedWriteList: ProcessedKVWriteHashEntry[];
  metadataWriteList: ProcessedKVMetadataWriteHashEntry[];
};

type ProcessedKVRWSet = {
  kvReadList: ProcessedKVReadEntry[];
  kvWriteList: ProcessedKVWriteEntry[];
  rangeQueryInfoList: ProcessedRangeQueryInfo[];
  kvMetadataWriteList: ProcessedKVMetadataWriteEntry[];
};

export {
  ProcessedKVMetadataEntry,
  ProcessedKVMetadataWriteEntry,
  ProcessedKVMetadataWriteHashEntry,
  ProcessedKVReadEntry,
  ProcessedKVReadHashEntry,
  ProcessedKVWriteEntry,
  ProcessedKVWriteHashEntry,
  ProcessedMerkleSummary,
  ProcessedRangeQueryInfo,
  // ProcessedKVWriteSet,
  ProcessedHashedRWSet,
  ProcessedKVRWSet,
};
