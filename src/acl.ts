import { RoleHasModelPermissions } from './services/roles/role_has_model_permissions.js'
import { ModelHasRolePermissions } from './services/models/model_has_role_permissions.js'
import {
  AclModel,
  MorphInterface,
  OptionsInterface,
  PermissionInterface,
  RoleInterface,
  ScopeInterface,
} from './types.js'
import PermissionHasModelRoles from './services/permissions/permission_has_model_roles.js'
import ModelManager from './model_manager.js'
import EmptyPermission from './services/permissions/empty_permission.js'
import EmptyRoles from './services/roles/empty_roles.js'
import { Scope } from './scope.js'

export class AclManager {
  private static modelManager: ModelManager

  private static map: MorphInterface

  static setModelManager(manager: ModelManager) {
    this.modelManager = manager
  }

  static setMorphMap(map: MorphInterface) {
    this.map = map
  }

  private allowOptionsRewriting: boolean

  private options: OptionsInterface = {}

  constructor(allowOptionsRewriting: boolean, defaultOptions?: OptionsInterface) {
    this.allowOptionsRewriting = allowOptionsRewriting
    // default global scope
    this.options['scope'] = this.createNewScope()
    if (defaultOptions) {
      this.options = { ...this.options, ...defaultOptions }
    }
  }

  model(model: AclModel): ModelHasRolePermissions {
    return new ModelHasRolePermissions(
      AclManager.modelManager,
      AclManager.map,
      { ...this.options },
      model
    )
  }

  role(): EmptyRoles
  role(role: RoleInterface): RoleHasModelPermissions
  role(role?: RoleInterface): RoleHasModelPermissions | EmptyRoles {
    if (role) {
      return new RoleHasModelPermissions(
        AclManager.modelManager,
        AclManager.map,
        { ...this.options },
        role
      )
    }

    return new EmptyRoles(AclManager.modelManager, AclManager.map, { ...this.options })
  }

  permission(): EmptyPermission
  permission(permission: PermissionInterface): EmptyPermission
  permission(permission?: PermissionInterface): PermissionHasModelRoles | EmptyPermission {
    if (permission) {
      return new PermissionHasModelRoles(
        AclManager.modelManager,
        AclManager.map,
        { ...this.options },
        permission
      )
    }

    return new EmptyPermission(AclManager.modelManager, AclManager.map, { ...this.options })
  }

  private createNewScope(): string {
    const ScopeClass = AclManager.modelManager.getModel('scope')
    return new ScopeClass().get()
  }

  /**
   * changing global options
   * @param options
   * @param forceUpdate
   */
  withOptions(options: OptionsInterface, forceUpdate: boolean = false) {
    if (!this.allowOptionsRewriting && !forceUpdate) {
      throw new Error(
        'withOptions method call is not available on global Acl object, use AclManager to create new object or use forceUpdate=true'
      )
    }

    this.options = { ...this.options, ...options }
    return this
  }

  /**
   * @param scope
   * @param forceUpdate
   */
  scope(scope: ScopeInterface, forceUpdate: boolean = false) {
    if (!this.allowOptionsRewriting && !forceUpdate) {
      throw new Error(
        'Scope method call is not available on global Acl object, use AclManager to create new scoped object or use forceUpdate=true'
      )
    }

    this.withOptions(
      {
        scope: scope.get(),
      },
      forceUpdate
    )
    return this
  }

  getScope() {
    return this.options['scope']
  }
}

const modelManager = new ModelManager()
modelManager.setModel('scope', Scope)
AclManager.setModelManager(modelManager)

export const Acl = new AclManager(false)
