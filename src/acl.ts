import { HasRolePermissions } from './services/has_role_permissions.js'
import PermissionsService from './services/permissions_service.js'
import RolesService from './services/roles_service.js'
import { AclModel } from './types.js'

export class Acl {
  static model(model: AclModel): HasRolePermissions {
    return new HasRolePermissions(model, new RolesService(), new PermissionsService())
  }
}
