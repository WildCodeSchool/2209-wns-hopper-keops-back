import { gql } from "apollo-server";

export const signin = gql`
  mutation Signin($password: String!, $email: String!) {
    signin(password: $password, email: $email)
  }
`;
