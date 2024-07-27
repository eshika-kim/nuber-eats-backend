import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm'; // repository를 만들어주는 토큰
import { Verification } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';

// 가짜 레파지토리에 있는 가짜 함수
// 함수를 리턴해야 repository 여러 개를 하나라고 착각하지 않음
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
});

// 가짜 jwt service
const mockJwtService = {
  sign: jest.fn(() => 'signed token'),
  verify: jest.fn(),
};

// Repository의 타입의 키들을 옵셔널로 가져와서 모든 함수들을 jest.Mock 타입으로 지정
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let jwtService: JwtService;
  let usersRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;

  // 테스트 모듈 주입
  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();
    service = testModule.get<UsersService>(UsersService);
    jwtService = testModule.get<JwtService>(JwtService);
    usersRepository = testModule.get(getRepositoryToken(User));
    verificationRepository = testModule.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  const createAccountArgs = {
    email: '',
    password: '',
    role: 0,
  };

  describe('createAccount', () => {
    it('should fail if user exist', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'abc@abc.com',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });

    it('should create a user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue(createAccountArgs);
      // 실행부
      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(
        createAccountArgs,
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('?'));
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create" });
    });
  });

  describe('login', () => {
    const loginArgs = { email: 'abc@abc.com', password: 'bsps' };
    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: 'Wrong password!' });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({
        ok: true,
        token: 'signed token',
      });
    });
  });

  describe('findById', () => {
    it('should find an existing user', async () => {
      const userInformation = { id: 1 };
      usersRepository.findOneOrFail.mockResolvedValue(userInformation);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: userInformation });
    });
    it('should fail if user is not found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: 'user not found',
      });
    });
  });
});
