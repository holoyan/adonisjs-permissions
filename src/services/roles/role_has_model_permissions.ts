import Permission from '../../models/permission.js'
import Role from '../../models/role.js'
import { AclModelQuery } from '../../types.js'
import PermissionsService from '../permissions/permissions_service.js'

export class RoleHasModelPermissions {
  private condition: AclModelQuery

  constructor(
    private role: Role,
    private permissionService: PermissionsService
  ) {
    this.condition = {
      modelType: this.role.getMorphMapName(),
      modelId: this.role.getModelId(),
    }
  }

  models() {}

  // permissions related BEGIN

  permissions() {
    // for roles direct and all permissions are same
    return this.permissionService.direct(this.condition.modelType, this.condition.modelId)
  }

  globalPermissions() {
    return this.permissionService.directGlobal(this.condition.modelType, this.condition.modelId)
  }

  onResourcePermissions() {
    return this.permissionService.directResource(this.condition.modelType, this.condition.modelId)
  }

  async containsPermission(permisison: string | Permission) {
    const result = await this.permissionService.has(
      this.condition.modelType,
      this.condition.modelId,
      permisison
    )

    return result
  }

  /**
   *
   * @param permisisons
   * @returns
   */
  async containsAllPermissions(permisisons: (string | Permission)[]) {
    const result = await this.permissionService.hasAll(
      this.condition.modelType,
      this.condition.modelId,
      permisisons
    )

    return result
  }

  /**
   *
   * @param permisisons
   * @returns
   */
  async containsAnyPermissions(permisisons: (string | Permission)[]) {
    const result = await this.permissionService.hasAny(
      this.condition.modelType,
      this.condition.modelId,
      permisisons
    )

    return result
  }

  async hasPermission(permisison: string | Permission) {
    const result = await this.permissionService.has(
      this.condition.modelType,
      this.condition.modelId,
      permisison
    )

    return result
  }

  /**
   *
   * @param permisisons
   * @returns
   */
  async hasAllPermissions(permisisons: (string | Permission)[]) {
    const result = await this.permissionService.hasAll(
      this.condition.modelType,
      this.condition.modelId,
      permisisons
    )

    return result
  }

  /**
   *
   * @param permisisons
   * @returns
   */
  async hasAnyPermissions(permisisons: (string | Permission)[]) {
    const result = await this.permissionService.hasAny(
      this.condition.modelType,
      this.condition.modelId,
      permisisons
    )

    return result
  }

  allowed(permisison: string | Permission) {
    return this.permissionService.allowed(
      this.condition.modelType,
      this.condition.modelId,
      permisison
    )
  }

  /**
   *
   * @param permisison
   * @returns
   */
  can(permisison: string | Permission) {
    return this.allowed(permisison)
  }

  forbidden(permisison: string | Permission) {
    return this.permissionService.forbidden(
      this.condition.modelType,
      this.condition.modelId,
      permisison
    )
  }

  async assigne(permisison: string) {
    const p = await this.permissionService.findBySlug(permisison)
    return this.permissionService.give(this.condition.modelType, this.condition.modelId, p.id)
  }

  revoke(permisison: string) {
    return this.permissionService.unforbid(
      this.condition.modelType,
      this.condition.modelId,
      permisison
    )
  }

  // permissions related END
}
