import Role from '../../models/role.js'
import ModelRole from '../../models/model_role.js'
import { AclModel } from '../../types.js'
import BaseService from '../base_service.js'
import ModelPermission from '../../models/model_permission.js'
import { morphMap } from '../helper.js'

export default class RolesService extends BaseService {
  private modelRolesQuery(modelType: string, modelId: number) {
    return Role.query()
      .join(ModelRole.table + ' as mr', 'mr.role_id', '=', Role.table + '.id')
      .where('mr.model_type', modelType)
      .where('mr.model_id', modelId)
  }

  all(modelType: string, modelId: number) {
    return this.modelRolesQuery(modelType, modelId).select(Role.table + '.*')
  }

  async has(modelType: string, modelId: number, role: string | Role): Promise<boolean> {
    return this.hasAll(modelType, modelId, [role])
  }

  async hasAll(modelType: string, modelId: number, roles: (string | Role)[]): Promise<boolean> {
    const rolesQuery = this.modelRolesQuery(modelType, modelId)

    let { slugs, ids } = this.formatList(roles)
    if (slugs.length) {
      rolesQuery.whereIn(Role.table + '.slug', slugs)
    }

    if (ids.length) {
      rolesQuery.whereIn(Role.table + '.id', ids)
    }

    const r = await rolesQuery.count('* as total')

    // @ts-ignore
    return r[0].total === roles.length
  }

  async hasAny(modelType: string, modelId: number, roles: (string | Role)[]): Promise<boolean> {
    // if is string then we are going to check against slug
    // map roles
    const rolesQuery = this.modelRolesQuery(modelType, modelId)

    let { slugs, ids } = this.formatList(roles)
    if (slugs.length) {
      rolesQuery.whereIn(Role.table + '.slug', slugs)
    }

    if (ids.length) {
      rolesQuery.whereIn(Role.table + '.id', ids)
    }

    const r = await rolesQuery.count('* as total')

    // @ts-ignore
    return r[0].total > 0
  }

  async assign(role: string | Role, modelType: string, modelId: number) {
    const r = await this.extractRoleModel(role)

    if (!r) {
      throw new Error('Role  not found')
    }

    await ModelRole.create({
      modelType,
      modelId,
      roleId: r.id,
    })

    return true
  }

  async revoke(role: string | number, model: AclModel) {
    return this.revokeAll([role], model)
  }

  async revokeAll(roles: (string | number)[], model: AclModel) {
    const map = await morphMap()

    const { slugs, ids } = this.formatListStringNumbers(roles)

    await ModelRole.query()
      .leftJoin(Role.table + ' as r', 'r.id', '=', ModelRole.table + '.role_id')
      .where('model_type', map.getAlias(model))
      .where('model_id', model.getModelId())
      .where((query) => {
        query.whereIn('r.id', ids).orWhereIn('r.slug', slugs)
      })
      .delete()

    return true
  }

  private async extractRoleModel(role: string | Role) {
    if (typeof role === 'string') {
      return await Role.query().where('slug', role).first()
    }
    return role
  }

  roleModelPermissionQuery(modelType: string) {
    return Role.query()
      .leftJoin(ModelPermission.table + ' as mp', 'mp.model_id', '=', Role.table + '.id')
      .where('mp.model_type', modelType)
  }

  async flush(modelType: string, modelId: number) {
    ModelRole.query().where('model_type', modelType).where('model_id', modelId).delete()
  }
}
