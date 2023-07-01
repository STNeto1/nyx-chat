import { APIGatewayProxyHandler } from "aws-lambda";
import { z } from "zod";
import { ApiGatewayManagementApi } from "aws-sdk";
import { Connection } from "@nyx-chat/core/connection";
import { Message } from "@nyx-chat/core/message";

const bodySchema = z.object({
  action: z.literal("fetchmessages"),
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
  const messages = await Message.allEntries();

  const apiG = new ApiGatewayManagementApi({
    endpoint: [domainName, stage].join("/"),
  });

  try {
    // Send the message to the given client
    await apiG
      .postToConnection({
        ConnectionId: evt.requestContext.connectionId ?? "-",
        Data: JSON.stringify(
          messages.map((elem) => ({
            username: elem.username,
            message: elem.message,
            timestamp: elem.timestamp,
          }))
        ),
      })
      .promise();
  } catch (e) {
    console.log("failed to send messages", e);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Messages sent" }),
  };
};
