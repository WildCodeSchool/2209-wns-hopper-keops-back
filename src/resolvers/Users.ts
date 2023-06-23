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
import { Uuid, UuidOptions } from "node-ts-uuid";

const repository = dataSource.getRepository(User);

@Resolver()
export class UsersResolver {
  @Mutation(() => User)
  async createUser(
    @Arg("data", () => UserInput) data: UserInput
  ): Promise<User> {
    const ecolosArray = [
      "Greta",
      "Jancovici",
      "Barrau",
      "Nakate",
      "Etienne",
      "Moritz",
      "Clement",
    ];
    const options: UuidOptions = {
      length: 15,
      prefix: `${ecolosArray[Math.floor(Math.random() * ecolosArray.length)]}-`,
    };
    data.name = Uuid.generate(options);
    data.password = await argon2.hash(data.password);
    data.createdAt = new Date();
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
  @Query(() => User, { nullable: true })
  //! Limit informations from DB when user profile != current user (password, email)
  async readUser(@Arg("id", () => ID) id: string): Promise<User | null> {
    const user = await repository.findOne({ where: { id } });
    return user === null ? null : user;
  }

  @Authorized()
  @Mutation(() => User, { nullable: true })
  async updateMe(
    @Arg("data", () => UpdateUserInput) data: UpdateUserInput,
    @Ctx() context: IContext
  ): Promise<User | null> {
    const user = await repository.findOne({ where: { id: context.me.id } });
    if (user === null) {
      return null;
    } else {
      data.updatedAt = new Date();
      return await repository.save({ ...user, ...data });
    }
  }

  @Mutation(() => User)
  async updatePassMe(
    @Arg("password") password: string,
    @Ctx() context: IContext
  ): Promise<User | null> {
    const user = await repository.findOne({ where: { id: context.me.id } });
    // Prévoir envoi de mail pour changer le mot de passe
    if (user === null) {
      return null;
    } else {
      const hashedPassword = await argon2.hash(password);
      return await repository.save({ ...user, password: hashedPassword });
    }
  }

  @Authorized()
  @Mutation(() => User)
  async deleteMe(@Ctx() context: IContext): Promise<User | null> {
    const user = await repository.findOne({ where: { id: context.me.id } });
    if (user === null) {
      return null;
    } else {
      return await repository.remove(user);
    }
  }
}
