import ToolsManager from "./ToolsManager";
import process from "process";
import { supportableCVS, ToolResponse } from "../util/types";
import { signalManager } from "../util/extra";

const [tool_name, cvs_name, id, key, value] = process.argv.slice(2);
if (!tool_name) throw new Error("Tool was not specified!");

if (tool_name === "edit" && (!key || !value))
  throw new Error("Key or value has not provided!");

const toolManager = new ToolsManager(
  tool_name === "setup" ? true : false,
  cvs_name as supportableCVS,
  Number(id),
  key,
  value
);

// ignore terminal signal on these tools
const ignore_tools = [
  // "setup",
  "add",
];

toolManager
  .init()
  .then(() => {
    const definedFunctions = {
      setup: toolManager.setup.bind(toolManager),
      add: toolManager.add.bind(toolManager),
      run: toolManager.run.bind(toolManager),
      start: toolManager.start.bind(toolManager),
      restart: toolManager.restart.bind(toolManager),
      stop: toolManager.stop.bind(toolManager),
      remove: toolManager.remove.bind(toolManager),
      list: toolManager.list.bind(toolManager),
      edit: toolManager.edit.bind(toolManager),
      port: toolManager.getPort.bind(toolManager),
    };

    const specified_function =
      definedFunctions[tool_name as keyof typeof definedFunctions];
    if (!specified_function) throw new Error(`uknown tool - ${tool_name}`);

    return specified_function() as Promise<ToolResponse>;
  })
  .then((response: ToolResponse) => {
    if (response.response) console.log(response.response);
    if (ignore_tools.includes(tool_name)) return Promise.resolve();
    else return signalManager.listenEvents(response.exit);
  })
  .catch((err) => {
    throw new Error(err);
  });
