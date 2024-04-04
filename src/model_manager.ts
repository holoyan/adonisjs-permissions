import { BaseModel } from '@adonisjs/lucid/orm'
import { ModelManagerInterface } from './types.js'

export default class ModelManager {
  private models: ModelManagerInterface = {}

  setModel(key: string, className: typeof BaseModel) {
    this.models[key] = className
  }

  has(key: string) {
    return key in this.models
  }

  getModel(key: string) {
    if (key in this.models) {
      return this.models[key]
    }

    throw new Error('Model not defined')
  }
}
