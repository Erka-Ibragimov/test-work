import { User } from "../module/user-module";

export class UserDto {
  email: string;
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  constructor(model: User) {
    this.email = model.email;
    this.id = model.id;
    this.name = model.name;
    this.createdAt = model.created_at;
    this.updatedAt = model.updated_at;
  }
}
