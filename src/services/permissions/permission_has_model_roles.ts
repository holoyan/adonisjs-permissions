import { AclModel, MorphInterface, PermissionInterface, ScopeInterface } from '../../types.js'
import { destructTarget } from '../helper.js'
import ModelService from '../model_service.js'
import RolesService from '../roles/roles_service.js'
import PermissionsService from './permissions_service.js'
import { BaseModel } from '@adonisjs/lucid/orm'
import { getModelPermissionModelQuery, getRoleModelQuery } from '../query_helper.js'

export default class PermissionHasModelRoles {
  private modelPermissionQuery
  // private readonly modelPermissionTable

  private roleQuery
  private readonly roleTable

  constructor(
    private permission: PermissionInterface,
    private roleService: RolesService,
    private permissionService: PermissionsService,
    private modelService: ModelService,
    private modelPermissionClassName: typeof BaseModel,
    private roleClassName: typeof BaseModel,
    private map: MorphInterface,
    private scope: ScopeInterface
  ) {
    this.modelPermissionQuery = getModelPermissionModelQuery(this.modelPermissionClassName)
    // this.modelPermissionTable = this.modelPermissionClassName.table
    this.roleQuery = getRoleModelQuery(this.roleClassName)
    this.roleTable = this.roleClassName.table
  }

  models() {
    return this.modelService.allByPermission(this.permission.getModelId())
  }

  on(scope: string) {
    this.scope.set(scope)
    return this
  }

  getScope() {
    return this.scope.get()
  }

  modelsFor(modelType: string) {
    return this.modelService.allByPermissionFor(modelType, this.permission.getModelId())
  }

  async roles() {
    return this.roleService
      .roleModelPermissionQuery(this.map.getAlias(this.roleClassName))
      .where('mp.permission_id', this.permission.id)
  }

  async belongsToRole(role: string | number) {
    const q = this.roleService
      .roleModelPermissionQuery(this.map.getAlias(this.roleClassName))
      .where('mp.permission_id', this.permission.id)
    if (typeof role === 'string') {
      q.where(this.roleTable + '.slug', role)
    } else {
      q.where(this.roleTable + '.id', role)
    }

    const r = await q.select(this.roleTable + '.id').limit(1)

    return r.length > 0
  }

  async attachToRole(role: string, target?: AclModel | Function) {
    // if isNan that we assume that role slug is passed, because role id is number
    if (Number.isNaN(+role)) {
      const r = await this.roleQuery.where('slug', role).first()

      if (!r) {
        throw new Error('Role not found')
      }

      role = String(r.id)
    }
    const entity = await destructTarget(this.map, target)
    return this.permissionService.giveAll(
      this.map.getAlias(this.roleClassName),
      role,
      [this.permission.slug],
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  async detachFromRole(role: string | number) {
    if (typeof role === 'string') {
      const r = await this.roleQuery.where('slug', role).first()

      if (!r) {
        throw new Error('Role not found')
      }

      role = r.id
    }

    return this.modelPermissionQuery
      .where('model_type', this.map.getAlias(this.roleClassName))
      .where('model_id', role)
      .delete()
  }
}
