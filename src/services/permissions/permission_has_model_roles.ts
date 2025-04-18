import {
  AclModel,
  ModelManagerBindings,
  MorphInterface,
  OptionsInterface,
  PermissionInterface,
} from '../../types.js'
import { destructTarget } from '../helper.js'
import ModelService from '../models/model_service.js'
import RoleService from '../roles/roles_service.js'
import PermissionService from './permissions_service.js'
import { getModelPermissionModelQuery } from '../query_helper.js'
import BaseAdapter from '../base_adapter.js'
import ModelManager from '../../model_manager.js'
import RolesService from '../roles/roles_service.js'
import { Emitter } from '@adonisjs/core/events'
import { Scope } from '../../scope.js'
import {
  PermissionsAttachedToRoleEvent,
  PermissionsDetachedFromRoleEvent,
} from '../../events/permissions/permissions.js'

export default class PermissionHasModelRoles extends BaseAdapter {
  private modelPermissionQuery

  protected modelPermissionClassName: ModelManagerBindings['modelPermission']
  protected roleClassName: ModelManagerBindings['role']

  protected roleService: RoleService

  protected permissionService: PermissionService

  protected modelService: ModelService
  // private readonly modelPermissionTable

  private readonly roleTable

  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface,
    protected scope: Scope,
    private permission: PermissionInterface,
    protected emitter: Emitter<any>
  ) {
    super(manager, map, options, scope, emitter)

    this.modelPermissionClassName = manager.getModel('modelPermission')
    this.roleClassName = manager.getModel('role')

    this.modelPermissionQuery = getModelPermissionModelQuery(this.modelPermissionClassName)
    this.roleTable = this.roleClassName.table

    const role = manager.getModel('role')
    const modelPermission = manager.getModel('modelPermission')
    const modelRole = manager.getModel('modelRole')

    this.roleService = new RolesService(this.options, scope, role, modelPermission, modelRole, map)

    this.permissionService = new PermissionService(
      this.options,
      scope,
      manager.getModel('permission'),
      role,
      modelPermission,
      modelRole,
      map
    )

    this.modelService = new ModelService(this.options, scope, modelPermission, modelRole, map)
  }

  models() {
    return this.modelService.allByPermission(this.permission.getModelId())
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

  /**
   * @param role
   * @param target
   */
  async attachToRole(role: string, target?: AclModel | Function) {
    // if isNan that we assume that role slug is passed, because role id is number
    if (Number.isNaN(+role)) {
      const r = await this.roleService.findBySlug(role)

      if (!r) {
        throw new Error('Role not found: ' + role)
      }

      role = String(r.id)
    }
    const entity = await destructTarget(this.map, target)
    const attached = await this.permissionService.giveAll(
      this.map.getAlias(this.roleClassName),
      role,
      [this.permission.slug],
      entity.targetClass,
      entity.targetId,
      true
    )

    if (attached.length > 0) {
      this.fire(
        PermissionsAttachedToRoleEvent,
        attached.map((item) => item.permissionId),
        role
      )
    }

    return attached
  }

  /**
   * @param role
   */
  async detachFromRole(role: string | number) {
    if (typeof role === 'string') {
      const r = await this.roleService.findBySlug(role)

      if (!r) {
        throw new Error('Role not found')
      }

      role = r.id
    }

    const detached = await this.modelPermissionQuery
      .where('model_type', this.map.getAlias(this.roleClassName))
      .where('model_id', role)
      .delete()

    if (detached.length > 0) {
      this.fire(PermissionsDetachedFromRoleEvent, [this.permission.slug], role)
    }
  }
}
