import { beforeEach, describe, expect, it } from 'vitest'

import RoomRepository from '../RoomRepository.js'

describe('RoomRepository abstract methods', () => {
  let repository

  beforeEach(() => {
    repository = new RoomRepository()
  })

  it('addRoom should throw METHOD_NOT_IMPLEMENTED', async () => {
    await expect(repository.addRoom({})).rejects.toThrowError('ROOM_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})