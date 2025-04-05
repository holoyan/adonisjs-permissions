import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { ModelIdType, ModelRoleInterface } from '../types.js'

export default class ModelRole extends BaseModel implements ModelRoleInterface {
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
