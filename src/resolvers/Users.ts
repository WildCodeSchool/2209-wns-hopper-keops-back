import dataSource from "../utils";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
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
  async readUser(@Arg("id") id: string): Promise<User | null> {
    const user = await repository.findOne({ where: { id } });
    return user === null ? null : user;
  }

  // @Mutation(() => User)
  // async updateUser(
  //   @Arg("data", () => UserInput) data: UserInput
  // ): Promise<User> {
  //   const user = await repository.update(data);
  //   return user;
  // }
}
