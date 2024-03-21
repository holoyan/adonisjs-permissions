import { RoleHasModelPermissions } from './services/roles/role_has_model_permissions.js'
import { ModelHasRolePermissions } from './services/model_has_role_permissions.js'
import PermissionsService from './services/permissions/permissions_service.js'
import RolesService from './services/roles/roles_service.js'
import { AclModel } from './types.js'
import Role from './models/role.js'
import Permission from './models/permission.js'
import PermissionHasModelRoles from './services/permissions/permission_has_model_roles.js'
import ModelService from './services/model_service.js'

export class Acl {
  static model(model: AclModel): ModelHasRolePermissions {
    return new ModelHasRolePermissions(model, new RolesService(), new PermissionsService())
  }

  static role(role: Role | null) {
    if (role) {
      return new RoleHasModelPermissions(role, new PermissionsService(), new ModelService())
    } else {
      return Role
    }
  }

  static permission(permisison: Permission | null) {
    if (permisison) {
      return new PermissionHasModelRoles(
        permisison,
        new RolesService(),
        new PermissionsService(),
        new ModelService()
      )
    } else {
      return Permission
    }
  }
}
