type ProcessedChaincodeEvent = {
  chaincodeEvent: {
    transactionId: string;
    blockNumber: number;
    eventName: string;
    chaincodeName: string;
    payload: string;
  };
};

export {ProcessedChaincodeEvent};
