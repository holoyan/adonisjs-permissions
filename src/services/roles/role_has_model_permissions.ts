import Permission from '../../models/permission.js'
import Role from '../../models/role.js'
import { destructTarget, morphMap } from '../helper.js'
import ModelService from '../model_service.js'
import PermissionsService from '../permissions/permissions_service.js'
import { AclModel } from '../../types.js'

export class RoleHasModelPermissions {
  constructor(
    private role: Role,
    private permissionService: PermissionsService,
    private modelService: ModelService
  ) {}

  models() {
    return this.modelService.all(this.role.getModelId())
  }

  modelsFor(modelType: string) {
    return this.modelService.allFor(modelType, this.role.getModelId())
  }

  /**
   * todo
   * @param model
   */
  // attachTo(model: LucidModel) {}

  // permissions related BEGIN

  async permissions() {
    // for roles direct and all permissions are same
    const map = await morphMap()
    return this.permissionService.direct(map.getAlias(this.role), this.role.getModelId())
  }

  async globalPermissions() {
    const map = await morphMap()
    return this.permissionService.directGlobal(map.getAlias(this.role), this.role.getModelId())
  }

  async onResourcePermissions() {
    const map = await morphMap()
    return this.permissionService.directResource(map.getAlias(this.role), this.role.getModelId())
  }

  async containsPermission(permisison: string | Permission) {
    const map = await morphMap()
    const result = await this.permissionService.containsAny(
      map.getAlias(this.role),
      this.role.getModelId(),
      [permisison]
    )

    return result
  }

  /**
   *
   * @param permisisons
   * @returns
   */
  async containsAllPermissions(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionService.containsAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisisons
    )

    return result
  }

  /**
   *
   * @param permisisons
   * @returns
   */
  async containsAnyPermissions(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionService.containsAny(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisisons
    )

    return result
  }

  async hasPermission(permisison: string | Permission, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionService.hasAny(
      map.getAlias(this.role),
      this.role.getModelId(),
      [permisison],
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  /**
   *
   * @param permisisons
   * @returns
   */
  async hasAllPermissions(permisisons: (string | Permission)[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionService.hasAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisisons,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  /**
   *
   * @param permisisons
   * @returns
   */
  async hasAnyPermissions(permisisons: (string | Permission)[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    const result = await this.permissionService.hasAny(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisisons,
      entity.targetClass,
      entity.targetId
    )

    return result
  }

  /**
   *
   * @param permisison
   * @returns
   */
  can(permisison: string | Permission) {
    return this.hasPermission(permisison)
  }

  canAll(permisisons: (string | Permission)[]) {
    return this.hasAllPermissions(permisisons)
  }

  canAny(permisisons: (string | Permission)[]) {
    return this.hasAnyPermissions(permisisons)
  }

  async forbidden(permisison: string | Permission, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    return this.permissionService.forbidden(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisison,
      entity.targetClass,
      entity.targetId
    )
  }

  assign(permisison: string, target?: AclModel | Function) {
    return this.give(permisison, target)
  }

  async give(permisison: string, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionService.giveAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      [permisison],
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  async giveAll(permisisons: string[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionService.giveAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisisons,
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  assingAll(permisisons: string[], target?: AclModel | Function) {
    return this.giveAll(permisisons, target)
  }

  async revokePermission(permisison: string) {
    return this.revoke(permisison)
  }

  async revoke(permisison: string) {
    return this.revokeAll([permisison])
  }

  async revokeAll(permisisons: string[], target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    return this.permissionService.revokeAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisisons,
      entity.targetClass,
      entity.targetId
    )
  }

  async revokeAllPermissions(permisisons: string[]) {
    return this.revokeAll(permisisons)
  }

  async flush() {
    const map = await morphMap()
    return this.permissionService.flush(map.getAlias(this.role), this.role.getModelId())
  }

  async forbid(permisison: string, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)

    return this.permissionService.forbid(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisison,
      entity.targetClass,
      entity.targetId
    )
  }

  async unforbid(permisison: string, target?: AclModel | Function) {
    const map = await morphMap()
    const entity = await destructTarget(target)
    return this.permissionService.unforbidAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      [permisison],
      entity.targetClass,
      entity.targetId
    )
  }

  // permissions related END
}
