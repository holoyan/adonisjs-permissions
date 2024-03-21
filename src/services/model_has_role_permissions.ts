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

  async permissions(includeForbiddens: boolean = false) {
    const map = await morphMap()

    return this.permissionsService.all(
      map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddens
    )
  }

  async globalPermissions(includeForbiddens: boolean = false) {
    const map = await morphMap()
    return this.permissionsService.global(
      map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddens
    )
  }

  async onResourcePermissions(includeForbiddens: boolean = false) {
    const map = await morphMap()
    return this.permissionsService.onResource(
      map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddens
    )
  }

  async directGlobalPermissions(includeForbiddens: boolean = false) {
    const map = await morphMap()
    return this.permissionsService.directGlobal(
      map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddens
    )
  }

  async directResourcePermissions(includeForbiddens: boolean = false) {
    const map = await morphMap()
    return this.permissionsService.directResource(
      map.getAlias(this.model),
      this.model.getModelId(),
      includeForbiddens
    )
  }

  async containsPermission(permisison: string | Permission) {
    const map = await morphMap()
    const result = await this.permissionsService.containsAny(
      map.getAlias(this.model),
      this.model.getModelId(),
      [permisison]
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
    const result = await this.permissionsService.containsAnyDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      [permisison]
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

  async hasPermission(permisison: string | Permission, target?: AclModel | Function) {
    return this.hasAnyPermission([permisison], target)
  }

  async hasAllPermissions(permisisons: (string | Permission)[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionsService.hasAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  async hasAnyPermission(permisisons: (string | Permission)[], target?: AclModel | Function) {
    const map = await morphMap()

    const entity = await destructTarget(target)
    const result = await this.permissionsService.hasAny(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  async hasAnyDirectPermission(permisisons: (string | Permission)[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionsService.hasAnyDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  async hasDirectPermission(permisison: string | Permission, target?: AclModel | Function) {
    return this.hasAnyDirectPermission([permisison], target)
  }

  async hasAllPermissionsDirect(
    permisisons: (string | Permission)[],
    target?: AclModel | Function
  ) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionsService.hasAllDirect(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  can(permisison: string | Permission, target?: AclModel | Function) {
    return this.hasPermission(permisison, target)
  }

  canAll(permisisons: (string | Permission)[], target?: AclModel | Function) {
    return this.hasAllPermissions(permisisons, target)
  }

  canAny(permisisons: (string | Permission)[], target?: AclModel | Function) {
    return this.hasAnyPermission(permisisons, target)
  }

  async assignDirectPermission(permisison: string, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionsService.giveAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      [permisison],
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  allow(permisison: string, target?: AclModel | Function) {
    return this.assignDirectPermission(permisison, target)
  }

  async revokePermission(permisison: string, target?: AclModel | Function) {
    return this.revokeAllPermissions([permisison], target)
  }

  async revokeAllPermissions(permisisons: string[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    return this.permissionsService.revokeAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons,
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

  async forbid(permisison: string, target?: AclModel | Function) {
    return this.forbidAll([permisison], target)
  }

  async forbidAll(permisisons: string[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionsService.forbidAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons,
      entity.targetClass,
      entity.targetId
    )
  }

  async unforbidAll(permisisons: string[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionsService.unforbidAll(
      map.getAlias(this.model),
      this.model.getModelId(),
      permisisons,
      entity.targetClass,
      entity.targetId
    )
  }

  async unforbid(permisison: string, target?: AclModel | Function) {
    return this.unforbidAll([permisison], target)
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
