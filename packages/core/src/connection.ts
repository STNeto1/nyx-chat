import { Entity, EntityItem } from "electrodb";

import { Dynamo } from "./dynamo";
export * as Connection from "./connection";

export const ConnectionEntity = new Entity(
  {
    model: {
      version: "1",
      entity: "Connection",
      service: "ws",
    },
    attributes: {
      connectionID: {
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

export type Info = EntityItem<typeof ConnectionEntity>;

export const createEntry = async (connID: string): Promise<Info> => {
  const { data } = await ConnectionEntity.put({
    connectionID: connID,
  }).go();

  return data;
};

export const deleteEntry = async (connID: string): Promise<void> => {
  await ConnectionEntity.delete({
    connectionID: connID,
  }).go();
};

export const allEntries = async (): Promise<Info[]> => {
  const { data } = await ConnectionEntity.scan.go();

  return data;
};
