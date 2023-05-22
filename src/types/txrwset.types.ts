import {ProcessedHashedRWSet, ProcessedKVRWSet} from './rwset.types';

type ProcessedCollectionHashedRWSetEntry = {
  collectionName: string;
  hashedRWSet: ProcessedHashedRWSet;
  privateRWSetHash: string;
};

type ProcessedNsRWEntry = {
  namespace: string;
  rwset: ProcessedKVRWSet;
  collectionHashedRWSet: ProcessedCollectionHashedRWSetEntry[];
};

type ProcessedTxRWSet = {
  datamodel: number;
  nsRWSet: ProcessedNsRWEntry[];
};

type ProcessedCollectionPvtRWSetEntry = {
  collectionName: string;
  rwset: ProcessedKVRWSet;
};

type ProcessedNsPvtRWEntry = {
  namespace: string;
  collectionPvtRWSet: ProcessedCollectionPvtRWSetEntry[];
};

export {
  ProcessedCollectionHashedRWSetEntry,
  ProcessedNsRWEntry,
  ProcessedTxRWSet,
  ProcessedCollectionPvtRWSetEntry,
  ProcessedNsPvtRWEntry,
};
