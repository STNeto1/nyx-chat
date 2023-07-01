import { Entity, EntityItem } from "electrodb";

import { Dynamo } from "./dynamo";
export * as Message from "./message";

export const MessageEntity = new Entity(
  {
    model: {
      version: "1",
      entity: "Message",
      service: "ws",
    },
    attributes: {
      connectionID: {
        type: "string",
        required: true,
      },
      username: {
        type: "string",
        required: true,
      },
      message: {
        type: "string",
        required: true,
      },
      timestamp: {
        type: "string",
        required: true,
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["connectionID"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
    },
  },
  Dynamo.Configuration
);

export type Info = EntityItem<typeof MessageEntity>;

export const createEntry = async (
  connID: string,
  username: string,
  message: string,
  timestamp: string
): Promise<Info> => {
  const { data } = await MessageEntity.put({
    connectionID: connID,
    username,
    message,
    timestamp,
  }).go();

  return data;
};

export const allEntries = async (): Promise<Info[]> => {
  const { data } = await MessageEntity.scan.go();

  return data;
};
