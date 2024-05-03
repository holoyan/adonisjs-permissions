import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { ModelIdType, ModelRoleInterface } from '../types.js'
import app from '@adonisjs/core/services/app'

export default class ModelRole extends BaseModel implements ModelRoleInterface {
  static get table() {
    return app.config.get('permissions.permissionsConfig.tables.modelRoles') as string
  }

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roleId: ModelIdType

  @column()
  declare modelType: string

  @column()
  declare modelId: ModelIdType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
