import { BaseModel } from '@adonisjs/lucid/orm'
import { getRoleModelQuery } from '../query_helper.js'
import { MorphInterface, OptionsInterface, RoleInterface, RoleModel } from '../../types.js'
import BaseAdapter from '../base_adapter.js'
import ModelManager from '../../model_manager.js'

export default class EmptyRoles extends BaseAdapter {
  private roleQuery

  protected roleClassName: typeof BaseModel
  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface
  ) {
    super(manager, map, options)
    this.roleClassName = manager.getModel('role')
    this.roleQuery = getRoleModelQuery(this.roleClassName)
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
