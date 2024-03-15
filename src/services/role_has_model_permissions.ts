import Permission from '../models/permission.js'
import Role from '../models/role.js'
import { AclModelQuery } from '../types.js'
import PermissionsService from './permissions_service.js'

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

  forbidden(permisison: string | Permission) {
    return this.permissionService.forbidden(
      this.condition.modelType,
      this.condition.modelId,
      permisison
    )
  }

  async assigne(permisison: number | string) {
    if (typeof permisison === 'string') {
      const p = await this.permissionService.findBySlug(permisison)
      permisison = p.id
    }
    return this.permissionService.give(this.condition.modelType, this.condition.modelId, permisison)
  }
}
