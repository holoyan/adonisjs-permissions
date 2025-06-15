import { RoleHasModelPermissions } from './services/roles/role_has_model_permissions.js'
import { ModelHasRolePermissions } from './services/models/model_has_role_permissions.js'
import {
  AclModel,
  MorphInterface,
  OptionsInterface,
  PermissionInterface,
  RoleInterface,
} from './types.js'
import PermissionHasModelRoles from './services/permissions/permission_has_model_roles.js'
import ModelManager from './model_manager.js'
import EmptyPermission from './services/permissions/empty_permission.js'
import EmptyRoles from './services/roles/empty_roles.js'
import { BaseEvent, Emitter } from '@adonisjs/core/events'
import { Scope } from './scope.js'

export class AclManager {
  private static modelManager: ModelManager

  private static map: MorphInterface

  private static emitter: Emitter<any>

  protected currentScope: Scope

  private readonly allowOptionsRewriting: boolean

  private options: OptionsInterface = {
    events: {
      fire: true,
      except: [],
      only: [],
    },
  }

  static setModelManager(manager: ModelManager) {
    this.modelManager = manager
  }

  static getModelManager(): ModelManager {
    return this.modelManager
  }

  static setMorphMap(map: MorphInterface) {
    this.map = map
  }

  static setEmitter(emitter: Emitter<any>) {
    this.emitter = emitter
  }

  constructor(allowOptionsRewriting: boolean, defaultOptions?: OptionsInterface) {
    this.allowOptionsRewriting = allowOptionsRewriting
    if (defaultOptions) {
      this.options = { ...this.options, ...defaultOptions }
    }

    this.currentScope = new Scope()
  }

  model(model: AclModel): ModelHasRolePermissions {
    return new ModelHasRolePermissions(
      AclManager.modelManager,
      AclManager.map,
      this.optionClone(),
      new Scope().set(this.currentScope.get()),
      model,
      AclManager.emitter
    )
  }

  role(): EmptyRoles
  role(role: RoleInterface): RoleHasModelPermissions
  role(role?: RoleInterface): RoleHasModelPermissions | EmptyRoles {
    if (role) {
      return new RoleHasModelPermissions(
        AclManager.modelManager,
        AclManager.map,
        this.optionClone(),
        new Scope().set(this.currentScope.get()),
        role,
        AclManager.emitter
      )
    }

    return new EmptyRoles(
      AclManager.modelManager,
      AclManager.map,
      this.optionClone(),
      new Scope().set(this.currentScope.get()),
      AclManager.emitter
    )
  }

  permission(): EmptyPermission
  permission(permission: PermissionInterface): PermissionHasModelRoles
  permission(permission?: PermissionInterface): PermissionHasModelRoles | EmptyPermission {
    if (permission) {
      return new PermissionHasModelRoles(
        AclManager.modelManager,
        AclManager.map,
        this.optionClone(),
        new Scope().set(this.currentScope.get()),
        permission,
        AclManager.emitter
      )
    }

    return new EmptyPermission(
      AclManager.modelManager,
      AclManager.map,
      this.optionClone(),
      new Scope().set(this.currentScope.get()),
      AclManager.emitter
    )
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
  scope(scope: Scope, forceUpdate: boolean = false) {
    if (!this.allowOptionsRewriting && !forceUpdate) {
      throw new Error(
        'Scope method call is not available on global Acl object, use AclManager to create new scoped object or use forceUpdate=true'
      )
    }

    this.currentScope = scope

    return this
  }

  getScope() {
    return this.options['scope']
  }

  withoutEvents(): AclManager
  withoutEvents<T extends BaseEvent>(events: T[]): AclManager
  withoutEvents<T extends BaseEvent>(events?: T[]): AclManager {
    if (events?.length) {
      this.options.events.except = events
      return this
    }

    this.options.events.fire = false

    return this
  }

  withEvents(): AclManager
  withEvents<T extends BaseEvent>(events: T[]): AclManager
  withEvents<T extends BaseEvent>(events?: T[]): AclManager {
    if (events?.length) {
      this.options.events.only = events
      return this
    }

    this.options.events.fire = true

    return this
  }

  protected optionClone(): OptionsInterface {
    return structuredClone(this.options)
  }
}

export const Acl = new AclManager(false)
