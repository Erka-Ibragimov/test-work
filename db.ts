import { DataSource } from "typeorm";
import { User } from "./module/user-module";
import { Session } from "./module/session";
import { Post } from "./module/posts";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "root123",
  database: "test-work",
  entities: [User, Session, Post],
  synchronize: true,
  logging: false,
});
