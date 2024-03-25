import Permission from '../models/permission.js'
import Role from '../models/role.js'
import { AclModel } from '../types.js'
import PermissionsService from './permissions/permissions_service.js'
import RolesService from './roles/roles_service.js'
import { destructTarget, formatList, morphMap } from './helper.js'

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

  async assignRole(role: string | Role) {
    const map = await morphMap()
    return this.roleService.assign(role, map.getAlias(this.model), this.model.getModelId())
  }

  revokeRole(role: string | number | Role) {
    return this.revokeAllRoles([role])
  }

  revokeAllRoles(roles: (string | number | Role)[]) {
    const { slugs, ids } = formatList(roles)

    return this.roleService.revokeAll([...slugs, ...ids], this.model)
  }

  // roles related section END

  // permissions related section BEGIN

  async permissions(includeForbiddings: boolean = false) {
    const map = await morphMap()

    return this.permissionsService.all(
      map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async globalPermissions(includeForbiddings: boolean = false) {
    const map = await morphMap()
    return this.permissionsService.global(
      map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async onResourcePermissions(includeForbiddings: boolean = false) {
    const map = await morphMap()
    return this.permissionsService.onResource(
      map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async directGlobalPermissions(includeForbiddings: boolean = false) {
    const map = await morphMap()
    return this.permissionsService.directGlobal(
      map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async directResourcePermissions(includeForbiddings: boolean = false) {
    const map = await morphMap()
    return this.permissionsService.directResource(
      map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async containsPermission(permission: string | Permission) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAny(
      map.getAlias(this.model),
      this.model.getModelId(),
      [permission]
    )

    return result
  }

  async containsAllPermissions(permissions: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  async containsAnyPermission(permissions: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAny(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  async containsDirectPermission(permission: string | Permission) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAnyDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      [permission]
    )

    return result
  }

  async containsAllPermissionsDirectly(permissions: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAllDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  async containsAnyPermissionDirectly(permissions: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAnyDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  async hasPermission(permission: string | Permission, target?: AclModel | Function) {
    return this.hasAnyPermission([permission], target)
  }

  async hasAllPermissions(permissions: (string | Permission)[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionsService.hasAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  async hasAnyPermission(permissions: (string | Permission)[], target?: AclModel | Function) {
    const map = await morphMap()

    const entity = await destructTarget(target)
    const result = await this.permissionsService.hasAny(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  async hasAnyDirectPermission(permissions: (string | Permission)[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionsService.hasAnyDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  async hasDirectPermission(permission: string | Permission, target?: AclModel | Function) {
    return this.hasAnyDirectPermission([permission], target)
  }

  async hasAllPermissionsDirect(
    permissions: (string | Permission)[],
    target?: AclModel | Function
  ) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionsService.hasAllDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  can(permission: string | Permission, target?: AclModel | Function) {
    return this.hasPermission(permission, target)
  }

  canAll(permissions: (string | Permission)[], target?: AclModel | Function) {
    return this.hasAllPermissions(permissions, target)
  }

  canAny(permissions: (string | Permission)[], target?: AclModel | Function) {
    return this.hasAnyPermission(permissions, target)
  }

  async assignDirectPermission(permission: string, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionsService.giveAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      [permission],
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  allow(permission: string, target?: AclModel | Function) {
    return this.assignDirectPermission(permission, target)
  }

  async revokePermission(permission: string, target?: AclModel | Function) {
    return this.revokeAllPermissions([permission], target)
  }

  async revokeAllPermissions(permissions: string[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    return this.permissionsService.revokeAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async flushPermissions() {
    const map = await morphMap()
    return this.permissionsService.flush(map.getAlias(this.model), this.model.getModelId())
  }

  async flush() {
    const map = await morphMap()
    await this.permissionsService.flush(map.getAlias(this.model), this.model.getModelId())
    await this.roleService.flush(map.getAlias(this.model), this.model.getModelId())
    return true
  }

  async forbid(permission: string, target?: AclModel | Function) {
    return this.forbidAll([permission], target)
  }

  async forbidAll(permissions: string[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionsService.forbidAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async unforbidAll(permissions: string[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionsService.unforbidAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async unforbid(permission: string, target?: AclModel | Function) {
    return this.unforbidAll([permission], target)
  }

  // detachPermission(permission: string | Permission) {
  //   // detach direct permission
  //   // detach from role if exists

  //   return this.permissionsService.reverseModelPermissionQuery({
  //     modelType: this.model.getMorphMapName(),
  //     modelId: this.model.getModelId(),
  //     directPermissions: false,
  //     permissionSlugs: typeof permission === 'string' ? [permission] : [permission.slug],
  //     permissionIds: [],
  //   })
  // }

  // permissions related section BEGIN
}
