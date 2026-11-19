class GetMyBookingsUseCase {
  constructor({ bookingRepository }) {
    this._bookingRepository = bookingRepository
  }

  async execute({ userId, userRole, filters = {}, page = 1, limit = 10 }) {
    const finalFilters = { ...filters }

    if (userRole === 'tenant') {
      finalFilters.tenantId = userId
    }

    if (userRole === 'owner') {
      finalFilters.ownerId = userId
    }

    return await this._bookingRepository.getBookings({
      filters: finalFilters,
      page,
      limit,
    })
  }
}

export default GetMyBookingsUseCase