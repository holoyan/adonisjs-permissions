import Permission from '../models/permission.js'
import Role from '../models/role.js'
import { AclModel } from '../types.js'
import PermissionsService from './permissions/permissions_service.js'
import RolesService from './roles/roles_service.js'
import { morphMap } from './helper.js'

export class ModelHasRolePermissions {
  constructor(
    private model: AclModel,
    private roleService: RolesService,
    private permissionsService: PermissionsService
  ) {}

  // roles related section BEGIN

  async roles() {
    const map = await morphMap()
    return this.roleService.all(map.getAlias(this.model), this.model.getModelId())
  }

  async hasRole(role: string | Role) {
    const map = await morphMap()
    return this.roleService.has(map.getAlias(this.model), this.model.getModelId(), role)
  }

  async hasAllRoles(roles: (string | Role)[]) {
    const map = await morphMap()
    return this.roleService.hasAll(map.getAlias(this.model), this.model.getModelId(), roles)
  }

  async hasAnyRole(roles: (string | Role)[]) {
    const map = await morphMap()
    return this.roleService.hasAll(map.getAlias(this.model), this.model.getModelId(), roles)
  }

  async assigneRole(role: string | Role) {
    const map = await morphMap()
    return this.roleService.assigne(role, map.getAlias(this.model), this.model.getModelId())
  }

  revokeRole(role: string | Role) {
    return this.roleService.revoke(role, this.model)
  }

  // roles related section END

  // permissions related section BEGIN

  async permissions() {
    const map = await morphMap()
    return this.permissionsService.all(map.getAlias(this.model), this.model.getModelId())
  }

  async globalPermissions() {
    const map = await morphMap()
    return this.permissionsService.global(map.getAlias(this.model), this.model.getModelId())
  }

  async onResourcePermissions() {
    const map = await morphMap()
    return this.permissionsService.onResource(map.getAlias(this.model), this.model.getModelId())
  }

  async directGlobalPermissions() {
    const map = await morphMap()
    return this.permissionsService.directGlobal(map.getAlias(this.model), this.model.getModelId())
  }

  async directResourcePermissions() {
    const map = await morphMap()
    return this.permissionsService.directResource(map.getAlias(this.model), this.model.getModelId())
  }

  async containsPermission(permisison: string | Permission) {
    const map = await morphMap()
    const result = await this.permissionsService.contains(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisison
    )

    return result
  }

  async containsAllPermissions(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async containsAnyPermission(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAny(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async containsDirectPermission(permisison: string | Permission) {
    const map = await morphMap()
    const result = await this.permissionsService.containsDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisison
    )

    return result
  }

  async containsAllPermissionsDirectly(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAllDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async containsAnyPermissionDirectly(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAnyDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async hasPermission(permisison: string | Permission) {
    const map = await morphMap()
    const result = await this.permissionsService.has(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisison
    )

    return result
  }

  async hasAllPermissions(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.hasAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async hasAnyPermission(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.hasAny(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async hasDirectPermission(permisison: string | Permission) {
    const map = await morphMap()
    const result = await this.permissionsService.hasDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisison
    )

    return result
  }

  async hasAllPermissionsDirect(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.hasAllDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async hasAnyPermissionDirect(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.hasAnyDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons
    )

    return result
  }

  async assigneDirectPermission(permisison: string | Permission) {
    const map = await morphMap()
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
      map.getAlias(this.model),
      this.model.getModelId(),
      permissionId
    )
  }

  async revokeDirectPermission(permisison: string | Permission) {
    const map = await morphMap()
    permisison = typeof permisison === 'string' ? permisison : permisison.slug
    return this.permissionsService.revokeAll(map.getAlias(this.model), this.model.getModelId(), [
      permisison,
    ])
  }

  async revokeAllDirectPermission(permisisons: string[]) {
    const map = await morphMap()
    return this.permissionsService.revokeAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons
    )
  }

  async flushDirectPermission() {
    const map = await morphMap()
    return this.permissionsService.flush(map.getAlias(this.model), this.model.getModelId())
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
