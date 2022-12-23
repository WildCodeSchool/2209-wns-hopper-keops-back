import { beforeAll, describe, expect, it } from "@jest/globals";
import { graphql, GraphQLSchema, print } from "graphql";
import { UsersResolver } from "../src/resolvers/Users";
import { buildSchema } from "type-graphql";
import dataSource from "../src/utils";
import { createUser } from "./graphql/createUser";
import { signin } from "./graphql/signin";
import { User } from "../src/entity/User";

let schema: GraphQLSchema;

beforeAll(async () => {
  // Généreratin de l'api de test
  // Connection à la db
  await dataSource.initialize();

  // Pugre la db
  try {
    // Demande toute les entitées de la db
    const entities = dataSource.entityMetadatas;
    // Prépare une chaine de caractère contenant le nom de toutes les entités
    const tableNames = entities
      .map((entity) => `"${entity.tableName}"`)
      .join(", ");
    // Fait une requête SQL à la base de donnée pour supprimer tout les ligne de la db ainsi que les relations
    await dataSource.query(`TRUNCATE ${tableNames} CASCADE`);
    console.log("DATABASE: Clean");
  } catch (error: any) {
    throw new Error(`ERROR: Cleaning database: ${JSON.stringify(error)}`);
  }

  // Création du schema
  schema = await buildSchema({
    resolvers: [UsersResolver],
  });
});

describe("Users", () => {
  describe("User signup", () => {
    it("Create a new user", async () => {
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
    it("Create user in db", async () => {
      const user = await dataSource
        .getRepository(User)
        .findOne({ where: { email: "test@gmail.com" } });
      expect(user?.password === "supersecret").toBe(false);
      expect(user).toBeTruthy();
    });
    it("Prevent using the same email", async () => {
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
