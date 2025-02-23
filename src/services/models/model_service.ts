import BaseService from '../base_service.js'
import { getModelPermissionModelQuery, getModelRoleModelQuery } from '../query_helper.js'
import { BaseModel } from '@adonisjs/lucid/orm'
import { ModelIdType, MorphInterface, OptionsInterface } from '../../types.js'

export default class ModelService extends BaseService {
  private modelPermissionQuery
  private readonly modelPermissionTable

  private modelRoleQuery
  private readonly modelRoleTable

  constructor(
    protected options: OptionsInterface,
    private modelPermissionClassName: typeof BaseModel,
    private modelRoleClassName: typeof BaseModel,
    private map: MorphInterface
  ) {
    super(options)

    this.modelPermissionQuery = getModelPermissionModelQuery(
      this.modelPermissionClassName,
      this.getQueryOptions()
    )
    this.modelPermissionTable = this.modelPermissionClassName.table

    this.modelRoleQuery = getModelRoleModelQuery(this.modelRoleClassName, this.getQueryOptions())
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

  allByPermission(permissionId: ModelIdType) {
    return this.modelPermissionQuery
      .where('permission_id', permissionId)
      .groupBy(['model_type', 'model_id'])
  }

  async allByPermissionFor(modelType: string, permissionId: ModelIdType) {
    const modelClass = this.map.get(modelType)
    return modelClass
      .query()
      .join(this.modelPermissionTable + ' as mp', 'mp.model_id', '=', modelClass.table + '.id')
      .where('mp.permission_id', permissionId)
      .where('mp.model_type', modelType)
  }
}
