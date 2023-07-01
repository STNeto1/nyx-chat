import { StackContext, use, WebSocketApi } from "sst/constructs";
import { Database } from "./Database";

export function API({ stack }: StackContext) {
  const db = use(Database);

  const api = new WebSocketApi(stack, "api", {
    defaults: {
      function: {
        bind: [db],
      },
    },
    routes: {
      $connect: "packages/functions/src/connect.handler",
      $disconnect: "packages/functions/src/disconnect.handler",
      sendmessage: "packages/functions/src/sendMessage.handler",
      fetchmessages: "packages/functions/src/fetchMessages.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return api;
}
