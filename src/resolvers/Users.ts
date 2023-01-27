import dataSource from "../utils";
import {
  Arg,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { User, UserInput, UpdateUserInput } from "../entity/User";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { IContext } from "../auth";

const repository = dataSource.getRepository(User);

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
      if (user === null) {
        console.log("user null");
        return null;
      }
      const decryptedPassword = await argon2.verify(user.password, password);
      console.log("decrypted password: ", decryptedPassword);
      if (decryptedPassword) {
        console.log("user find and pass decrypt");

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

  @Query(() => User, { nullable: true })
  async readUser(@Arg("id", () => ID) id: string): Promise<User | null> {
    const user = await repository.findOne({ where: { id } });
    return user === null ? null : user  ;
  }

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
