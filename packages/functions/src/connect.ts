import { Connection } from "@nyx-chat/core/connection";
import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (evt) => {
  await Connection.createEntry(evt.requestContext?.connectionId ?? "-");

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Connected" }),
  };
};
