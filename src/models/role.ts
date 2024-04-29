import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import config from '@adonisjs/core/services/config'
import { RoleInterface } from '../types.js'
import { v4 as uuidv4 } from 'uuid'

export default class Role extends BaseModel implements RoleInterface {
  static get table() {
    return config.get('permissions.permissionsConfig.tables.roles') as string
  }

  static selfAssignPrimaryKey = true

  @beforeCreate()
  static assignUuid(role: Role) {
    role.id = uuidv4()
  }

  getModelId(): string {
    return String(this.id)
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
  declare scope: number

  @column()
  declare allowed: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
