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
import { me } from "./graphql/me";
import { readUser } from "./graphql/readUser";
import { readAllUsers } from "./graphql/readAllUsers";

let schema: GraphQLSchema;
let userToken: string;
let user: User;

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
      expect(typeof result.data?.signin).toBe("string");
      userToken = result.data?.signin;
    });
    it("Return the current logged user", async () => {
      const mutation = print(me);
      const result = await graphql({
        schema,
        source: mutation,
        contextValue: {
          token: userToken,
        },
      });
      console.log(result);
      expect(result.data?.me).toBeTruthy();
      expect(result.data?.me.email).toBe("test@gmail.com");
      user = result.data?.me;
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
  describe("User me", () => {
    it("Logout the user if the token is wrong or undfined", async () => {
      const mutation = print(me);
      const result = await graphql({
        schema,
        source: mutation,
        contextValue: {
          token: "WrongToken",
        },
      });
      console.log(result);
      expect(result.data?.me).toBe(null);
    });
  });
  describe("User readUser", () => {
    it("Allows the user to read his own profile's infos", async () => {
      const mutation = print(readUser);
      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          readUserId: user.id,
        },
        contextValue: {
          token: userToken,
          me: user,
        },
      });
      console.log(result);
      expect(result.data?.readUser).toBeTruthy();
    });
    it("Prevent another user to read an other profile's infos", async () => {
      const mutation = print(readUser);
      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          readUserId: "1",
        },
        contextValue: {
          token: userToken,
          me: user,
        },
      });
      console.log(result);
      expect(result.data?.readUser).toBe(null);
    });
    it("Return null if user is not in DB", async () => {
      const mutation = print(readUser);
      const result = await graphql({
        schema,
        source: mutation,

        variableValues: {
          readUserId: "2",
        },
      });
      console.log(result);
      expect(result.data?.readUser).toBeNull();
    });
  });
  describe("User readAll", () => {
    it("Returns an array of user and their relations to challenges", async () => {
      const mutation = print(readAllUsers);
      const result = await graphql({
        schema,
        source: mutation,
        contextValue: {
          token: userToken,
        },
      });
      console.log(result.data?.readAllUsers);
      expect(result.data?.readAllUsers).toBeTruthy();
      expect(
        result.data?.readAllUsers.every((user: User) => user.userToChallenges)
      ).toBeTruthy();
    });
  });
  // describe("User update", () => {
  //   it("Returns return data when user update", async () => {
  //     expect(false).toBeTruthy();
  //   });
  //   it("Save the updated data in DB", async () => {
  //     expect(false).toBeTruthy();
  //   });
  //   it("Prevent anyone else to update your data user", async () => {
  //     expect(false).toBeTruthy();
  //   });
  // });
  // describe("User delete", () => {
  //   it("Returns return data when user is deleted", async () => {
  //     expect(false).toBeTruthy();
  //   });
  //   it("Remove the deleted user in DB", async () => {
  //     expect(false).toBeTruthy();
  //   });
  // });
});
