import { MorphInterface, MorphMapInterface } from './types.js'

export default class MorphMap implements MorphInterface {
  private _map: MorphMapInterface = {}

  private static _instance?: MorphMap

  static create() {
    if (this._instance) {
      return this._instance
    }

    return new MorphMap()
  }

  set(alias: string, target: any) {
    this._map[alias] = target
  }

  get(alias: string) {
    if (!(alias in this._map)) {
      throw new Error('morph map not found for ' + alias)
    }

    return this._map[alias] || null
  }

  has(alias: string) {
    return alias in this._map
  }

  hasTarget(target: any) {
    const keys = Object.keys(this._map)
    for (const key of keys) {
      if (this._map[key] === target) {
        return true
      }
    }

    return false
  }

  getAlias(target: any) {
    const keys = Object.keys(this._map)
    for (const key of keys) {
      if (target instanceof this._map[key] || target === this._map[key]) {
        return key
      }
    }

    throw new Error('Target not found')
  }
}
