import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { ModelIdType, ModelPermissionInterface } from '../types.js'
import app from '@adonisjs/core/services/app'

export default class ModelPermission extends BaseModel implements ModelPermissionInterface {
  static get table() {
    return app.config.get('permissions.permissionsConfig.tables.modelPermissions') as string
  }
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare permissionId: ModelIdType

  @column()
  declare modelType: string

  @column()
  declare modelId: ModelIdType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
