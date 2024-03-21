import ModelPermission from '../../models/model_permission.js'
import Permission from '../../models/permission.js'
import Role from '../../models/role.js'
import { AclModel } from '../../types.js'
import { destructTarget, morphMap } from '../helper.js'
import ModelService from '../model_service.js'
import RolesService from '../roles/roles_service.js'
import PermissionsService from './permissions_service.js'

export default class PermissionHasModelRoles {
  constructor(
    private permission: Permission,
    private roleService: RolesService,
    private permissionService: PermissionsService,
    private modelService: ModelService
  ) {}

  models() {
    return this.modelService.allByPermission(this.permission.getModelId())
  }

  modelsFor(modelType: string) {
    return this.modelService.allByPermissionFor(modelType, this.permission.getModelId())
  }

  async roles() {
    const map = await morphMap()
    return this.roleService
      .roleModelPermissionQuery(map.getAlias(Role))
      .where('mp.permission_id', this.permission.id)
  }

  async belongsToRole(role: string | number) {
    const map = await morphMap()
    const q = this.roleService
      .roleModelPermissionQuery(map.getAlias(Role))
      .where('mp.permission_id', this.permission.id)
    if (typeof role === 'string') {
      q.where(Role.table + '.slug', role)
    } else {
      q.where(Role.table + '.id', role)
    }

    const r = await q.select(Role.table + '.id').limit(1)

    return r.length > 0
  }

  async attachToRole(role: string | number, target?: AclModel | Function) {
    if (typeof role === 'string') {
      const r = await Role.query().where('slug', role).first()

      if (!r) {
        throw new Error('Role not found')
      }

      role = r.id
    }
    const map = await morphMap()
    const entity = await destructTarget(target)
    return this.permissionService.giveAll(
      map.getAlias(Role),
      role,
      [this.permission.slug],
      entity.targetClass,
      entity.targetId,
      true
    )
  }

  async detachFromRole(role: string | number) {
    if (typeof role === 'string') {
      const r = await Role.query().where('slug', role).first()

      if (!r) {
        throw new Error('Role not found')
      }

      role = r.id
    }

    const map = await morphMap()
    return ModelPermission.query()
      .where('model_type', map.getAlias(Role))
      .where('model_id', role)
      .delete()
  }
}
