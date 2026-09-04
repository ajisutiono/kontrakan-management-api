import asyncHandler from '../../../../Commons/utils/asyncHandler'

class BookingsController {
  constructor(container) {
    this._container = container
  }

  postBooking = asyncHandler(async (req, res) => {
    const addBookingUseCase = this._container.resolve('addBookingUseCase')
    const registeredBooking = await addBookingUseCase.execute({
      ...req.body,
      tenant_id: req.user.id,
      role: req.user.role,
    })

    res.status(201).json({
      status: 'success',
      data: registeredBooking
    })
  })
}

export default BookingsController