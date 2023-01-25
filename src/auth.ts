import jwt from "jsonwebtoken";
import { AuthChecker } from "type-graphql";
import { User } from "./entity/User";

interface IContext {
  token: string | null;
  user: User;
}

export const customAuthChecker: AuthChecker<IContext> = async (
  { root, args, context, info },
  roles
) => {
  const token = context.token;
  if (token === null || token === "") {
    return false;
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (secret === undefined) {
      return null;
    }
    const decodedToken = jwt.verify(token, secret);
  } catch {}
};
