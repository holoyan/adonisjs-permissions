import { ApplicationService } from '@adonisjs/core/types'
import Permission from '../src/models/permission.js'
import Role from '../src/models/role.js'
import ModelPermission from '../src/models/model_permission.js'
import ModelRole from '../src/models/model_role.js'
import ModelManager from '../src/model_manager.js'
import { AclManager } from '../src/acl.js'
import MorphMap from '../src/morph_map.js'
import { Scope } from '../src/scope.js'
import emitter from '@adonisjs/core/services/emitter'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    morphMap: MorphMap
    modelManager: ModelManager
  }
}
export default class RolePermissionProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('morphMap', async () => {
      return new MorphMap()
    })
    this.app.container.singleton('modelManager', async () => {
      return new ModelManager()
    })
    const wantsUuid = this.app.config.get('permissions.permissionsConfig.uuidSupport') as boolean

    Permission.table = this.app.config.get('permissions.permissionsConfig.tables.permissions')
    Permission.selfAssignPrimaryKey = wantsUuid
    Permission.uuidSupport = wantsUuid

    Role.table = this.app.config.get('permissions.permissionsConfig.tables.roles')
    Role.selfAssignPrimaryKey = wantsUuid
    Role.uuidSupport = wantsUuid

    ModelRole.table = this.app.config.get('permissions.permissionsConfig.tables.modelRoles')

    ModelPermission.table = this.app.config.get(
      'permissions.permissionsConfig.tables.modelPermissions'
    )
  }

  async boot() {
    const modelManager = await this.app.container.make('modelManager')
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    modelManager.setModel('scope', Scope)

    AclManager.setModelManager(modelManager)
    AclManager.setEmitter(emitter)

    const map = await this.app.container.make('morphMap')
    map.set('permissions', Permission)
    map.set('roles', Role)
    AclManager.setMorphMap(map)
  }
}
