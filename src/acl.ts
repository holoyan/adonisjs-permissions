import { RoleHasModelPermissions } from './services/roles/role_has_model_permissions.js'
import { ModelHasRolePermissions } from './services/model_has_role_permissions.js'
import PermissionsService from './services/permissions/permissions_service.js'
import RolesService from './services/roles/roles_service.js'
import { AclModel, MorphInterface, PermissionInterface, RoleInterface } from './types.js'
import PermissionHasModelRoles from './services/permissions/permission_has_model_roles.js'
import ModelService from './services/model_service.js'
import ModelManager from './model_manager.js'
import EmptyPermission from './services/permissions/empty_permission.js'
import EmptyRoles from './services/roles/empty_roles.js'

export class Acl {
  private static modelManager: ModelManager

  private static map: MorphInterface

  static setModelManager(manager: ModelManager) {
    this.modelManager = manager
  }

  static setMorphMap(map: MorphInterface) {
    this.map = map
  }

  static model(model: AclModel): ModelHasRolePermissions {
    return new ModelHasRolePermissions(
      model,
      new RolesService(
        this.modelManager.getModel('role'),
        this.modelManager.getModel('modelPermission'),
        this.modelManager.getModel('modelRole'),
        this.map
      ),
      new PermissionsService(
        this.modelManager.getModel('permission'),
        this.modelManager.getModel('role'),
        this.modelManager.getModel('modelPermission'),
        this.modelManager.getModel('modelRole'),
        this.map
      ),
      this.map
    )
  }

  static role(role?: RoleInterface) {
    if (role) {
      return new RoleHasModelPermissions(
        role,
        new PermissionsService(
          this.modelManager.getModel('permission'),
          this.modelManager.getModel('role'),
          this.modelManager.getModel('modelPermission'),
          this.modelManager.getModel('modelRole'),
          this.map
        ),
        new ModelService(
          this.modelManager.getModel('modelPermission'),
          this.modelManager.getModel('modelRole'),
          this.map
        ),
        this.map
      )
    } else {
      return new EmptyRoles(this.modelManager.getModel('role'))
    }
  }

  static permission(permission?: PermissionInterface) {
    if (permission) {
      return new PermissionHasModelRoles(
        permission,
        new RolesService(
          this.modelManager.getModel('role'),
          this.modelManager.getModel('modelPermission'),
          this.modelManager.getModel('modelRole'),
          this.map
        ),
        new PermissionsService(
          this.modelManager.getModel('permission'),
          this.modelManager.getModel('role'),
          this.modelManager.getModel('modelPermission'),
          this.modelManager.getModel('modelRole'),
          this.map
        ),
        new ModelService(
          this.modelManager.getModel('modelPermission'),
          this.modelManager.getModel('modelRole'),
          this.map
        ),
        this.modelManager.getModel('modelPermission'),
        this.modelManager.getModel('modelRole'),
        this.map
      )
    } else {
      return new EmptyPermission(this.modelManager.getModel('permission'))
    }
  }
}
