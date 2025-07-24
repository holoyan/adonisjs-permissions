import {
  AclModel,
  AclModelInterface,
  ModelIdType,
  MorphInterface,
  PermissionInterface,
} from '../types.js'
import { BaseModel } from '@adonisjs/lucid/orm'
import type {
  ManyToManySubQueryBuilderContract,
  RelationSubQueryBuilderContract,
} from '@adonisjs/lucid/types/relations'
import { ModelRole, Permission } from '../../index.js'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export function formatList(models: (string | number | any)[]) {
  let slugs: string[] = []
  let ids: number[] = []

  for (let model of models) {
    if (model instanceof BaseModel) {
      // @ts-ignore
      slugs.push(model.slug)
    } else if (typeof model === 'string' && Number.isNaN(+model)) {
      slugs.push(model)
    } else if (typeof model === 'number') {
      ids.push(model)
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

export function destructTarget(map: MorphInterface, target?: AclModel | Function) {
  if (!target) {
    return {
      targetClass: null,
      targetId: null,
    }
  }

  return {
    targetClass: map.getAlias(target),
    targetId: isAclModelInterface(target) ? target.getModelId() : null,
  }
}

function isAclModelInterface(obj: any): obj is AclModelInterface {
  return typeof obj === 'object' && typeof obj.getModelId === 'function'
}

export function applyTargetRestriction(
  table: string,
  q:
    | ManyToManySubQueryBuilderContract<typeof Permission>
    | ModelQueryBuilderContract<typeof Permission, PermissionInterface>
    | RelationSubQueryBuilderContract<typeof ModelRole>,
  entityType: string | null,
  entityId: ModelIdType | null
) {
  if (entityType) {
    q.where((query) => {
      query.where(table + '.entity_type', entityType).orWhere(table + '.entity_type', '*')
    })
    if (entityId) {
      q.where((query) => {
        query.where(table + '.entity_id', entityId).orWhereNull(table + '.entity_id')
      })
    } else {
      q.whereNull(table + '.entity_id')
    }
  } else {
    q.where(table + '.entity_type', '*').whereNull(table + '.entity_id')
  }
}
