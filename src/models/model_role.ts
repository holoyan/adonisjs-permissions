import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import config from '@adonisjs/core/services/config'
import { ModelRoleInterface } from '../types.js'

export default class ModelRole extends BaseModel implements ModelRoleInterface {
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
  declare modelId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
