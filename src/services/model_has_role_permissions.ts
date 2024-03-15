import Permission from '../models/permission.js'
import Role from '../models/role.js'
import { AclModel } from '../types.js'
import PermissionsService from './permissions/permissions_service.js'
import RolesService from './roles/roles_service.js'

export class ModelHasRolePermissions {
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

  // permissions related section BEGIN

  permissions() {
    return this.permissionsService.all(this.model.getMorphMapName(), this.model.getModelId())
  }

  globalPermissions() {
    return this.permissionsService.global(this.model.getMorphMapName(), this.model.getModelId())
  }

  onResourcePermissions() {
    return this.permissionsService.onResource(this.model.getMorphMapName(), this.model.getModelId())
  }

  directGlobalPermissions() {
    return this.permissionsService.directGlobal(
      this.model.getMorphMapName(),
      this.model.getModelId()
    )
  }

  directResourcePermissions() {
    return this.permissionsService.directResource(
      this.model.getMorphMapName(),
      this.model.getModelId()
    )
  }

  async containsPermission(permisison: string | Permission) {
    const result = await this.permissionsService.contains(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisison
    )

    return result
  }

  async containsAllPermission(permisisons: (string | Permission)[]) {
    const result = await this.permissionsService.containsAll(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async containsAnyPermission(permisisons: (string | Permission)[]) {
    const result = await this.permissionsService.containsAny(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async hasPermission(permisison: string | Permission) {
    const result = await this.permissionsService.has(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisison
    )

    return result
  }

  async hasAllPermissions(permisisons: (string | Permission)[]) {
    const result = await this.permissionsService.hasAll(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async hasAnyPermission(permisisons: (string | Permission)[]) {
    const result = await this.permissionsService.hasAny(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  // permissions related section BEGIN
}
