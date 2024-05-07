import { BaseModel } from '@adonisjs/lucid/orm'
import { getRoleModelQuery } from '../query_helper.js'
import { RoleInterface, RoleModel, ScopeInterface } from '../../types.js'

export default class EmptyRoles {
  private roleQuery
  constructor(
    private roleClassName: typeof BaseModel,
    private scope: ScopeInterface
  ) {
    this.roleQuery = getRoleModelQuery(this.roleClassName)
  }

  on(scope: string) {
    this.scope.set(scope)
    return this
  }

  getScope() {
    return this.scope.get()
  }

  delete(role: string) {
    return this.roleQuery.where('slug', role).delete()
  }

  async create(values: Partial<RoleInterface>) {
    if (!values.slug) {
      throw new Error('The attribute slug is required')
    }

    const search: Partial<RoleInterface> = {
      slug: values.slug,
      scope: values.scope || this.getScope(),
    }

    return (await this.roleClassName.updateOrCreate(search, values)) as unknown as RoleModel<
      typeof this.roleClassName
    >
  }

  query() {
    return this.roleQuery
  }
}
