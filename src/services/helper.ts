import app from '@adonisjs/core/services/app'
import { AclModel, AclModelInterface } from '../types.js'

export async function morphMap() {
  const map = await app.container.make('morphMap')
  return map
}

export function formatList(models: (string | number | any)[]) {
  let slugs: string[] = []
  let ids: number[] = []

  for (let model of models) {
    if (typeof model === 'string') {
      slugs.push(model)
    } else if (typeof model === 'number') {
      ids.push(model)
    } else {
      // @ts-ignore
      ids.push(model.id)
    }
  }

  return { slugs, ids }
}

export function formatListStringNumbers(models: (string | number)[]) {
  let slugs: string[] = []
  let ids: number[] = []

  for (let model of models) {
    if (typeof model === 'string') {
      slugs.push(model)
    } else {
      // @ts-ignore
      ids.push(model)
    }
  }

  return { slugs, ids }
}

export function formatStringNumbers(models: string | number | any) {
  let slugs: string[] = []
  let ids: number[] = []

  for (let model of models) {
    if (typeof model === 'string') {
      slugs.push(model)
    } else if (typeof model === 'number') {
      // @ts-ignore
      ids.push(model)
    } else {
      ids.push(model.id)
    }
  }

  return { slugs, ids }
}

export async function destructTarget(target?: AclModel | Function) {
  if (!target) {
    return {
      targetClass: null,
      targetId: null,
    }
  }

  const map = await morphMap()
  return {
    targetClass: map.getAlias(target),
    targetId: isAclModelInterface(target) ? target.getModelId() : null,
  }
}

function isAclModelInterface(obj: any): obj is AclModelInterface {
  return typeof obj === 'object' && typeof obj.getModelId === 'function'
}
