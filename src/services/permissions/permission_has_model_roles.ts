import ModelPermission from '../../models/model_permission.js'
import Permission from '../../models/permission.js'
import Role from '../../models/role.js'

export default class PermissionHasModelRoles {
  constructor(private permission: Permission) {}

  roles() {
    return this.rolePermissionQuery().where('mp.permission_id', this.permission.id)
  }

  async belongsToRole(role: string | number) {
    const q = this.rolePermissionQuery().where('mp.permission_id', this.permission.id)
    if (typeof role === 'string') {
      q.where(Role.table + '.slug', role)
    } else {
      q.where(Role.table + '.id', role)
    }

    const r = await q.select(Role.table + '.id').limit(1)

    return r.length > 0
  }

  async attachToRole(role: string | number) {
    if (typeof role === 'string') {
      const r = await Role.query().where('slug', role).first()

      if (!r) {
        throw new Error('Role not found')
      }

      role = r.id
    }

    return ModelPermission.create({
      modelType: new Role().getMorphMapName(),
      modelId: role,
      permissionId: this.permission.id,
    })
  }

  async detachFromRole(role: string | number) {
    if (typeof role === 'string') {
      const r = await Role.query().where('slug', role).first()

      if (!r) {
        throw new Error('Role not found')
      }

      role = r.id
    }

    return ModelPermission.query()
      .where('model_type', new Role().getMorphMapName())
      .where('model_id', role)
      .delete()
  }

  private rolePermissionQuery() {
    return Role.query()
      .leftJoin(ModelPermission.table + ' as mp', 'mp.model_id', '=', Role.table + '.id')
      .where('mp.model_type', new Role().getMorphMapName())
  }
}
