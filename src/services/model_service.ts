import BaseService from './base_service.js'
import { getModelPermissionModelQuery, getModelRoleModelQuery } from './query_helper.js'
import { BaseModel } from '@adonisjs/lucid/orm'
import { MorphInterface } from '../types.js'

export default class ModelService extends BaseService {
  // private permissionQuery
  // private readonly permissionTable

  // private roleQuery
  // private readonly roleTable

  private modelPermissionQuery
  private readonly modelPermissionTable

  private modelRoleQuery
  private readonly modelRoleTable

  constructor(
    // private roleClassName: typeof BaseModel,
    // private permissionClassName: typeof BaseModel,
    private modelPermissionClassName: typeof BaseModel,
    private modelRoleClassName: typeof BaseModel,
    private map: MorphInterface
  ) {
    super()
    // this.permissionQuery = getPermissionModelQuery(this.permissionClassName)
    // this.permissionTable = this.permissionClassName.table

    // this.roleQuery = getRoleModelQuery(this.roleClassName)
    // this.roleTable = this.roleClassName.table

    this.modelPermissionQuery = getModelPermissionModelQuery(this.modelPermissionClassName)
    this.modelPermissionTable = this.modelPermissionClassName.table

    this.modelRoleQuery = getModelRoleModelQuery(this.modelRoleClassName)
    this.modelRoleTable = this.modelRoleClassName.table
  }

  all(roleId: number) {
    return this.modelRoleQuery.where('role_id', roleId)
  }

  async allFor(modelType: string, roleId: number) {
    const modelClass = this.map.get(modelType)
    return modelClass
      .query()
      .join(this.modelRoleTable + ' as mr', 'mr.model_id', '=', modelClass.table + '.id')
      .where('mr.role_id', roleId)
      .where('mr.model_type', modelType)
  }

  allByPermission(permissionId: string) {
    return this.modelPermissionQuery
      .where('permission_id', permissionId)
      .groupBy(['model_type', 'model_id'])
  }

  async allByPermissionFor(modelType: string, permissionId: string) {
    const modelClass = this.map.get(modelType)
    return modelClass
      .query()
      .join(this.modelPermissionTable + ' as mp', 'mp.model_id', '=', modelClass.table + '.id')
      .where('mp.permission_id', permissionId)
      .where('mp.model_type', modelType)
  }
}
