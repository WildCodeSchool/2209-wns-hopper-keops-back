import { beforeAll, describe, expect, it } from "@jest/globals";
import { graphql, GraphQLSchema, print } from "graphql";
import { UsersResolver } from "../src/resolvers/Users";
import { buildSchema } from "type-graphql";
import dataSource from "../src/utils";
import { signin } from "./graphql/signin";
import { User } from "../src/entity/User";
import { authChecker } from "../src/auth";
import { initializeTestDb } from "./testDb";
import { createChallenge } from "./graphql/createChallenge";
import { Challenge } from "../src/entity/Challenge";

let schema: GraphQLSchema;

beforeAll(async () => {
  await initializeTestDb();
  // Création du schema
  schema = await buildSchema({
    resolvers: [UsersResolver],
    authChecker,
  });
});

describe("In the Challenge resolver", () => {
  describe("the method createChallenge", () => {
    it("should find in DB a new challenge without actions", async () => {
      const challengeMaster = User.new({
        email: "test@gmail.com",
        password: "notpassword",
      });

      const mutation = print(createChallenge);
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const name = `Mon super challenge du ${startDate}`;

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          data: {
            length: 10,
            start_date: startDate,
            name,
            createdBy: challengeMaster,
            createdAt: new Date(),
          },
        },
      });

      const challenge = await dataSource
        .getRepository(Challenge)
        .findOneBy({ name });

      expect(result.data?.createChallenge).toBeTruthy();
      expect(challenge?.start_date).toBe(startDate);
    });

    it("should find in DB a new challenge with linked actions", async () => {
      const challengeMaster = User.new({
        email: "test2@gmail.com",
        password: "notpassword",
      });

      const mutation = print(createChallenge);
      const startDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const name = `Mon super challenge du ${startDate}`;
      const actions = [{ id: "1" }, { id: "2" }];

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          data: {
            length: 10,
            start_date: startDate,
            name,
            createdBy: challengeMaster,
            createdAt: new Date(),
            actions,
          },
        },
      });

      const challenge = await dataSource
        .getRepository(Challenge)
        .findOneBy({ name });

      expect(result.data?.createChallenge).toBeTruthy();
      expect(challenge?.start_date).toBe(startDate);
      expect(challenge?.actions).toBe(actions);
    });
  });

  describe("the method updateChallenge", () => {
    it("return ", async () => {
      const mutation = print(signin);
      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          email: "test@gmail.com",
          password: "supersecret",
        },
      });
      console.log(result);
      expect(result.data?.signin).toBeTruthy();
    });
    it("Prevent using the wrong credentials", async () => {
      const mutation = print(signin);
      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          email: "test@gmail.com",
          password: "notpassword",
        },
      });
      console.log(result);
      expect(result.data?.signin).toBe(null);
    });
  });
});
