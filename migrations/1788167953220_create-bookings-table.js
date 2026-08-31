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
  pgm.createTable('bookings', {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    room_id: {
      type: 'UUID',
      notNull: true,
      references: '"rooms"',
      onDelete: 'CASCADE',
    },
    tenant_id: {
      type: 'UUID',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    start_date: {
      type: 'DATE',
      notNull: true,
    },
    status: {
      type: 'VARCHAR(20)',
      notNull: true,
      default: 'active', // 'active' | 'cancelled'
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('now()'),
    },
  })

  pgm.addConstraint(
    'bookings',
    'unique_active_booking',
    'UNIQUE (room_id, tenant_id, status)'
  )
}

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { 
  pgm.dropConstraint('bookings', 'unique_active_booking')
  pgm.dropTable('bookings')
}
