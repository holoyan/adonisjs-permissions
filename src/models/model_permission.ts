import { DateTime } from 'luxon'
import { BaseModel, column, scope } from '@adonisjs/lucid/orm'
import config from '@adonisjs/core/services/config'
import { ModelPermissionInterface } from '../types.js'

export default class ModelPermission extends BaseModel implements ModelPermissionInterface {
  getModelId(): number {
    return this.id
  }

  static get table() {
    return config.get('permissions.permissionsConfig.tables.modelPermissions') as string
  }
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare permissionId: number

  @column()
  declare modelType: string

  @column()
  declare modelId: number | string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static forModel = scope((query, modelType: string, modelId: number | null) => {
    query.where('model_type', modelType)
    modelId === null ? query.whereNull('model_id') : query.where('model_id', modelId)
  })
}
