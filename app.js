const readline = require('readline');

const mqttHandler = require('./mqttHandler.js');

const SUBSCRIBE_TOPICS = ['keys', 'actuator', 'user', 'sensor'];

const mockTopic = new mqttHandler();
mockTopic.connect();

SUBSCRIBE_TOPICS.forEach((topic) => {
  mockTopic.subscribe(topic);
})

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

mockTopic.on('messageReceived', (received) => {
  switch(received.topic) {
    case 'keys':
      console.log(received);
      break;
    case 'actuator':
      if(received.message === 'start') {
        console.log('STARTING ACTUATOR, OPENING VALVULE');
        startSensorMessages();
      }

      if(received.message === 'stop') {
        console.log('STOPING ACTUATOR, CLOSING VALVULE')
        stopSensorMessage();
      }
      break;
    case 'sensor':
      console.log(received.message);
      break;
    case 'user':
      console.log(`USUARIO ${received.message}`);
      break;
  }
});

let interval;

const startSensorMessages = () => {
  interval = setInterval(() => {
    sendSensorMessage()
  }, 50)
}

const sendSensorMessage = () => {
  mockTopic.sendMessage('123', 'sensor');
}

const stopSensorMessage = () => {
  clearInterval(interval);
}

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    if(str === '1' || str === '2' || str === '3' || str === '4' || str === '5' || str === '6' || str === '7' || str === '8' || str === '9' || str === '0' || str === '*' || str === '#'){
      console.log(`You pressed the "${str}" key`);
      mockTopic.sendMessage(str, 'keys');
    }

    if(str == 's') {
      mockTopic.sendMessage('stop', 'actuator');
    };

    if(str == 'c'){
      mockTopic.sendMessage('start', 'actuator');
    }

    if(str == 'u') {
      mockTopic.sendMessage('Karranca', 'user');
    }
  }
});
console.log('Press any key...');
