import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { BaseModel, manyToMany, hasMany } from '@adonisjs/lucid/orm'

import { AclModel, AclModelInterface, ModelIdType } from '../types.js'
import { Acl } from '../acl.js'
import type {
  ManyToMany,
  ManyToManySubQueryBuilderContract,
  HasMany,
  RelationSubQueryBuilderContract,
} from '@adonisjs/lucid/types/relations'
import Role from '../models/role.js'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { ModelRole, Permission } from '../../index.js'
import ModelPermission from '../models/model_permission.js'
import { morphMap } from '@holoyan/morph-map-js'
import { applyTargetRestriction, destructTarget } from '../services/helper.js'

export function hasPermissions() {
  return <Model extends NormalizeConstructor<typeof BaseModel>>(superclass: Model) => {
    class HasPermissionsMixin extends superclass implements AclModelInterface {
      getModelId(): ModelIdType {
        throw new Error(
          'method getModelId must be implemented in target model, which will return key for current object'
        )
      }

      /**
       * returns list of roles assigned to the model
       */
      roles() {
        return Acl.model(this as unknown as AclModel).roles()
      }

      /**
       * Check if model has role
       * @param role
       */
      hasRole(role: string) {
        return Acl.model(this as unknown as AclModel).hasRole(role)
      }

      /**
       * Check if model has all roles - returns true ONLY, if model has all roles
       * @param roles
       */
      hasAllRoles(...roles: string[]) {
        return Acl.model(this as unknown as AclModel).hasAllRoles(...roles)
      }

      /**
       * Check if model has any role - returns true if model has any of the roles
       * @param roles
       */
      hasAnyRole(...roles: string[]) {
        return Acl.model(this as unknown as AclModel).hasAnyRole(...roles)
      }

      /**
       * Assign role to model
       * @param role
       */
      assignRole(role: string) {
        return Acl.model(this as unknown as AclModel).assignRole(role)
      }

      /**
       * Revoke role from model
       * @param role
       */
      revokeRole(role: string) {
        return Acl.model(this as unknown as AclModel).revokeRole(role)
      }

      /**
       * Revoke all roles from model
       * @param roles
       */
      revokeAllRoles(...roles: string[]) {
        return Acl.model(this as unknown as AclModel).revokeAllRoles(...roles)
      }

      // roles related section END

      // permissions related section BEGIN

      /**
       * returns list of permissions assigned to the model
       * @param includeForbiddings
       */
      permissions(includeForbiddings: boolean = false) {
        return Acl.model(this as unknown as AclModel).permissions(includeForbiddings)
      }

      /**
       * returns list of global permissions assigned to the model
       * @param includeForbiddings
       */
      globalPermissions(includeForbiddings: boolean = false) {
        return Acl.model(this as unknown as AclModel).globalPermissions(includeForbiddings)
      }

      /**
       * returns list of resource permissions assigned to the model
       * @param includeForbiddings
       */
      async onResourcePermissions(includeForbiddings: boolean = false) {
        return Acl.model(this as unknown as AclModel).onResourcePermissions(includeForbiddings)
      }

      /**
       * Returns list of direct permissions assigned to the model
       * @param includeForbiddings
       */
      directGlobalPermissions(includeForbiddings: boolean = false) {
        return Acl.model(this as unknown as AclModel).directGlobalPermissions(includeForbiddings)
      }

      /**
       * Returns list of direct resource permissions assigned to the model
       * @param includeForbiddings
       */
      directResourcePermissions(includeForbiddings: boolean = false) {
        return Acl.model(this as unknown as AclModel).directResourcePermissions(includeForbiddings)
      }

      /**
       * Check if model has "contains" permission
       * If permission is forbidden, it will return true
       * @param permission
       */
      containsPermission(permission: string) {
        return Acl.model(this as unknown as AclModel).containsPermission(permission)
      }

      /**
       * Check if model contains all permissions
       * @param permissions
       */
      containsAllPermissions(permissions: string[]) {
        return Acl.model(this as unknown as AclModel).containsAllPermissions(permissions)
      }

      /**
       * Check if model contains any permission
       * @param permissions
       */
      containsAnyPermission(permissions: string[]) {
        return Acl.model(this as unknown as AclModel).containsAnyPermission(permissions)
      }

      /**
       * Check if model contains direct permission
       * @param permission
       */
      containsDirectPermission(permission: string) {
        return Acl.model(this as unknown as AclModel).containsDirectPermission(permission)
      }

      /**
       * Check if model contains all direct permissions
       * @param permissions
       */
      containsAllPermissionsDirectly(permissions: string[]) {
        return Acl.model(this as unknown as AclModel).containsAllPermissionsDirectly(permissions)
      }

      /**
       * Check if model contains any direct permission
       * @param permissions
       */
      containsAnyPermissionDirectly(permissions: string[]) {
        return Acl.model(this as unknown as AclModel).containsAnyPermissionDirectly(permissions)
      }

      /**
       * Check if model has permission
       * @param permission
       * @param target
       */
      hasPermission(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasPermission(permission, target)
      }

      /**
       * Check if model has all permissions
       * @param permissions
       * @param target
       */
      hasAllPermissions(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasAllPermissions(permissions, target)
      }

      /**
       * Check if model has any permission
       * @param permissions
       * @param target
       */
      hasAnyPermission(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasAnyPermission(permissions, target)
      }

      /**
       * Check if model has direct permission
       * @param permissions
       * @param target
       */
      hasAnyDirectPermission(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasAnyDirectPermission(permissions, target)
      }

      /**
       * Check if model has direct permission
       * @param permission
       * @param target
       */
      hasDirectPermission(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasDirectPermission(permission, target)
      }

      /**
       * Check if model has all direct permissions
       * @param permissions
       * @param target
       */
      hasAllPermissionsDirect(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasAllPermissionsDirect(permissions, target)
      }

      /**
       * Check if model has all permission
       * @param permissions
       * @param target
       */
      canAll(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).canAll(permissions, target)
      }

      canAny(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).canAny(permissions, target)
      }

      /**
       * Check if model has any permission
       * @param permission
       * @param target
       */
      assignDirectPermission(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).assignDirectPermission(permission, target)
      }

      /**
       * Allow permission for model
       * @param permission
       * @param target
       */
      allow(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).allow(permission, target)
      }

      /**
       * Revoke permission from model
       * @param permission
       * @param target
       */
      revokePermission(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).revokePermission(permission, target)
      }

      /**
       * Revoke all permissions from model
       * @param permissions
       * @param target
       */
      revokeAllPermissions(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).revokeAllPermissions(permissions, target)
      }

      /**
       * Flush(revoke all) permissions from model
       */
      flushPermissions() {
        return Acl.model(this as unknown as AclModel).flushPermissions()
      }

      /**
       * Flush(revoke all) roles and permissions from model
       */
      flush() {
        return Acl.model(this as unknown as AclModel).flush()
      }

      /**
       * Sync Role with the given list
       * @param roles
       * @param detach
       */
      syncRoles(roles: string[], detach: boolean = true) {
        return Acl.model(this as unknown as AclModel).syncRoles(roles, detach)
      }

      /**
       * Sync Role with the given list without detaching existing roles
       * @param roles
       */
      syncRolesWithoutDetaching(roles: string[]) {
        return Acl.model(this as unknown as AclModel).syncRolesWithoutDetaching(roles)
      }

      /**
       * Sync permissions with the given list
       * @param permissions
       * @param target
       */
      syncPermissions(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).syncPermissions(permissions, target)
      }

      /**
       * Forbid permission for model
       * @param permission
       * @param target
       */
      forbid(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).forbid(permission, target)
      }

      /**
       * Forbid all permissions for model
       * @param permissions
       * @param target
       */
      forbidAll(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).forbidAll(permissions, target)
      }

      /**
       * Unforbid all permissions for model
       * @param permissions
       * @param target
       */
      unforbidAll(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).unforbidAll(permissions, target)
      }

      /**
       * Unforbid permission for model
       * @param permission
       * @param target
       */
      unforbid(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).unforbid(permission, target)
      }
    }

    return HasPermissionsMixin
  }
}

export function permissionQueryHelpers() {
  return <Model extends NormalizeConstructor<typeof BaseModel>>(superclass: Model) => {
    class QueryHelpersMixin extends superclass {
      @manyToMany(() => Role, {
        localKey: 'id',
        relatedKey: 'id',
        pivotForeignKey: 'model_id',
        pivotRelatedForeignKey: 'role_id',
        pivotTable: 'model_roles',
        pivotColumns: ['model_type'],
        pivotTimestamps: true,
      })
      declare _roles: ManyToMany<typeof Role>

      _whereRoles(
        query: ModelQueryBuilderContract<LucidModel, LucidRow>,
        type: string,
        ...roles: string[]
      ) {
        return query.whereHas(
          // @ts-ignore
          '_roles',
          (rolesQuery: ManyToManySubQueryBuilderContract<typeof Role>) => {
            rolesQuery.whereIn('slug', roles).where('model_type', type)
          }
        )
      }

      @manyToMany(() => Permission, {
        localKey: 'id',
        relatedKey: 'id',
        pivotForeignKey: 'model_id',
        pivotRelatedForeignKey: 'permission_id',
        pivotTable: 'model_permissions',
        pivotColumns: ['model_type'],
        pivotTimestamps: true,
      })
      declare _permissions: ManyToMany<typeof Permission>

      _whereDirectPermissions<TargetClass extends Model>(
        query: ModelQueryBuilderContract<LucidModel, LucidRow>,
        targetClass: TargetClass,
        permissions: string[],
        target?: AclModel | Function
      ) {
        return query.whereHas(
          // @ts-ignore
          '_permissions',
          (permissionsQuery: ManyToManySubQueryBuilderContract<typeof Permission>) => {
            const entity = destructTarget(morphMap, target)

            permissionsQuery
              .whereIn('slug', permissions)
              .where('model_type', morphMap.getAlias(targetClass))
              .whereNotExists((subQuery) => {
                subQuery
                  .from(Permission.table + ' as p2')
                  .leftJoin(ModelPermission.table + ' as mp2', 'mp2.permission_id', '=', 'p2.id')
                  .where('p2.allowed', false)
                  .whereRaw('p2.slug=' + Permission.table + '.slug')
                  .whereRaw('p2.scope=' + Permission.table + '.scope')
                  .whereColumn('mp2.model_id', targetClass.table + '.id')
                  .where('mp2.model_type', morphMap.getAlias(targetClass))
                  .select('p2.slug')
                  .groupBy('p2.slug')
              })

            applyTargetRestriction(
              Permission.table,
              permissionsQuery,
              entity.targetClass,
              entity.targetId
            )
          }
        )
      }

      @hasMany(() => ModelRole, {
        foreignKey: 'modelId',
      })
      declare _model_roles: HasMany<typeof ModelRole>

      _whereRolePermissions<TargetClass extends Model>(
        query: ModelQueryBuilderContract<LucidModel, LucidRow>,
        targetClass: TargetClass,
        permissions: string[],
        target?: AclModel | Function
      ) {
        return query.whereHas(
          // @ts-ignore
          '_model_roles',
          (rolesQuery: RelationSubQueryBuilderContract<typeof ModelRole>) => {
            const entity = destructTarget(morphMap, target)
            rolesQuery
              .where(ModelRole.table + '.model_type', morphMap.getAlias(targetClass))
              .join(
                ModelPermission.table + ' as mp',
                'mp.model_id',
                '=',
                ModelRole.table + '.role_id'
              )
              .where('mp.model_type', 'roles')
              .join(Permission.table + ' as p', 'p.id', '=', 'mp.permission_id')
              .whereIn('p.slug', permissions)
              .whereNotExists((subQuery) => {
                subQuery
                  .from(Permission.table + ' as p2')
                  .leftJoin(ModelPermission.table + ' as mp2', 'mp2.permission_id', '=', 'p2.id')
                  .where('p2.allowed', false)
                  .whereRaw('p2.slug=' + 'p.slug')
                  .whereRaw('p2.scope=' + 'p.scope')
                  .whereColumn('mp2.model_id', targetClass.table + '.id')
                  .where('mp2.model_type', morphMap.getAlias(targetClass))
                  .select('p2.slug')
                  .groupBy('p2.slug')
              })

            applyTargetRestriction('p', rolesQuery, entity.targetClass, entity.targetId)
          }
        )
      }

      _wherePermissions<TargetClass extends Model>(
        query: ModelQueryBuilderContract<LucidModel, LucidRow>,
        targetClass: TargetClass,
        permissions: string[],
        target?: AclModel | Function
      ) {
        query
          .where((subQuery) => {
            this._whereDirectPermissions(subQuery, targetClass, permissions, target)
          })
          .orWhere((subQuery) => {
            this._whereRolePermissions(subQuery, targetClass, permissions, target)
          })
      }
    }

    return QueryHelpersMixin
  }
}
