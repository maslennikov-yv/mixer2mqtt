const mqtt = require("mqtt")
const useMixer = require("./mixer")
require('dotenv').config()

const driver = "generic";
const mqtt_url = process.env.MQTT_URL
const username = process.env.MQTT_USERNAME
const password = process.env.MQTT_PASSWORD
const friendly_name = process.env.FRIENDLY_NAME

const client = mqtt.connect(mqtt_url, {
    username,
    password,
});

const publish = (state) => {
    client.publish(`${driver}/${friendly_name}`, JSON.stringify(state), {})
}

const mixer = useMixer(publish)

client.on("connect", () => {
    client.subscribe(`${driver}/${friendly_name}/#`, (err) => {
        console.log('Connected')
        mixer.run()
    });
});

client.on("message", (topic, message) => {
    let state = JSON.parse(message.toString());
    if (`${driver}/${friendly_name}/set` === topic) {
        mixer.action(state)
    } else if (`${driver}/${friendly_name}/get` === topic) {
        publish(mixer.query())
    }
});

function gracefulShutdown() {
    console.log('\nShutting down gracefully...')
    mixer.end()
    client.end()
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
