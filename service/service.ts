import { AppDataSource } from "../db";
import { UserDto } from "../dto/user.dto";
import { ApiError } from "../exeptions/api-error";
import { User } from "../module/user-module";
import { hash, compare } from "bcrypt";
import { generateTokens, validateRefreshToken } from "./generateToken";
import { Session } from "../module/session";
import { Post } from "../module/posts";

export class Service {
  async register(name: string, email: string, password: string) {
    const userRepository = AppDataSource.getRepository(User);
    const existUser = await userRepository.findOneBy({
      email,
    });
    if (existUser) {
      throw new ApiError(404, "Такой пользователь уже существует");
    }

    const hashPassword = await hash(password, 3);

    const newUser = new User();
    newUser.name = name;
    newUser.email = email;
    newUser.password = hashPassword;
    const user = await userRepository.save(newUser);
    const userDto = new UserDto(user);

    const generateToken = generateTokens({ id: userDto.id, email: userDto.email, name: userDto.name });

    const session = AppDataSource.getRepository(Session);
    const newToken = new Session();
    newToken.token = generateToken.accessToken;
    newToken.refreshToken = generateToken.refreshToken;
    newToken.user = newUser;
    const token = await session.save(newToken);

    return {
      user: { ...userDto },
      token: {
        token: token.token,
        refreshToken: token.refreshToken,
        createdAt: token.created_at,
        id: token.id,
        userId: token.user.id,
      },
    };
  }

  async login(email: string, password: string) {
    const userRepository = AppDataSource.getRepository(User);
    const existUser = await userRepository.findOneBy({
      email,
    });
    if (!existUser) {
      throw new ApiError(404, "Такой пользователь не существует");
    }
    const isPassEquals = await compare(password, existUser.password);
    if (!isPassEquals) {
      throw new ApiError(404, "Не правильный пароль!");
    }

    const userDto = new UserDto(existUser);
    const generateToken = generateTokens({ id: userDto.id, email: userDto.email, name: userDto.name });

    const session = AppDataSource.getRepository(Session);
    const existToken = await session.findOneBy({
      user: {
        id: existUser.id,
      },
    });

    existToken!.token = generateToken.accessToken;
    existToken!.refreshToken = generateToken.refreshToken;
    existToken!.updated_at = new Date();
    existToken!.user = existUser;

    const token = await session.save(existToken as Session);
    return {
      user: { ...userDto },
      token: {
        token: token.token,
        refreshToken: token.refreshToken,
        createdAt: token.created_at,
        updatedAt: token.updated_at,
        id: token.id,
        userId: token.user.id,
      },
    };
  }

  async addPost(text: string, userId: number, file?: string) {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new ApiError(400, "Такого пользователя не существует");
    }
    const postRepository = AppDataSource.getRepository(Post);
    const post = new Post();
    post.text = text;
    post.user = user;
    post.file = file;
    const resultPost = await postRepository.save(post);
    return {
      id: resultPost.id,
      text: resultPost.text,
      createdAt: resultPost.created_at,
      updatedAt: resultPost.updated_at,
      name: resultPost.user.name,
      email: resultPost.user.email,
      file: resultPost.file,
    };
  }

  async updatePost(text: string, id: number) {
    const postRepository = AppDataSource.getRepository(Post);
    const post = await postRepository.findOne({
      where: { id },
      relations: { user: true },
      select: {
        user: {
          name: true,
          email: true,
          id: true,
        },
      },
    });
    if (!post) {
      throw new ApiError(404, "Не найден пост");
    }
    post.text = text;
    post.updated_at = new Date();
    const resultPost = await postRepository.save(post);

    return {
      id: resultPost.id,
      text: resultPost.text,
      createdAt: resultPost.created_at,
      updatedAt: resultPost.updated_at,
      name: resultPost.user.name,
      email: resultPost.user.email,
      userId: resultPost.user.id,
    };
  }

  async deletePost(id: number) {
    const postRepository = AppDataSource.getRepository(Post);
    const post = await postRepository.findOneBy({
      id,
    });
    if (!post) {
      throw new ApiError(404, "Не найден пост");
    }
    await postRepository.remove(post);
    return true;
  }

  async allPosts(take: number, page: number) {
    const skip = take * page - take;
    const postRepository = AppDataSource.getRepository(Post);
    const posts = await postRepository.find({
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
      relations: {
        user: true,
      },
      skip: skip,
      take: take,
    });
    return posts;
  }

  async logout(refreshToken: string) {
    const session = AppDataSource.getRepository(Session);
    const existToken = await session.findOneBy({
      refreshToken,
    });
    await session.remove(existToken as Session);
    return true;
  }
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(404, "Не авторизован");
    }
    const userData = validateRefreshToken(refreshToken);
    const session = AppDataSource.getRepository(Session);
    const existToken = await session.find({
      where: {
        refreshToken,
      },
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
      relations: {
        user: true,
      },
    });
    if (!userData || !existToken[0]) {
      throw new ApiError(404, "Не авторизован");
    }
    const tokens = generateTokens({
      id: existToken[0].user.id,
      name: existToken[0].user.name,
      email: existToken[0].user.email,
    });
    existToken[0].token = tokens.accessToken;
    existToken[0].refreshToken = tokens.refreshToken;
    await session.save(existToken[0]);
    return {
      ...tokens,
    };
  }
}
