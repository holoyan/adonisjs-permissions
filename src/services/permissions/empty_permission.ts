import { BaseModel } from '@adonisjs/lucid/orm'
import { getPermissionModelQuery } from '../query_helper.js'
import {
  MorphInterface,
  OptionsInterface,
  PermissionInterface,
  PermissionModel,
} from '../../types.js'
import BaseAdapter from '../base_adapter.js'
import ModelManager from '../../model_manager.js'

export default class EmptyPermission extends BaseAdapter {
  private permissionQuery

  permissionClassName: typeof BaseModel

  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface
  ) {
    super(manager, map, options)

    this.permissionClassName = manager.getModel('permission')

    this.permissionQuery = getPermissionModelQuery(this.permissionClassName)
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
