import { RoleHasModelPermissions } from './services/role_has_model_permissions.js'
import { HasRolePermissions } from './services/has_role_permissions.js'
import PermissionsService from './services/permissions_service.js'
import RolesService from './services/roles_service.js'
import { AclModel } from './types.js'
import Role from './models/role.js'
import Permission from './models/permission.js'

export class Acl {
  static model(model: AclModel): HasRolePermissions {
    return new HasRolePermissions(model, new RolesService(), new PermissionsService())
  }

  static role(role: Role | null) {
    if (role) {
      return new RoleHasModelPermissions(role, new PermissionsService())
    } else {
      return Role.query()
    }
  }

  static permission(permisison: Permission | null) {
    if (permisison) {
    } else {
      return Permission.query()
    }
  }
}
