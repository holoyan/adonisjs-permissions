import { formatList, formatListStringNumbers, formatStringNumbers } from './helper.js'
import { OptionsInterface } from '../types.js'
import { Scope } from '../scope.js'
import { ModelAdapterOptions } from '@adonisjs/lucid/types/model'

export default class BaseService {
  protected queryOptions: ModelAdapterOptions = {}

  constructor(
    protected options: OptionsInterface,
    protected scope: Scope
  ) {}

  protected getQueryOptions() {
    return this.queryOptions
  }

  setQueryOptions(options: ModelAdapterOptions) {
    this.queryOptions = options
    return this
  }

  protected formatList(models: (string | number | any)[]) {
    return formatList(models)
  }

  protected formatListStringNumbers(models: (string | number)[]) {
    return formatListStringNumbers(models)
  }

  protected formatStringNumbers(models: string | number | any) {
    return formatStringNumbers(models)
  }
}
