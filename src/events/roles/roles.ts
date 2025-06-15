import { BaseEvent } from '@adonisjs/core/events'
import Role from '../../models/role.js'
import { LucidModel } from '@adonisjs/lucid/types/model'

export class RoleCreatedEvent extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public role: Role) {
    super()
  }
}

export class RoleDeletedEvent extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public role: string) {
    super()
  }
}

export class RolesAttachedToModel<T extends LucidModel> extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public roles: string[],
    public model: T
  ) {
    super()
  }
}

export class RolesDetachedFromModelEvent<T extends LucidModel> extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public roles: string[],
    public model: T
  ) {
    super()
  }
}

export class RolesFlushedFromModelEvent extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public model: LucidModel) {
    super()
  }
}
