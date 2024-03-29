import dataSource from "../utils";
import * as argon2 from "argon2";
import { Mutation, Resolver } from "type-graphql";
import { User } from "../entity/User";
import { Action } from "../entity/Action";
import { Challenge } from "../entity/Challenge";
import { UserToChallenge } from "../entity/UserToChallenge";
import { Uuid, UuidOptions } from "node-ts-uuid";

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

      const options: UuidOptions = {
        length: 15,
        prefix: "user-",
      };
      // peupler la base de données
      // Admin
      async function createAdmin(): Promise<User> {
        const password = await argon2.hash("superSecret");
        return await dataSource.getRepository(User).save({
          email: "admin@keops.fr",
          password,
          isAdmin: true,
          createdAt: new Date(),
          name: Uuid.generate(options),
        });
      }
      const admin = await createAdmin();

      // User
      async function createUser(email: string): Promise<User> {
        const password = await argon2.hash("userSuperSecret");
        return await dataSource.getRepository(User).save({
          email,
          password,
          isAdmin: false,
          createdAt: new Date(),
          name: Uuid.generate(options),
        });
      }

      const user1 = await createUser("user1@keops.fr");
      const user2 = await createUser("user2@keops.fr");

      // Actions
      if (admin !== null) {
        await dataSource.getRepository(Action).save({
          title: "Flexitarien",
          description: "Manger moins de viande",
          createdBy: admin,
          createdAt: new Date(),
        });
        await dataSource.getRepository(Action).save({
          title: "Cyclo-Boulot",
          description: "Aller au travail en vélo",
          createdBy: admin,
          createdAt: new Date(),
          successValue: 30,
        });
        await dataSource.getRepository(Action).save({
          title: "One Two Tri",
          description: "Trier ses déchets",
          createdBy: admin,
          createdAt: new Date(),
        });

        // Challenge
        const createChallenge = async (): Promise<Challenge> => {
          return await dataSource.getRepository(Challenge).save({
            length: 7,
            start_date: new Date("2050/01/01"),
            name: "Super Future Challenge",
            createdBy: admin,
            createdAt: new Date(),
            actions: [{ id: "1" }, { id: "2" }],
          });
        };

        const createUserChallenge = async (): Promise<Challenge> => {
          return await dataSource.getRepository(Challenge).save({
            length: 4,
            start_date: new Date("2023/07/02"),
            name: "Super User Challenge",
            createdBy: user1,
            createdAt: new Date(),
            actions: [{ id: "1" }, { id: "3" }],
          });
        };

        const challengeAdmin = await createChallenge();
        const challengeUser = await createUserChallenge();

        // UserToChallenge Admin - Challenge.first
        await dataSource.getRepository(UserToChallenge).save({
          isAccepted: true,
          user: admin,
          challenge: { id: challengeAdmin.id },
        });

        // UserToChallenge User - Challenge.second
        await dataSource.getRepository(UserToChallenge).save({
          isAccepted: true,
          user: user1,
          challenge: { id: challengeUser.id },
        });

        await dataSource.getRepository(UserToChallenge).save({
          isAccepted: true,
          user: user2,
          challenge: { id: challengeUser.id },
        });
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
