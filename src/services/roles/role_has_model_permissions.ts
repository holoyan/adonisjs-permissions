import { destructTarget } from '../helper.js'
import ModelService from '../models/model_service.js'
import PermissionService from '../permissions/permissions_service.js'
import { AclModel, MorphInterface, OptionsInterface, RoleInterface } from '../../types.js'
import BaseAdapter from '../base_adapter.js'
import ModelManager from '../../model_manager.js'
import { Scope } from '../../scope.js'
import { Emitter } from '@adonisjs/core/events'
import {
  PermissionsAttachedToRoleEvent,
  PermissionsDetachedFromRoleEvent,
  PermissionsFlushedFromRoleEvent,
} from '../../events/permissions/permissions.js'

export class RoleHasModelPermissions extends BaseAdapter {
  protected modelService: ModelService

  protected permissionService: PermissionService
  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface,
    protected scope: Scope,
    protected role: RoleInterface,
    protected emitter: Emitter<any>
  ) {
    super(manager, map, options, scope, emitter)

    const roleClass = manager.getModel('role')
    const modelPermission = manager.getModel('modelPermission')
    const modelRole = manager.getModel('modelRole')
    const permission = manager.getModel('permission')

    this.modelService = new ModelService(this.options, scope, modelPermission, modelRole, map)
    this.permissionService = new PermissionService(
      this.options,
      scope,
      permission,
      roleClass,
      modelPermission,
      modelRole,
      map
    )
  }

  models() {
    return this.modelService.all(+this.role.getModelId())
  }

  modelsFor(modelType: string) {
    return this.modelService.allFor(modelType, +this.role.getModelId())
  }

  // permissions related BEGIN

  async permissions() {
    // for roles direct and all permissions are same
    return this.permissionService.direct(this.map.getAlias(this.role), this.role.getModelId())
  }

  async globalPermissions() {
    return this.permissionService.directGlobal(this.map.getAlias(this.role), this.role.getModelId())
  }

  async onResourcePermissions() {
    return this.permissionService.directResource(
      this.map.getAlias(this.role),
      this.role.getModelId()
    )
  }

  async containsPermission(permission: string) {
    const result = await this.permissionService.containsAny(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      [permission]
    )

    return result
  }

  /**
   *
   * @param permissions
   * @returns
   */
  async containsAllPermissions(permissions: string[]) {
    const result = await this.permissionService.containsAll(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      permissions
    )

    return result
  }

  /**
   *
   * @param permissions
   * @returns
   */
  async containsAnyPermissions(permissions: string[]) {
    const result = await this.permissionService.containsAny(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      permissions
    )

    return result
  }

  async hasPermission(permission: string, target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    const result = await this.permissionService.hasAny(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      [permission],
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  /**
   *
   * @param permissions
   * @param target
   * @returns
   */
  async hasAllPermissions(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    const result = await this.permissionService.hasAll(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  /**
   *
   * @param permissions
   * @param target
   * @returns
   */
  async hasAnyPermissions(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    const result = await this.permissionService.hasAny(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  /**
   *
   * @param permission
   * @returns
   */
  can(permission: string) {
    return this.hasPermission(permission)
  }

  canAll(permissions: string[]) {
    return this.hasAllPermissions(permissions)
  }

  canAny(permissions: string[]) {
    return this.hasAnyPermissions(permissions)
  }

  async forbidden(permission: string, target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return this.permissionService.forbidden(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      permission,
      entity.targetClass,
      entity.targetId
    )
  }

  /**
   * calls giveAll()
   * @param permission
   * @param target
   */
  assign(permission: string, target?: AclModel | Function) {
    return this.giveAll([permission], target)
  }

  /**
   * calls giveAll()
   * @param permission
   * @param target
   */
  allow(permission: string, target?: AclModel | Function) {
    return this.giveAll([permission], target)
  }

  /**
   * calls giveAll()
   * @param permission
   * @param target
   */
  async give(permission: string, target?: AclModel | Function) {
    return this.giveAll([permission], target)
  }

  /**
   * @param permissions
   * @param target
   */
  async giveAll(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    const attached = await this.permissionService.giveAll(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId,
      true
    )

    if (attached.length > 0) {
      this.fire(
        PermissionsAttachedToRoleEvent,
        attached.map((item) => item.permissionId),
        this.role.getModelId()
      )
    }

    return attached
  }

  /**
   * calls giveAll()
   * @param permissions
   * @param target
   */
  assignAll(permissions: string[], target?: AclModel | Function) {
    return this.giveAll(permissions, target)
  }

  /**
   * calls giveAll()
   * @param permissions
   * @param target
   */
  allowAll(permissions: string[], target?: AclModel | Function) {
    return this.giveAll(permissions, target)
  }

  /**
   * calls revokeAll()
   * @param permission
   */
  async revokePermission(permission: string) {
    return this.revokeAll([permission])
  }

  /**
   * calls revokeAll()
   * @param permission
   */
  async revoke(permission: string) {
    return this.revokeAll([permission])
  }

  async revokeAll(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    const revoked = await this.permissionService.revokeAll(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )

    if (revoked.length > 0) {
      this.fire(PermissionsDetachedFromRoleEvent, permissions, this.role.getModelId())
    }
  }

  /**
   * calls revokeAll()
   * @param permissions
   */
  async revokeAllPermissions(permissions: string[]) {
    return this.revokeAll(permissions)
  }

  async flush() {
    const flushed = await this.permissionService.flush(
      this.map.getAlias(this.role),
      this.role.getModelId()
    )

    if (flushed.length > 0) {
      this.fire(PermissionsFlushedFromRoleEvent, this.role.getModelId())
    }
  }

  /**
   * Sync permissions with the given list
   * @param permissions - list of permissions
   * @param target
   */
  async sync(permissions: string[], target?: AclModel | Function) {
    await this.flush()
    return this.giveAll(permissions, target)
  }

  async forbid(permission: string, target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    return this.permissionService.forbid(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      permission,
      entity.targetClass,
      entity.targetId
    )
  }

  async unforbid(permission: string, target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return this.permissionService.unforbidAll(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      [permission],
      entity.targetClass,
      entity.targetId
    )
  }

  // permissions related END
}
