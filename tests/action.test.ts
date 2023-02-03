import { beforeAll, describe, expect, it } from "@jest/globals";
import { graphql, GraphQLSchema, print } from "graphql";
import { buildSchema, ID } from "type-graphql";
import dataSource from "../src/utils";
import { Action } from "../src/entity/Action";
import { authChecker } from "../src/auth";
import { initializeTestDb } from "./testDb";
import { ActionsResolver } from "../src/resolvers/Actions";
import { createAction } from "./graphql/createAction";

let schema: GraphQLSchema;

beforeAll(async () => {
  await initializeTestDb();
  // Création du schema
  schema = await buildSchema({
    resolvers: [ActionsResolver],
    authChecker,
  });
});

describe("Actions", () => {
  describe("Create an action ", () => {
    it("Returns data when action created", async () => {
      const mutation = print(createAction);
      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          data: {
            title: "Sauvons les poulets!",
            description: "Stopper la consommation de poulet"
          },
          
        },

      });
      console.log(result);
      expect(result);
    });

    // it("Verify if action is created in DB", async () => {
    //   const action = await dataSource
    //     .getRepository(Action)
    //     .findOneBy({ id: ID });
    //   expect(action).toBeTruthy();
    // });
  });
})
