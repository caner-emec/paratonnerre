/* eslint-disable node/no-unsupported-features/node-builtins */
import * as grpc from '@grpc/grpc-js';
import {
  ConnectOptions,
  Identity,
  Signer,
  signers,
} from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import {promises as fs} from 'fs';

import {
  mspId,
  hlfCredsPath,
  peerEndpoint,
  peerHostAlias,
} from '../configs/default.configs';

export async function newGrpcConnection(): Promise<grpc.Client> {
  const tlsRootCert = await fs.readFile(hlfCredsPath.peerTlsCert);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(peerEndpoint, tlsCredentials, {
    'grpc.ssl_target_name_override': peerHostAlias,
  });
}

export async function newConnectOptions(
  client: grpc.Client
): Promise<ConnectOptions> {
  return {
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    // Default timeouts for different gRPC calls
    evaluateOptions: () => {
      return {deadline: Date.now() + 5000}; // 5 seconds
    },
    endorseOptions: () => {
      return {deadline: Date.now() + 15000}; // 15 seconds
    },
    submitOptions: () => {
      return {deadline: Date.now() + 5000}; // 5 seconds
    },
    commitStatusOptions: () => {
      return {deadline: Date.now() + 60000}; // 1 minute
    },
  };
}

async function newIdentity(): Promise<Identity> {
  const credentials = await fs.readFile(hlfCredsPath.userCert);
  return {mspId, credentials};
}

async function newSigner(): Promise<Signer> {
  const privateKeyPem = await fs.readFile(hlfCredsPath.userPrivKey);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}
