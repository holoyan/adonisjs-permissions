import { AclModel, RoleInterface } from '../../types.js'
import BaseService from '../base_service.js'
import { morphMap } from '../helper.js'
import { BaseModel } from '@adonisjs/lucid/orm'
import {
  // getModelPermissionModelQuery,
  getModelRoleModelQuery,
  // getPermissionModelQuery,
  getRoleModelQuery,
} from '../query_helper.js'

export default class RolesService extends BaseService {
  // private permissionQuery
  // private readonly permissionTable

  private roleQuery
  private readonly roleTable

  // private modelPermissionQuery
  private readonly modelPermissionTable

  private modelRoleQuery
  private readonly modelRoleTable

  constructor(
    private roleClassName: typeof BaseModel,
    // private permissionClassName: typeof BaseModel,
    private modelPermissionClassName: typeof BaseModel,
    private modelRoleClassName: typeof BaseModel
  ) {
    super()
    // this.permissionQuery = getPermissionModelQuery(this.permissionClassName)
    // this.permissionTable = this.permissionClassName.table

    this.roleQuery = getRoleModelQuery(this.roleClassName)
    this.roleTable = this.roleClassName.table

    // this.modelPermissionQuery = getModelPermissionModelQuery(this.modelPermissionClassName)
    this.modelPermissionTable = this.modelPermissionClassName.table

    this.modelRoleQuery = getModelRoleModelQuery(this.modelRoleClassName)
    this.modelRoleTable = this.modelRoleClassName.table
  }

  private modelRolesQuery(modelType: string, modelId: number) {
    return this.roleQuery
      .join(this.modelRoleTable + ' as mr', 'mr.role_id', '=', this.roleTable + '.id')
      .where('mr.model_type', modelType)
      .where('mr.model_id', modelId)
  }

  all(modelType: string, modelId: number) {
    return this.modelRolesQuery(modelType, modelId).select(this.roleTable + '.*')
  }

  async has(modelType: string, modelId: number, role: string | RoleInterface): Promise<boolean> {
    return this.hasAll(modelType, modelId, [role])
  }

  async hasAll(
    modelType: string,
    modelId: number,
    roles: (string | RoleInterface)[]
  ): Promise<boolean> {
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
    return r[0].total === roles.length
  }

  async hasAny(
    modelType: string,
    modelId: number,
    roles: (string | RoleInterface)[]
  ): Promise<boolean> {
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
    return r[0].total > 0
  }

  async assign(role: string | RoleInterface, modelType: string, modelId: number) {
    const r = await this.extractRoleModel(role)

    if (!r) {
      throw new Error('Role  not found')
    }

    await this.modelRoleClassName.create({
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

    await this.modelRoleQuery
      .leftJoin(this.roleTable + ' as r', 'r.id', '=', this.modelRoleTable + '.role_id')
      .where('model_type', map.getAlias(model))
      .where('model_id', model.getModelId())
      .where((query) => {
        query.whereIn('r.id', ids).orWhereIn('r.slug', slugs)
      })
      .delete()

    return true
  }

  private async extractRoleModel(role: string | RoleInterface) {
    if (typeof role === 'string') {
      return await this.roleQuery.where('slug', role).first()
    }
    return role
  }

  roleModelPermissionQuery(modelType: string) {
    return this.roleQuery
      .leftJoin(this.modelPermissionTable + ' as mp', 'mp.model_id', '=', this.roleTable + '.id')
      .where('mp.model_type', modelType)
  }

  async flush(modelType: string, modelId: number) {
    this.modelRoleQuery.where('model_type', modelType).where('model_id', modelId).delete()
  }
}
