import { SSTConfig } from "sst";
import { API } from "./stacks/Api";
import { Database } from "./stacks/Database";

export default {
  config(_input) {
    return {
      name: "nyx-chat",
      region: "sa-east-1",
    };
  },
  stacks(app) {
    app.stack(Database).stack(API);
  },
} satisfies SSTConfig;
