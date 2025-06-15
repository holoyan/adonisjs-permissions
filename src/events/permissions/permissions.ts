import { BaseEvent } from '@adonisjs/core/events'
import Permission from '../../models/permission.js'
import { ModelIdType } from '../../types.js'
import { LucidModel } from '@adonisjs/lucid/types/model'

export class PermissionCreatedEvent extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public permission: Permission) {
    super()
  }
}

export class PermissionDeletedEvent extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public permission: string) {
    super()
  }
}

export class PermissionsAttachedToRoleEvent extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public permissionIds: ModelIdType[],
    public roleId: ModelIdType
  ) {
    super()
  }
}

export class PermissionsDetachedFromRoleEvent extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public permissions: string[],
    public roleId: ModelIdType
  ) {
    super()
  }
}

export class PermissionsAttachedToModelEvent<T extends LucidModel> extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public permissionIds: ModelIdType[],
    public model: T
  ) {
    super()
  }
}

export class PermissionsDetachedFromModelEvent<T extends LucidModel> extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public permissions: string[],
    public model: T
  ) {
    super()
  }
}

export class PermissionsFlushedEvent<T extends LucidModel> extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public model: T) {
    super()
  }
}

export class PermissionsForbadeEvent<T extends LucidModel> extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public permissionIds: ModelIdType[],
    public model: T
  ) {
    super()
  }
}

export class PermissionsUnForbadeEvent<T extends LucidModel> extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public permissionIds: ModelIdType[],
    public model: T
  ) {
    super()
  }
}

export class PermissionsFlushedFromRoleEvent extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public roleId: ModelIdType) {
    super()
  }
}
