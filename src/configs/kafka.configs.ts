const config = {
  clientId: 'paratonnerre-client',
  brokers: [
    `${process.env.KAFKA_BROKER1_ADDRESS}`,
    `${process.env.KAFKA_BROKER2_ADDRESS}`,
  ],
  connectionTimeout: 3000,
  authenticationTimeout: 1000,
  reauthenticationThreshold: 10000,
};

export {config};
