import Permission from '../../models/permission.js'
import Role from '../../models/role.js'
import { morphMap } from '../helper.js'
import ModelService from '../model_service.js'
import PermissionsService from '../permissions/permissions_service.js'

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
    const result = await this.permissionService.has(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisison
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
    const result = await this.permissionService.hasAll(
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
    const result = await this.permissionService.hasAny(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisisons
    )

    return result
  }

  async hasPermission(permisison: string | Permission) {
    const map = await morphMap()
    const result = await this.permissionService.has(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisison
    )

    return result
  }

  /**
   *
   * @param permisisons
   * @returns
   */
  async hasAllPermissions(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionService.hasAll(
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
  async hasAnyPermissions(permisisons: (string | Permission)[]) {
    const map = await morphMap()
    const result = await this.permissionService.hasAny(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisisons
    )

    return result
  }

  async allowed(permisison: string | Permission) {
    const map = await morphMap()
    return this.permissionService.allowed(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisison
    )
  }

  /**
   *
   * @param permisison
   * @returns
   */
  can(permisison: string | Permission) {
    return this.allowed(permisison)
  }

  async forbidden(permisison: string | Permission) {
    const map = await morphMap()
    return this.permissionService.forbidden(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisison
    )
  }

  assigne(permisison: string) {
    return this.give(permisison)
  }

  async give(permisison: string) {
    const map = await morphMap()
    const p = await this.permissionService.findBySlug(permisison, true)
    return this.permissionService.give(map.getAlias(this.role), this.role.getModelId(), p.id)
  }

  async revoke(permisison: string) {
    return this.revokeAll([permisison])
  }

  async revokeAll(permisison: string[]) {
    const map = await morphMap()
    return this.permissionService.revokeAll(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisison
    )
  }

  async flush() {
    const map = await morphMap()
    return this.permissionService.flush(map.getAlias(this.role), this.role.getModelId())
  }

  async forbid(permisison: string) {
    const map = await morphMap()
    return this.permissionService.forbid(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisison
    )
  }

  async unforbid(permisison: string) {
    const map = await morphMap()
    return this.permissionService.unforbid(
      map.getAlias(this.role),
      this.role.getModelId(),
      permisison
    )
  }

  // permissions related END
}
