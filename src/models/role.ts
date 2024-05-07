import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { ModelIdType, RoleInterface } from '../types.js'
import { v4 as uuidv4 } from 'uuid'
import app from '@adonisjs/core/services/app'

export default class Role extends BaseModel implements RoleInterface {
  static get table() {
    return app.config.get('permissions.permissionsConfig.tables.roles') as string
  }

  static get selfAssignPrimaryKey() {
    return app.config.get('permissions.permissionsConfig.uuidSupport') as boolean
  }

  @beforeCreate()
  static assignUuid(role: Role) {
    if (app.config.get('permissions.permissionsConfig.uuidSupport')) {
      role.id = uuidv4()
    }
  }

  getModelId(): ModelIdType {
    return this.id
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare slug: string

  @column()
  declare title: string | null

  @column()
  declare entityType: string

  @column()
  declare entityId: string | null

  @column()
  declare scope: string

  @column()
  declare allowed: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
