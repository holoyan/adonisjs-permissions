import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import Permission from '../models/permission.js'
import { BaseModel } from '@adonisjs/lucid/orm'
import { Acl } from '../acl.js'
import { AclModel, AclModelInterface } from '../types.js'

// class Abg extends BaseModel implements AclModelInterface {
//   getModelId(): number {
//     return 0
//   }
// }
//
// const abg = new Abg()
//
// Acl.model(abg).permissions()

export function hasPermissions() {
  return <Model extends NormalizeConstructor<typeof BaseModel>>(superclass: Model) => {
    class HasPermissionsMixin extends superclass implements AclModelInterface {
      getModelId(): number {
        throw new Error(
          'method getModelId must be implemented in target model, which will return key for current object'
        )
      }

      /**
       * return all permissions including global, direct
       */
      permissions(includeForbiddens: boolean = false): Promise<Permission[] | null> {
        return Acl.model(this as AclModel).permissions(includeForbiddens)
      }
    }

    return HasPermissionsMixin
  }
}
