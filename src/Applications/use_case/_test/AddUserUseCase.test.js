import { describe, expect, it, vi } from 'vitest'

import RegisteredUser from '../../../Domains/users/entities/RegisteredUser'
import UserRepository from '../../../Domains/users/UserRepository'
import PasswordHash from '../../security/PasswordHash'
import PasswordValidator from '../../security/PasswordValidator'
import AddUserUseCase from '../AddUserUseCase'

describe('AddUserUseCase', () => {
  it('should orchestrating the add user correctly', async () => {
    // Arrange
    const useCasePayload = {
      name: 'test',
      email: 'testing@example.com',
      password: 'Secr1t_passw0rd',
      role: 'owner',
    }

    const mockRegisteredUser = new RegisteredUser({
      id: 'user-123',
      name: useCasePayload.name,
      role: useCasePayload.role,
    })

    // create dependency use case
    const mockUserRepository = new UserRepository()
    const mockPasswordValidator = new PasswordValidator()
    const mockPasswordHash = new PasswordHash()

    // mocking needed function
    mockUserRepository.verifyAvailableEmail = vi.fn()
      .mockResolvedValue()
    mockPasswordValidator.validate = vi.fn()
      .mockImplementation(() => { })
    mockPasswordHash.hash = vi.fn()
      .mockResolvedValue('encrypted_password')
    mockUserRepository.addUser = vi.fn()
      .mockResolvedValue(mockRegisteredUser)

    // create use case instance
    const addUserUseCase = new AddUserUseCase({
      userRepository: mockUserRepository,
      passwordHash: mockPasswordHash,
      passwordValidator: mockPasswordValidator,
    })

    // Action
    const registeredUser = await addUserUseCase.execute(useCasePayload)

    // Assert
    expect(registeredUser).toStrictEqual(new RegisteredUser({
      id: 'user-123',
      name: 'test',
      role: 'owner',
    }))
    expect(mockUserRepository.verifyAvailableEmail).toBeCalledWith(useCasePayload.email)
    expect(mockPasswordValidator.validate).toBeCalledWith(useCasePayload.password)
    expect(mockPasswordHash.hash).toBeCalledWith(useCasePayload.password)
    expect(mockUserRepository.addUser).toBeCalledWith({
      name: useCasePayload.name,
      email: useCasePayload.email,
      password: 'encrypted_password',
      role: useCasePayload.role,

    })
  })

  it('should throw error when email already exists', async () => {
    const useCasePayload = {
      name: 'test',
      email: 'testing@example.com', // email already existing
      password: 'Secr1t_passw0rd',
      role: 'owner',
    }

    const mockUserRepository = new UserRepository()
    const mockPasswordValidator = new PasswordValidator()
    const mockPasswordHash = new PasswordHash()

    // mocking
    mockUserRepository.verifyAvailableEmail = vi.fn()
      .mockRejectedValue(new Error('EMAIL_ALREADY_EXIST'))
    mockPasswordValidator.validate = vi.fn()
      .mockImplementation(() => { })
    mockPasswordHash.hash = vi.fn()
      .mockResolvedValue('encypted_password')
    mockUserRepository.addUser = vi.fn()

    const addUserUseCase = new AddUserUseCase({
      userRepository: mockUserRepository,
      passwordHash: mockPasswordHash,
      passwordValidator: mockPasswordValidator,
    })

    await expect(addUserUseCase.execute(useCasePayload))
      .rejects.toThrowError('EMAIL_ALREADY_EXIST')
    expect(mockUserRepository.addUser).not.toHaveBeenCalled()
  })

  it('should throw error when password does not meet complexity requirements', async () => {
    const useCasePayload = {
      name: 'test',
      email: 'testing@example.com',
      password: 'weakpassword',
      role: 'owner',
    }

    const mockUserRepository = new UserRepository()
    const mockPasswordValidator = new PasswordValidator()
    const mockPasswordHash = new PasswordHash()

    // mock
    mockUserRepository.verifyAvailableEmail = vi.fn()
      .mockResolvedValue()
    mockPasswordValidator.validate = vi.fn()
      .mockImplementation(() => {
        throw new Error('PASSWORD_NOT_MEET_REQUIREMENT')
      })
    mockPasswordHash.hash = vi.fn()
    mockUserRepository.addUser = vi.fn()

    const addUserUseCase = new AddUserUseCase({
      userRepository: mockUserRepository,
      passwordHash: mockPasswordHash,
      passwordValidator: mockPasswordValidator,
    })

    await expect(() => addUserUseCase.execute(useCasePayload))
      .rejects.toThrowError('PASSWORD_NOT_MEET_REQUIREMENT')
    
    expect(mockPasswordHash.hash).not.toHaveBeenCalled()
    expect(mockUserRepository.addUser).not.toHaveBeenCalled()
  })
})