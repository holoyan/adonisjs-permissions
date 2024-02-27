import Role from '../models/role.js'
import ModelRole from '../models/model_role.js'
import { HasRoles } from '../types.js'

export default class RolesService {
  private modelRolesQuery(modelType: string, modelId: number | null) {
    const query = Role.query()
      .join('model_roles', 'model_roles.role_id', '=', 'roles.id')
      .where('model_roles.model_type', modelType)
    return modelId === null
      ? query.whereNull('model_roles.model_id')
      : query.where('model_roles.model_id', modelId)
  }

  async all(modelType: string, modelId: number | null): Promise<Role[] | null> {
    const roles = await this.modelRolesQuery(modelType, modelId).select('roles.*')

    if (roles.length === 0) {
      return null
    }

    return roles
  }

  async has(modelType: string, modelId: number | null, role: string | Role): Promise<boolean> {
    return this.hasAll(modelType, modelId, [role])
  }

  async hasAll(
    modelType: string,
    modelId: number | null,
    roles: (string | Role)[]
  ): Promise<boolean> {
    const rolesQuery = this.modelRolesQuery(modelType, modelId)

    let { slugs, ids } = this.formatList(roles)
    if (slugs.length) {
      rolesQuery.whereIn('roles.slug', slugs)
    }

    if (ids.length) {
      rolesQuery.whereIn('roles.id', ids)
    }

    const r = await rolesQuery.count('* as total')

    // @ts-ignore
    return r[0].total === roles.length
  }

  async hasAny(
    modelType: string,
    modelId: number | null,
    roles: (string | Role)[]
  ): Promise<boolean> {
    // if is string then we are going to check against slug
    // map roles
    const rolesQuery = this.modelRolesQuery(modelType, modelId)

    let { slugs, ids } = this.formatList(roles)
    if (slugs.length) {
      rolesQuery.whereIn('roles.slug', slugs)
    }

    if (ids.length) {
      rolesQuery.whereIn('roles.id', ids)
    }

    const r = await rolesQuery.count('* as total')

    // @ts-ignore
    return r[0].total > 0
  }

  async assigne(role: string | Role, model: HasRoles) {
    const r = await this.extractRoleModel(role)

    if (!r) {
      throw new Error('Role  not found')
    }

    await ModelRole.create({
      modelType: model.getMorphMapName(),
      modelId: model.getModelId(),
      roleId: r.id,
    })

    return true
  }

  async revoke(role: string | Role, model: HasRoles) {
    const r = await this.extractRoleModel(role)

    if (!r) {
      throw new Error('Role  not found')
    }

    const q = ModelRole.query().where('model_type', model.getMorphMapName()).where('role_id', r.id)
    const modelId = model.getModelId()
    modelId === null ? q.whereNull('model_id') : q.where('model_id', modelId)

    await q.delete()

    return true
  }

  private async extractRoleModel(role: string | Role) {
    if (typeof role === 'string') {
      return await Role.query().where('slug', role).first()
    }
    return role
  }

  private formatList(roles: (string | Role)[]) {
    let slugs: string[] = []
    let ids: (number | string)[] = []

    for (let role of roles) {
      if (typeof role === 'string') {
        slugs.push(role)
      } else {
        ids.push(role.id)
      }
    }

    return { slugs, ids }
  }
}
