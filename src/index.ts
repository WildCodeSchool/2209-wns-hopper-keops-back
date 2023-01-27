import "reflect-metadata";
import dataSource from "./utils";
import { ApolloServer } from "apollo-server";
import { UsersResolver } from "./resolvers/Users";
import { buildSchema } from "type-graphql";
import { ChallengesResolver } from "./resolvers/Challenges";
import { authChecker } from "./auth";
import { UserToChallengesResolver } from "./resolvers/UsersToChallenges";
import { ActionsResolver } from "./resolvers/Actions";

const PORT = 4000;

async function bootstrap(): Promise<void> {
  // ... Building schema here
  const schema = await buildSchema({
    resolvers: [
      UsersResolver,
      ChallengesResolver,
      UserToChallengesResolver,
      ActionsResolver,
    ],
    authChecker,
  });

  // Create the GraphQL server
  const server = new ApolloServer({
    schema,
    cors: true,
    context: ({ req }) => {
      const authorization = req?.headers?.authorization;

      if (!authorization) {
        return { token: null };
      }
      // Add the user to the context

      // remove Bearer from jwt to keep only the token
      const token = authorization.split(" ").pop();

      return { token };
    },
  });

  try {
    // Connexion à la base de donnée (Attente de la connexion avant de passer à la suite)
    await dataSource.initialize();
    console.log("DB connected");

    //   Démarrage du server
    const { url } = await server.listen(PORT);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
  } catch (error) {
    console.log("DB connexion failed");
    console.log(error);
  }
}

bootstrap().then(
  () => {
    console.log("Server Started");
  },
  (error) => {
    console.log("Server Error");
    console.log(error);
  }
);
