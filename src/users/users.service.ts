import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateAccountInput } from './dto/create-account.dto';
import { LoginInput } from 'src/restaurants/dto/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { UserProfileInput } from './dto/user-profile.dto';
import { EditProfileInput } from './dto/edit-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    // 1. check that email does not exist
    // 2. create user & hash the password
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        // make error
        return { ok: false, error: 'There is a user with that email already' };
      }
      await this.users.save(this.users.create({ email, password, role }));
    } catch (e) {
      //make error
      return { ok: false, error: "Couldn't create" };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne({ where: { email } });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password!',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number) {
    return await this.users.findOneBy({ id });
  }

  async editProfile(userId: number, editProfileInput: EditProfileInput) {
    const { email, password } = editProfileInput;
    // spread 연산자를 이용해 ...editProfileInput을 사용해도 됨
    // return await this.users.update(userId, { email, password });
    // => typeorm의 update는 특정 entity를 불러내서 저장되는 것이 아니라 일치하는 것을 그냥 업데이트하고
    // 없으면 새로 저장할 수 있는 기능이므로 사용하는 것이 권장되지 않는다.
    const user = await this.users.findOneBy({ id: userId });
    // 해당하는 entity를 불러온 후
    if (email) user.email = email;
    if (password) user.password = password;
    // 저장하고
    return await this.users.save(user);
    // db에 save하면 Beforeupdate hook 이 불러와지는 것을 확인할 수 있다.
  }
}
