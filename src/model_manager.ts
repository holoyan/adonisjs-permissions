import { ModelManagerBindings, ModelManagerInterface } from './types.js'

export default class ModelManager {
  private models: ModelManagerInterface = {}

  setModel<Binding extends keyof ModelManagerBindings>(
    key: Binding,
    className: ModelManagerBindings[Binding]
  ) {
    this.models[key] = className
  }

  has(key: string) {
    return key in this.models
  }

  getModel<Binding extends keyof ModelManagerBindings>(
    key: Binding
  ): ModelManagerBindings[Binding] {
    if (key in this.models) {
      return this.models[key]
    }

    throw new Error('Model not defined for key: ' + key)
  }
}
