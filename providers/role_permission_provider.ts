import { ApplicationService } from '@adonisjs/core/types'
// import MorphMap from '../src/morph_map.js'

declare module '@adonisjs/core/types' {
  // export interface ContainerBindings {
  //   morphMap: MorphMap
  // }
}

export default class RolePermissionProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    // this.app.container.singleton('morphMap', async () => {
    //   return new MorphMap()
    // })
  }
}
