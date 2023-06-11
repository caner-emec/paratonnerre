import {HLFCredentialsPaths} from '../types/default.types';
import * as path from 'path';

const channelName = process.env.CHANNEL_NAME ?? 'mychannel';
const chaincodeName = process.env.CHAINCODE_NAME ?? 'basic';

const channelsForBlockEvent = (
  process.env.LISTENER_BLOCK_EVENTS_FROM ?? 'mychannel'
)
  .split(',')
  .map(x => x.trim());

const chaincodesForEvents = (
  process.env.LISTENER_CHAINCODE_EVENTS_FROM ?? 'mychannel:events'
)
  .split(',')
  .map(x => x.trim())
  .map(x => {
    return {channel: x.split(':')[0], chaincode: x.split(':')[1]};
  });

type ChaincodeEventInfo = {
  channel: string;
  chaincode: string;
};

const peerName = process.env.PEER_NAME ?? 'peer0.org1.example.com';
const mspId = process.env.MSP_ID ?? 'Org1MSP';

// Gateway peer endpoint.
const peerEndpoint = process.env.PEER_ENDPOINT ?? 'localhost:7051';

// Gateway peer SSL host name override.
const peerHostAlias = process.env.PEER_HOST_ALIAS ?? peerName;

const hlfCredsPath: HLFCredentialsPaths = {
  userCert:
    process.env.CRED_USER_CERT_PATH ??
    path.resolve(__dirname, '..', '..', '..', 'src', 'credentials', 'cert.pem'),
  userPrivKey:
    process.env.CRED_USER_PRIVKEY_PATH ??
    path.resolve(__dirname, '..', '..', '..', 'src', 'credentials', 'priv_sk'),
  peerTlsCert:
    process.env.CRED_PEER_TLS_CERT_PATH ??
    path.resolve(__dirname, '..', '..', '..', 'src', 'credentials', 'ca.crt'),
};

export {
  channelName, // TODO!
  chaincodeName, // TODO!
  peerName,
  mspId,
  hlfCredsPath,
  peerEndpoint,
  peerHostAlias,
  channelsForBlockEvent,
  chaincodesForEvents,
  ChaincodeEventInfo,
};
