import { beforeAll, describe, expect, it } from "@jest/globals";
import { GraphQLSchema } from "graphql";
import { UsersResolver } from "../src/resolvers/Users";
import { buildSchema } from "type-graphql";
import { authChecker } from "../src/auth";
import { initializeTestDb } from "./testDb";

let schema: GraphQLSchema;

beforeAll(async () => {
  await initializeTestDb();
  // Création du schema
  schema = await buildSchema({
    resolvers: [UsersResolver],
    authChecker,
  });
});

describe("Users to challenges", () => {
  describe("User to challenges create", () => {
    it("Returns data when user creted connection with a challenge", async () => {
      expect(false).toBeTruthy();
    });
    it("Save the connection data in DB", async () => {
      expect(false).toBeTruthy();
    });
  });
  describe("User to challenges update", () => {
    it("Returns data when user update connection with a challenge", async () => {
      expect(false).toBeTruthy();
    });
    it("Save the connection updated in DB", async () => {
      expect(false).toBeTruthy();
    });
  });
  describe("User to challenges delete", () => {
    it("Allows admin to delete connection betwen user and his challenge", async () => {
      expect(false).toBeTruthy();
    });
    it("Remove the connection in DB", async () => {
      expect(false).toBeTruthy();
    });
    it("Prevents other than the admin to delete connection on his challenge", async () => {
      expect(false).toBeTruthy();
    });
  });
});
