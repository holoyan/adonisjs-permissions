import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import config from '@adonisjs/core/services/config'
import { MorphMap } from '../decorators.js'
import { PermissionInterface } from '../types.js'

@MorphMap('permissions')
export default class Permission extends BaseModel implements PermissionInterface {
  static get table() {
    return config.get('permissions.permissionsConfig.tables.permissions') as string
  }

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
  declare allowed: boolean

  @column()
  declare scope: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
