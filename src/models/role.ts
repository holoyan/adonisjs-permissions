import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { ModelIdType, RoleInterface } from '../types.js'
import { v4 as uuidv4 } from 'uuid'

export default class Role extends BaseModel implements RoleInterface {
  static uuidSupport = false

  @beforeCreate()
  static assignUuid(role: Role) {
    if (this.uuidSupport) {
      role.id = uuidv4()
    }
  }

  getModelId(): ModelIdType {
    return this.id
  }

  @column({ isPrimary: true })
  declare id: ModelIdType

  @column()
  declare slug: string

  @column()
  declare title: string | null

  @column()
  declare entityType: string

  @column()
  declare entityId: ModelIdType | null

  @column()
  declare scope: string

  @column()
  declare allowed: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
