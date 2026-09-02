import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js'
import InvariantError from '../../Commons/exceptions/InvariantError.js'
import RegisterBooking from '../../Domains/bookings/entities/RegisterBooking.js'

class AddBookingUseCase {
  constructor({ bookingRepository, roomRepository }) {
    this._bookingRepository = bookingRepository
    this._roomRepository = roomRepository
  }

  async execute({ role, ...booking }) {
    if (role !== 'tenant') {
      throw new AuthorizationError('hanya tenant yang dapat booking ruangan')
    }

    const registerBooking = new RegisterBooking(booking)

    const existingRoom = await this._roomRepository.getRoomById(registerBooking.room_id)

    if (existingRoom.status !== 'available') {
      throw new InvariantError('Ruangan ini tidak tersedia')
    }

    return await this._bookingRepository.addBooking(registerBooking)
  }
}

export default AddBookingUseCase