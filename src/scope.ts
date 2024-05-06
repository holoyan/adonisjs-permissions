import { ScopeInterface } from './types.js'

const DEFAULT_SCOPE = null

export class Scope implements ScopeInterface {
  #currentScope: number | string | null = DEFAULT_SCOPE

  set(scope: string | number) {
    this.#currentScope = scope
    return this
  }

  get() {
    return this.#currentScope
  }

  default() {
    return DEFAULT_SCOPE
  }
}
