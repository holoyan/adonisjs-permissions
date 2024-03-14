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
    // for roles direct(all) permissions are all for that model
    return this.permissionService.global(this.condition.modelType, this.condition.modelId)
  }

  onResourcePermissions() {
    return this.permissionService.onResource(this.condition.modelType, this.condition.modelId)
  }

  async hasPermission(permisison: string | Permission) {
    const result = await this.permissionService.has(
      this.condition.modelType,
      this.condition.modelId,
      permisison
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

  query() {
    return Role.query()
  }
}
