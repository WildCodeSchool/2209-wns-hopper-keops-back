import { gql } from "apollo-server";

export const me = gql`
  query Me {
    me {
      id
      email
    }
  }
`;
