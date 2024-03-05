// import Role from '../models/role.js'
// import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
// import RolesService from '../services/roles_service.js'

// export default <
//   Model extends NormalizeConstructor<import('@adonisjs/lucid/types/model').LucidModel>,
// >(
//   superclass: Model
// ) => {
//   class HasRolesMixin extends superclass {
//     getMorphMapName(): string {
//       throw new Error(
//         'method getMorphMapName must be implemented in target model, which will return string alias for model class'
//       )
//     }

//     getModelId(): number | null {
//       throw new Error(
//         'method getModelId must be implemented in target model, which will return key for current object'
//       )
//     }

//     roles(): Promise<Role[] | null> {
//       const service = new RolesService()
//       return service.all(this.getMorphMapName(), this.getModelId())
//     }

//     hasRole(role: string | Role) {
//       const service = new RolesService()
//       return service.has(this.getMorphMapName(), this.getModelId(), role)
//     }

//     hasAllRoles(role: (string | Role)[]) {
//       const service = new RolesService()
//       return service.hasAll(this.getMorphMapName(), this.getModelId(), role)
//     }

//     hasAnyRole(role: (string | Role)[]) {
//       const service = new RolesService()
//       return service.hasAny(this.getMorphMapName(), this.getModelId(), role)
//     }

//     assigneRole(role: string | Role) {
//       const service = new RolesService()
//       return service.assigne(role, this)
//     }

//     revokeRole(role: string | Role) {
//       const service = new RolesService()
//       return service.revoke(role, this)
//     }
//   }

//   return HasRolesMixin
// }
