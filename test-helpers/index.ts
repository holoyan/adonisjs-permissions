import { configDotenv } from 'dotenv'
import { getActiveTest } from '@japa/runner'
import { Emitter } from '@adonisjs/core/events'
import { BaseModel, column, scope } from '@adonisjs/lucid/orm'
import { Database } from '@adonisjs/lucid/database'
import { Encryption } from '@adonisjs/core/encryption'
import { AppFactory } from '@adonisjs/core/factories/app'
import { LoggerFactory } from '@adonisjs/core/factories/logger'
import { EncryptionFactory } from '@adonisjs/core/factories/encryption'
import { join } from 'node:path'
import fs from 'node:fs'
import { DateTime } from 'luxon'
import { AclModelInterface } from '../src/types.js'
import morphMap from '../src/morph_map.js'
import { ApplicationService } from '@adonisjs/core/types'
import { Chance } from 'chance'

export const encryption: Encryption = new EncryptionFactory().create()
configDotenv()

const BASE_URL = new URL('./tmp/', import.meta.url)

const app = new AppFactory().create(BASE_URL, () => {}) as ApplicationService
await app.init()
await app.boot()
// app.container.singleton('morphMap', async () => {
//   return new MorphMap()
// })

const logger = new LoggerFactory().create()
const emitter = new Emitter(app)

export function MorphMapDecorator(param: string) {
  return function <T extends { new (...args: any[]): {} }>(target: T) {
    target.prototype.__morphMapName = param
    morphMap.set(param, target)
  }
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

    await db.connection().schema.dropTableIfExists('products')
    await db.connection().schema.dropTableIfExists('posts')
  })

  await db.connection().schema.createTableIfNotExists('users', (table) => {
    table.increments('id').notNullable()

    table.timestamp('created_at').notNullable()
    table.timestamp('updated_at').nullable()
  })

  await db.connection().schema.createTableIfNotExists('roles', (table) => {
    table.increments('id')

    table.string('slug').index()
    table.string('title')
    table.string('entity_type').defaultTo('*')
    table.bigint('entity_id').unsigned().nullable()
    table.integer('scope').unsigned().defaultTo('*')
    table.boolean('allowed').defaultTo(true)

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
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
    table.string('entity_type').defaultTo('*')
    table.bigint('entity_id').unsigned().nullable()
    table.integer('scope').unsigned().defaultTo(0)
    table.boolean('allowed').defaultTo(true)

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

  await db.connection().schema.createTableIfNotExists('products', (table) => {
    table.increments('id')

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })
  })

  await db.connection().schema.createTableIfNotExists('posts', (table) => {
    table.increments('id')

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })
  })
}

export async function defineModels() {
  @MorphMapDecorator('users')
  class User extends BaseModel implements AclModelInterface {
    @column({ isPrimary: true })
    declare id: number

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    getModelId() {
      return this.id
    }
  }

  @MorphMapDecorator('roles')
  class Role extends BaseModel implements AclModelInterface {
    getModelId(): number {
      return this.id
    }

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare slug: string

    @column()
    declare title: string

    @column()
    declare entityType: string

    @column()
    declare entityId: number | null

    @column()
    declare scope: number

    @column()
    declare allowed: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime
  }

  @MorphMapDecorator('permissions')
  class Permission extends BaseModel implements AclModelInterface {
    getModelId(): number {
      return this.id
    }

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare slug: string

    @column()
    declare title: string

    @column()
    declare entityType: string | null

    @column()
    declare entityId: number | null

    @column()
    declare allowed: boolean

    @column()
    declare scope: number

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime
  }

  class ModelRole extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare roleId: number

    @column()
    declare modelType: string

    @column()
    declare modelId: number | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime
  }

  class ModelPermission extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare permissionId: number

    @column()
    declare modelType: string

    @column()
    declare modelId: number

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    static forModel = scope((query, modelType: string, modelId: number | null) => {
      query.where('model_type', modelType)
      modelId === null ? query.whereNull('model_id') : query.where('model_id', modelId)
    })
  }

  @MorphMapDecorator('products')
  class Product extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime
  }

  @MorphMapDecorator('posts')
  class Post extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime
  }

  return {
    User,
    Product,
    Post,
    Role,
    Permission,
    ModelRole,
    ModelPermission,
  }
}

export async function seedDb(models: any) {
  await models.User.createMany(getUsers(100))
  await models.Post.createMany(getPosts(20))
  await models.Product.createMany(getProduts(20))
}

/**
 * Returns an array of users filled with random data
 */
export function getUsers(count: number) {
  // const chance = new Chance()
  return [...new Array(count)].map(() => {
    return {}
  })
}

export function getRoles(count: number) {
  const chance = new Chance()
  return [...new Array(count)].map(() => {
    return {
      slug: chance.name(),
      title: chance.name(),
    }
  })
}

export function getPermissions(count: number) {
  const chance = new Chance()
  return [...new Array(count)].map(() => {
    return {
      slug: chance.name(),
      title: chance.name(),
    }
  })
}

/**
 * Returns an array of posts for a given user, filled with random data
 */
export function getPosts(count: number) {
  return [...new Array(count)].map(() => {
    return {}
  })
}

/**
 * Returns an array of posts for a given user, filled with random data
 */
export function getProduts(count: number) {
  return [...new Array(count)].map(() => {
    return {}
  })
}
