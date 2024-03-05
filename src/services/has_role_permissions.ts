import Role from '../models/role.js'
import { AclModel } from '../types.js'
import PermissionsService from './permissions_service.js'
import RolesService from './roles_service.js'

export class HasRolePermissions {
  constructor(
    private model: AclModel,
    private roleService: RolesService,
    private permissionsService: PermissionsService
  ) {}

  // roles related section BEGIN

  roles() {
    return this.roleService.all(this.model.getMorphMapName(), this.model.getModelId())
  }

  hasRole(role: string | Role) {
    return this.roleService.has(this.model.getMorphMapName(), this.model.getModelId(), role)
  }

  hasAllRoles(roles: (string | Role)[]) {
    return this.roleService.hasAll(this.model.getMorphMapName(), this.model.getModelId(), roles)
  }

  hasAnyRole(roles: (string | Role)[]) {
    return this.roleService.hasAll(this.model.getMorphMapName(), this.model.getModelId(), roles)
  }

  assigneRole(role: string | Role) {
    return this.roleService.assigne(role, this.model)
  }

  revokeRole(role: string | Role) {
    return this.roleService.revoke(role, this.model)
  }

  // roles related section END

  permissions() {
    return this.permissionsService.all(this.model.getMorphMapName(), this.model.getModelId())
  }
}
