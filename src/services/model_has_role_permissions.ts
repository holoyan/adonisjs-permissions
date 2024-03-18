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

  async containsAllPermissions(permisisons: (string | Permission)[]) {
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

  async containsDirectPermission(permisison: string | Permission) {
    const result = await this.permissionsService.containsDirect(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisison
    )

    return result
  }

  async containsAllPermissionsDirectly(permisisons: (string | Permission)[]) {
    const result = await this.permissionsService.containsAllDirect(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async containsAnyPermissionDirectly(permisisons: (string | Permission)[]) {
    const result = await this.permissionsService.containsAnyDirect(
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

  async hasDirectPermission(permisison: string | Permission) {
    const result = await this.permissionsService.hasDirect(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisison
    )

    return result
  }

  async hasAllPermissionsDirect(permisisons: (string | Permission)[]) {
    const result = await this.permissionsService.hasAllDirect(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async hasAnyPermissionDirect(permisisons: (string | Permission)[]) {
    const result = await this.permissionsService.hasAnyDirect(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async assignePermission(permisison: string | Permission) {
    let permissionId
    if (typeof permisison === 'string') {
      const p = await Permission.query().where('slug', permisison).where('allowed', true).first()

      if (!p) {
        throw new Error('Permission not found')
      }
      permissionId = p.id
    } else {
      permissionId = permisison.id
    }

    return this.permissionsService.give(
      this.model.getMorphMapName(),
      this.model.getModelId(),
      permissionId
    )
  }

  // detachPermission(permisison: string | Permission) {
  //   // detach direct permission
  //   // detach from role if exists

  //   return this.permissionsService.reverseModelPermissionQuery({
  //     modelType: this.model.getMorphMapName(),
  //     modelId: this.model.getModelId(),
  //     directPermissions: false,
  //     permissionSlugs: typeof permisison === 'string' ? [permisison] : [permisison.slug],
  //     permissionIds: [],
  //   })
  // }

  // permissions related section BEGIN
}
