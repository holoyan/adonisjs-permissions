import { RoleHasModelPermissions } from './services/roles/role_has_model_permissions.js'
import { ModelHasRolePermissions } from './services/model_has_role_permissions.js'
import PermissionsService from './services/permissions/permissions_service.js'
import RolesService from './services/roles/roles_service.js'
import { AclModel, PermissionInterface, RoleInterface } from './types.js'
import PermissionHasModelRoles from './services/permissions/permission_has_model_roles.js'
import ModelService from './services/model_service.js'
import ModelManager from './model_manager.js'

export class Acl {
  private static modelManager: ModelManager

  static setModelManager(manager: ModelManager) {
    this.modelManager = manager
  }

  static model(model: AclModel): ModelHasRolePermissions {
    return new ModelHasRolePermissions(
      model,
      new RolesService(
        this.modelManager.getModel('role'),
        this.modelManager.getModel('modelPermission'),
        this.modelManager.getModel('modelRole')
      ),
      new PermissionsService(
        this.modelManager.getModel('permission'),
        this.modelManager.getModel('role'),
        this.modelManager.getModel('modelPermission'),
        this.modelManager.getModel('modelRole')
      )
    )
  }

  static role(role: RoleInterface | null) {
    if (role) {
      return new RoleHasModelPermissions(
        role,
        new PermissionsService(
          this.modelManager.getModel('permission'),
          this.modelManager.getModel('role'),
          this.modelManager.getModel('modelPermission'),
          this.modelManager.getModel('modelRole')
        ),
        new ModelService(
          this.modelManager.getModel('modelPermission'),
          this.modelManager.getModel('modelRole')
        )
      )
    } else {
      return this.modelManager.getModel('role')
    }
  }

  static permission(permission: PermissionInterface | null) {
    if (permission) {
      return new PermissionHasModelRoles(
        permission,
        new RolesService(
          this.modelManager.getModel('role'),
          this.modelManager.getModel('modelPermission'),
          this.modelManager.getModel('modelRole')
        ),
        new PermissionsService(
          this.modelManager.getModel('permission'),
          this.modelManager.getModel('role'),
          this.modelManager.getModel('modelPermission'),
          this.modelManager.getModel('modelRole')
        ),
        new ModelService(
          this.modelManager.getModel('modelPermission'),
          this.modelManager.getModel('modelRole')
        ),
        this.modelManager.getModel('modelPermission'),
        this.modelManager.getModel('modelRole')
      )
    } else {
      return this.modelManager.getModel('permission')
    }
  }
}
