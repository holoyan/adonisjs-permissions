import { formatList, formatListStringNumbers, formatStringNumbers } from './helper.js'

export default class BaseService {
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
