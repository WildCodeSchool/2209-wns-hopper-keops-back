import { gql } from "apollo-server";

export const createChallenge = gql`
  mutation CreateChallenge($data: CreateChallengeInput!) {
    createChallenge(data: $data) {
      id
    }
  }
`;
