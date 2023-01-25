import dataSource from "../utils";
import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { User, UserInput, UpdateUserInput } from "../entity/User";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";

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
        const token = jwt.sign({ userId: user.id }, "supersecret");
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

  @Query(() => [User])
  async readAllUsers(): Promise<User[]> {
    const user = await repository.find({});
    return user;
  }

  @Query(() => User, { nullable: true })
  async me(@Arg("token") token: string): Promise<User | null> {
    try {
      const decodedToken: { userId: string } = jwt.verify(
        token,
        "supersecret"
      ) as any;
      const userId = decodedToken.userId;
      const user = await repository.findOne({ where: { id: userId } });

      if (user != null) {
        return user;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  @Query(() => User, { nullable: true })
  async readUser(@Arg("id", () => ID) id: string): Promise<User | null> {
    const user = await repository.findOne({ where: { id } });
    return user === null ? null : user;
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
