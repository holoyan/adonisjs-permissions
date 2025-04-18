import { getPermissionModelQuery } from '../query_helper.js'
import {
  ModelManagerBindings,
  MorphInterface,
  OptionsInterface,
  PermissionInterface,
  PermissionModel,
} from '../../types.js'
import BaseAdapter from '../base_adapter.js'
import ModelManager from '../../model_manager.js'
import { Emitter } from '@adonisjs/core/events'
import {
  PermissionCreatedEvent,
  PermissionDeletedEvent,
} from '../../events/permissions/permissions.js'
import { Scope } from '../../scope.js'

export default class EmptyPermission extends BaseAdapter {
  private permissionQuery

  permissionClassName: ModelManagerBindings['permission']

  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface,
    protected scope: Scope,
    protected emitter: Emitter<any>
  ) {
    super(manager, map, options, scope, emitter)

    this.permissionClassName = manager.getModel('permission')

    this.permissionQuery = getPermissionModelQuery(this.permissionClassName)
  }

  async create(values: Partial<PermissionInterface>) {
    if (!values.slug) {
      throw new Error('The attribute slug is required')
    }

    const search: Partial<PermissionInterface> = {
      slug: values.slug,
      scope: values.scope || this.getScope().get(),
    }

    values.scope = values.scope || this.getScope().get()

    let permission = await this.permissionClassName.findBy(search)

    if (!permission) {
      permission = await this.permissionClassName.create(values)
      this.fire(PermissionCreatedEvent, permission)
    }

    return permission as unknown as PermissionModel<typeof this.permissionClassName>
  }

  async delete(permission: string) {
    const deleted = await this.permissionQuery
      .where('slug', permission)
      .where('scope', this.getScope().get())
      .delete()

    if (deleted.length > 0) {
      this.fire(PermissionDeletedEvent, permission)
    }

    return deleted.length > 0
  }
}
