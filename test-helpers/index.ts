import { Hash } from '@adonisjs/hash'
import { configDotenv } from 'dotenv'
import { getActiveTest } from '@japa/runner'
import { Emitter } from '@adonisjs/core/events'
import { BaseModel } from '@adonisjs/lucid/orm'
import { Database } from '@adonisjs/lucid/database'
import { Encryption } from '@adonisjs/core/encryption'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import { AppFactory } from '@adonisjs/core/factories/app'
import { LoggerFactory } from '@adonisjs/core/factories/logger'
import { EncryptionFactory } from '@adonisjs/core/factories/encryption'
import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'
import fs from 'node:fs'

export const encryption: Encryption = new EncryptionFactory().create()
configDotenv()

const BASE_URL = new URL('./tmp/', import.meta.url)

/**
 * Creates a fresh instance of AdonisJS hash module
 * with scrypt driver
 */
export function getHasher() {
  return new Hash(new Scrypt({}))
}

/**
 * Creates an instance of the database class for making queries
 */
export async function createDatabase() {
  const test = getActiveTest()

  if (!test) {
    throw new Error('Cannot use "createDatabase" outside of a Japa test')
  }

  var dir = '../tmp'

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  const app = new AppFactory().create(BASE_URL, () => {})
  const logger = new LoggerFactory().create()
  const emitter = new Emitter(app)
  const db = new Database(
    {
      connection: process.env.DB || 'sqlite',
      connections: {
        sqlite: {
          client: 'sqlite3',
          connection: {
            filename: join('../tmp', 'db.sqlite3'),
          },
        },
        pg: {
          client: 'pg',
          connection: {
            host: process.env.PG_HOST as string,
            port: Number(process.env.PG_PORT),
            database: process.env.PG_DATABASE as string,
            user: process.env.PG_USER as string,
            password: process.env.PG_PASSWORD as string,
          },
        },
      },
    },
    logger,
    emitter
  )

  test.cleanup(() => db.manager.closeAll())
  BaseModel.useAdapter(db.modelAdapter())
  return db
}

/**
 * Creates needed database tables
 */
export async function createTables(db: Database) {
  const test = getActiveTest()
  if (!test) {
    throw new Error('Cannot use "createTables" outside of a Japa test')
  }

  test.cleanup(async () => {
    await db.connection().schema.dropTableIfExists('users')
    await db.connection().schema.dropTableIfExists('model_roles')
    await db.connection().schema.dropTableIfExists('model_permissions')

    await db.connection().schema.dropTableIfExists('roles')
    await db.connection().schema.dropTableIfExists('permissions')
  })

  await db.connection().schema.createTableIfNotExists('users', (table) => {
    table.increments('id').notNullable()
    table.string('full_name').nullable()
    table.string('email', 254).notNullable().unique()
    table.string('password').notNullable()

    table.timestamp('created_at').notNullable()
    table.timestamp('updated_at').nullable()
  })

  await db.connection().schema.createTableIfNotExists('roles', (table) => {
    table.increments('id')

    table.string('slug').index()
    table.string('title')
    table.string('entity_type')
    table.bigint('entity_id').unsigned()
    table.integer('scope').unsigned()

    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })

    table.unique(['slug', 'scope'])
    table.index(['entity_type', 'entity_id'])
  })

  await db.connection().schema.createTableIfNotExists('model_roles', (table) => {
    table.increments('id')

    table.string('model_type')
    table.bigint('model_id').unsigned()
    table.bigInteger('role_id').unsigned()

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })

    table.index(['model_type', 'model_id'])

    table.foreign('role_id').references('roles.id').onDelete('CASCADE')
  })

  await db.connection().schema.createTableIfNotExists('permissions', (table) => {
    table.increments('id')

    table.string('slug').index()
    table.string('title')
    table.string('entity_type')
    table.bigint('entity_id').unsigned()
    table.integer('scope').unsigned()
    table.boolean('allowed')

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })

    table.unique(['slug', 'scope'])
    table.index(['entity_type', 'entity_id'])
  })

  await db.connection().schema.createTableIfNotExists('model_permissions', (table) => {
    table.increments('id')

    table.string('model_type')
    table.bigint('model_id').unsigned()
    table.bigInteger('permission_id').unsigned()

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })

    table.index(['model_type', 'model_id'])

    table.foreign('permission_id').references('permissions.id').onDelete('CASCADE')
  })
}

/**
 * Creates an emitter instance for testing with typed
 * events
 */
export function createEmitter<Events extends Record<string, any>>() {
  const test = getActiveTest()
  if (!test) {
    throw new Error('Cannot use "createEmitter" outside of a Japa test')
  }

  const app = new AppFactory().create(BASE_URL, () => {})
  return new Emitter<Events>(app)
}

/**
 * Promisify an event
 */
export function pEvent<T extends Record<string | symbol | number, any>, K extends keyof T>(
  emitter: Emitter<T>,
  event: K,
  timeout: number = 500
) {
  return new Promise<T[K] | null>((resolve) => {
    function handler(data: T[K]) {
      emitter.off(event, handler)
      resolve(data)
    }

    setTimeout(() => {
      emitter.off(event, handler)
      resolve(null)
    }, timeout)
    emitter.on(event, handler)
  })
}
