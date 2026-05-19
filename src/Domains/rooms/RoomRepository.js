/* eslint-disable no-unused-vars */
class RoomRepository {
  async addRoom(room) {
    throw new Error('ROOM_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async getRooms({ filters, page, limit, userRole }) {
    throw new Error('ROOM_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async getRoomById(roomId) {
    throw new Error('ROOM_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }
}

export default RoomRepository