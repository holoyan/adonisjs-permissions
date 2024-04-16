import { BaseModel } from '@adonisjs/lucid/orm'
import { getPermissionModelQuery } from '../query_helper.js'
import { ScopeInterface } from '../../types.js'

export default class EmptyPermission {
  private permissionQuery

  constructor(
    private permissionClassName: typeof BaseModel,
    private scope: ScopeInterface
  ) {
    this.permissionQuery = getPermissionModelQuery(this.permissionClassName)
  }

  on(scope: number) {
    this.scope.set(scope)
    return this
  }

  getScope() {
    return this.scope.get()
  }

  delete(permission: string) {
    // get all permissions by slug
    // if there is permission with allowed false then check if it has `links`
    return this.permissionQuery.where('slug', permission).delete()
  }

  query() {
    return this.permissionQuery
  }
}
