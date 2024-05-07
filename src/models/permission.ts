import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { ModelIdType, PermissionInterface } from '../types.js'
import app from '@adonisjs/core/services/app'

export default class Permission extends BaseModel implements PermissionInterface {
  static get table() {
    return app.config.get('permissions.permissionsConfig.tables.permissions') as string
  }

  static get selfAssignPrimaryKey() {
    return app.config.get('permissions.permissionsConfig.uuidSupport') as boolean
  }

  @beforeCreate()
  static assignUuid(permission: Permission) {
    if (app.config.get('permissions.permissionsConfig.uuidSupport')) {
      permission.id = uuidv4()
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
  declare allowed: boolean

  @column()
  declare scope: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
