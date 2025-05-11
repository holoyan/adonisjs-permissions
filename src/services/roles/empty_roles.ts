import { getRoleModelQuery } from '../query_helper.js'
import {
  ModelManagerBindings,
  MorphInterface,
  OptionsInterface,
  RoleInterface,
} from '../../types.js'
import BaseAdapter from '../base_adapter.js'
import ModelManager from '../../model_manager.js'
import { Scope } from '../../scope.js'
import { Emitter } from '@adonisjs/core/events'
import { RoleCreatedEvent, RoleDeletedEvent } from '../../events/roles/roles.js'

export default class EmptyRoles extends BaseAdapter {
  private roleQuery

  protected roleClassName: ModelManagerBindings['role']

  constructor(
    protected manager: ModelManager,
    protected map: MorphInterface,
    protected options: OptionsInterface,
    protected scope: Scope,
    protected emitter: Emitter<any>
  ) {
    super(manager, map, options, scope, emitter)
    this.roleClassName = manager.getModel('role')
    this.roleQuery = getRoleModelQuery(this.roleClassName)
  }

  async delete(role: string) {
    const deleted = await this.roleQuery.where('slug', role).delete()
    if (deleted.length) {
      this.fire(RoleDeletedEvent, role)
    }

    return deleted
  }

  async create(values: Partial<RoleInterface>) {
    if (!values.slug) {
      throw new Error('The attribute slug is required')
    }

    const search: Partial<RoleInterface> = {
      slug: values.slug,
      scope: values.scope || this.getScope().get(),
    }

    const role = await this.roleClassName.updateOrCreate(search, values)

    this.fire(RoleCreatedEvent, role)

    return role
  }

  query() {
    return this.roleQuery
  }
}
