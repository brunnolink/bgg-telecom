import { UserEntity } from "./user-entity";
import { CreateUserDTO } from "./dtos/user.dto";

export interface UserRepository {
    create(data: CreateUserDTO): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findById(id: string): Promise<UserEntity | null>; 
    updateUserInfo(id: string, data: Partial<CreateUserDTO>): Promise<UserEntity>;
    delete(id: string): Promise<void>;
}