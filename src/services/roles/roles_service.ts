import {
  AclModel,
  ModelIdType,
  ModelRoleInterface,
  MorphInterface,
  OptionsInterface,
  RoleInterface,
} from '../../types.js'
import BaseService from '../base_service.js'
import { BaseModel } from '@adonisjs/lucid/orm'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Role from '../../models/role.js'
import { Scope } from '../../scope.js'
import { getModelRoleModelQuery } from '../query_helper.js'

export default class RolesService extends BaseService {
  private readonly roleTable

  // private modelPermissionQuery
  private readonly modelPermissionTable

  private readonly modelRoleTable

  constructor(
    protected options: OptionsInterface,
    protected scope: Scope,
    protected roleClassName: typeof Role,
    protected modelPermissionClassName: typeof BaseModel,
    protected modelRoleClassName: typeof BaseModel,
    protected map: MorphInterface
  ) {
    super(options, scope)
    this.roleTable = this.roleClassName.table

    this.modelPermissionTable = this.modelPermissionClassName.table

    this.modelRoleTable = this.modelRoleClassName.table
  }

  private modelRolesQuery(modelType: string, modelId: ModelIdType) {
    return this.roleQuery
      .leftJoin(this.modelRoleTable + ' as mr', 'mr.role_id', '=', this.roleTable + '.id')
      .where('mr.model_type', modelType)
      .where('mr.model_id', modelId)
  }

  private get roleQuery() {
    const q = this.roleClassName.query(this.getQueryOptions())
    this.applyScopes(q, this.scope.get())

    return q
  }

  private get modelRoleQuery() {
    return getModelRoleModelQuery(this.modelRoleClassName, this.getQueryOptions())
  }

  all(modelType: string, modelId: ModelIdType) {
    return this.modelRolesQuery(modelType, modelId)
      .distinct(this.roleTable + '.id')
      .select(this.roleTable + '.*')
  }

  has(modelType: string, modelId: ModelIdType, role: string): Promise<boolean> {
    return this.hasAll(modelType, modelId, [role])
  }

  async hasAll(modelType: string, modelId: ModelIdType, roles: string[]): Promise<boolean> {
    const rolesQuery = this.modelRolesQuery(modelType, modelId)

    let { slugs, ids } = this.formatList(roles)

    if (slugs.length) {
      rolesQuery.whereIn(this.roleTable + '.slug', slugs)
    }

    if (ids.length) {
      rolesQuery.whereIn(this.roleTable + '.id', ids)
    }

    const r = await rolesQuery.count('* as total')
    // @ts-ignore
    return +r[0].$extras.total === roles.length
  }

  async hasAny(modelType: string, modelId: ModelIdType, roles: string[]): Promise<boolean> {
    // if is string then we are going to check against slug
    // map roles
    const rolesQuery = this.modelRolesQuery(modelType, modelId)

    let { slugs, ids } = this.formatList(roles)
    if (slugs.length) {
      rolesQuery.whereIn(this.roleTable + '.slug', slugs)
    }

    if (ids.length) {
      rolesQuery.whereIn(this.roleTable + '.id', ids)
    }

    const r = await rolesQuery.count('* as total')

    // @ts-ignore
    return +r[0].$extras.total > 0
  }

  assign(role: string, modelType: string, modelId: ModelIdType) {
    return this.assignAll([role], modelType, modelId)
  }

  async assignAll(roles: string[], modelType: string, modelId: ModelIdType) {
    const rs = await this.extractRoleModel(roles)

    if (!rs.length) {
      throw new Error('One or many roles not found')
    }

    let roleIds = rs.map((role) => role.id)

    const modelRoles = await this.modelRoleQuery
      .whereIn('role_id', roleIds)
      .where('model_type', modelType)
      .where('model_id', modelId)
      .select('role_id')

    const modelRoleIds = modelRoles.map((modelRole) => modelRole.roleId)

    roleIds = roleIds.filter((roleId) => {
      return !modelRoleIds.includes(roleId)
    })

    const data = []
    for (const id of roleIds) {
      data.push({
        modelType,
        modelId,
        roleId: id,
      })
    }

    const created = await this.modelRoleClassName.createMany(data, this.getQueryOptions())

    return created.length === data.length
  }

  async revoke(role: string, model: AclModel) {
    return this.revokeAll([role], model)
  }

  async revokeAll(roles: string[], model: AclModel) {
    const { slugs, ids } = this.formatListStringNumbers(roles)

    const q = this.modelRoleQuery
      .leftJoin(this.roleTable + ' as r', 'r.id', '=', this.modelRoleTable + '.role_id')
      .where('model_type', this.map.getAlias(model))
      .where('model_id', model.getModelId())
      .where((query) => {
        if (slugs.length) {
          query.orWhereIn('r.slug', slugs)
        }
        if (ids.length) {
          query.orWhereIn('r.id', ids)
        }
      })

    this.applyModelRoleScopes(q, 'r', this.scope.get())
    const d = await q.delete()

    return d.length > 0
  }

  private extractRoleModel(roles: string[]) {
    return this.roleQuery.whereIn('slug', roles)
  }

  roleModelPermissionQuery(modelType: string) {
    return this.roleQuery
      .leftJoin(this.modelPermissionTable + ' as mp', 'mp.model_id', '=', this.roleTable + '.id')
      .where('mp.model_type', modelType)
  }

  flush(modelType: string, modelId: ModelIdType) {
    return this.modelRoleQuery.where('model_type', modelType).where('model_id', modelId).delete()
  }

  private applyScopes(
    q: ModelQueryBuilderContract<typeof BaseModel, RoleInterface>,
    scope: string
  ) {
    q.where(this.roleTable + '.scope', scope)
  }

  private applyModelRoleScopes(
    q: ModelQueryBuilderContract<typeof BaseModel, ModelRoleInterface>,
    table: string,
    scope: string
  ) {
    q.where(table + '.scope', scope)
  }

  findBySlug(slug: string) {
    return this.roleQuery.where('slug', slug).first()
  }
}
