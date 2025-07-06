import { morphMap, getClassPath as baseGetClassPath } from '@holoyan/morph-map-js'

// keep for backward compatibility
export function MorphMap(param: string) {
  return function <T extends { new (...args: any[]): {} }>(target: T) {
    morphMap.set(param, target)

    target.prototype.__morphMapName = param
  }
}

export function getClassPath<T extends { new (...args: any[]): {} }>(clazz: T): string {
  return baseGetClassPath(clazz)
}
