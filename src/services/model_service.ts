import ModelPermission from '../models/model_permission.js'
import { morphMap } from './helper.js'
import BaseService from './base_service.js'
import { getModelRoleModelQuery } from './query_helper.js'
import { BaseModel } from '@adonisjs/lucid/orm'

export default class ModelService extends BaseService {
  // private permissionQuery
  // private readonly permissionTable

  // private roleQuery
  // private readonly roleTable

  // private modelPermissionQuery
  // private readonly modelPermissionTable

  private modelRoleQuery
  private readonly modelRoleTable

  constructor(
    // private roleClassName: typeof BaseModel,
    // private permissionClassName: typeof BaseModel,
    // private modelPermissionClassName: typeof BaseModel,
    private modelRoleClassName: typeof BaseModel
  ) {
    super()
    // this.permissionQuery = getPermissionModelQuery(this.permissionClassName)
    // this.permissionTable = this.permissionClassName.table

    // this.roleQuery = getRoleModelQuery(this.roleClassName)
    // this.roleTable = this.roleClassName.table

    // this.modelPermissionQuery = getModelPermissionModelQuery(this.modelPermissionClassName)
    // this.modelPermissionTable = this.modelPermissionClassName.table

    this.modelRoleQuery = getModelRoleModelQuery(this.modelRoleClassName)
    this.modelRoleTable = this.modelRoleClassName.table
  }

  all(roleId: number) {
    return this.modelRoleQuery.where('role_id', roleId)
  }

  async allFor(modelType: string, roleId: number) {
    const map = await morphMap()
    const modelClass = map.get(modelType)
    return modelClass
      .query()
      .join(this.modelRoleTable + ' as mr', 'mr.model_id', '=', modelClass.table + '.id')
      .where('mr.role_id', roleId)
      .where('mr.model_type', modelType)
  }

  allByPermission(permissionId: number) {
    return ModelPermission.query()
      .where('permission_id', permissionId)
      .groupBy(['model_type', 'model_id'])
  }

  async allByPermissionFor(modelType: string, permissionId: number) {
    const map = await morphMap()
    const modelClass = map.get(modelType)
    return modelClass
      .query()
      .join(ModelPermission.table + ' as mp', 'mp.model_id', '=', modelClass.table + '.id')
      .where('mp.permission_id', permissionId)
      .where('mp.model_type', modelType)
  }
}
