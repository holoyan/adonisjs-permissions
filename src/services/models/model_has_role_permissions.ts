import { AclModel, MorphInterface, OptionsInterface } from '../../types.js'
import RolesService from '../roles/roles_service.js'
import { destructTarget, formatList } from '../helper.js'
import BaseAdapter from '../base_adapter.js'
import ModelManager from '../../model_manager.js'
import PermissionService from '../permissions/permissions_service.js'
import { Scope } from '../../scope.js'
import { Emitter } from '@adonisjs/core/events'
import {
  PermissionsAttachedToModelEvent,
  PermissionsDetachedFromModelEvent,
  PermissionsFlushedEvent,
  PermissionsForbadeEvent,
  PermissionsUnForbadeEvent,
} from '../../events/permissions/permissions.js'
import {
  RolesAttachedToModel,
  RolesDetachedFromModelEvent,
  RolesFlushedFromModelEvent,
} from '../../events/roles/roles.js'

export class ModelHasRolePermissions extends BaseAdapter {
  protected roleService: RolesService

  protected permissionService: PermissionService

  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface,
    protected scope: Scope,
    protected model: AclModel,
    protected emitter: Emitter<any>
  ) {
    super(manager, map, options, scope, emitter)

    const role = manager.getModel('role')
    const modelPermission = manager.getModel('modelPermission')
    const modelRole = manager.getModel('modelRole')

    this.roleService = new RolesService(
      this.options,
      this.scope,
      role,
      modelPermission,
      modelRole,
      map
    )

    this.permissionService = new PermissionService(
      this.options,
      scope,
      manager.getModel('permission'),
      role,
      modelPermission,
      modelRole,
      map
    )
  }

  // roles related section BEGIN

  roles() {
    return this.roleService.all(this.map.getAlias(this.model), this.model.getModelId())
  }

  hasRole(role: string) {
    return this.roleService.has(this.map.getAlias(this.model), this.model.getModelId(), role)
  }

  hasAllRoles(...roles: string[]) {
    return this.roleService.hasAll(this.map.getAlias(this.model), this.model.getModelId(), roles)
  }

  hasAnyRole(...roles: string[]) {
    return this.roleService.hasAny(this.map.getAlias(this.model), this.model.getModelId(), roles)
  }

  /**
   * Assign role to the model
   * calls assignAllRoles
   * @param role
   */
  assignRole(role: string) {
    return this.assignAllRoles(role)
  }

  /**
   * Assign role to the model
   * calls assignAllRoles
   * @param role
   */
  assign(role: string) {
    return this.assignAllRoles(role)
  }

  /**
   * Assign list of roles to the model
   * @param roles
   */
  async assignAllRoles(...roles: string[]) {
    const assigned = await this.roleService.assignAll(
      roles,
      this.map.getAlias(this.model),
      this.model.getModelId()
    )

    if (assigned) {
      this.fire(RolesAttachedToModel, roles, this.model)
    }
  }

  /**
   * Revoke role from the model
   * calls revokeAllRoles
   * @param role
   */
  revokeRole(role: string) {
    return this.revokeAllRoles(role)
  }

  /**
   * Revoke role from the model
   * @param roles
   */
  async revokeAllRoles(...roles: string[]) {
    const { slugs } = formatList(roles)

    const revoked = await this.roleService.revokeAll(slugs, this.model)

    if (revoked) {
      this.fire(RolesDetachedFromModelEvent, roles, this.model)
    }

    return revoked
  }

  async flushRoles() {
    const deleted = await this.roleService.flush(
      this.map.getAlias(this.model),
      this.model.getModelId()
    )

    if (deleted.length) {
      this.fire(RolesFlushedFromModelEvent, this.model)
    }

    return deleted.length > 0
  }

  /**
   * Sync roles with the model  (detach all roles and assign new roles)
   * @param roles  - array of roles
   * @param detach - if true, it will detach the existing roles
   */
  async syncRoles(roles: string[], detach: boolean = true) {
    if (detach) {
      await this.flushRoles()
    }

    return this.assignAllRoles(...roles)
  }

  /**
   * Sync roles with the model without detaching the existing ones
   * @param roles
   */
  syncRolesWithoutDetaching(roles: string[]) {
    return this.syncRoles(roles, false)
  }

  // roles related section END

  // permissions related section BEGIN

  async permissions(includeForbiddings: boolean = false) {
    return this.permissionService.all(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  /**
   * returns list of global permissions assigned to the model
   * @param includeForbiddings
   */
  async globalPermissions(includeForbiddings: boolean = false) {
    return this.permissionService.global(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  /**
   * @param includeForbiddings
   */
  async onResourcePermissions(includeForbiddings: boolean = false) {
    return this.permissionService.onResource(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  directPermissions(includeForbiddings: boolean = false) {
    return this.permissionService.direct(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  /**
   * Get permission through roles
   * @param includeForbiddings
   */
  rolePermissions(includeForbiddings: boolean = false) {
    return this.permissionService.throughRoles(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async directGlobalPermissions(includeForbiddings: boolean = false) {
    return this.permissionService.directGlobal(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async directResourcePermissions(includeForbiddings: boolean = false) {
    return this.permissionService.directResource(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async containsPermission(permission: string) {
    const result = await this.permissionService.containsAny(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      [permission]
    )

    return result
  }

  async contains(permission: string) {
    return this.containsPermission(permission)
  }

  async containsAllPermissions(permissions: string[]) {
    const result = await this.permissionService.containsAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  containsAnyPermission(permissions: string[]) {
    return this.permissionService.containsAny(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )
  }

  containsDirectPermission(permission: string) {
    return this.permissionService.containsAnyDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      [permission]
    )
  }

  containsAllPermissionsDirectly(permissions: string[]) {
    return this.permissionService.containsAllDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )
  }

  async containsAnyPermissionDirectly(permissions: string[]) {
    return await this.permissionService.containsAnyDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )
  }

  /**
   * @param permission
   * @param target
   */
  async hasPermission(permission: string, target?: AclModel | Function) {
    return this.hasAnyPermission([permission], target)
  }

  /**
   *
   * @param permissions
   * @param target
   */
  async hasAllPermissions(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionService.hasAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async hasAnyPermission(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionService.hasAny(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async hasAnyDirectPermission(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionService.hasAnyDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async hasDirectPermission(permission: string, target?: AclModel | Function) {
    return this.hasAnyDirectPermission([permission], target)
  }

  async hasAllPermissionsDirect(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionService.hasAllDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  can(permission: string, target?: AclModel | Function) {
    return this.hasPermission(permission, target)
  }

  canAll(permissions: string[], target?: AclModel | Function) {
    return this.hasAllPermissions(permissions, target)
  }

  canAny(permissions: string[], target?: AclModel | Function) {
    return this.hasAnyPermission(permissions, target)
  }

  /**
   * calls assignDirectAllPermissions()
   * @param permission
   * @param target
   */
  async assignDirectPermission(permission: string, target?: AclModel | Function) {
    return this.assignDirectAllPermissions([permission], target)
  }

  /**
   *
   * @param permissions
   * @param target
   */
  async assignDirectAllPermissions(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    const assigned = await this.permissionService.giveAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId,
      true
    )

    this.fire(
      PermissionsAttachedToModelEvent,
      assigned.map((item) => item.permissionId),
      this.model
    )

    return assigned
  }

  /**
   * Assign permission to the model
   * calls assignDirectAllPermissions
   * @param permission
   * @param target
   */
  allow(permission: string, target?: AclModel | Function) {
    return this.allowAll([permission], target)
  }

  /**
   * Assign list of permissions to the model
   * calls assignDirectAllPermissions
   * @param permission
   * @param target
   */
  allowAll(permission: string[], target?: AclModel | Function) {
    return this.assignDirectAllPermissions(permission, target)
  }

  /**
   * Revoke permission from the model
   * calls revokeAllPermissions
   * @param permission
   * @param target
   */
  async revokePermission(permission: string, target?: AclModel | Function) {
    return this.revokeAllPermissions([permission], target)
  }

  /**
   * Revoke permission from the model
   * calls revokeAllPermissions
   * @param permission
   * @param target
   */
  async revoke(permission: string, target?: AclModel | Function) {
    return this.revokeAllPermissions([permission], target)
  }

  /**
   * Revoke list of permissions from the model
   * calls revokeAllPermissions
   * @param permissions
   * @param target
   */
  async revokeAll(permissions: string[], target?: AclModel | Function) {
    return this.revokeAllPermissions(permissions, target)
  }

  /**
   * @param permissions
   * @param target
   */
  async revokeAllPermissions(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    const revoked = this.permissionService.revokeAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )

    this.fire(PermissionsDetachedFromModelEvent, permissions, this.model)

    return revoked
  }

  async flushPermissions() {
    const flushed = await this.permissionService.flush(
      this.map.getAlias(this.model),
      this.model.getModelId()
    )
    if (flushed.length) {
      this.fire(PermissionsFlushedEvent, this.model)
    }

    return flushed
  }

  /**
   * @param permissions
   * @param target
   */
  async syncPermissions(permissions: string[], target?: AclModel | Function) {
    await this.flushPermissions()
    return this.allowAll(permissions, target)
  }

  async flush() {
    await this.flushPermissions()
    await this.roleService.flush(this.map.getAlias(this.model), this.model.getModelId())
    return true
  }

  /**
   * calls forbidAll
   * @param permission
   * @param target
   */
  async forbid(permission: string, target?: AclModel | Function) {
    return this.forbidAll([permission], target)
  }

  /**
   * @param permissions
   * @param target
   */
  async forbidAll(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    const forbade = await this.permissionService.forbidAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )

    this.fire(
      PermissionsForbadeEvent,
      forbade.map((item) => item.permissionId),
      this.model
    )
  }

  /**
   * @param permissions
   * @param target
   */
  async unforbidAll(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    const unforbade = await this.permissionService.unforbidAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )

    if (unforbade.length) {
      this.fire(
        PermissionsUnForbadeEvent,
        unforbade.map((item) => item.permissionId),
        this.model
      )
    }

    return unforbade
  }

  /**
   * @param permission
   * @param target
   */
  async unforbid(permission: string, target?: AclModel | Function) {
    return this.unforbidAll([permission], target)
  }

  // permissions related section END
}
