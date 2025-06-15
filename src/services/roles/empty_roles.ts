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
import { RoleCreatedEvent, RoleDeletedEvent } from '../../events/index.js'

export default class EmptyRoles extends BaseAdapter {
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
  }

  get roleQuery() {
    return getRoleModelQuery(this.roleClassName, this.queryOptions)
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

    values.scope = search.scope

    let role = await this.roleClassName.query().where(search).first()

    if (role) {
      await role.merge(values).save()
    } else {
      role = await this.roleClassName.create(values)

      this.fire(RoleCreatedEvent, role)
    }

    return role
  }

  query() {
    return this.roleQuery
  }
}
