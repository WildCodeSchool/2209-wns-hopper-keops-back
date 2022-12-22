import { gql } from "apollo-server";

export const createUser = gql`
  mutation CreateUser($data: UserInput!) {
    createUser(data: $data) {
      id
    }
  }
`;
