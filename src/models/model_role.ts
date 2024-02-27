import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import config from '@adonisjs/core/services/config'

export default class ModelRole extends BaseModel {
  static get table() {
    return config.get('permissions.permissionsConfig.tables.modelRoles') as string
  }

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
