import { formatList, formatListStringNumbers, formatStringNumbers } from './helper.js'
import { OptionsInterface } from '../types.js'
import { Scope } from '../scope.js'

export default class BaseService {
  constructor(
    protected options: OptionsInterface,
    protected scope: Scope
  ) {}

  protected getQueryOptions() {
    return this.options['queryOptions'] || undefined
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
