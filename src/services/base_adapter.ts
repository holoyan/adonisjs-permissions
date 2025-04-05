import { ModelAdapterOptions } from '@adonisjs/lucid/types/model'
import ModelManager from '../model_manager.js'
import { MorphInterface, OptionsInterface } from '../types.js'
import { Scope } from '../scope.js'

export default class BaseAdapter {
  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface,
    protected scope: Scope
  ) {}

  on(scope: string) {
    this.scope.set(scope)
    return this
  }

  getScope() {
    return this.scope
  }

  withQueryOptions(options: ModelAdapterOptions) {
    this.options['queryOptions'] = options

    return this
  }
}
