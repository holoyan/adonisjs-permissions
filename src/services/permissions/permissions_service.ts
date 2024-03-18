import ModelPermission from '../../models/model_permission.js'
import ModelRole from '../../models/model_role.js'
import Permission from '../../models/permission.js'
import Role from '../../models/role.js'
import { ModelPermissionsQuery } from '../../types.js'
import BaseService from '../base_service.js'

export default class PermissionsService extends BaseService {
  /**
   * return all permissions, including fodbidden
   */
  all(modelType: string, modelId: number) {
    const roleMorhpMap = new Role().getMorphMapName()

    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: roleMorhpMap === modelType,
    })
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  /**
   * return only global assigned permissions, through role or direct
   */
  global(modelType: string, modelId: number) {
    const roleMorhpMap = new Role().getMorphMapName()

    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: roleMorhpMap === modelType,
    })
      .whereNull(Permission.table + '.entity_id')
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  /**
   * get all permissions which is assigned to concrete resource
   */
  onResource(modelType: string, modelId: number) {
    const roleMorhpMap = new Role().getMorphMapName()

    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: roleMorhpMap === modelType,
    })
      .whereNotNull(Permission.table + '.entity_id')
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  /**
   * all direct permissions
   */
  direct(modelType: string, modelId: number) {
    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: true,
    })
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  directGlobal(modelType: string, modelId: number) {
    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: true,
    })
      .whereNull(Permission.table + '.entity_id')
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  /**
   * return direct and resource assigned permissions
   */
  directResource(modelType: string, modelId: number) {
    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: true,
    })
      .whereNotNull(Permission.table + '.entity_id')
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  hasDirect(modelType: string, modelId: number, permisison: string | Permission) {}

  /**
   * @param modelType
   * @param modelId
   * @param permisison
   * @returns
   */
  async hasAnyDirect(modelType: string, modelId: number, permisisons: (string | Permission)[]) {
    const { slugs, ids } = this.formatList(permisisons)

    const q = this.modelPermissionQueryWithForbiddenCheck({
      modelType,
      modelId,
      directPermissions: true,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    return r.length >= 0
  }
  async hasAllDirect(modelType: string, modelId: number, permisisons: (string | Permission)[]) {
    const { slugs, ids } = this.formatList(permisisons)

    const q = this.modelPermissionQueryWithForbiddenCheck({
      modelType,
      modelId,
      directPermissions: true,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    return r.length >= permisisons.length
  }

  /**
   * check if it has permission
   * to check forbidden or not use other method
   */
  async has(modelType: string, modelId: number, permisison: string | Permission) {
    const r = await this.hasAny(modelType, modelId, [permisison])

    return r
  }

  /**
   * has all permissions
   */
  async hasAll(modelType: string, modelId: number, permisisons: (string | Permission)[]) {
    const roleMorhpMap = new Role().getMorphMapName()
    const { slugs, ids } = this.formatList(permisisons)

    const q = this.modelPermissionQueryWithForbiddenCheck({
      modelType,
      modelId,
      directPermissions: roleMorhpMap === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    return r.length >= permisisons.length
  }

  /**
   * has any of permissions
   */
  async hasAny(modelType: string, modelId: number, permisison: (string | Permission)[]) {
    const roleMorhpMap = new Role().getMorphMapName()
    const { slugs, ids } = this.formatList(permisison)

    const q = this.modelPermissionQueryWithForbiddenCheck({
      modelType,
      modelId,
      directPermissions: roleMorhpMap === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    return r.length >= 0
  }

  /**
   * check if it has permission
   * to check forbidden or not use other method
   */
  async contains(modelType: string, modelId: number, permisison: string | Permission) {
    const r = await this.containsAny(modelType, modelId, [permisison])

    return r
  }

  /**
   * has all permissions
   */
  async containsAll(modelType: string, modelId: number, permisison: (string | Permission)[]) {
    const roleMorhpMap = new Role().getMorphMapName()
    const { slugs, ids } = this.formatList(permisison)

    const q = this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: roleMorhpMap === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    return r.length >= permisison.length
  }

  /**
   * has any of permissions
   */
  async containsAny(modelType: string, modelId: number, permisison: (string | Permission)[]) {
    const roleMorhpMap = new Role().getMorphMapName()
    const { slugs, ids } = this.formatList(permisison)

    const q = this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: roleMorhpMap === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    // @ts-ignore
    return r.length > 0
  }

  /**
   * check if it has permission
   * to check forbidden or not use other method
   */
  async containsDirect(modelType: string, modelId: number, permisison: string | Permission) {
    const r = await this.containsAny(modelType, modelId, [permisison])

    return r
  }

  /**
   * has all permissions
   */
  async containsAllDirect(modelType: string, modelId: number, permisison: (string | Permission)[]) {
    const { slugs, ids } = this.formatList(permisison)

    const q = this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: true,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    return r.length >= permisison.length
  }

  /**
   * has any of permissions
   */
  async containsAnyDirect(modelType: string, modelId: number, permisison: (string | Permission)[]) {
    const { slugs, ids } = this.formatList(permisison)

    const q = this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: true,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    // @ts-ignore
    return r.length > 0
  }

  /**
   * check if permission is forbidden, if there is same permission with allowed=false then return true;
   */
  forbidden(modelType: string, modelId: number, permisison: string | Permission) {
    return !this.has(modelType, modelId, permisison)
  }

  allowed(modelType: string, modelId: number, permisison: string | Permission) {
    return this.has(modelType, modelId, permisison)
  }

  /**
   * give permission to model
   */
  give(modelType: string, modelId: number, permissionId: number) {
    return ModelPermission.create({
      modelType,
      modelId,
      permissionId,
    })
  }

  /**
   * give permissions to model
   */
  async giveAll(modelType: string, modelId: number, permissionId: number[]) {
    let permissions = permissionId.map((item) => {
      return {
        modelType,
        modelId,
        permissionId: item,
      }
    })

    return ModelPermission.createMany(permissions)
  }

  /**
   * sync permissions, remove everything outside of the list
   */
  async sync(modelType: string, modelId: number, permissionId: number[]) {
    await ModelPermission.query().where('model_type', modelType).where('model_id', modelId).delete()

    const many = await this.giveAll(modelType, modelId, permissionId)

    return many
  }

  /**
   * forbid permission on model
   */
  async forbid(modelType: string, modelId: number, permissionSlug: string) {
    // if there is permission with that slug and allowed false retrive it, oterwise create new one and attach

    let forbiddenPermission = await Permission.query()
      .where('allowed', false)
      .where(Permission.table + '.slug', permissionSlug)
      .select('*')
      .first()

    if (!forbiddenPermission) {
      forbiddenPermission = await Permission.create({
        slug: permissionSlug,
        title: permissionSlug,
        allowed: false,
      })
    }

    return this.give(modelType, modelId, forbiddenPermission.id)
  }

  /**
   * to remove forbidden permission on model
   */
  async unforbid(modelType: string, modelId: number, permissionSlug: string) {
    let forbiddenPermission = await Permission.query()
      .where('allowed', false)
      .where(Permission.table + '.slug', permissionSlug)
      .select('*')
      .first()

    if (!forbiddenPermission) {
      return true
    }

    // todo replace using reverseModelPermissionQuery() method
    await ModelPermission.query()
      .where('model_type', modelType)
      .where('model_id', modelId)
      .where('permission_id', forbiddenPermission.id)
      .delete()

    return true
  }

  findBySlug(slug: string, allowed: boolean = true) {
    return Permission.query().where('slug', slug).where('allowed', allowed).firstOrFail()
  }

  private modelPermissionQueryWithForbiddenCheck(conditions: Partial<ModelPermissionsQuery>) {
    const q = this.modelPermissionQuery(conditions)
    q.whereNotExists((subQuery) => {
      subQuery
        .from(Permission.table + ' as p2')
        .join(ModelPermission.table + ' as mp2', 'mp2.permission_id', '=', 'p2.id')
        .where('p2.allowed', false)
        .whereRaw('p2.slug=' + Permission.table + '.slug')
    })

    return q
  }

  private modelPermissionQuery(conditions: Partial<ModelPermissionsQuery>) {
    const { modelId, modelType, permissionSlugs, directPermissions } = conditions

    const q = Permission.query().join(
      ModelPermission.table + ' as mp',
      'mp.permission_id',
      '=',
      Permission.table + '.id'
    )

    if (modelId && modelType) {
      if (directPermissions) {
        q.where('mp.model_type', modelType).where('mp.model_id', modelId)
      } else {
        q.join(ModelRole.table + ' as mr', (joinQuery) => {
          joinQuery.onVal('mr.model_type', modelType).onVal('mr.model_id', modelId)
        }).where((subQuery) => {
          subQuery
            .where((query) => {
              query.where('mp.model_type', modelType).where('mp.model_id', modelId)
            })
            .orWhere((query) => {
              query.whereRaw('mr.role_id=mp.model_id').where('mp.model_type', 'roles')
            })
        })
      }
    }

    if (permissionSlugs) {
      q.whereIn(Permission.table + '.slug', permissionSlugs)
    }

    return q
  }

  reverseModelPermissionQuery(conditions: Partial<ModelPermissionsQuery>) {
    const { modelId, modelType, permissionSlugs, directPermissions } = conditions
    const q = ModelPermission.query().leftJoin(
      Permission.table + ' as p',
      'p.id',
      '=',
      ModelPermission.table + '.permission_id'
    )

    if (modelId && modelType) {
      if (directPermissions) {
        q.where(ModelPermission.table + '.model_type', modelType).where(
          ModelPermission.table + '.model_id',
          modelId
        )
      } else {
        q.join(ModelRole.table + ' as mr', (joinQuery) => {
          joinQuery.onVal('mr.model_type', modelType).andOnVal('mr.model_id', modelId)
        }).where((subQuery) => {
          subQuery
            .where((query) => {
              query
                .where(ModelPermission.table + '.model_type', modelType)
                .where(ModelPermission.table + '.model_id', modelId)
            })
            .orWhere((query) => {
              query
                .whereRaw('mr.role_id=' + ModelPermission.table + '.model_id')
                .where(ModelPermission.table + '.model_type', 'roles')
            })
        })
      }
    }

    if (permissionSlugs) {
      q.whereIn('p.slug', permissionSlugs)
    }

    return q
  }
}
