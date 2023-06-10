import {logger} from '../lib/logger';

const brokers = (process.env.KAFKA_BROKER_ADDRESSES ?? '')
  .split(',')
  .map(x => x.trim());

logger.debug(`${brokers}`);

const config = {
  clientId: 'paratonnerre-client',
  brokers: brokers,
  connectionTimeout: 3000,
  authenticationTimeout: 1000,
  reauthenticationThreshold: 10000,
};

export {config};
