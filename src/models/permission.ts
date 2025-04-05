import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { ModelIdType, PermissionInterface } from '../types.js'

export default class Permission extends BaseModel implements PermissionInterface {
  static uuidSupport = false

  @beforeCreate()
  static assignUuid(permission: Permission) {
    if (this.uuidSupport) {
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
  declare entityId: ModelIdType | null

  @column()
  declare allowed: boolean

  @column()
  declare scope: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
