import { randomUUID } from 'crypto';

import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper';
import pool from '../../database/postgres/pool';
import UserRepositoryPostgres from '../UserRepositoryPostgres';
import InvariantError from '../../../Commons/exceptions/InvariantError';
import NotFoundError from '../../../Commons/exceptions/NotFoundError';

describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyAvailableEmail function', () => {
    it('should not throw when email available', async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      await expect(userRepositoryPostgres.verifyAvailableEmail('test@example.com')).resolves.not.toThrow();
    });

    it('should throw InvariantError when email already exists', async () => {
      await UsersTableTestHelper.addUser({ email: 'test@example.com' }); // test@example.com sudah ada di database menggunakan UsersTableTestHelper
      const userRepositoryPostgres = new UserRepositoryPostgres(pool);

      await expect(
        userRepositoryPostgres.verifyAvailableEmail('test@example.com')
      ).rejects.toThrowError('USER_REPOSITORY.EMAIL_ALREADY_EXISTS');

      await expect(
        userRepositoryPostgres.verifyAvailableEmail('test@example.com')
      ).rejects.toBeInstanceOf(InvariantError);
    });
  });

  describe('addUser function', () => {
    it('should persist user and return registered user correctly', async () => {
      const registerUser = {
        name: 'Example User',
        email: 'example@mail.com',
        password: 'H4shed_password',
        role: 'owner',
      };

      const fakeId = randomUUID();

      const mockIdGenerator = vi.fn().mockReturnValue(fakeId);

      const userRepositoryPostgres = new UserRepositoryPostgres(pool, mockIdGenerator);

      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      expect(registeredUser).toEqual({
        id: fakeId,
        name: 'Example User',
        role: 'owner',
      });

      const user = await UsersTableTestHelper.findUserById(fakeId);
      expect(user).toBeDefined();
      expect(user.email).toBe('example@mail.com');
      expect(user.password).toBe('H4shed_password');
    });
  });

  describe('findUserById function', () => {
    it('should return user when id exists', async() => {
      const fakeId = randomUUID();

      await UsersTableTestHelper.addUser({ id: fakeId });

      const userRepositoryPostgres = new UserRepositoryPostgres(pool);

      const user = await userRepositoryPostgres.findUserById(fakeId);

      expect(user.id).toBe(fakeId);
    });

    it('should throw NotFoundError when id not found', async() => {
      const fakeId = randomUUID();
      const userRepositoryPostgres = new UserRepositoryPostgres(pool);

      const user = userRepositoryPostgres.findUserById(fakeId);

      await expect(user).rejects.toThrowError('USER_REPOSITORY.USER_NOT_FOUND');
      await expect(user).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('findUserByEmail', () => {
    it('should return user when email exists', async() => {
      await UsersTableTestHelper.addUser({ email: 'testing@mail.com' });

      const userRepositoryPostgres = new UserRepositoryPostgres(pool);

      const user = await userRepositoryPostgres.findUserByEmail('testing@mail.com');

      expect(user.email).toBe('testing@mail.com');
    });

    it('should throw NotFoundError when email not found', async() => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool);

      const user = userRepositoryPostgres.findUserByEmail('notfound@mail.com');

      await expect(user).rejects.toThrowError('USER_REPOSITORY.EMAIL_NOT_FOUND');
      await expect(user).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});