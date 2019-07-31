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
        startSensorMessages(20);
      }

      if(received.message === 'stop') {
        console.log('STOPING ACTUATOR, CLOSING VALVULE')
        stopSensorMessage();
      }
      break;
    case 'sensor':
      // console.log(received.message);
      break;
    case 'user':
      const message = received.message;
      console.log(`USUARIO ${message}`);
      break;
  }
});

let interval;
let sendMsg;

const startSensorMessages = (msg) => {
  sendMsg = msg;
  interval = setInterval(() => {
    sendSensorMessage(sendMsg.toString())
    if(sendMsg < 150) {
      sendMsg += 1;
    }
    if(sendMsg >= 150) {
      sendMsg = randomIntFromInterval(161,164);
    }
    console.log(sendMsg)
  }, 50)
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const sendSensorMessage = (msg) => {
  mockTopic.sendMessage(msg, 'sensor');
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
      mockTopic.sendMessage(JSON.stringify({user: {name:'Karranca'}}), 'user');
    }

    if(str == '-') {
      for(let i = 0 ; i < 15 ; i++) {
        sendSensorMessage('5')
      }
    }
  }
});
console.log('Press any key...');
