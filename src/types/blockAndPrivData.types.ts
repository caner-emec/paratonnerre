import {ProcessedBlockConstruction} from './block.types';
import {ProcessedNsPvtRWEntry} from './txrwset.types';

type ProcessedBlockAndPrivateData = {
  hasBlock: boolean;
  block: ProcessedBlockConstruction | undefined;
  privateDataMap: ProcessedNsPvtRWEntry[][]; //Map<number, TxPvtReadWriteSet>;
};

export {ProcessedBlockAndPrivateData};
