import {Block} from '@hyperledger/fabric-protos/lib/common';
import {BlockAndPrivateData} from '@hyperledger/fabric-protos/lib/peer';
import {ProcessedBlockConstruction} from '../../types/block.types';
import {ProcessedBlockAndPrivateData} from '../../types/blockAndPrivData.types';
import {ProcessedNsPvtRWEntry} from '../../types/txrwset.types';
import {logger} from '../logger';
import {p_constructBlock} from './blockParser';
import {parseNsPvtRWArr} from './txrwsetParser';

function p_constructBlockAndPrivData(
  block: BlockAndPrivateData
): ProcessedBlockAndPrivateData {
  logger.info('Block And Private Data contruction started!');
  const rawBlock: Block | undefined = block.getBlock();
  let processedBlock: ProcessedBlockConstruction | undefined = undefined;

  if (rawBlock !== undefined) {
    processedBlock = p_constructBlock(rawBlock);
  }

  const privMap: ProcessedNsPvtRWEntry[][] = [];
  logger.info(block.getPrivateDataMapMap().toArray().length);
  block.getPrivateDataMapMap().forEach(kv => {
    privMap.push(parseNsPvtRWArr(kv.getNsPvtRwsetList()));
  });

  return {
    hasBlock: block.hasBlock(),
    block: processedBlock,
    privateDataMap: privMap,
  };
}

export {p_constructBlockAndPrivData};
