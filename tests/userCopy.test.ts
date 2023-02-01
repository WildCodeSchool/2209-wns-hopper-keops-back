import { beforeAll, describe, expect, it } from "@jest/globals";
import { graphql, GraphQLSchema, print } from "graphql";
import { UsersResolver } from "../src/resolvers/Users";
import { buildSchema } from "type-graphql";
import dataSource from "../src/utils";
import { createUser } from "./graphql/createUser";
import { signin } from "./graphql/signin";
import { User } from "../src/entity/User";
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

describe("Users", () => {
  describe("User signup", () => {
    it("Returns data when user created", async () => {
      const mutation = print(createUser);
      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          data: {
            email: "test@gmail.com",
            password: "supersecret",
          },
        },
      });
      console.log(result);
      expect(result.data?.createUser).toBeTruthy();
    });

    it("Verify if user is created in DB", async () => {
      const user = await dataSource
        .getRepository(User)
        .findOne({ where: { email: "test@gmail.com" } });
      expect(user).toBeTruthy();
    });

    it("Verify if the password in DB is hashed", async () => {
      const user = await dataSource
        .getRepository(User)
        .findOne({ where: { email: "test@gmail.com" } });
      expect(user?.password === "supersecret").toBe(false);
    });

    it("Prevents using the same email", async () => {
      const mutation = print(createUser);
      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          data: {
            email: "test@gmail.com",
            password: "supersecret",
          },
        },
      });
      console.log(result);
      expect(result.data).toBe(null);
      expect(result.errors).toHaveLength(1);
    });
  });
  describe("User signin", () => {
    it("Return a token if the credentials are true", async () => {
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
