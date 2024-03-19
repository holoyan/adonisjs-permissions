import ModelPermission from '../models/model_permission.js'
import ModelRole from '../models/model_role.js'
import { morphMap } from './helper.js'

export default class ModelService {
  all(roleId: number) {
    return ModelRole.query().where('role_id', roleId)
  }

  async allFor(modelType: string, roleId: number) {
    const map = await morphMap()
    const modelClass = map.get(modelType)
    return modelClass
      .query()
      .join(ModelRole.table + ' as mr', 'mr.model_id', '=', modelClass.table + '.id')
      .where('mr.role_id', roleId)
      .where('mr.model_type', modelType)
  }

  allByPermission(permissionId: number) {
    return ModelPermission.query()
      .where('permission_id', permissionId)
      .groupBy(['model_type', 'model_id'])
  }

  async allByPermissionFor(modelType: string, permisisonId: number) {
    const map = await morphMap()
    const modelClass = map.get(modelType)
    return modelClass
      .query()
      .join(ModelPermission.table + ' as mp', 'mp.model_id', '=', modelClass.table + '.id')
      .where('mp.permission_id', permisisonId)
      .where('mp.model_type', modelType)
  }
}
