import { ModelAdapterOptions } from '@adonisjs/lucid/types/model'
import ModelManager from '../model_manager.js'
import { MorphInterface, OptionsInterface } from '../types.js'
import { Scope } from '../scope.js'
import { BaseEvent, Emitter } from '@adonisjs/core/events'

export default class BaseAdapter {
  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface,
    protected scope: Scope,
    protected emitter: Emitter<any>
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

  withoutEvents() {
    this.options['events'] = false

    return this
  }

  withEvents() {
    this.options['events'] = true

    return this
  }

  fire<T extends BaseEvent>(event: new (...args: any[]) => T, ...args: any[]) {
    if (!this.options.events) {
      return
    }
    this.emitter.emit(event, new event(...args))
  }
}
