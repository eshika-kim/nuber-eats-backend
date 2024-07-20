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
});

// 가짜 jwt service
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

// Repository의 타입의 키들을 옵셔널로 가져와서 모든 함수들을 jest.Mock 타입으로 지정
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;

  let usersRepository: MockRepository<User>;
  // 테스트 모듈 주입
  beforeAll(async () => {
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
    usersRepository = testModule.get(getRepositoryToken(User));
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
      await service.createAccount(createAccountArgs);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
    });
  });
});
