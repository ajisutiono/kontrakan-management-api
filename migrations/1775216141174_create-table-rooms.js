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
  pgm.createTable('rooms', {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    owner_id: {
      type: 'UUID',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    room_number: {
      type: 'VARCHAR(10)',
      notNull: true
    },
    type: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    price: {
      type: 'NUMERIC',
      notNull: true
    },
    facilities: {
      type: 'JSONB'
    },
    status: {
      type: 'VARCHAR(20)',
      notNull: true,
      default: 'available',
      // 'available' | 'occupied' | 'maintenance'
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

  pgm.addConstraint('rooms', 'unique_owner_room_number', 'UNIQUE (owner_id, room_number)')
}

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint('rooms', 'unique_owner_room_number')
  pgm.dropTable('rooms')
}
