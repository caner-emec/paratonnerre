import {ledger} from '@hyperledger/fabric-protos';
import {toHexString} from '../../utils/utils';
import {parseKVRWSet, parseHashedRWSet} from './rwsetParser';

import {
  ProcessedCollectionHashedRWSetEntry,
  ProcessedCollectionPvtRWSetEntry,
  ProcessedNsPvtRWEntry,
  ProcessedNsRWEntry,
  ProcessedTxPvtRWSet,
  ProcessedTxRWSet,
} from '../../types/txrwset.types';

// parseCollectionHashedRWSetEntry --> parseCollectionHashedRWSetArr --> parseNsRWEntry --> parseNsRWArr --> parseTxRWSet

function parseCollectionHashedRWSetEntry(
  collectionhashedrwset: ledger.rwset.CollectionHashedReadWriteSet
): ProcessedCollectionHashedRWSetEntry {
  const hashedrwset = ledger.rwset.kvrwset.HashedRWSet.deserializeBinary(
    collectionhashedrwset.getHashedRwset_asU8()
  );

  return {
    collectionName: collectionhashedrwset.getCollectionName(),
    hashedRWSet: parseHashedRWSet(hashedrwset),
    privateRWSetHash: toHexString(collectionhashedrwset.getHashedRwset_asU8()),
  };
}

function parseCollectionHashedRWSetArr(
  collectionhashedrwsetArr: ledger.rwset.CollectionHashedReadWriteSet[]
): ProcessedCollectionHashedRWSetEntry[] {
  const result: ProcessedCollectionHashedRWSetEntry[] = [];
  collectionhashedrwsetArr.forEach(element => {
    result.push(parseCollectionHashedRWSetEntry(element));
  });

  return result;
}

function parseNsRWEntry(
  nsrwset: ledger.rwset.NsReadWriteSet
): ProcessedNsRWEntry {
  return {
    namespace: nsrwset.getNamespace(),
    rwset: parseKVRWSet(
      ledger.rwset.kvrwset.KVRWSet.deserializeBinary(nsrwset.getRwset_asU8())
    ),
    collectionHashedRWSet: parseCollectionHashedRWSetArr(
      nsrwset.getCollectionHashedRwsetList()
    ),
  };
}

function parseNsRWArr(
  nsrwserArr: ledger.rwset.NsReadWriteSet[]
): ProcessedNsRWEntry[] {
  const result: ProcessedNsRWEntry[] = [];
  nsrwserArr.forEach(element => {
    result.push(parseNsRWEntry(element));
  });
  return result;
}

function parseTxRWSet(txrwset: ledger.rwset.TxReadWriteSet): ProcessedTxRWSet {
  return {
    datamodel: txrwset.getDataModel(),
    nsRWSet: parseNsRWArr(txrwset.getNsRwsetList()),
  };
}

// parseCollectionPvtRWSetEntry --> parseCollectionPvtRWSetArr --> parseNsPvtRWEntry --> parseNsPvtRWArr --> parseTxPvtRWSet

function parseCollectionPvtRWSetEntry(
  collectionpvtrw: ledger.rwset.CollectionPvtReadWriteSet
): ProcessedCollectionPvtRWSetEntry {
  return {
    collectionName: collectionpvtrw.getCollectionName(),
    rwset: parseKVRWSet(
      ledger.rwset.kvrwset.KVRWSet.deserializeBinary(
        collectionpvtrw.getRwset_asU8()
      )
    ),
  };
}

function parseCollectionPvtRWSetArr(
  collectionpvtrwArr: ledger.rwset.CollectionPvtReadWriteSet[]
): ProcessedCollectionPvtRWSetEntry[] {
  const result: ProcessedCollectionPvtRWSetEntry[] = [];
  collectionpvtrwArr.forEach(element => {
    result.push(parseCollectionPvtRWSetEntry(element));
  });
  return result;
}

function parseNsPvtRWEntry(
  nspvtrw: ledger.rwset.NsPvtReadWriteSet
): ProcessedNsPvtRWEntry {
  return {
    namespace: nspvtrw.getNamespace(),
    collectionPvtRWSet: parseCollectionPvtRWSetArr(
      nspvtrw.getCollectionPvtRwsetList()
    ),
  };
}

function parseNsPvtRWArr(
  nspvtrwArr: ledger.rwset.NsPvtReadWriteSet[]
): ProcessedNsPvtRWEntry[] {
  const result: ProcessedNsPvtRWEntry[] = [];
  nspvtrwArr.forEach(element => {
    result.push(parseNsPvtRWEntry(element));
  });
  return result;
}

function parseTxPvtRWSet(
  txpvtrwset: ledger.rwset.TxPvtReadWriteSet
): ProcessedTxPvtRWSet {
  return {
    datamodel: txpvtrwset.getDataModel(),
    nsPvtRWSet: parseNsPvtRWArr(txpvtrwset.getNsPvtRwsetList()),
  };
}

export {parseTxRWSet, parseTxPvtRWSet, parseNsPvtRWArr};
