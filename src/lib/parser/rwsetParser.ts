import {common, ledger, msp, peer} from '@hyperledger/fabric-protos';
import {checkUndefined, toHexString} from '../../utils/utils';

import {
  ProcessedKVMetadataEntry,
  ProcessedKVMetadataWriteEntry,
  ProcessedKVMetadataWriteHashEntry,
  ProcessedKVReadEntry,
  ProcessedKVReadHashEntry,
  ProcessedKVWriteEntry,
  ProcessedKVWriteHashEntry,
  ProcessedMerkleSummary,
  ProcessedRangeQueryInfo,
  ProcessedHashedRWSet,
  ProcessedKVRWSet,
} from '../../types/rwset.types';

// parseKVRWSet
function parseKVRWSet(kvrwset: ledger.rwset.kvrwset.KVRWSet): ProcessedKVRWSet {
  return {
    kvReadList: parseKVReadArr(kvrwset.getReadsList()),
    kvWriteList: parseKVWriteArr(kvrwset.getWritesList()),
    rangeQueryInfoList: parseRangeQueryInfoArr(
      kvrwset.getRangeQueriesInfoList()
    ),
    kvMetadataWriteList: parseKVMetadataWriteArr(
      kvrwset.getMetadataWritesList()
    ),
  };
}

function parseHashedRWSet(
  hashedrwset: ledger.rwset.kvrwset.HashedRWSet
): ProcessedHashedRWSet {
  return {
    hashedReadList: parseKVReadHashArr(hashedrwset.getHashedReadsList()),
    hashedWriteList: parseKVWriteHashArr(hashedrwset.getHashedWritesList()),
    metadataWriteList: parseKVMetadataWriteHashArr(
      hashedrwset.getMetadataWritesList()
    ),
  };
}

// parseKVReadEntry --> parseKVReadArr
function parseKVReadEntry(
  kvread: ledger.rwset.kvrwset.KVRead
): ProcessedKVReadEntry {
  return {
    key: kvread.getKey(),
    version: {
      blockNum: kvread.getVersion()?.getBlockNum(),
      txNum: kvread.getVersion()?.getTxNum(),
    },
  };
}

function parseKVReadArr(
  kvreadArr: ledger.rwset.kvrwset.KVRead[]
): ProcessedKVReadEntry[] {
  const result: ProcessedKVReadEntry[] = [];
  kvreadArr.forEach(element => {
    result.push(parseKVReadEntry(element));
  });
  return result;
}

// parseKVWriteEntry --> parseKVWriteArr

function parseKVWriteEntry(
  kvwrite: ledger.rwset.kvrwset.KVWrite
): ProcessedKVWriteEntry {
  return {
    key: kvwrite.getKey(),
    value: {
      asByte: kvwrite.getValue_asU8(),
      asBase64: kvwrite.getValue_asB64(),
      asString: String.fromCharCode(...kvwrite.getValue_asU8()),
    },
    isDeleted: kvwrite.getIsDelete(),
  };
}

function parseKVWriteArr(
  kvwriteArr: ledger.rwset.kvrwset.KVWrite[]
): ProcessedKVWriteEntry[] {
  const result: ProcessedKVWriteEntry[] = [];
  kvwriteArr.forEach(element => {
    result.push(parseKVWriteEntry(element));
  });
  return result;
}

// parseKVReadHashEntry --> parseKVReadHashArr
function parseKVReadHashEntry(
  kvreadhash: ledger.rwset.kvrwset.KVReadHash
): ProcessedKVReadHashEntry {
  return {
    keyHash: toHexString(kvreadhash.getKeyHash_asU8()),
    version: {
      blockNum: kvreadhash.getVersion()?.getBlockNum(),
      txNum: kvreadhash.getVersion()?.getTxNum(),
    },
  };
}

function parseKVReadHashArr(
  kvreadhashArr: ledger.rwset.kvrwset.KVReadHash[]
): ProcessedKVReadHashEntry[] {
  const result: ProcessedKVReadHashEntry[] = [];
  kvreadhashArr.forEach(element => {
    result.push(parseKVReadHashEntry(element));
  });

  return result;
}

// parseKVWriteHashEntry --> parseKVWriteHashArr
function parseKVWriteHashEntry(
  kvwritehash: ledger.rwset.kvrwset.KVWriteHash
): ProcessedKVWriteHashEntry {
  return {
    keyHAsh: toHexString(kvwritehash.getKeyHash_asU8()),
    valueHash: toHexString(kvwritehash.getValueHash_asU8()),
    isDelete: kvwritehash.getIsDelete(),
    isPurge: kvwritehash.getIsPurge(),
  };
}

function parseKVWriteHashArr(
  kvwritehashArr: ledger.rwset.kvrwset.KVWriteHash[]
): ProcessedKVWriteHashEntry[] {
  const result: ProcessedKVWriteHashEntry[] = [];
  kvwritehashArr.forEach(element => {
    result.push(parseKVWriteHashEntry(element));
  });
  return result;
}

// parseKVMetadataWriteEntry --> parseKVMetadataWriteArr

function parseKVMetadataWriteEntry(
  kvmetadatawrite: ledger.rwset.kvrwset.KVMetadataWrite
): ProcessedKVMetadataWriteEntry {
  const kvmetadataEntries = kvmetadatawrite.getEntriesList();
  const entries: ProcessedKVMetadataEntry[] = [];
  kvmetadataEntries.forEach(element => {
    entries.push({
      name: element.getName(),
      value: String.fromCharCode(...element.getValue_asU8()),
    });
  });
  return {
    key: kvmetadatawrite.getKey(),
    kvMetadataEntries: entries,
  };
}

function parseKVMetadataWriteArr(
  kvmetadatawriteArr: ledger.rwset.kvrwset.KVMetadataWrite[]
): ProcessedKVMetadataWriteEntry[] {
  const result: ProcessedKVMetadataWriteEntry[] = [];
  kvmetadatawriteArr.forEach(element => {
    result.push(parseKVMetadataWriteEntry(element));
  });

  return result;
}

// parseKVMetadataWriteHashEntry --> parseKVMetadataWriteHashArr
function parseKVMetadataWriteHashEntry(
  kvmetadatawritehash: ledger.rwset.kvrwset.KVMetadataWriteHash
): ProcessedKVMetadataWriteHashEntry {
  const kvmetadatahashEntries = kvmetadatawritehash.getEntriesList();
  const entries: ProcessedKVMetadataEntry[] = [];
  kvmetadatahashEntries.forEach(element => {
    entries.push({
      name: element.getName(),
      value: String.fromCharCode(...element.getValue_asU8()),
    });
  });
  return {
    keyHash: toHexString(kvmetadatawritehash.getKeyHash_asU8()),
    kvMetadataEntries: entries,
  };
}

function parseKVMetadataWriteHashArr(
  kvmetadatawritehashArr: ledger.rwset.kvrwset.KVMetadataWriteHash[]
): ProcessedKVMetadataWriteHashEntry[] {
  const result: ProcessedKVMetadataWriteHashEntry[] = [];
  kvmetadatawritehashArr.forEach(element => {
    result.push(parseKVMetadataWriteHashEntry(element));
  });
  return result;
}

// parseRangeQueryInfoEntry --> parseRangeQueryInfoArr
function parseRangeQueryInfoEntry(
  rangequeryinfo: ledger.rwset.kvrwset.RangeQueryInfo
): ProcessedRangeQueryInfo {
  let other: ProcessedKVReadEntry[] | ProcessedMerkleSummary = [];
  if (rangequeryinfo.hasRawReads()) {
    // get raw reads
    const kvread = checkUndefined(
      rangequeryinfo.getRawReads()?.getKvReadsList(),
      'There are no kvread[]'
    );
    other = parseKVReadArr(kvread);
  } else {
    // get merkle summary
    other = {
      maxDegree: rangequeryinfo.getReadsMerkleHashes()?.getMaxDegree(),
      maxLevel: rangequeryinfo.getReadsMerkleHashes()?.getMaxLevel(),
      maxLevelHashes: rangequeryinfo
        .getReadsMerkleHashes()
        ?.getMaxLevelHashesList_asU8()
        .map(value => toHexString(value)),
    };
  }

  return {
    startKey: rangequeryinfo.getStartKey(),
    endKey: rangequeryinfo.getEndKey(),
    itrExhausted: rangequeryinfo.getItrExhausted(),
    other: other,
  };
}

function parseRangeQueryInfoArr(
  rangequeryinfoArr: ledger.rwset.kvrwset.RangeQueryInfo[]
): ProcessedRangeQueryInfo[] {
  const result: ProcessedRangeQueryInfo[] = [];
  rangequeryinfoArr.forEach(element => {
    result.push(parseRangeQueryInfoEntry(element));
  });
  return result;
}

export {
  parseRangeQueryInfoArr,
  parseKVMetadataWriteHashArr,
  parseKVMetadataWriteArr,
  parseKVWriteHashArr,
  parseKVReadHashArr,
  parseKVWriteArr,
  parseKVReadArr,
  parseHashedRWSet,
  parseKVRWSet,
};
