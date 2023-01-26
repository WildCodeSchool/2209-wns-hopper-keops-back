import jwt from "jsonwebtoken";
import { AuthChecker } from "type-graphql";
import { User } from "./entity/User";
import dataSource from "./utils";

const repository = dataSource.getRepository(User);

export interface IContext {
  token: string | null;
  me: User;
}

export const authChecker: AuthChecker<IContext> = async (
  { root, args, context, info },
  roles
) => {
  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]
  const token = context.token;

  if (token === null) {
    return false;
  }

  try {
    if (process.env.JWT_SECRET === undefined) {
      return false;
    }

    const decodedToken: { userId: string } = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as any;
    const userId = decodedToken.userId;
    const user = await repository.findOne({ where: { id: userId } });

    if (user != null) {
      context.me = user;
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};
