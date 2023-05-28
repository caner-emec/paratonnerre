import {Kafka, Producer} from 'kafkajs';
import {config} from '../configs/kafka.configs';

let kafka: Kafka;

let producer: Producer;

const init = () => {
  kafka = new Kafka(config);
  producer = kafka.producer();
};

const getProducer = () => {
  return producer;
};

const connect = async (prod: Producer) => {
  await prod.connect();
};

const disconnect = async (prod: Producer) => {
  await prod.disconnect();
};

const send = async (
  prod: Producer,
  topic: string,
  msg: string | Buffer | null
) => {
  await prod.send({
    topic: topic,
    messages: [
      {
        value: msg,
      },
    ],
  });
};

export {init, connect, disconnect, send, getProducer};
