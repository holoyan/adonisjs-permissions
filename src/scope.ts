import { ScopeInterface } from './types.js'

export class Scope implements ScopeInterface {
  private currentScope

  static defaultScope = 'default'

  constructor(scope?: string) {
    if (!scope) {
      scope = Scope.defaultScope
    }

    this.currentScope = scope
  }

  set(scope: string) {
    this.currentScope = scope
    return this
  }

  get() {
    return this.currentScope
  }

  default() {
    return Scope.defaultScope
  }
}
