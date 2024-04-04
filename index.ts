/*
|--------------------------------------------------------------------------
| Package entrypoint
|--------------------------------------------------------------------------
|
| Export values from the package entrypoint as you see fit.
|
*/

import modelRole from './src/models/model_role.js'
import modelPermission from './src/models/model_permission.js'
import permission from './src/models/permission.js'
import role from './src/models/role.js'

export const ModelRole = modelRole
export const ModelPermission = modelPermission
export const Permission = permission
export const Role = role

export { configure } from './configure.js'
export { stubsRoot } from './stubs/main.js'
export { Acl } from './src/acl.js'
export { MorphMap, getClassPath } from './src/decorators.js'
export * as morphMapModel from './src/morph_map.js'
export { hasPermissions } from './src/mixins/has_permissions.js'
