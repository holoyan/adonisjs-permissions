import morphMap from './morph_map.js'

export function MorphMap(param: string) {
  return function <T extends { new (...args: any[]): {} }>(target: T) {
    target.prototype.__morphMapName = param
    morphMap.set(param, target)
  }
}

export function getClassPath<T extends { new (...args: any[]): {} }>(clazz: T): string {
  const morphMapName = clazz.prototype.__morphMapName
  if (!morphMapName) {
    throw new Error('morph map name not specified')
  }

  return morphMapName
}
