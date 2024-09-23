import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'
import { Acl } from '../acl.js'
import { AclModel, AclModelInterface, ModelIdType } from '../types.js'

export function hasPermissions() {
  return <Model extends NormalizeConstructor<typeof BaseModel>>(superclass: Model) => {
    class HasPermissionsMixin extends superclass implements AclModelInterface {
      getModelId(): ModelIdType {
        throw new Error(
          'method getModelId must be implemented in target model, which will return key for current object'
        )
      }

      roles() {
        return Acl.model(this as unknown as AclModel).roles()
      }

      hasRole(role: string) {
        return Acl.model(this as unknown as AclModel).hasRole(role)
      }

      hasAllRoles(...roles: string[]) {
        return Acl.model(this as unknown as AclModel).hasAllRoles(...roles)
      }

      hasAnyRole(...roles: string[]) {
        return Acl.model(this as unknown as AclModel).hasAnyRole(...roles)
      }

      assignRole(role: string) {
        return Acl.model(this as unknown as AclModel).assignRole(role)
      }

      revokeRole(role: string) {
        return Acl.model(this as unknown as AclModel).revokeRole(role)
      }

      revokeAllRoles(...roles: string[]) {
        return Acl.model(this as unknown as AclModel).revokeAllRoles(...roles)
      }

      // roles related section END

      // permissions related section BEGIN

      permissions(includeForbiddings: boolean = false) {
        return Acl.model(this as unknown as AclModel).permissions(includeForbiddings)
      }

      globalPermissions(includeForbiddings: boolean = false) {
        return Acl.model(this as unknown as AclModel).globalPermissions(includeForbiddings)
      }

      async onResourcePermissions(includeForbiddings: boolean = false) {
        return Acl.model(this as unknown as AclModel).onResourcePermissions(includeForbiddings)
      }

      async directGlobalPermissions(includeForbiddings: boolean = false) {
        return Acl.model(this as unknown as AclModel).directGlobalPermissions(includeForbiddings)
      }

      async directResourcePermissions(includeForbiddings: boolean = false) {
        return Acl.model(this as unknown as AclModel).directResourcePermissions(includeForbiddings)
      }

      async containsPermission(permission: string) {
        return Acl.model(this as unknown as AclModel).containsPermission(permission)
      }

      async containsAllPermissions(permissions: string[]) {
        return Acl.model(this as unknown as AclModel).containsAllPermissions(permissions)
      }

      async containsAnyPermission(permissions: string[]) {
        return Acl.model(this as unknown as AclModel).containsAnyPermission(permissions)
      }

      async containsDirectPermission(permission: string) {
        return Acl.model(this as unknown as AclModel).containsDirectPermission(permission)
      }

      async containsAllPermissionsDirectly(permissions: string[]) {
        return Acl.model(this as unknown as AclModel).containsAllPermissionsDirectly(permissions)
      }

      async containsAnyPermissionDirectly(permissions: string[]) {
        return Acl.model(this as unknown as AclModel).containsAnyPermissionDirectly(permissions)
      }

      async hasPermission(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasPermission(permission, target)
      }

      async hasAllPermissions(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasAllPermissions(permissions, target)
      }

      async hasAnyPermission(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasAnyPermission(permissions, target)
      }

      async hasAnyDirectPermission(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasAnyDirectPermission(permissions, target)
      }

      async hasDirectPermission(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasDirectPermission(permission, target)
      }

      async hasAllPermissionsDirect(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).hasAllPermissionsDirect(permissions, target)
      }

      canAll(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).canAll(permissions, target)
      }

      canAny(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).canAny(permissions, target)
      }

      async assignDirectPermission(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).assignDirectPermission(permission, target)
      }

      allow(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).allow(permission, target)
      }

      async revokePermission(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).revokePermission(permission, target)
      }

      async revokeAllPermissions(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).revokeAllPermissions(permissions, target)
      }

      async flushPermissions() {
        return Acl.model(this as unknown as AclModel).flushPermissions()
      }

      async flush() {
        return Acl.model(this as unknown as AclModel).flush()
      }

      async forbid(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).forbid(permission, target)
      }

      async forbidAll(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).forbidAll(permissions, target)
      }

      async unforbidAll(permissions: string[], target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).unforbidAll(permissions, target)
      }

      async unforbid(permission: string, target?: AclModel | Function) {
        return Acl.model(this as unknown as AclModel).unforbid(permission, target)
      }
    }

    return HasPermissionsMixin
  }
}
