import { MorphMapInterface } from './types.js'

export default class MorphMap {
  private map: MorphMapInterface = {}

  set(alias: string, target: any) {
    this.map[alias] = target
  }

  get(alias: string) {
    if (!(alias in this.map)) {
      throw new Error('morph map not found for ' + alias)
    }

    return this.map[alias] || null
  }

  has(alias: string) {
    return alias in this.map
  }

  hasTarget(target: any) {
    const keys = Object.keys(this.map)
    for (const key of keys) {
      if (this.map[key] === target) {
        return true
      }
    }

    return false
  }

  getAlias(target: any) {
    const keys = Object.keys(this.map)
    for (const key of keys) {
      if (target instanceof this.map[key] || target === this.map[key]) {
        return key
      }
    }

    throw new Error('Target not found')
  }
}
