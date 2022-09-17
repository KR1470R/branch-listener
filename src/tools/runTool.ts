import ToolsManager from "./ToolsManager";
import process from "process";
import { supportableCVS } from "../util/types";
import { signalManager } from "../util/extra";

const [tool_name, cvs_name, id] = process.argv.slice(2);
if (!tool_name) throw new Error("Tool was not specified!");

const toolManager = new ToolsManager(
  tool_name === "setup" ? true : false,
  cvs_name as supportableCVS,
  Number(id)
);

toolManager
  .init()
  .then(() => {
    const definedFunctions = {
      setup: toolManager.setup.bind(toolManager),
      add: toolManager.add.bind(toolManager),
      start: toolManager.start.bind(toolManager),
      stop: toolManager.stop.bind(toolManager),
      remove: toolManager.remove.bind(toolManager),
      list: toolManager.list.bind(toolManager),
      //@TODO
      //edit
      //restart
    };

    return definedFunctions[
      tool_name as keyof typeof definedFunctions
    ]() as Promise<boolean>;
  })
  .then((exit: boolean) => {
    return signalManager.listenEvents(exit);
  })
  .catch((err) => {
    throw new Error(err);
  });
