import { ModelAdapterOptions } from '@adonisjs/lucid/types/model'
import ModelManager from '../model_manager.js'
import { MorphInterface, OptionsInterface } from '../types.js'

export default class BaseAdapter {
  protected get scope() {
    return this.options['scope']
  }

  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface
  ) {}

  on(scope: string) {
    this.options['scope'] = scope
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
