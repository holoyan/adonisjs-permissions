import { ApplicationService } from '@adonisjs/core/types'
import Permission from '../src/models/permission.js'
import { PermissionInterface } from '../src/types.js'
import ModelManager from '../src/model_manager.js'
// import MorphMap from '../src/morph_map.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    // morphMap: MorphMap
    modelManager: ModelManager
    permission: PermissionInterface
  }
}

export default class RolePermissionProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    // this.app.container.singleton('morphMap', async () => {
    //   return new MorphMap()
    // })
    this.app.container.singleton('modelManager', async () => {
      return new ModelManager()
    })
  }

  async boot() {
    const modelManager = await this.app.container.make('modelManager')
    modelManager.setModel('permission', Permission)
    // modelManager.setModel('role', Role)
    // modelManager.setModel('permission', Permission)
    // modelManager.setModel('permission', Permission)
  }
}
