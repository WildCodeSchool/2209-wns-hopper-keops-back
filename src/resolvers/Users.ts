import dataSource from "../utils";
import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { User, UserInput } from "../entity/User";

const repository = dataSource.getRepository(User);

@Resolver()
export class UsersResolver {
  @Mutation(() => User)
  async createUser(
    @Arg("data", () => UserInput) data: UserInput
  ): Promise<User> {
    const user = await repository.save(data);
    return user;
  }

  @Query(() => [User])
  async readAllUsers(): Promise<User[]> {
    const user = await repository.find({});
    return user;
  }

  @Query(() => User)
  async readUser(@Arg("id", () => ID) id: string): Promise<User | null> {
    const user = await repository.findOne({ where: { id } });
    return user === null ? null : user;
  }

  @Mutation(() => User)
  async updateUser(
    @Arg("data", () => UserInput) data: UserInput,
    @Arg("id", () => ID) id: string
  ): Promise<User | null> {
    const user = await repository.findOne({ where: { id } });
    if (user === null) {
      return null;
    } else {
      return await repository.save({ ...user, ...data });
      // function test(): any {
      //   for (const key of Object.keys(data)) {
      //     user?[key]:data.key;
      //   }
      // }
      // return await repository.save(test());
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
