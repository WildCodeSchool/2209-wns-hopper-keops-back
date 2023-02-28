import { gql } from "apollo-server";

export const readAllUsers = gql`
  query ReadAllUsers {
    readAllUsers {
      id
      userToChallenges {
        id
      }
    }
  }
`;
