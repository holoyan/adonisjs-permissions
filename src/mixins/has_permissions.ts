import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import PermissionsService from '../services/permissions_service.js'
import { HasPermissions as HasPermissionsContract } from '../types.js'
import Permission from '../models/permission.js'

const HasPermissions = <
  Model extends NormalizeConstructor<import('@adonisjs/lucid/types/model').LucidModel>,
>(
  superclass: Model
) => {
  class HasPermissionsMixin extends superclass implements HasPermissionsContract {
    getMorphMapName(): string {
      throw new Error(
        'method getMorphMapName must be implemented in target model, which will return string alias for model class'
      )
    }

    getModelId(): number {
      throw new Error(
        'method getModelId must be implemented in target model, which will return key for current object'
      )
    }

    /**
     * return all permissions including global, direct
     */
    permissions(): Promise<Permission[] | null> {
      const service = new PermissionsService()
      return service.all(this.getMorphMapName(), this.getModelId())
    }
  }

  return HasPermissionsMixin
}

export default HasPermissions
