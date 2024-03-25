import Permission from '../../models/permission.js'
import Role from '../../models/role.js'
import { destructTarget, morphMap } from '../helper.js'
import ModelService from '../model_service.js'
import PermissionsService from '../permissions/permissions_service.js'
import { AclModel } from '../../types.js'

export class RoleHasModelPermissions {
  constructor(
    private role: Role,
    private permissionService: PermissionsService,
    private modelService: ModelService
  ) {}

  models() {
    return this.modelService.all(this.role.getModelId())
  }

  modelsFor(modelType: string) {
    return this.modelService.allFor(modelType, this.role.getModelId())
  }

  /**
   * todo
   * @param model
   */
  // attachTo(model: LucidModel) {}

  // permissions related BEGIN

  async permissions() {
    // for roles direct and all permissions are same
    const map = await morphMap()
    return this.permissionService.direct(map.getAlias(this.role), this.role.getModelId())
  }

  async globalPermissions() {
    const map = await morphMap()
    return this.permissionService.directGlobal(map.getAlias(this.role), this.role.getModelId())
  }

  async onResourcePermissions() {
    const map = await morphMap()
    return this.permissionService.directResource(map.getAlias(this.role), this.role.getModelId())
  }

  async containsPermission(permission: string | Permission) {
    const map = await morphMap()
    const result = await this.permissionService.containsAny(
      map.getAlias(this.role),
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
  async containsAllPermissions(permissions: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionService.containsAll(
      map.getAlias(this.role),
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
  async containsAnyPermissions(permissions: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionService.containsAny(
      map.getAlias(this.role),
      this.role.getModelId(),
      permissions
    )

    return result
  }

  async hasPermission(permission: string | Permission, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionService.hasAny(
      map.getAlias(this.role),
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
   * @returns
   */
  async hasAllPermissions(permissions: (string | Permission)[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionService.hasAll(
      map.getAlias(this.role),
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
   * @returns
   */
  async hasAnyPermissions(permissions: (string | Permission)[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionService.hasAny(
      map.getAlias(this.role),
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
  can(permission: string | Permission) {
    return this.hasPermission(permission)
  }

  canAll(permissions: (string | Permission)[]) {
    return this.hasAllPermissions(permissions)
  }

  canAny(permissions: (string | Permission)[]) {
    return this.hasAnyPermissions(permissions)
  }

  async forbidden(permission: string | Permission, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    return this.permissionService.forbidden(
      map.getAlias(this.role),
      this.role.getModelId(),
      permission,
      entity.targetClass,
      entity.targetId
    )
  }

  assign(permission: string, target?: AclModel | Function) {
    return this.give(permission, target)
  }

  async give(permission: string, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionService.giveAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      [permission],
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  async giveAll(permissions: string[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionService.giveAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  assingAll(permissions: string[], target?: AclModel | Function) {
    return this.giveAll(permissions, target)
  }

  async revokePermission(permission: string) {
    return this.revoke(permission)
  }

  async revoke(permission: string) {
    return this.revokeAll([permission])
  }

  async revokeAll(permissions: string[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    return this.permissionService.revokeAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async revokeAllPermissions(permissions: string[]) {
    return this.revokeAll(permissions)
  }

  async flush() {
    const map = await morphMap()
    return this.permissionService.flush(map.getAlias(this.role), this.role.getModelId())
  }

  async forbid(permission: string, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionService.forbid(
      map.getAlias(this.role),
      this.role.getModelId(),
      permission,
      entity.targetClass,
      entity.targetId
    )
  }

  async unforbid(permission: string, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    return this.permissionService.unforbidAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      [permission],
      entity.targetClass,
      entity.targetId
    )
  }

  // permissions related END
}
