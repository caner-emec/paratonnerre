# **_Paratonnerre_**

<p align="center">
<img src="./doc/logo.png" alt= “” width="250" height="250">
</p>

Event-catcher for Hyperledger Fabric.

It connects to a node in the Hyperledger fabric network to listen for events. It has the following features.

- Listening raw block events.
- Listenin filtered block events.
- Listening chaincode events.
- Listen to block events on multiple channel.
- Listen to chaincode events on multiple chaincodes.
- Gateway-SDK is used.

**Coming soon:**

- Block And Private Data Events

## **Installization**

Go to the release page and download docker-compose files.

[Release Page - v0.1.0-alpha](https://github.com/caner-emec/paratonnerre/releases/tag/v0.1.0-alpha)

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
