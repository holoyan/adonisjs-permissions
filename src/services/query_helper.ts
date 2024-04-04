import { LucidModel, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { BaseModel } from '@adonisjs/lucid/orm'
import { ModelPermissionModel, ModelRoleModel, PermissionModel, RoleModel } from '../types.js'

export function getPermissionModelQuery<T extends LucidModel>(
  permissionClassName: typeof BaseModel
) {
  return permissionClassName.query() as ModelQueryBuilderContract<T, PermissionModel<T>>
}

export function getRoleModelQuery<T extends LucidModel>(permissionClassName: typeof BaseModel) {
  return permissionClassName.query() as ModelQueryBuilderContract<T, RoleModel<T>>
}

export function getModelPermissionModelQuery<T extends LucidModel>(
  permissionClassName: typeof BaseModel
) {
  return permissionClassName.query() as ModelQueryBuilderContract<T, ModelPermissionModel<T>>
}

export function getModelRoleModelQuery<T extends LucidModel>(
  permissionClassName: typeof BaseModel
) {
  return permissionClassName.query() as ModelQueryBuilderContract<T, ModelRoleModel<T>>
}
