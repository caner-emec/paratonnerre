import {Kafka, Producer} from 'kafkajs';
import {config} from '../configs/kafka.configs';

let kafka: Kafka;

const init = () => {
  kafka = new Kafka(config);
};

const getProducer = () => {
  const producer: Producer = kafka.producer();
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
