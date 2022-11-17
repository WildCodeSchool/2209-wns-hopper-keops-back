import dataSource from "../utils";
import { Query, Resolver } from "type-graphql";
import { User } from "../entity/User";

const repository = dataSource.getRepository(User);

@Resolver()
export class UsersResolver {
  @Query(() => [User])
  async readUser(): Promise<User[]> {
    const user = await repository.find({});
    return user;
  }
}
