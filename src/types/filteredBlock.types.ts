type ProcessedFilteredBlock = {
  channelID: string;
  number: number;
  filteredTxs: ProcessedFilteredTx[];
};

type ProcessedFilteredTx = {
  txId: string;
  type: string | number;
  validationCode: string | number;
  actions: ProcessedTxAction[] | undefined;
};

type ProcessedTxAction = {
  chaincodeEvent: {
    transactionId: string;
    eventName: string;
    chaincodeName: string;
    payload: string;
  };
};

export {ProcessedFilteredBlock, ProcessedTxAction, ProcessedFilteredTx};
