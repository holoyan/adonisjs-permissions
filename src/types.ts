import { LucidModel } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { BaseModel } from '@adonisjs/lucid/orm'
import { Scope } from './scope.js'

export interface AclModelInterface<T extends string | number = number> {
  getModelId(): T
}

export interface AclUUIDModelInterface extends AclModelInterface<string> {}

export interface PermissionInterface extends AclModelInterface {
  id: number

  slug: string

  title: string | null

  entityType: string

  entityId: number | null

  allowed: boolean

  scope: number

  createdAt: DateTime

  updatedAt: DateTime
}
export interface RoleInterface extends AclModelInterface {
  id: number

  slug: string

  title: string | null

  entityType: string

  entityId: number | null

  scope: number

  allowed: boolean

  createdAt: DateTime

  updatedAt: DateTime
}

export interface ModelRoleInterface extends AclModelInterface {
  id: number

  roleId: number

  modelType: string

  modelId: number | string | null

  createdAt: DateTime

  updatedAt: DateTime
}

export interface ModelPermissionInterface extends AclModelInterface {
  id: number

  permissionId: number

  modelType: string

  modelId: number | string | null

  createdAt: DateTime

  updatedAt: DateTime
}

export type AclModel = InstanceType<LucidModel> & AclModelInterface

export type PermissionModel<T extends new (...args: any[]) => any> = InstanceType<T> &
  PermissionInterface
export type RoleModel<T extends new (...args: any[]) => any> = InstanceType<T> & RoleInterface
export type ModelPermissionModel<T extends new (...args: any[]) => any> = InstanceType<T> &
  ModelPermissionInterface
export type ModelRoleModel<T extends new (...args: any[]) => any> = InstanceType<T> &
  ModelRoleInterface

export interface AclModelQuery {
  modelType: string
  modelId: number
}

type Entity = {
  type: string | null
  id: number | null
}

export interface ModelPermissionsQuery extends AclModelQuery {
  permissionSlugs: string[]
  permissionIds: number[]
  directPermissions: boolean
  includeForbiddings: boolean
  entity: Entity
  throughRoles: boolean
}

export interface MorphMapInterface {
  [key: string]: any
}

export interface MorphInterface {
  set(alias: string, target: any): void
  get(alias: string): any
  has(alias: string): boolean
  hasTarget(target: any): boolean
  getAlias(target: any): string
}

export interface ModelManagerInterface {
  [key: string]: any
}

export interface Permissions {
  tables: Object
  morphMaps: Object
}

export interface ScopeInterface {
  set(scope: number): ScopeInterface
  get(): number
  default(): number
}

export interface ModelManagerBindings {
  scope: typeof Scope
  role: typeof BaseModel
  permission: typeof BaseModel
  modelRole: typeof BaseModel
  modelPermission: typeof BaseModel
}

export interface AclMiddlewareOptions {
  role: string
  permission: string
  scope: number
  method: string
}
