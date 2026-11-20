/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.dropConstraint('bookings', 'unique_active_booking')  

  pgm.createIndex('bookings', 'room_id', {
    name: 'unique_active_booking_per_room',
    unique: true,
    where: 'status = \'active\'',
  })
}

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropIndex('bookings', 'room_id', {
    name: 'unique_active_booking_per_room',
  })

  pgm.addConstraint(
    'bookings',
    'unique_active_booking',
    'UNIQUE (room_id, tenant_id, status)'
  )
}
