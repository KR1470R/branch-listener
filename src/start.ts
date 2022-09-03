import express from "express";
import ListenerManager from "./listeners/ListenerManager";
import ConfigFactory from "./util/ConfigFactory";

const listenerManager = new ListenerManager();
const config_server = new ConfigFactory("server");

listenerManager.init()
    .then(() => {
        console.log("initilized")
        listenerManager.startListen();
    })

// console.log(`Running with config: ${JSON.stringify({
//     ...config_server.getAllProperties(),
// }, null, "\t")}\n`);

// const app = express();

// app.listen(config_server.getProperty(0, "port"), () => {
//     console.log(`Listening at ${config_server.getProperty(0, "port")}`);
//     // listen_new_commit();
// });
