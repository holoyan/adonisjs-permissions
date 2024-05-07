import { RoleHasModelPermissions } from './services/roles/role_has_model_permissions.js'
import { ModelHasRolePermissions } from './services/model_has_role_permissions.js'
import PermissionsService from './services/permissions/permissions_service.js'
import RolesService from './services/roles/roles_service.js'
import {
  AclModel,
  MorphInterface,
  PermissionInterface,
  RoleInterface,
  ScopeInterface,
} from './types.js'
import PermissionHasModelRoles from './services/permissions/permission_has_model_roles.js'
import ModelService from './services/model_service.js'
import ModelManager from './model_manager.js'
import EmptyPermission from './services/permissions/empty_permission.js'
import EmptyRoles from './services/roles/empty_roles.js'

export class AclManager {
  private static modelManager: ModelManager

  private static map: MorphInterface

  static setModelManager(manager: ModelManager) {
    this.modelManager = manager
  }

  static setMorphMap(map: MorphInterface) {
    this.map = map
  }

  private _scope?: ScopeInterface

  private allowScopeRewriting = true

  constructor(allowScopeRewriting?: boolean) {
    if (allowScopeRewriting !== undefined) {
      this.allowScopeRewriting = allowScopeRewriting
    }
  }

  model(model: AclModel): ModelHasRolePermissions {
    const scope = this.getScope()
    const role = AclManager.modelManager.getModel('role')
    const modelPermission = AclManager.modelManager.getModel('modelPermission')
    const modelRole = AclManager.modelManager.getModel('modelRole')

    return new ModelHasRolePermissions(
      model,
      new RolesService(role, modelPermission, modelRole, AclManager.map, scope),
      new PermissionsService(
        AclManager.modelManager.getModel('permission'),
        role,
        modelPermission,
        modelRole,
        AclManager.map,
        scope
      ),
      AclManager.map,
      scope
    )
  }

  role(): EmptyRoles
  role(role: RoleInterface): RoleHasModelPermissions
  role(role?: RoleInterface): RoleHasModelPermissions | EmptyRoles {
    const scope = this.getScope()

    const roleClass = AclManager.modelManager.getModel('role')
    const modelPermission = AclManager.modelManager.getModel('modelPermission')
    const modelRole = AclManager.modelManager.getModel('modelRole')

    if (role) {
      return new RoleHasModelPermissions(
        role,
        new PermissionsService(
          AclManager.modelManager.getModel('permission'),
          roleClass,
          modelPermission,
          modelRole,
          AclManager.map,
          scope
        ),
        new ModelService(modelPermission, modelRole, AclManager.map),
        AclManager.map,
        scope
      )
    }

    return new EmptyRoles(roleClass, scope)
  }

  permission(): EmptyPermission
  permission(permission: PermissionInterface): EmptyPermission
  permission(permission?: PermissionInterface): PermissionHasModelRoles | EmptyPermission {
    const scope = this.getScope()

    const roleClass = AclManager.modelManager.getModel('role')
    const modelPermission = AclManager.modelManager.getModel('modelPermission')
    const modelRole = AclManager.modelManager.getModel('modelRole')

    if (permission) {
      return new PermissionHasModelRoles(
        permission,
        new RolesService(roleClass, modelPermission, modelRole, AclManager.map, scope),
        new PermissionsService(
          AclManager.modelManager.getModel('permission'),
          roleClass,
          modelPermission,
          modelRole,
          AclManager.map,
          scope
        ),
        new ModelService(modelPermission, modelRole, AclManager.map),
        modelPermission,
        modelRole,
        AclManager.map,
        scope
      )
    }

    return new EmptyPermission(AclManager.modelManager.getModel('permission'), scope)
  }

  private createNewScope(): ScopeInterface {
    const ScopeClass = AclManager.modelManager.getModel('scope')
    return new ScopeClass()
  }

  scope(scope: ScopeInterface, forceUpdate: boolean = false) {
    if (!this.allowScopeRewriting && !forceUpdate) {
      throw new Error(
        'Scope method call is not available on global Acl object, use AclManager to create new scoped object or use forceUpdate=true'
      )
    }

    this._scope = scope
    return this
  }

  getScope() {
    return this._scope || this.createNewScope()
  }
}

export const Acl = new AclManager(false)
