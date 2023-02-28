import dataSource from "../utils";
import * as argon2 from "argon2";
import { Mutation, Resolver } from "type-graphql";
import { User } from "../entity/User";

@Resolver()
export class DevsResolver {
  @Mutation(() => Boolean)
  async reset(): Promise<boolean> {
    try {
      // purger la base de données
      try {
        // Demande toute les entitées de la db
        const entities = dataSource.entityMetadatas;
        // Prépare une chaine de caractère contenant le nom de toutes les entités
        const tableNames = entities
          .map((entity) => `"${entity.tableName}"`)
          .join(", ");
        await dataSource.query(
          `TRUNCATE ${tableNames} RESTART IDENTITY CASCADE`
        );
        console.log("DATABASE: Clean");
      } catch (error: any) {
        throw new Error(`ERROR: Cleaning database: ${JSON.stringify(error)}`);
      }

      // peupler la base de données
      const admin = await dataSource
        .getRepository(User)
        .findOne({ where: { email: "admin@keops.fr" } });
      if (admin === null) {
        const password = await argon2.hash("superSecret");
        await dataSource
          .getRepository(User)
          .save({ email: "admin@keops.fr", password, isAdmin: true });
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
