import { AclModel, MorphInterface, OptionsInterface } from '../../types.js'
import RolesService from '../roles/roles_service.js'
import { destructTarget, formatList } from '../helper.js'
import BaseAdapter from '../base_adapter.js'
import ModelManager from '../../model_manager.js'
import PermissionService from '../permissions/permissions_service.js'

export class ModelHasRolePermissions extends BaseAdapter {
  protected roleService: RolesService

  protected permissionService: PermissionService

  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface,
    private model: AclModel
  ) {
    super(manager, map, options)

    const role = manager.getModel('role')
    const modelPermission = manager.getModel('modelPermission')
    const modelRole = manager.getModel('modelRole')

    this.roleService = new RolesService(this.options, role, modelPermission, modelRole, map)

    this.permissionService = new PermissionService(
      this.options,
      manager.getModel('permission'),
      role,
      modelPermission,
      modelRole,
      map
    )
  }

  // roles related section BEGIN

  roles() {
    return this.roleService.all(this.map.getAlias(this.model), this.model.getModelId())
  }

  hasRole(role: string) {
    return this.roleService.has(this.map.getAlias(this.model), this.model.getModelId(), role)
  }

  hasAllRoles(...roles: string[]) {
    return this.roleService.hasAll(this.map.getAlias(this.model), this.model.getModelId(), roles)
  }

  hasAnyRole(...roles: string[]) {
    return this.roleService.hasAny(this.map.getAlias(this.model), this.model.getModelId(), roles)
  }

  assignRole(role: string) {
    return this.roleService.assign(role, this.map.getAlias(this.model), this.model.getModelId())
  }

  assign(role: string) {
    return this.assignRole(role)
  }

  assignAllRoles(...roles: string[]) {
    return this.roleService.assignAll(roles, this.map.getAlias(this.model), this.model.getModelId())
  }

  revokeRole(role: string) {
    return this.revokeAllRoles(role)
  }

  revokeAllRoles(...roles: string[]) {
    const { slugs } = formatList(roles)

    return this.roleService.revokeAll(slugs, this.model)
  }

  flushRoles() {
    return this.roleService.flush(this.map.getAlias(this.model), this.model.getModelId())
  }

  /**
   * Sync roles with the model  (detach all roles and assign new roles)
   * @param roles  - array of roles
   * @param detach - if true, it will detach the existing roles
   */
  async syncRoles(roles: string[], detach: boolean = true) {
    if (detach) {
      await this.flushRoles()
    }

    return this.assignAllRoles(...roles)
  }

  /**
   * Sync roles with the model without detaching the existing ones
   * @param roles
   */
  syncRolesWithoutDetaching(roles: string[]) {
    return this.syncRoles(roles, false)
  }

  // roles related section END

  // permissions related section BEGIN

  async permissions(includeForbiddings: boolean = false) {
    return this.permissionService.all(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  /**
   * returns list of global permissions assigned to the model
   * @param includeForbiddings
   */
  async globalPermissions(includeForbiddings: boolean = false) {
    return this.permissionService.global(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  /**
   * @param includeForbiddings
   */
  async onResourcePermissions(includeForbiddings: boolean = false) {
    return this.permissionService.onResource(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  directPermissions(includeForbiddings: boolean = false) {
    return this.permissionService.direct(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  /**
   * Get permission through roles
   * @param includeForbiddings
   */
  rolePermissions(includeForbiddings: boolean = false) {
    return this.permissionService.throughRoles(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async directGlobalPermissions(includeForbiddings: boolean = false) {
    return this.permissionService.directGlobal(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async directResourcePermissions(includeForbiddings: boolean = false) {
    return this.permissionService.directResource(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddings
    )
  }

  async containsPermission(permission: string) {
    const result = await this.permissionService.containsAny(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      [permission]
    )

    return result
  }

  async contains(permission: string) {
    return this.containsPermission(permission)
  }

  async containsAllPermissions(permissions: string[]) {
    const result = await this.permissionService.containsAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  async containsAnyPermission(permissions: string[]) {
    const result = await this.permissionService.containsAny(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  async containsDirectPermission(permission: string) {
    const result = await this.permissionService.containsAnyDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      [permission]
    )

    return result
  }

  containsAllPermissionsDirectly(permissions: string[]) {
    return this.permissionService.containsAllDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )
  }

  async containsAnyPermissionDirectly(permissions: string[]) {
    const result = await this.permissionService.containsAnyDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions
    )

    return result
  }

  /**
   * @param permission
   * @param target
   */
  async hasPermission(permission: string, target?: AclModel | Function) {
    return this.hasAnyPermission([permission], target)
  }

  /**
   *
   * @param permissions
   * @param target
   */
  async hasAllPermissions(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionService.hasAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async hasAnyPermission(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionService.hasAny(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async hasAnyDirectPermission(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionService.hasAnyDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async hasDirectPermission(permission: string, target?: AclModel | Function) {
    return this.hasAnyDirectPermission([permission], target)
  }

  async hasAllPermissionsDirect(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return await this.permissionService.hasAllDirect(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  can(permission: string, target?: AclModel | Function) {
    return this.hasPermission(permission, target)
  }

  canAll(permissions: string[], target?: AclModel | Function) {
    return this.hasAllPermissions(permissions, target)
  }

  canAny(permissions: string[], target?: AclModel | Function) {
    return this.hasAnyPermission(permissions, target)
  }

  async assignDirectPermission(permission: string, target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    return this.permissionService.giveAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      [permission],
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  async assignDirectAllPermissions(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    return this.permissionService.giveAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  allow(permission: string, target?: AclModel | Function) {
    return this.allowAll([permission], target)
  }

  allowAll(permission: string[], target?: AclModel | Function) {
    return this.assignDirectAllPermissions(permission, target)
  }

  async revokePermission(permission: string, target?: AclModel | Function) {
    return this.revokeAllPermissions([permission], target)
  }

  async revoke(permission: string, target?: AclModel | Function) {
    return this.revokeAllPermissions([permission], target)
  }

  async revokeAll(permissions: string[], target?: AclModel | Function) {
    return this.revokeAllPermissions(permissions, target)
  }

  async revokeAllPermissions(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)
    return this.permissionService.revokeAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async flushPermissions() {
    return this.permissionService.flush(this.map.getAlias(this.model), this.model.getModelId())
  }

  async syncPermissions(permissions: string[], target?: AclModel | Function) {
    await this.flushPermissions()
    return this.allowAll(permissions, target)
  }

  async flush() {
    await this.permissionService.flush(this.map.getAlias(this.model), this.model.getModelId())
    await this.roleService.flush(this.map.getAlias(this.model), this.model.getModelId())
    return true
  }

  async forbid(permission: string, target?: AclModel | Function) {
    return this.forbidAll([permission], target)
  }

  async forbidAll(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    return this.permissionService.forbidAll(
      this.map.getAlias(this.model),
      this.model.getModelId(),
      permissions,
      entity.targetClass,
      entity.targetId
    )
  }

  async unforbidAll(permissions: string[], target?: AclModel | Function) {
    const entity = await destructTarget(this.map, target)

    return this.permissionService.unforbidAll(
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

  // detachPermission(permission: string) {
  //   // detach direct permission
  //   // detach from role if exists

  //   return this.permissionService.reverseModelPermissionQuery({
  //     modelType: this.model.getMorphMapName(),
  //     modelId: this.model.getModelId(),
  //     directPermissions: false,
  //     permissionSlugs: typeof permission === 'string' ? [permission] : [permission.slug],
  //     permissionIds: [],
  //   })
  // }

  // permissions related section BEGIN
}
