import { beforeAll, describe, expect, it } from "@jest/globals";
import { graphql, GraphQLSchema, print } from "graphql";
import { UsersResolver } from "../src/resolvers/Users";
import { buildSchema } from "type-graphql";
import { authChecker } from "../src/auth";
import { initializeTestDb } from "./testDb";
import { createUser } from "./graphql/createUser";
import { signin } from "./graphql/signin";
import { me } from "./graphql/me";
import { User } from "../src/entity/User";
import { readUser } from "./graphql/readUser";

let schema: GraphQLSchema;
let sanders: Partial<User>;
let marck: User;
let sandersToken: string;
let marckToken: string;

beforeAll(async () => {
  await initializeTestDb();
  // Création du schema
  schema = await buildSchema({
    resolvers: [UsersResolver],
    authChecker,
  });
});

describe("Creation of two user acount", () => {
  describe("Marck signup", () => {
    it("Returns data when Marck profiles is created", async () => {
      const mutation = print(createUser);
      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          data: {
            email: "marck@gmail.com",
            password: "marckpassword",
          },
        },
      });
      console.log(result);
      expect(result.data?.createUser).toBeTruthy();
      marck = result.data?.createUser;
    });
  });
  describe("Sanders signup", () => {
    it("Returns data when Sanders profiles is created", async () => {
      const mutation = print(createUser);
      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          data: {
            email: "sander-kfc@gmail.com",
            password: "kentuckyfriedpassword",
          },
        },
      });
      console.log(result);
      expect(result.data?.createUser).toBeTruthy();
      sanders = result.data?.createUser;
    });
  });
});

describe("Marck Signin", () => {
  it("Returns null when Marck make a mistacke in his credentials", async () => {
    const mutation = print(signin);
    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        email: "marck@gmail.com",
        password: "ilovechickenoups",
      },
    });
    console.log(result);
    expect(result.data?.signin).toBeNull();
  });
  it("Returns a token when Marck use the right credentials ", async () => {
    const mutation = print(signin);
    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        email: "marck@gmail.com",
        password: "marckpassword",
      },
    });
    console.log(result);
    expect(result.data?.signin).toBeTruthy();
    marckToken = result.data?.signin;
  });
  it("Return Marck infos when is logged, with his token", async () => {
    const mutation = print(me);
    const result = await graphql({
      schema,
      source: mutation,
      contextValue: {
        token: marckToken,
      },
    });
    console.log(result);
    expect(result.data?.me).toBeTruthy();
    expect(result.data?.me.email).toBe("marck@gmail.com");
    marck = result.data?.me;
  });
});

describe("Marck want to read one user profile", () => {
  it("Returns sanders when mark read his profile", async () => {
    const mutation = print(readUser);
    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        readUserId: sanders.id,
      },
      contextValue: {
        token: marckToken,
      },
    });
    console.log(result);
    expect(result.data?.readUser).toMatchObject(sanders);
  });
  it("Tests false", async () => {
    expect(true).toBe(false);
  });
  // it("Returns a token when Marck use the right credentials ", async () => {
  //   const mutation = print(signin);
  //   const result = await graphql({
  //     schema,
  //     source: mutation,
  //     variableValues: {
  //       email: "marck@gmail.com",
  //       password: "marckpassword",
  //     },
  //   });
  //   console.log(result);
  //   expect(result.data?.signin).toBeTruthy();
  //   marckToken = result.data?.signin;
  // });
  // it("Return Marck infos when is logged, with his token", async () => {
  //   const mutation = print(me);
  //   const result = await graphql({
  //     schema,
  //     source: mutation,
  //     contextValue: {
  //       token: marckToken,
  //     },
  //   });
  //   console.log(result);
  //   expect(result.data?.me).toBeTruthy();
  //   expect(result.data?.me.email).toBe("marck@gmail.com");
  //   marck = result.data?.me;
  // });
});
