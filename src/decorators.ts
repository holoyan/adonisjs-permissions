import app from '@adonisjs/core/services/app'

export function MorphMap(param: string) {
  return function <T extends { new (...args: any[]): {} }>(target: T) {
    const service = async function () {
      var result = await app.container.make('morphMap')
      result.set(param, target)
      return param
    }

    target.prototype.__morphMapName = service()
    target.prototype.__morphMapName = param
  }
}

export function getClassPath<T extends { new (...args: any[]): {} }>(clazz: T): string {
  const morphMapName = clazz.prototype.__morphMapName
  if (!morphMapName) {
    throw new Error('morph map name not specified')
  }

  return morphMapName
}
