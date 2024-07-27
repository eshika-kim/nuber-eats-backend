import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateAccountInput } from './dto/create-account.dto';
import { LoginInput } from 'src/restaurants/dto/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dto/verify-email.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
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
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verification.save(this.verification.create({ user }));
      return { ok: true };
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
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      });
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
    try {
      const user = await this.users.findOneOrFail({ where: { id } });
      return {
        ok: true,
        user,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'user not found',
      };
    }
  }

  async editProfile(
    userId: number,
    editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const { email, password } = editProfileInput;
      // spread 연산자를 이용해 ...editProfileInput을 사용해도 됨
      // return await this.users.update(userId, { email, password });
      // => typeorm의 update는 특정 entity를 불러내서 저장되는 것이 아니라 일치하는 것을 그냥 업데이트하고
      // 일치하는 것이 없으면 아무일도 일어나지 않아 dto의 BeforeUpdate가 실행되지 않는다.
      const user = await this.users.findOneBy({ id: userId });
      // 해당하는 entity를 불러온 후
      if (email) user.email = email;
      if (password) user.password = password;
      await this.verification.save(this.verification.create({ user }));
      // 저장하고
      await this.users.save(user);
      // db에 save하면 Beforeupdate hook 이 불러와지는 것을 확인할 수 있다.
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verification.findOne({
        where: { code },
        relations: ['user'],
      });
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        // 유저 인증 후 삭제
        await this.verification.delete(verification.id);
        return {
          ok: true,
        };
      }
    } catch (e) {
      return {
        ok: false,
        error: e.message,
      };
    }
  }
}
