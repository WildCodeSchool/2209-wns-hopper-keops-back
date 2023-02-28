import { gql } from "apollo-server";

export const readUser = gql`
  query ReadUser($readUserId: ID!) {
    readUser(id: $readUserId) {
      id
    }
  }
`;
