import { User } from '../entities/user.entity';

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByClientId(clientId: string): Promise<User[]>;
  findByVerificationToken(token: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
}
