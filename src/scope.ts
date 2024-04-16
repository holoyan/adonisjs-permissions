import { ScopeInterface } from './types.js'

const DEFAULT_SCOPE = 0

export class Scope implements ScopeInterface {
  private currentScope = DEFAULT_SCOPE

  set(scope: number) {
    this.currentScope = scope
    return this
  }

  get() {
    return this.currentScope
  }

  default() {
    return DEFAULT_SCOPE
  }
}
