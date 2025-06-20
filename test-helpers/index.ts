import { configDotenv } from 'dotenv'
import { getActiveTest } from '@japa/runner'
import { Emitter } from '@adonisjs/core/events'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { Database } from '@adonisjs/lucid/database'
import { Encryption } from '@adonisjs/core/encryption'
import { AppFactory } from '@adonisjs/core/factories/app'
import { LoggerFactory } from '@adonisjs/core/factories/logger'
import { EncryptionFactory } from '@adonisjs/core/factories/encryption'

import { join } from 'node:path'
import fs from 'node:fs'
import { AclModelInterface, MorphInterface, MorphMapInterface } from '../src/types.js'
import { ApplicationService } from '@adonisjs/core/types'
import { Chance } from 'chance'
import { v4 as uuidv4 } from 'uuid'
import { compose } from '@adonisjs/core/helpers'
import { hasPermissions } from '../src/mixins/has_permissions.js'
import { DateTime } from 'luxon'
import { AclManager, Permission, Role, Scope } from '../index.js'
import ModelManager from '../src/model_manager.js'
import ModelPermission from '../src/models/model_permission.js'
import ModelRole from '../src/models/model_role.js'

export const encryption: Encryption = new EncryptionFactory().create()
configDotenv()

const BASE_URL = new URL('./tmp/', import.meta.url)

const app = new AppFactory().create(BASE_URL, () => {}) as ApplicationService
await app.init()
await app.boot()

const logger = new LoggerFactory().create()
export const emitter = new Emitter(app)

class MorphMap implements MorphInterface {
  _map: MorphMapInterface = {}

  static _instance?: MorphMap

  static create() {
    if (this._instance) {
      return this._instance
    }

    return new MorphMap()
  }

  set(alias: string, target: any) {
    this._map[alias] = target
  }

  get(alias: string) {
    if (!(alias in this._map)) {
      throw new Error('morph map not found for ' + alias)
    }

    return this._map[alias] || null
  }

  has(alias: string) {
    return alias in this._map
  }

  hasTarget(target: any) {
    const keys = Object.keys(this._map)
    for (const key of keys) {
      if (this._map[key] === target) {
        return true
      }
    }

    return false
  }

  getAlias(target: any) {
    const keys = Object.keys(this._map)
    for (const key of keys) {
      if (target instanceof this._map[key] || target === this._map[key]) {
        return key
      }
    }

    throw new Error('Target not found')
  }
}

export class User extends compose(BaseModel, hasPermissions()) implements AclModelInterface {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  getModelId() {
    return String(this.id)
  }
}

export class Product extends BaseModel implements AclModelInterface {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  getModelId(): string {
    return String(this.id)
  }
}

export class Post extends BaseModel implements AclModelInterface {
  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  getModelId(): string {
    return String(this.id)
  }
}

export const morphMap = MorphMap.create()
morphMap.set('permissions', Permission)
morphMap.set('roles', Role)
morphMap.set('users', User)
morphMap.set('posts', Post)
morphMap.set('products', Product)

const permissionTable = 'permissions'
const roleTable = 'roles'
const userTable = 'users'
const modelRoleTable = 'model_roles'
const modelPermissionTable = 'model_permissions'

Permission.uuidSupport = wantsUUID()
Permission.selfAssignPrimaryKey = wantsUUID()
Permission.table = permissionTable

Role.uuidSupport = wantsUUID()
Role.selfAssignPrimaryKey = wantsUUID()
Role.table = roleTable

ModelRole.table = modelRoleTable
ModelPermission.table = modelPermissionTable

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
          debug: true,
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
          debug: true,
        },
        mssql: {
          client: 'mssql',
          connection: {
            server: process.env.MSSQL_HOST as string,
            port: Number(process.env.MSSQL_PORT! as string),
            user: process.env.MSSQL_USER as string,
            password: process.env.MSSQL_PASSWORD as string,
            database: 'master',
            options: {
              enableArithAbort: true,
            },
          },
          debug: true,
        },
        mysql: {
          client: 'mysql2',
          connection: {
            host: process.env.MYSQL_HOST as string,
            port: Number(process.env.MYSQL_PORT),
            database: process.env.MYSQL_DATABASE as string,
            user: process.env.MYSQL_USER as string,
            password: process.env.MYSQL_PASSWORD as string,
          },
          debug: true,
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
    await db.connection().schema.dropTableIfExists(userTable)
    await db.connection().schema.dropTableIfExists(modelRoleTable)
    await db.connection().schema.dropTableIfExists(modelPermissionTable)

    await db.connection().schema.dropTableIfExists(roleTable)
    await db.connection().schema.dropTableIfExists(permissionTable)

    await db.connection().schema.dropTableIfExists('products')
    await db.connection().schema.dropTableIfExists('posts')
  })

  await db.connection().schema.createTableIfNotExists('users', (table) => {
    table.increments('id').notNullable()

    table.timestamp('created_at').notNullable()
    table.timestamp('updated_at').nullable()
  })

  await db.connection().schema.createTableIfNotExists(permissionTable, (table) => {
    PrimaryKey(table, 'id')

    table.string('slug')
    table.string('title').nullable()
    table.string('entity_type').defaultTo('*')
    modelId(table, 'entity_id').nullable()
    table.string('scope').defaultTo('default')
    table.boolean('allowed').defaultTo(true)

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })

    table.index(['scope', 'slug'])
    table.index(['entity_type', 'entity_id'])
  })

  await db.connection().schema.createTableIfNotExists(roleTable, (table) => {
    PrimaryKey(table, 'id')

    table.string('slug')
    table.string('title').nullable()
    table.string('entity_type').defaultTo('*')
    modelId(table, 'entity_id').nullable()
    table.string('scope').defaultTo('default')
    table.boolean('allowed').defaultTo(true)

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })

    table.index(['scope', 'slug'])
    table.index(['entity_type', 'entity_id'])
  })

  await db.connection().schema.createTableIfNotExists(modelRoleTable, (table) => {
    table.bigIncrements('id')

    table.string('model_type')
    modelId(table, 'model_id')
    modelId(table, 'role_id')

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })

    table.index(['model_type', 'model_id'])

    table
      .foreign('role_id')
      .references(roleTable + '.id')
      .onDelete('CASCADE')
  })

  await db.connection().schema.createTableIfNotExists(modelPermissionTable, (table) => {
    table.bigIncrements('id')

    table.string('model_type')
    modelId(table, 'model_id')
    modelId(table, 'permission_id')

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })

    table.index(['model_type', 'model_id'])

    table
      .foreign('permission_id')
      .references(permissionTable + '.id')
      .onDelete('CASCADE')
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
    PrimaryKey(table, 'id')

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })
  })
}
function PrimaryKey(table: any, columnName: string) {
  return wantsUUID() ? table.string(columnName).primary() : table.bigIncrements(columnName)
}

function modelId(table: any, columnName: string) {
  return wantsUUID() ? table.string(columnName) : table.bigint(columnName).unsigned()
}

export function wantsUUID() {
  return process.env.UUID_SUPPORT === 'true'
}

export async function seedDb(models: any) {
  await models.User.createMany(getUsers(100))
  if (models.Post) {
    await models.Post.createMany(getPosts(20))
  }
  if (models.Product) {
    await models.Product.createMany(getProducts(20))
  }
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
    if (wantsUUID()) {
      return {
        id: uuidv4(),
      }
    }
    return {}
  })
}

/**
 * Returns an array of posts for a given user, filled with random data
 */
export function getProducts(count: number) {
  return [...new Array(count)].map(() => {
    return {}
  })
}

export function makeId() {
  return uuidv4()
}

const modelManager = new ModelManager()
modelManager.setModel('permission', Permission)
modelManager.setModel('role', Role)
modelManager.setModel('modelPermission', ModelPermission)
modelManager.setModel('modelRole', ModelRole)
modelManager.setModel('scope', Scope)

AclManager.setModelManager(modelManager)
AclManager.setMorphMap(morphMap)
AclManager.setEmitter(emitter)
