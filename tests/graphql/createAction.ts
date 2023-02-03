import { gql } from "apollo-server";

export const createAction = gql`
  mutation CreateAction($data: ActionInput!) {
    createAction(data: $data) {
      id
    }
  }
`;
