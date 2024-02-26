import Permission from '../models/permission.js'

export default class PermissionsService {
  /**
   * return all permissions
   */
  async all(modelType: string, modelId: number) {
    const p = await this.permissionQuery(modelType, modelId)
      .groupBy('permissions.id')
      .select('permissions.*')

    return p
  }

  /**
   * return only global assigned permissions, through role or direct
   */
  async global(modelType: string, modelId: number) {
    const p = await this.permissionQuery(modelType, modelId)
      .where('permissions.entity_type', '*')
      .whereNull('permissions.entity_id')
      .groupBy('permissions.id')
      .select('permissions.*')

    return p
  }

  /**
   * get all permissions which is assigned to concrete resource
   */
  async onResource(modelType: string, modelId: number) {
    const p = await this.permissionQuery(modelType, modelId)
      .where('permissions.entity_type', '*')
      .whereNotNull('permissions.entity_id')
      .groupBy('permissions.id')
      .select('permissions.*')

    return p
  }

  /**
   * all direct permissions
   */
  async direct(modelType: string, modelId: number) {
    const p = await this.directPermissionQuery(modelType, modelId)
      .groupBy('permissions.id')
      .select('permissions.*')

    return p
  }

  /**
   * return direct and resource assigned permissions
   */
  directResource() {}

  /**
   * check if it has permission
   */
  has() {}

  /**
   * has all permissions
   */
  hasAll() {}

  /**
   * has any of permissions
   */
  hasAny() {}

  /**
   * give permission to model
   */
  give() {}

  /**
   * give permissions to model
   */
  giveAll() {}

  /**
   * sync permissions, remove everything outside of the list
   */
  sync() {}

  /**
   * forbid permission on model
   */
  forbid() {}

  /**
   * to remove forbidden permission on model
   */
  unforbid() {}

  /**
   * check if permission is forbidden
   */
  forbidden() {}

  private permissionQuery(modelType: string, modelId: number) {
    const q = Permission.query()
      .join('model_permissions as mp', 'mp.permission_id', '=', 'permissions.id')
      .join('model_roles as mr', (joinQuery) => {
        joinQuery.onVal('mr.model_type', modelType).onVal('mr.model_id', modelId)
      })
      .where((subQuery) => {
        subQuery
          .where((query) => {
            query.where('mp.model_type', modelType)
            modelId === null ? query.whereNull('mp.model_id') : query.where('mp.model_id', modelId)
          })
          .orWhere((query) => {
            query.whereRaw('mr.role_id=mp.model_id').where('mp.model_type', 'roles')
          })
      })

    return q
  }
  private directPermissionQuery(modelType: string, modelId: number) {
    const q = Permission.query()
      .join('model_permissions as mp', 'mp.permission_id', '=', 'permissions.id')
      .where('mp.model_type', modelType)
      .where('mp.model_id', modelId)

    return q
  }
}
