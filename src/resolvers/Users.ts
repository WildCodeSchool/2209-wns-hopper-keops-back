import dataSource from "../utils";
import {
  Arg,
  Authorized,
  Ctx,
  ID,
  MiddlewareFn,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { User, UserInput, UpdateUserInput } from "../entity/User";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { IContext } from "../auth";

const repository = dataSource.getRepository(User);

const keepInfosSecret: MiddlewareFn = async ({ context, info }, next) => {
  const result = await next();

  console.log("RESULLLLLT.ID", result.id);
  console.log("MEEEEEEEEEEE.ID", context.me.id);

  if (result.id === context.me.id) {
    console.log("keepInfosSecret =", result);
    return result;
  } else if (result && result.id !== context.me.id) {
    // const properties
    // Object.keys(result).filter((key) => key != In())

    const filteredResult = {
      id: result.id,
      name: result.name,
      score: result.score,
    };

    console.log("keepInfosSecret =", result);
    return filteredResult;
  }

  return null;
};

@Resolver()
export class UsersResolver {
  @Mutation(() => User)
  async createUser(
    @Arg("data", () => UserInput) data: UserInput
  ): Promise<User> {
    data.password = await argon2.hash(data.password);
    const user = await repository.save(data);
    return user;
  }

  @Mutation(() => String, { nullable: true })
  async signin(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<string | null> {
    try {
      const user = await repository.findOne({ where: { email } });
      console.log("user: ", user);
      console.log("password: ", password);
      if (user === null) {
        console.log("user null");
        return null;
      }
      const hasMatched = await argon2.verify(user.password, password);
      console.log("decrypted password: ", hasMatched);
      if (hasMatched) {
        console.log("user find and pass decrypt");
        console.log("Env", process.env);

        const secret = process.env.JWT_SECRET;
        if (secret === undefined) {
          return null;
        }
        const token = jwt.sign({ userId: user.id }, secret);
        return token;
      } else {
        console.log("user find but pass not decrypt");
        return null;
      }
    } catch {
      console.log("Somethin wrong");
      return null;
    }
  }

  @Authorized()
  @Query(() => [User])
  async readAllUsers(): Promise<User[]> {
    const user = await repository.find({
      relations: {
        userToChallenges: true,
      },
    });
    return user;
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async me(@Ctx() context: IContext): Promise<User | null> {
    return context.me;
  }

  @Authorized()
  @UseMiddleware(keepInfosSecret)
  @Query(() => User, { nullable: true })
  //! Limit informations from DB when user profile != current user (password, email)
  async readUser(
    @Arg("id", () => ID) id: string,
    @Ctx() context: IContext
  ): Promise<User | null> {
    const user = await repository.findOne({ where: { id } });
    return user === null ? null : user;
  }

  @Authorized()
  @Mutation(() => User, { nullable: true })
  async updateUser(
    @Arg("data", () => UpdateUserInput) data: UpdateUserInput,
    @Arg("id", () => ID) id: string
  ): Promise<User | null> {
    const user = await repository.findOne({ where: { id } });
    if (user === null) {
      return null;
    } else {
      return await repository.save({ ...user, ...data });
    }
  }

  @Mutation(() => User)
  async updatePassUser(
    @Arg("password") password: string,
    @Arg("id", () => ID) id: string
  ): Promise<User | null> {
    const user = await repository.findOne({ where: { id } });
    if (user === null) {
      return null;
    } else {
      const hashedPassword = await argon2.hash(password);
      return await repository.save({ ...user, password: hashedPassword });
    }
  }

  @Authorized()
  @Mutation(() => User)
  async deleteUser(@Arg("id", () => ID) id: string): Promise<User | null> {
    const user = await repository.findOne({ where: { id } });
    if (user === null) {
      return null;
    } else {
      return await repository.remove(user);
    }
  }
}
