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
import { Token, TokenInput } from "../entity/Token";

const repository = dataSource.getRepository(User);
const repositoryToken = dataSource.getRepository(Token);

@Resolver()
export class UsersResolver {
  @Mutation(() => User)
  async createUser(
    @Arg("data", () => UserInput) data: UserInput
  ): Promise<User> {
    data.name = `user-${new Date().toISOString()}`;
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

  // @Mutation(() => Token, { nullable: true })
  // async forgotPassword(
  //   @Arg("data", () => TokenInput) data: TokenInput
  // ): Promise<Token | null> {
  //   try {
  //     const user = await repository.findOne({ where: { email: data.email } });

  //     if (!user) throw new Error("User does not exist");
  //     const token = await repositoryToken.findOne({
  //       where: { user: { id: user.id } },
  //     });
  //     if (token) await repositoryToken.delete(token);

  //     const secret = process.env.JWT_SECRET;
  //     if (secret === undefined) {
  //       return null;
  //     }
  //     const resetToken = jwt.sign({ userId: user.id }, secret);
  //     const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  //     await new Token({
  //       userId: user._id,
  //       token: hash,
  //       createdAt: Date.now(),
  //     }).save();

  //     const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
  //     sendEmail(
  //       user.email,
  //       "Password Reset Request",
  //       { name: user.name, link: link },
  //       "./template/requestResetPassword.handlebars"
  //     );
  //     return link;
  //   } catch (error) {
  //     return null;
  //   }
  // }

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
