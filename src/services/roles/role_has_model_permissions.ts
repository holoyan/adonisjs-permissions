import { destructTarget } from '../helper.js'
import ModelService from '../model_service.js'
import PermissionsService from '../permissions/permissions_service.js'
import { AclModel, MorphInterface, RoleInterface, ScopeInterface } from '../../types.js'

export class RoleHasModelPermissions {
  constructor(
    private role: RoleInterface,
    private permissionService: PermissionsService,
    private modelService: ModelService,
    private map: MorphInterface,
    private scope: ScopeInterface
  ) {}

  on(scope: string) {
    this.scope.set(scope)
    return this
  }

  getScope() {
    return this.scope.get()
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

  assign(permission: string, target?: AclModel | Function) {
    return this.give(permission, target)
  }

  allow(permission: string, target?: AclModel | Function) {
    return this.give(permission, target)
  }

  async give(permission: string, target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    return this.permissionService.giveAll(
      this.map.getAlias(this.role),
      this.role.getModelId(),
      [permission],
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  async giveAll(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    return this.permissionService.giveAll(
      this.map.getAlias(this.role),
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

  allowAll(permissions: string[], target?: AclModel | Function) {
    return this.giveAll(permissions, target)
  }

  async revokePermission(permission: string) {
    return this.revoke(permission)
  }

  async revoke(permission: string) {
    return this.revokeAll([permission])
  }

  async revokeAll(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return this.permissionService.revokeAll(
      this.map.getAlias(this.role),
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
    return this.permissionService.flush(this.map.getAlias(this.role), this.role.getModelId())
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
