import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('users service', () => {
  let service: UsersService;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();
    service = testingModule.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('createAccount');
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
