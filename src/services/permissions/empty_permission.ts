import { BaseModel } from '@adonisjs/lucid/orm'
import { getPermissionModelQuery } from '../query_helper.js'
import { PermissionInterface, PermissionModel, ScopeInterface } from '../../types.js'

export default class EmptyPermission {
  private permissionQuery

  constructor(
    private permissionClassName: typeof BaseModel,
    private scope: ScopeInterface
  ) {
    this.permissionQuery = getPermissionModelQuery(this.permissionClassName)
  }

  on(scope: string) {
    this.scope.set(scope)
    return this
  }

  getScope() {
    return this.scope.get()
  }

  delete(permission: string) {
    return this.permissionQuery.where('slug', permission).delete()
  }

  async create(values: Partial<PermissionInterface>) {
    if (!values.slug) {
      throw new Error('The attribute slug is required')
    }

    const search: Partial<PermissionInterface> = {
      slug: values.slug,
      scope: values.scope || this.getScope(),
    }

    return (await this.permissionClassName.updateOrCreate(
      search,
      values
    )) as unknown as PermissionModel<typeof this.permissionClassName>
  }

  query() {
    return this.permissionQuery
  }
}
