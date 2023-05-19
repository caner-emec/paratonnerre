type Identity = {
  credentials: string; // user certificate --> cert.pem
  mspId: string;
};

type HLFCredentialsPaths = {
  userCert: string;
  userPrivKey: string;
  peerTlsCert: string;
};

export {HLFCredentialsPaths, Identity};
