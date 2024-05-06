import { ScopeInterface } from './types.js'
import { ChainableContract } from '@adonisjs/lucid/types/querybuilder'

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

  applyWhere(query: ChainableContract, table: string) {
    if (this.#currentScope) {
      query.where(table + '.scope', this.#currentScope)
    }
  }
}
