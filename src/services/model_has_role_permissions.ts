import { AclModel, MorphInterface, PermissionInterface, RoleInterface } from '../types.js'
import PermissionsService from './permissions/permissions_service.js'
import RolesService from './roles/roles_service.js'
import { destructTarget, formatList } from './helper.js'

export class ModelHasRolePermissions {
  constructor(
    private model: AclModel,
    private roleService: RolesService,
    private permissionsService: PermissionsService,
    private map: MorphInterface
  ) {}

  // roles related section BEGIN

  async roles() {
    return this.roleService.all(this.map.getAlias(this.model), this.model.getModelId())
  }

  async hasRole(role: string | RoleInterface) {
    return this.roleService.has(this.map.getAlias(this.model), this.model.getModelId(), role)
  }

  async hasAllRoles(roles: (string | RoleInterface)[]) {
    return this.roleService.hasAll(this.map.getAlias(this.model), this.model.getModelId(), roles)
  }

  async hasAnyRole(roles: (string | RoleInterface)[]) {
    return this.roleService.hasAll(this.map.getAlias(this.model), this.model.getModelId(), roles)
  }

  async assignRole(role: string | RoleInterface) {
    return this.roleService.assign(role, this.map.getAlias(this.model), this.model.getModelId())
  }

  revokeRole(role: string | number | RoleInterface) {
    return this.revokeAllRoles([role])
  }

  revokeAllRoles(roles: (string | number | RoleInterface)[]) {
    const { slugs, ids } = formatList(roles)

    return this.roleService.revokeAll([...slugs, ...ids], this.model)
  }

  // roles related section END

  // permissions related section BEGIN

  async permissions(includeForbiddings: boolean = false) {
    return this.permissionsService.all(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async globalPermissions(includeForbiddings: boolean = false) {
    return this.permissionsService.global(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async onResourcePermissions(includeForbiddings: boolean = false) {
    return this.permissionsService.onResource(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async directGlobalPermissions(includeForbiddings: boolean = false) {
    return this.permissionsService.directGlobal(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async directResourcePermissions(includeForbiddings: boolean = false) {
    return this.permissionsService.directResource(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async containsPermission(permission: string | PermissionInterface) {
    const result = await this.permissionsService.containsAny(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      [permission]
    )

    return result
  }

  async containsAllPermissions(permissions: (string | PermissionInterface)[]) {
    const result = await this.permissionsService.containsAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  async containsAnyPermission(permissions: (string | PermissionInterface)[]) {
    const result = await this.permissionsService.containsAny(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  async containsDirectPermission(permission: string | PermissionInterface) {
    const result = await this.permissionsService.containsAnyDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      [permission]
    )

    return result
  }

  async containsAllPermissionsDirectly(permissions: (string | PermissionInterface)[]) {
    const result = await this.permissionsService.containsAllDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  async containsAnyPermissionDirectly(permissions: (string | PermissionInterface)[]) {
    const result = await this.permissionsService.containsAnyDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  async hasPermission(permission: string | PermissionInterface, target?: AclModel | Function) {
    return this.hasAnyPermission([permission], target)
  }

  async hasAllPermissions(
    permissions: (string | PermissionInterface)[],
    target?: AclModel | Function
  ) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionsService.hasAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async hasAnyPermission(
    permissions: (string | PermissionInterface)[],
    target?: AclModel | Function
  ) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionsService.hasAny(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async hasAnyDirectPermission(
    permissions: (string | PermissionInterface)[],
    target?: AclModel | Function
  ) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionsService.hasAnyDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async hasDirectPermission(
    permission: string | PermissionInterface,
    target?: AclModel | Function
  ) {
    return this.hasAnyDirectPermission([permission], target)
  }

  async hasAllPermissionsDirect(
    permissions: (string | PermissionInterface)[],
    target?: AclModel | Function
  ) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionsService.hasAllDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  can(permission: string | PermissionInterface, target?: AclModel | Function) {
    return this.hasPermission(permission, target)
  }

  canAll(permissions: (string | PermissionInterface)[], target?: AclModel | Function) {
    return this.hasAllPermissions(permissions, target)
  }

  canAny(permissions: (string | PermissionInterface)[], target?: AclModel | Function) {
    return this.hasAnyPermission(permissions, target)
  }

  async assignDirectPermission(permission: string, target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    return this.permissionsService.giveAll(
      this.map.getAlias(this.model),
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
    const entity = await destructTarget(this.map, target)
    return this.permissionsService.revokeAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async flushPermissions() {
    return this.permissionsService.flush(this.map.getAlias(this.model), this.model.getModelId())
  }

  async flush() {
    await this.permissionsService.flush(this.map.getAlias(this.model), this.model.getModelId())
    await this.roleService.flush(this.map.getAlias(this.model), this.model.getModelId())
    return true
  }

  async forbid(permission: string, target?: AclModel | Function) {
    return this.forbidAll([permission], target)
  }

  async forbidAll(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    return this.permissionsService.forbidAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async unforbidAll(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    return this.permissionsService.unforbidAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async unforbid(permission: string, target?: AclModel | Function) {
    return this.unforbidAll([permission], target)
  }

  // detachPermission(permission: string | PermissionInterface) {
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
