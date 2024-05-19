import {
  LucidModel,
  ModelAdapterOptions,
  ModelQueryBuilderContract,
} from '@adonisjs/lucid/types/model'
import { BaseModel } from '@adonisjs/lucid/orm'
import { ModelPermissionModel, ModelRoleModel, PermissionModel, RoleModel } from '../types.js'

export function getPermissionModelQuery<T extends LucidModel>(
  className: typeof BaseModel,
  options?: ModelAdapterOptions
) {
  return className.query(options) as ModelQueryBuilderContract<T, PermissionModel<T>>
}

export function getRoleModelQuery<T extends LucidModel>(
  className: typeof BaseModel,
  options?: ModelAdapterOptions
) {
  return className.query(options) as ModelQueryBuilderContract<T, RoleModel<T>>
}

export function getModelPermissionModelQuery<T extends LucidModel>(
  className: typeof BaseModel,
  options?: ModelAdapterOptions
) {
  return className.query(options) as ModelQueryBuilderContract<T, ModelPermissionModel<T>>
}

export function getModelRoleModelQuery<T extends LucidModel>(
  className: typeof BaseModel,
  options?: ModelAdapterOptions
) {
  return className.query(options) as ModelQueryBuilderContract<T, ModelRoleModel<T>>
}
