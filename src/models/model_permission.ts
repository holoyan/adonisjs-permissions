import { DateTime } from 'luxon'
import { BaseModel, column, scope } from '@adonisjs/lucid/orm'

export default class ModelPermission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare permissionId: number

  @column()
  declare modelType: string

  @column()
  declare modelId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static forModel = scope((query, modelType: string, modelId: number | null) => {
    query.where('model_type', modelType)
    modelId === null ? query.whereNull('model_id') : query.where('model_id', modelId)
  })
}
