import { ModelAdapterOptions } from '@adonisjs/lucid/types/model'
import ModelManager from '../model_manager.js'
import { MorphInterface, OptionsInterface } from '../types.js'
import { Scope } from '../scope.js'
import { BaseEvent, Emitter } from '@adonisjs/core/events'

export default class BaseAdapter {
  protected queryOptions: ModelAdapterOptions = {}

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
    this.queryOptions = options

    return this
  }

  withoutEvents() {
    this.options.events.fire = false

    return this
  }

  withEvents() {
    this.options.events.fire = true

    return this
  }

  fire<T extends BaseEvent>(event: new (...args: any[]) => T, ...args: any[]) {
    if (!this.options.events.fire) {
      return
    }

    // if "only" is set, fire event and return, because it has higher priority than "except"
    if (this.options.events.only?.includes(event)) {
      this.emitter.emit(event, new event(...args))
      return
    }

    if (this.options.events.except?.includes(event)) {
      return
    }

    this.emitter.emit(event, new event(...args))
  }
}
