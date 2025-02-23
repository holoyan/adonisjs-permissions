import { AclModel, MorphInterface, OptionsInterface, PermissionInterface } from '../../types.js'
import { destructTarget } from '../helper.js'
import ModelService from '../models/model_service.js'
import RoleService from '../roles/roles_service.js'
import PermissionService from './permissions_service.js'
import { BaseModel } from '@adonisjs/lucid/orm'
import { getModelPermissionModelQuery, getRoleModelQuery } from '../query_helper.js'
import BaseAdapter from '../base_adapter.js'
import ModelManager from '../../model_manager.js'
import RolesService from '../roles/roles_service.js'

export default class PermissionHasModelRoles extends BaseAdapter {
  private modelPermissionQuery

  protected modelPermissionClassName: typeof BaseModel
  protected roleClassName: typeof BaseModel

  protected roleService: RoleService

  protected permissionService: PermissionService

  protected modelService: ModelService
  // private readonly modelPermissionTable

  private roleQuery
  private readonly roleTable

  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface,
    private permission: PermissionInterface
  ) {
    super(manager, map, options)

    this.modelPermissionClassName = manager.getModel('modelPermission')
    this.roleClassName = manager.getModel('role')

    this.modelPermissionQuery = getModelPermissionModelQuery(this.modelPermissionClassName)
    // this.modelPermissionTable = this.modelPermissionClassName.table
    this.roleQuery = getRoleModelQuery(this.roleClassName)
    this.roleTable = this.roleClassName.table

    const role = manager.getModel('role')
    const modelPermission = manager.getModel('modelPermission')
    const modelRole = manager.getModel('modelRole')

    this.roleService = new RolesService(this.options, role, modelPermission, modelRole, map)

    this.permissionService = new PermissionService(
      this.options,
      manager.getModel('permission'),
      role,
      modelPermission,
      modelRole,
      map
    )

    this.modelService = new ModelService(this.options, modelPermission, modelRole, map)
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
