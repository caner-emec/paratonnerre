# **_Paratonnerre_**

<p align="center">
<img src="./doc/logo.png" alt= “” width="250" height="250">
</p>

Event-catcher for Hyperledger Fabric.

It connects to a node in the Hyperledger fabric network to listen for events. It has the following features.

- Listening raw block events.
- Listenin filtered block events.
- Listening block and private data events.
- Listening chaincode events.
- Listen to block events on multiple channel.
- Listen to chaincode events on multiple chaincodes.
- Gateway-SDK is used.


## **Installization**

Go to the release page and download docker-compose files.

[Release Page - v0.3.0-alpha](https://github.com/caner-emec/paratonnerre/releases/tag/v0.3.0-alpha)

## **Getting Started**

Before you start, get your Hyperledger Fabric network up and running. Create a channel, upload a chaincode (or multiple chaincodes) and make a few transactions.

### **Create Folder For Testing**

```bash
mkdir paratonnerreTest
cd paratonnerreTest
```

### **Prepare Credentials**

**Copy all three files into "paratonnerreTest" folder.**

In order to run the application, you need to prepare the following 3 files.

- user certificate (**cert.pem**)
- user private key (**\*\_sk**)
- peer tls certificate (**ca.crt**)

</br>

< **For Fabric Samples Test Network** >

You can access the files by following the path below in the test network in the Fabric samples repository.

**For User Certificate:**

- fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/**cert.pem**

**For User Private Key:** (After copy-paste, change name to **_priv_sk_**)

- fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/**< private key file >**

**For Peer Tls Certificate:**

- fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/**ca.crt**

### **Get Docker-Compose Files**

Download files and put into paratonnerreTest folder.

[kafka-services compose file](https://github.com/caner-emec/paratonnerre/releases/download/v0.1.0-alpha/kafka-services-docker-compose.yaml)

[paratonnerre compose file](https://github.com/caner-emec/paratonnerre/releases/download/v0.1.0-alpha/paratonnerre-docker-compose.yaml)

### **Configure Environment Variables**

```bash
- PEER_NAME=peer0.org1.example.com
- MSP_ID=Org1MSP
- PEER_ENDPOINT=localhost:7051
- PEER_HOST_ALIAS=peer0.org1.example.com
# Listener settings
- LISTENER_BLOCK_EVENTS_FROM=mychannel # comma seperated channel list
- LISTENER_CHAINCODE_EVENTS_FROM=mychannel:events,mychannel:basic # comma seperated chaincode list, ex. <channel name>:<chaincode name>
```

**Change the above variables according to your own network.**

</br>

### **Start Application**

```bash
docker-compose -f kafka-services-docker-compose.yaml up -d
docker-compose -f paratonnerre-docker-compose.yaml up
```

## **Basic Usage**

**To Listen Events**

Topic names:

- _< KAFKA_TOPIC_HLF_BLOCKS_PREFIX >\_< Channel Name >_
- _< KAFKA_TOPIC_HLF_FILTERED_BLOCK_PREFIX >\_< Channel Name >_
- _< KAFKA_TOPIC_HLF_BLOCK_AND_PRIVDATA_PREFIX >\_< Channel Name >_
- _< KAFKA_TOPIC_HLF_TRANSACTION_PREFIX >\_< Channel Name >\_< Chaincode Name >_

</br>

```bash
docker exec kafka-1 kafka-console-consumer --topic <TOPIC NAME COMES HERE> --from-beginning --bootstrap-server localhost:9092
```

**Examples**

```bash
docker exec kafka-1 kafka-console-consumer --topic hlf_txs_mychannel_events --from-beginning --bootstrap-server localhost:9092
docker exec kafka-1 kafka-console-consumer --topic hlf_txs_mychannel_basic --from-beginning --bootstrap-server localhost:9092
docker exec kafka-1 kafka-console-consumer --topic hlf_blocks_mychannel --from-beginning --bootstrap-server localhost:9092
docker exec kafka-1 kafka-console-consumer --topic hlf_filteredBlock_mychannel --from-beginning --bootstrap-server localhost:9092
docker exec kafka-1 kafka-console-consumer --topic hlf_blockAndPriv_mychannel --from-beginning --bootstrap-server localhost:9092
```

**Block And Private Data Event Example Output**

```json
{
    "hasBlock":true,
    "block":{
        "block":{
            "metadata":{
                "value":"CgIIAhIJCgcKAQEQAhgp",
                "numOfSignatures":1,
                "signatures":[
                    {
                        "signatureHeader":{
                            "creator":{
                                "mspId":"OrdererMSP",
                                "id":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNwakNDQWt5Z0F3SUJBZ0lVZTZHbjhUOVY0ZFRVdzRkSzdZb2oxZ0laN2VRd0NnWUlLb1pJemowRUF3SXcKWWpFTE1Ba0dBMVVFQmhNQ1ZWTXhFVEFQQmdOVkJBZ1RDRTVsZHlCWmIzSnJNUkV3RHdZRFZRUUhFd2hPWlhjZwpXVzl5YXpFVU1CSUdBMVVFQ2hNTFpYaGhiWEJzWlM1amIyMHhGekFWQmdOVkJBTVREbU5oTG1WNFlXMXdiR1V1ClkyOXRNQjRYRFRJek1EVXhPVEV4TlRVd01Gb1hEVEkwTURVeE9ERXlNREF3TUZvd1lERUxNQWtHQTFVRUJoTUMKVlZNeEZ6QVZCZ05WQkFnVERrNXZjblJvSUVOaGNtOXNhVzVoTVJRd0VnWURWUVFLRXd0SWVYQmxjbXhsWkdkbApjakVRTUE0R0ExVUVDeE1IYjNKa1pYSmxjakVRTUE0R0ExVUVBeE1IYjNKa1pYSmxjakJaTUJNR0J5cUdTTTQ5CkFnRUdDQ3FHU000OUF3RUhBMElBQkM5NUU2Nkk4cG9ZblU2QmdnZ2pCcDUvbEx3Y1hkRnFaMCt4TmJWTDJLUk4KT1I4d2VnQWVjUGp6UVRxUHZIREY3T0lqRE5LQTdpVnpqOS9wdTRXTlNmbWpnZUV3Z2Q0d0RnWURWUjBQQVFILwpCQVFEQWdlQU1Bd0dBMVVkRXdFQi93UUNNQUF3SFFZRFZSME9CQllFRkFGOFhtOXdJeHpNYzBpSUdTYVQ3WlQxClJ2WFlNQjhHQTFVZEl3UVlNQmFBRkhySnl6Qm11RURXeWw0R2dWM0JMeUdMa1h5Wk1DRUdBMVVkRVFRYU1CaUMKRm1WNGFXMXBiM1Z6TWkxSVZVMUJMVWcwTFZZMExURXdXd1lJS2dNRUJRWUhDQUVFVDNzaVlYUjBjbk1pT25zaQphR1l1UVdabWFXeHBZWFJwYjI0aU9pSWlMQ0pvWmk1RmJuSnZiR3h0Wlc1MFNVUWlPaUp2Y21SbGNtVnlJaXdpCmFHWXVWSGx3WlNJNkltOXlaR1Z5WlhJaWZYMHdDZ1lJS29aSXpqMEVBd0lEU0FBd1JRSWhBUDc4SlJ2czNFV2EKUFBxTkZTS2laQnhNbzBhRDBRc3dhVFVkZHpkYWdONUpBaUFZeXV2WGdHbXQ2WGxjSm1nbWZwMW95TElHZmV0VwpVYjJ2QUljb0hmcCtmdz09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K"
                            },
                            "nonce":-9107307609084343000
                        },
                        "signature":"MEQCIHX+jfh6M09x0UOmpu9vMdT6PTEJvUEkoClPs4Gsz97EAiAHkp5dmbhBGfuKrCLqy+nurdK3tfHNG/uZcEYGMqJChw=="
                    }
                ],
                "metadataCommitHash":"0a20383f55343c2cfbdd3a5a2322effea002a4f28af37b1e83f5f43743ab02b9b83a"
            },
            "header":{
                "number":39,
                "previousHash":"8e458f792409ce48fa68cb20208a622ba226747189ff58b44905d62086a33f1c",
                "dataHash":"2e381c6e56a9b82c5da5707a6eea327b9cb942f3d313418d4609d490ef08025f"
            },
            "data":[
                {
                    "txValidationStatus":"VALID",
                    "signature":"30450221008b81d935c066eeaa5d5df715c21575281665c26b93c39833538e08ec16cd5a25022023ec2524c97230c2f4ce12c6ea41bcee5b7cd6c04c12ae94a715f774696cbf68",
                    "payload":{
                        "header":{
                            "header":{
                                "channelHeader":{
                                    "type":"ENDORSER_TRANSACTION",
                                    "version":0,
                                    "timestamp":"2023-06-24T15:37:08.133Z",
                                    "channelId":"mychannel",
                                    "txId":"f2330b37616667a0d9b81221133d090faeff67d9c8a8a81c3c84a17be613569b",
                                    "epoch":0,
                                    "tlsCertHash":""
                                },
                                "signatureHeader":{
                                    "creator":{
                                        "mspId":"Org1MSP",
                                        "id":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNyakNDQWxTZ0F3SUJBZ0lVVmxFZlJVZmhvdk0vUkpMTk9vblBDK2g4Yk93d0NnWUlLb1pJemowRUF3SXcKY0RFTE1Ba0dBMVVFQmhNQ1ZWTXhGekFWQmdOVkJBZ1REazV2Y25Sb0lFTmhjbTlzYVc1aE1ROHdEUVlEVlFRSApFd1pFZFhKb1lXMHhHVEFYQmdOVkJBb1RFRzl5WnpFdVpYaGhiWEJzWlM1amIyMHhIREFhQmdOVkJBTVRFMk5oCkxtOXlaekV1WlhoaGJYQnNaUzVqYjIwd0hoY05Nak13TlRFNU1URTFOVEF3V2hjTk1qUXdOVEU0TVRJd01EQXcKV2pCZE1Rc3dDUVlEVlFRR0V3SlZVekVYTUJVR0ExVUVDQk1PVG05eWRHZ2dRMkZ5YjJ4cGJtRXhGREFTQmdOVgpCQW9UQzBoNWNHVnliR1ZrWjJWeU1ROHdEUVlEVlFRTEV3WmpiR2xsYm5ReERqQU1CZ05WQkFNVEJYVnpaWEl4Ck1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRUpNQ1N3RmQ4UlFtOWxBM3JmYlFhM01VVDZPN2IKcU1CU1lzQ09LcEpNczZJUk15T0RCUjRYemhjRkpKeWo0Mkg5U1pVZHllc1ZhZXY2azRLWk80Z0tGcU9CM2pDQgoyekFPQmdOVkhROEJBZjhFQkFNQ0I0QXdEQVlEVlIwVEFRSC9CQUl3QURBZEJnTlZIUTRFRmdRVTVZcm5OaDkvCnA4UWtmSHd4K2xjU2RVbG93SFl3SHdZRFZSMGpCQmd3Rm9BVTdjS1p2S1BqRktSRktkekU2ZUxxNWE4NHcrY3cKSVFZRFZSMFJCQm93R0lJV1pYaHBiV2x2ZFhNeUxVaFZUVUV0U0RRdFZqUXRNVEJZQmdncUF3UUZCZ2NJQVFSTQpleUpoZEhSeWN5STZleUpvWmk1QlptWnBiR2xoZEdsdmJpSTZJaUlzSW1obUxrVnVjbTlzYkcxbGJuUkpSQ0k2CkluVnpaWEl4SWl3aWFHWXVWSGx3WlNJNkltTnNhV1Z1ZENKOWZUQUtCZ2dxaGtqT1BRUURBZ05JQURCRkFpRUEKbnlrQW1VdnhjMWpyRThOdlRVZzErQ0FYM0o5OXY2RGhJYVFkeDdUV2pwY0NJR0xpbS9jeGVjdGlINDBxaXVzbApCa0hqSXRtYzcyU0xQMC84RVd5RHFkWEYKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo="
                                    },
                                    "nonce":-265899332887951070
                                }
                            }
                        },
                        "data":{
                            "transactionActions":[
                                {
                                    "proposalActionHeader":{
                                        "creator":{
                                            "mspId":"Org1MSP",
                                            "id":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNyakNDQWxTZ0F3SUJBZ0lVVmxFZlJVZmhvdk0vUkpMTk9vblBDK2g4Yk93d0NnWUlLb1pJemowRUF3SXcKY0RFTE1Ba0dBMVVFQmhNQ1ZWTXhGekFWQmdOVkJBZ1REazV2Y25Sb0lFTmhjbTlzYVc1aE1ROHdEUVlEVlFRSApFd1pFZFhKb1lXMHhHVEFYQmdOVkJBb1RFRzl5WnpFdVpYaGhiWEJzWlM1amIyMHhIREFhQmdOVkJBTVRFMk5oCkxtOXlaekV1WlhoaGJYQnNaUzVqYjIwd0hoY05Nak13TlRFNU1URTFOVEF3V2hjTk1qUXdOVEU0TVRJd01EQXcKV2pCZE1Rc3dDUVlEVlFRR0V3SlZVekVYTUJVR0ExVUVDQk1PVG05eWRHZ2dRMkZ5YjJ4cGJtRXhGREFTQmdOVgpCQW9UQzBoNWNHVnliR1ZrWjJWeU1ROHdEUVlEVlFRTEV3WmpiR2xsYm5ReERqQU1CZ05WQkFNVEJYVnpaWEl4Ck1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRUpNQ1N3RmQ4UlFtOWxBM3JmYlFhM01VVDZPN2IKcU1CU1lzQ09LcEpNczZJUk15T0RCUjRYemhjRkpKeWo0Mkg5U1pVZHllc1ZhZXY2azRLWk80Z0tGcU9CM2pDQgoyekFPQmdOVkhROEJBZjhFQkFNQ0I0QXdEQVlEVlIwVEFRSC9CQUl3QURBZEJnTlZIUTRFRmdRVTVZcm5OaDkvCnA4UWtmSHd4K2xjU2RVbG93SFl3SHdZRFZSMGpCQmd3Rm9BVTdjS1p2S1BqRktSRktkekU2ZUxxNWE4NHcrY3cKSVFZRFZSMFJCQm93R0lJV1pYaHBiV2x2ZFhNeUxVaFZUVUV0U0RRdFZqUXRNVEJZQmdncUF3UUZCZ2NJQVFSTQpleUpoZEhSeWN5STZleUpvWmk1QlptWnBiR2xoZEdsdmJpSTZJaUlzSW1obUxrVnVjbTlzYkcxbGJuUkpSQ0k2CkluVnpaWEl4SWl3aWFHWXVWSGx3WlNJNkltTnNhV1Z1ZENKOWZUQUtCZ2dxaGtqT1BRUURBZ05JQURCRkFpRUEKbnlrQW1VdnhjMWpyRThOdlRVZzErQ0FYM0o5OXY2RGhJYVFkeDdUV2pwY0NJR0xpbS9jeGVjdGlINDBxaXVzbApCa0hqSXRtYzcyU0xQMC84RVd5RHFkWEYKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo="
                                        },
                                        "nonce":-265899332887951070
                                    },
                                    "chaincodeActionPayload":{
                                        "chaincodeEndorsedAction":{
                                            "endorsments":[
                                                {
                                                    "endorser":{
                                                        "mspId":"Org1MSP",
                                                        "id":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNxVENDQWxDZ0F3SUJBZ0lVU2Z4bjRzamYvV2JTUHNOajBpd2VuNmFaSmVVd0NnWUlLb1pJemowRUF3SXcKY0RFTE1Ba0dBMVVFQmhNQ1ZWTXhGekFWQmdOVkJBZ1REazV2Y25Sb0lFTmhjbTlzYVc1aE1ROHdEUVlEVlFRSApFd1pFZFhKb1lXMHhHVEFYQmdOVkJBb1RFRzl5WnpFdVpYaGhiWEJzWlM1amIyMHhIREFhQmdOVkJBTVRFMk5oCkxtOXlaekV1WlhoaGJYQnNaUzVqYjIwd0hoY05Nak13TlRFNU1URTFOVEF3V2hjTk1qUXdOVEU0TVRJd01EQXcKV2pCYk1Rc3dDUVlEVlFRR0V3SlZVekVYTUJVR0ExVUVDQk1PVG05eWRHZ2dRMkZ5YjJ4cGJtRXhGREFTQmdOVgpCQW9UQzBoNWNHVnliR1ZrWjJWeU1RMHdDd1lEVlFRTEV3UndaV1Z5TVE0d0RBWURWUVFERXdWd1pXVnlNREJaCk1CTUdCeXFHU000OUFnRUdDQ3FHU000OUF3RUhBMElBQk9vSk1IeXdBK3Yvcm1jSUNOcE5PZC9wTis5WUQ0WTAKTnl3ZU1VWGxZL3AxdktTZkQrSG0vT3c4QWFFYUVlUzdaZGlrN081SHVmVWtJU2QwY2dlajVBdWpnZHd3Z2RrdwpEZ1lEVlIwUEFRSC9CQVFEQWdlQU1Bd0dBMVVkRXdFQi93UUNNQUF3SFFZRFZSME9CQllFRkJLbWpkU3BVMFk4CkgzY0NWNmszV2laaXlWdy9NQjhHQTFVZEl3UVlNQmFBRk8zQ21ieWo0eFNrUlNuY3hPbmk2dVd2T01Qbk1DRUcKQTFVZEVRUWFNQmlDRm1WNGFXMXBiM1Z6TWkxSVZVMUJMVWcwTFZZMExURXdWZ1lJS2dNRUJRWUhDQUVFU25zaQpZWFIwY25NaU9uc2lhR1l1UVdabWFXeHBZWFJwYjI0aU9pSWlMQ0pvWmk1RmJuSnZiR3h0Wlc1MFNVUWlPaUp3ClpXVnlNQ0lzSW1obUxsUjVjR1VpT2lKd1pXVnlJbjE5TUFvR0NDcUdTTTQ5QkFNQ0EwY0FNRVFDSUFadzZ3S2IKK0dUa1RPYXdaeDBpcE1QWFFzWlk2Q2x6Q05LSkx3QzhWWWtDQWlCc1orTzRqSmhoZFhRZ0t1Z1pIeVMvd2NWUgpVM2Y2bGNORmhNVnRYTFJtenc9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg=="
                                                    },
                                                    "signature":"3045022100b2c52a9efcf42d846d4722c27d662f08cca457bab3e31ae115b2deccfac49bfa0220178f9997609f70de54ab9cc52e15447b7f9fae930aa903d06f41257269ecb7ea"
                                                }
                                            ],
                                            "proposalResponsePayload":{
                                                "proposalHash":"f435152bc56d8ab7296495a1cee15dd556d75c46e520c2a37ef74adf06ea00a5",
                                                "extensionChaincodeAction":{
                                                    "chaincodeId":{
                                                        "name":"private",
                                                        "path":"",
                                                        "version":"1.0"
                                                    },
                                                    "chaincodeEvent":{
                                                        "chaincodeId":"",
                                                        "txId":"",
                                                        "eventName":"",
                                                        "payload":""
                                                    },
                                                    "chaincodeResponse":{
                                                        "status":200,
                                                        "message":""
                                                    },
                                                    "chaincodeResults":{
                                                        "txRWSet":{
                                                            "datamodel":0,
                                                            "nsRWSet":[
                                                                {
                                                                    "namespace":"_lifecycle",
                                                                    "rwset":{
                                                                        "kvReadList":[
                                                                            {
                                                                                "key":"namespaces/fields/private/Collections",
                                                                                "version":{
                                                                                    "blockNum":34,
                                                                                    "txNum":0
                                                                                }
                                                                            },
                                                                            {
                                                                                "key":"namespaces/fields/private/EndorsementInfo",
                                                                                "version":{
                                                                                    "blockNum":34,
                                                                                    "txNum":0
                                                                                }
                                                                            },
                                                                            {
                                                                                "key":"namespaces/fields/private/Sequence",
                                                                                "version":{
                                                                                    "blockNum":34,
                                                                                    "txNum":0
                                                                                }
                                                                            },
                                                                            {
                                                                                "key":"namespaces/fields/private/ValidationInfo",
                                                                                "version":{
                                                                                    "blockNum":34,
                                                                                    "txNum":0
                                                                                }
                                                                            },
                                                                            {
                                                                                "key":"namespaces/metadata/private",
                                                                                "version":{
                                                                                    "blockNum":34,
                                                                                    "txNum":0
                                                                                }
                                                                            }
                                                                        ],
                                                                        "kvWriteList":[
                                                                            
                                                                        ],
                                                                        "rangeQueryInfoList":[
                                                                            
                                                                        ],
                                                                        "kvMetadataWriteList":[
                                                                            
                                                                        ]
                                                                    },
                                                                    "collectionHashedRWSet":[
                                                                        
                                                                    ]
                                                                },
                                                                {
                                                                    "namespace":"private",
                                                                    "rwset":{
                                                                        "kvReadList":[
                                                                            
                                                                        ],
                                                                        "kvWriteList":[
                                                                            
                                                                        ],
                                                                        "rangeQueryInfoList":[
                                                                            
                                                                        ],
                                                                        "kvMetadataWriteList":[
                                                                            
                                                                        ]
                                                                    },
                                                                    "collectionHashedRWSet":[
                                                                        {
                                                                            "collectionName":"Org1MSPPrivateCollection",
                                                                            "hashedRWSet":{
                                                                                "hashedReadList":[
                                                                                    
                                                                                ],
                                                                                "hashedWriteList":[
                                                                                    {
                                                                                        "keyHAsh":"d53762bfc6f701bfb680d6f8b334e416b5f77f0ee1eae9d7a2bf856ac2da46a4",
                                                                                        "valueHash":"44e1b27f5ed029718dd4a7668b493cc714515c275d59034d273c1d4ad03bfca7",
                                                                                        "isDelete":false,
                                                                                        "isPurge":false
                                                                                    }
                                                                                ],
                                                                                "metadataWriteList":[
                                                                                    
                                                                                ]
                                                                            },
                                                                            "privateRWSetHash":"12440a20d53762bfc6f701bfb680d6f8b334e416b5f77f0ee1eae9d7a2bf856ac2da46a41a2044e1b27f5ed029718dd4a7668b493cc714515c275d59034d273c1d4ad03bfca7"
                                                                        },
                                                                        {
                                                                            "collectionName":"assetCollection",
                                                                            "hashedRWSet":{
                                                                                "hashedReadList":[
                                                                                    {
                                                                                        "keyHash":"d53762bfc6f701bfb680d6f8b334e416b5f77f0ee1eae9d7a2bf856ac2da46a4",
                                                                                        "version":{
                                                                                            
                                                                                        }
                                                                                    }
                                                                                ],
                                                                                "hashedWriteList":[
                                                                                    {
                                                                                        "keyHAsh":"d53762bfc6f701bfb680d6f8b334e416b5f77f0ee1eae9d7a2bf856ac2da46a4",
                                                                                        "valueHash":"681a7da202d907bb6fa3cffaeac0424ec7819b696a71cbe997d0bd0ee25a35e6",
                                                                                        "isDelete":false,
                                                                                        "isPurge":false
                                                                                    }
                                                                                ],
                                                                                "metadataWriteList":[
                                                                                    
                                                                                ]
                                                                            },
                                                                            "privateRWSetHash":"0a220a20d53762bfc6f701bfb680d6f8b334e416b5f77f0ee1eae9d7a2bf856ac2da46a412440a20d53762bfc6f701bfb680d6f8b334e416b5f77f0ee1eae9d7a2bf856ac2da46a41a20681a7da202d907bb6fa3cffaeac0424ec7819b696a71cbe997d0bd0ee25a35e6"
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        },
                                                        "txPvtRWSet":{
                                                            "datamodel":0,
                                                            "nsPvtRWSet":[
                                                                {
                                                                    "namespace":"_lifecycle",
                                                                    "collectionPvtRWSet":[
                                                                        {
                                                                            "collectionName":"\n\u001bnamespaces/metadata/private\u0012\u0002\b\"",
                                                                            "rwset":{
                                                                                "kvReadList":[
                                                                                    
                                                                                ],
                                                                                "kvWriteList":[
                                                                                    
                                                                                ],
                                                                                "rangeQueryInfoList":[
                                                                                    
                                                                                ],
                                                                                "kvMetadataWriteList":[
                                                                                    
                                                                                ]
                                                                            }
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    "namespace":"private",
                                                                    "collectionPvtRWSet":[
                                                                        
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        "chaincodeProposalPayload":{
                                            "chaincodeInvocationSpecInput":{
                                                "ChaincodeSpec":{
                                                    "type":"NODE",
                                                    "chaincodeId":{
                                                        "name":"private",
                                                        "path":"",
                                                        "version":""
                                                    },
                                                    "input":{
                                                        "args":[
                                                            "CreateAsset"
                                                        ],
                                                        "isInit":false
                                                    },
                                                    "timeout":0
                                                }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        }
    },
    "privateDataMap":[
        [
            {
                "namespace":"private",
                "collectionPvtRWSet":[
                    {
                        "collectionName":"Org1MSPPrivateCollection",
                        "rwset":{
                            "kvReadList":[
                                
                            ],
                            "kvWriteList":[
                                {
                                    "key":"asset1687621028121",
                                    "value":{
                                        "asByte":{
                                            "0":123,
                                            "1":34,
                                            "2":65,
                                            "3":112,
                                            "4":112,
                                            "5":114,
                                            "6":97,
                                            "7":105,
                                            "8":115,
                                            "9":101,
                                            "10":100,
                                            "11":86,
                                            "12":97,
                                            "13":108,
                                            "14":117,
                                            "15":101,
                                            "16":34,
                                            "17":58,
                                            "18":49,
                                            "19":48,
                                            "20":48,
                                            "21":44,
                                            "22":34,
                                            "23":73,
                                            "24":68,
                                            "25":34,
                                            "26":58,
                                            "27":34,
                                            "28":97,
                                            "29":115,
                                            "30":115,
                                            "31":101,
                                            "32":116,
                                            "33":49,
                                            "34":54,
                                            "35":56,
                                            "36":55,
                                            "37":54,
                                            "38":50,
                                            "39":49,
                                            "40":48,
                                            "41":50,
                                            "42":56,
                                            "43":49,
                                            "44":50,
                                            "45":49,
                                            "46":34,
                                            "47":125
                                        },
                                        "asBase64":"eyJBcHByYWlzZWRWYWx1ZSI6MTAwLCJJRCI6ImFzc2V0MTY4NzYyMTAyODEyMSJ9",
                                        "asString":"{\"AppraisedValue\":100,\"ID\":\"asset1687621028121\"}"
                                    },
                                    "isDeleted":false
                                }
                            ],
                            "rangeQueryInfoList":[
                                
                            ],
                            "kvMetadataWriteList":[
                                
                            ]
                        }
                    },
                    {
                        "collectionName":"assetCollection",
                        "rwset":{
                            "kvReadList":[
                                
                            ],
                            "kvWriteList":[
                                {
                                    "key":"asset1687621028121",
                                    "value":{
                                        "asByte":{
                                            "0":123,
                                            "1":34,
                                            "2":67,
                                            "3":111,
                                            "4":108,
                                            "5":111,
                                            "6":114,
                                            "7":34,
                                            "8":58,
                                            "9":34,
                                            "10":103,
                                            "11":114,
                                            "12":101,
                                            "13":101,
                                            "14":110,
                                            "15":34,
                                            "16":44,
                                            "17":34,
                                            "18":73,
                                            "19":68,
                                            "20":34,
                                            "21":58,
                                            "22":34,
                                            "23":97,
                                            "24":115,
                                            "25":115,
                                            "26":101,
                                            "27":116,
                                            "28":49,
                                            "29":54,
                                            "30":56,
                                            "31":55,
                                            "32":54,
                                            "33":50,
                                            "34":49,
                                            "35":48,
                                            "36":50,
                                            "37":56,
                                            "38":49,
                                            "39":50,
                                            "40":49,
                                            "41":34,
                                            "42":44,
                                            "43":34,
                                            "44":79,
                                            "45":119,
                                            "46":110,
                                            "47":101,
                                            "48":114,
                                            "49":34,
                                            "50":58,
                                            "51":34,
                                            "52":120,
                                            "53":53,
                                            "54":48,
                                            "55":57,
                                            "56":58,
                                            "57":58,
                                            "58":47,
                                            "59":67,
                                            "60":61,
                                            "61":85,
                                            "62":83,
                                            "63":47,
                                            "64":83,
                                            "65":84,
                                            "66":61,
                                            "67":78,
                                            "68":111,
                                            "69":114,
                                            "70":116,
                                            "71":104,
                                            "72":32,
                                            "73":67,
                                            "74":97,
                                            "75":114,
                                            "76":111,
                                            "77":108,
                                            "78":105,
                                            "79":110,
                                            "80":97,
                                            "81":47,
                                            "82":79,
                                            "83":61,
                                            "84":72,
                                            "85":121,
                                            "86":112,
                                            "87":101,
                                            "88":114,
                                            "89":108,
                                            "90":101,
                                            "91":100,
                                            "92":103,
                                            "93":101,
                                            "94":114,
                                            "95":47,
                                            "96":79,
                                            "97":85,
                                            "98":61,
                                            "99":99,
                                            "100":108,
                                            "101":105,
                                            "102":101,
                                            "103":110,
                                            "104":116,
                                            "105":47,
                                            "106":67,
                                            "107":78,
                                            "108":61,
                                            "109":117,
                                            "110":115,
                                            "111":101,
                                            "112":114,
                                            "113":49,
                                            "114":58,
                                            "115":58,
                                            "116":47,
                                            "117":67,
                                            "118":61,
                                            "119":85,
                                            "120":83,
                                            "121":47,
                                            "122":83,
                                            "123":84,
                                            "124":61,
                                            "125":78,
                                            "126":111,
                                            "127":114,
                                            "128":116,
                                            "129":104,
                                            "130":32,
                                            "131":67,
                                            "132":97,
                                            "133":114,
                                            "134":111,
                                            "135":108,
                                            "136":105,
                                            "137":110,
                                            "138":97,
                                            "139":47,
                                            "140":76,
                                            "141":61,
                                            "142":68,
                                            "143":117,
                                            "144":114,
                                            "145":104,
                                            "146":97,
                                            "147":109,
                                            "148":47,
                                            "149":79,
                                            "150":61,
                                            "151":111,
                                            "152":114,
                                            "153":103,
                                            "154":49,
                                            "155":46,
                                            "156":101,
                                            "157":120,
                                            "158":97,
                                            "159":109,
                                            "160":112,
                                            "161":108,
                                            "162":101,
                                            "163":46,
                                            "164":99,
                                            "165":111,
                                            "166":109,
                                            "167":47,
                                            "168":67,
                                            "169":78,
                                            "170":61,
                                            "171":99,
                                            "172":97,
                                            "173":46,
                                            "174":111,
                                            "175":114,
                                            "176":103,
                                            "177":49,
                                            "178":46,
                                            "179":101,
                                            "180":120,
                                            "181":97,
                                            "182":109,
                                            "183":112,
                                            "184":108,
                                            "185":101,
                                            "186":46,
                                            "187":99,
                                            "188":111,
                                            "189":109,
                                            "190":34,
                                            "191":44,
                                            "192":34,
                                            "193":83,
                                            "194":105,
                                            "195":122,
                                            "196":101,
                                            "197":34,
                                            "198":58,
                                            "199":50,
                                            "200":48,
                                            "201":125
                                        },
                                        "asBase64":"eyJDb2xvciI6ImdyZWVuIiwiSUQiOiJhc3NldDE2ODc2MjEwMjgxMjEiLCJPd25lciI6Ing1MDk6Oi9DPVVTL1NUPU5vcnRoIENhcm9saW5hL089SHlwZXJsZWRnZXIvT1U9Y2xpZW50L0NOPXVzZXIxOjovQz1VUy9TVD1Ob3J0aCBDYXJvbGluYS9MPUR1cmhhbS9PPW9yZzEuZXhhbXBsZS5jb20vQ049Y2Eub3JnMS5leGFtcGxlLmNvbSIsIlNpemUiOjIwfQ==",
                                        "asString":"{\"Color\":\"green\",\"ID\":\"asset1687621028121\",\"Owner\":\"x509::/C=US/ST=North Carolina/O=Hyperledger/OU=client/CN=user1::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com\",\"Size\":20}"
                                    },
                                    "isDeleted":false
                                }
                            ],
                            "rangeQueryInfoList":[
                                
                            ],
                            "kvMetadataWriteList":[
                                
                            ]
                        }
                    }
                ]
            }
        ]
    ]
}
```

**Filtered Block Event Data Example Output**
```json
{
   "channelID":"mychannel",
   "number":23,
   "filteredTxs":[
      {
         "txId":"12a8d233669d147778cce342e37a0f195fbdcffdd9bc8efe716745c010009f3e",
         "type":"ENDORSER_TRANSACTION",
         "validationCode":"VALID",
         "actions":[
            {
               "chaincodeEvent":{
                  "transactionId":"12a8d233669d147778cce342e37a0f195fbdcffdd9bc8efe716745c010009f3e",
                  "eventName":"DeleteAsset",
                  "chaincodeName":"events",
                  "payload":""
               }
            }
         ]
      }
   ]
}
```


**Chaincode Event Data Example Output:**

```json
{
  "chaincodeEvent": {
    "transactionId": "12b5aa482750d0f0a53daa3b69d6856f1652519f9f66e5fc4ad6d2b3a145705a",
    "blockNumber": 22,
    "eventName": "TransferAsset",
    "chaincodeName": "events",
    "payload": "{\"ID\":\"asset1686480891540\",\"Color\":\"blue\",\"Size\":\"10\",\"Owner\":\"Mary\",\"AppraisedValue\":\"200\"}"
  }
}
```

## **Authors**

Caner Emeç - caner.emec@gmail.com

## **Licence**

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## **Acknowledgement**

// TO DO
