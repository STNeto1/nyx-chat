import { APIGatewayProxyHandler } from "aws-lambda";
import { z } from "zod";
import { ApiGatewayManagementApi } from "aws-sdk";
import { Connection } from "@nyx-chat/core/connection";

const bodySchema = z.object({
  action: z.literal("sendmessage"),
  username: z.string(),
  message: z.string(),
});

export const handler: APIGatewayProxyHandler = async (evt) => {
  const messageData = bodySchema.safeParse(JSON.parse(evt.body ?? ""));
  if (!messageData.success) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid body" }),
    };
  }

  const { stage, domainName } = evt.requestContext;
  const connections = await Connection.allEntries();

  const apiG = new ApiGatewayManagementApi({
    endpoint: [domainName, stage].join("/"),
  });

  const postToConnection = async function (props: Connection.Info) {
    try {
      // Send the message to the given client
      await apiG
        .postToConnection({
          ConnectionId: props.connectionID,
          Data: JSON.stringify({
            username: messageData.data.username,
            message: messageData.data.message,
            timestamp: new Date().toISOString(),
          }),
        })
        .promise();
    } catch (e) {
      console.log("failed to send message", e);
      // @ts-ignore
      if (e.statusCode === 410) {
        // Remove stale connections
        await Connection.deleteEntry(props.connectionID);
      }
    }
  };

  await Promise.all(connections.map(postToConnection));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Message sent" }),
  };
};
