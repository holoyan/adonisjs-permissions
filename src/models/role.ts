import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import config from '@adonisjs/core/services/config'
import { MorphMap } from '../decorators.js'

@MorphMap(config.get('permissions.permissionsConfig.morphMaps.roles') as string)
export default class Role extends BaseModel {
  static get table() {
    return config.get('permissions.permissionsConfig.tables.roles') as string
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
  declare scope: number

  @column()
  declare allowed: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
