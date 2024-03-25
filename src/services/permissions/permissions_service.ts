import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import ModelPermission from '../../models/model_permission.js'
import ModelRole from '../../models/model_role.js'
import Permission from '../../models/permission.js'
import Role from '../../models/role.js'
import { ModelPermissionsQuery } from '../../types.js'
import BaseService from '../base_service.js'
import { morphMap } from '../helper.js'

export default class PermissionsService extends BaseService {
  /**
   * return all permissions, including fodbidden
   */
  async all(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    const map = await morphMap()

    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: map.getAlias(Role) === modelType,
      includeForbiddings,
    })
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  /**
   * return only global assigned permissions, through role or direct
   */
  async global(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    const map = await morphMap()

    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: map.getAlias(Role) === modelType,
      includeForbiddings,
    })
      .where(Permission.table + '.entity_type', '*')
      .whereNull(Permission.table + '.entity_id')
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  /**
   * get all permissions which is assigned to concrete resource
   */
  async onResource(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    const map = await morphMap()

    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: map.getAlias(Role) === modelType,
      includeForbiddings,
    })
      .where(Permission.table + '.entity_type', '!=', '*')
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  /**
   * all direct permissions
   */
  direct(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: true,
      includeForbiddings,
    })
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  directGlobal(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: true,
      includeForbiddings,
    })
      .whereNull(Permission.table + '.entity_id')
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  /**
   * return direct and resource assigned permissions
   */
  directResource(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    return this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: true,
      includeForbiddings,
    })
      .whereNotNull(Permission.table + '.entity_id')
      .groupBy(Permission.table + '.id')
      .select(Permission.table + '.*')
  }

  /**
   * @param modelType
   * @param modelId
   * @param permission
   * @returns
   */
  async hasAnyDirect(
    modelType: string,
    modelId: number,
    permissions: (string | Permission)[],
    entityType: string | null,
    entityId: number | null
  ) {
    const { slugs, ids } = this.formatList(permissions)

    const q = this.modelPermissionQueryWithForbiddenCheck({
      modelType,
      modelId,
      directPermissions: true,
      permissionSlugs: slugs,
      permissionIds: ids,
    })

    this.applyTargetRestriction(q, entityType, entityId)
    const r = await q.groupBy(Permission.table + '.id').select(Permission.table + '.id')

    return r.length > 0
  }
  async hasAllDirect(
    modelType: string,
    modelId: number,
    permissions: (string | Permission)[],
    entityType: string | null,
    entityId: number | null
  ) {
    const { slugs, ids } = this.formatList(permissions)

    const q = this.modelPermissionQueryWithForbiddenCheck({
      modelType,
      modelId,
      directPermissions: true,
      permissionSlugs: slugs,
      permissionIds: ids,
    })

    this.applyTargetRestriction(q, entityType, entityId)

    const r = await q.groupBy(Permission.table + '.id').select(Permission.table + '.id')

    return r.length >= permissions.length
  }

  /**
   * has all permissions
   */
  async hasAll(
    modelType: string,
    modelId: number,
    permissions: (string | Permission)[],
    entityType: string | null,
    entityId: number | null
  ) {
    const map = await morphMap()
    const { slugs, ids } = this.formatList(permissions)

    const q = this.modelPermissionQueryWithForbiddenCheck({
      modelType,
      modelId,
      directPermissions: map.getAlias(Role) === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
    })

    this.applyTargetRestriction(q, entityType, entityId)

    const r = await q.groupBy(Permission.table + '.id').select(Permission.table + '.id')

    return r.length >= permissions.length
  }

  /**
   * has any of permissions
   */
  async hasAny(
    modelType: string,
    modelId: number,
    permission: (string | Permission)[],
    entityType: string | null,
    entityId: number | null
  ) {
    const map = await morphMap()
    const { slugs, ids } = this.formatList(permission)

    const q = this.modelPermissionQueryWithForbiddenCheck({
      modelType,
      modelId,
      directPermissions: map.getAlias(Role) === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
    })

    this.applyTargetRestriction(q, entityType, entityId)

    const r = await q.groupBy(Permission.table + '.id').select(Permission.table + '.id')

    return r.length > 0
  }

  /**
   * has all permissions
   */
  async containsAll(modelType: string, modelId: number, permission: (string | Permission)[]) {
    const map = await morphMap()
    const { slugs, ids } = this.formatList(permission)

    const q = this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: map.getAlias(Role) === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    return r.length >= permission.length
  }

  /**
   * has any of permissions
   */
  async containsAny(modelType: string, modelId: number, permission: (string | Permission)[]) {
    const map = await morphMap()
    const { slugs, ids } = this.formatList(permission)

    const q = this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: map.getAlias(Role) === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    // @ts-ignore
    return r.length > 0
  }

  /**
   * has all permissions
   */
  async containsAllDirect(modelType: string, modelId: number, permission: (string | Permission)[]) {
    const { slugs, ids } = this.formatList(permission)

    const q = this.modelPermissionQuery({
      modelType,
      modelId,
      directPermissions: true,
      permissionSlugs: slugs,
      permissionIds: ids,
    }).groupBy(Permission.table + '.id')
    const r = await q.select(Permission.table + '.id')

    return r.length >= permission.length
  }

  /**
   * has any of permissions
   */
  async containsAnyDirect(modelType: string, modelId: number, permission: (string | Permission)[]) {
    const { slugs, ids } = this.formatList(permission)

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
  forbidden(
    modelType: string,
    modelId: number,
    permission: string | Permission,
    entityType: string | null,
    entityId: number | null
  ) {
    return !this.hasAny(modelType, modelId, [permission], entityType, entityId)
  }

  /**
   * give permission to model
   */
  async giveAll(
    modelType: string,
    modelId: number,
    slugs: string[],
    entityType: string | null,
    entityId: number | null,
    allowed: boolean
  ) {
    // if entityType is not null then we need to assigne permission for specific entity

    let permissions = await this.findAssignableEntity(slugs, entityType, entityId, allowed)
    //if no permissions then we will create permission for this specific entity

    let createManyData = []
    let permissionIds = []
    for (const slug of slugs) {
      const found = permissions.find((i) => i.slug === slug)
      if (!found) {
        createManyData.push({
          slug,
          title: slug,
          entityType,
          entityId,
          allowed,
        })
      } else {
        permissionIds.push(found.id)
      }
    }

    if (createManyData.length) {
      const newPermissions = await Permission.createMany(createManyData)
      newPermissions.map((i) => permissionIds.push(i.id))
    }

    let modelPermissionMany = permissionIds.map((i) => ({
      modelType: modelType,
      modelId: modelId,
      permissionId: i,
    }))

    return ModelPermission.createMany(modelPermissionMany)
  }

  revokeAll(
    modelType: string,
    modelId: number,
    permissions: string[],
    entityType: string | null,
    entityId: number | null
  ) {
    const q = ModelPermission.query()
      .leftJoin(Permission.table + ' as p', 'p.id', '=', ModelPermission.table + '.permission_id')
      .whereIn('p.slug', permissions)
      .where('p.allowed', true)
      .where(ModelPermission.table + '.model_type', modelType)
      .where(ModelPermission.table + '.model_id', modelId)

    if (entityType) {
      q.where('p.entity_type', entityType)

      if (entityId) {
        q.where('p.entity_id', entityId)
      }
    }

    return q
  }

  flush(modelType: string, modelId: number) {
    return ModelPermission.query()
      .where(ModelPermission.table + '.model_type', modelType)
      .where(ModelPermission.table + '.model_id', modelId)
      .delete()
  }

  /**
   * sync permissions, remove everything outside of the list
   */
  async sync(modelType: string, modelId: number, permissionId: string[]) {
    await ModelPermission.query().where('model_type', modelType).where('model_id', modelId).delete()

    const many = await this.giveAll(modelType, modelId, permissionId, null, null, true)

    return many
  }

  /**
   * forbid permission on model
   */
  async forbid(
    modelType: string,
    modelId: number,
    permissionSlug: string,
    entityType: string | null,
    entityId: number | null
  ) {
    return this.forbidAll(modelType, modelId, [permissionSlug], entityType, entityId)
  }

  /**
   * forbid permission on model
   */
  async forbidAll(
    modelType: string,
    modelId: number,
    permissionsSlug: string[],
    entityType: string | null,
    entityId: number | null
  ) {
    return this.giveAll(modelType, modelId, permissionsSlug, entityType, entityId, false)
  }

  /**
   * to remove forbidden permission on model
   */
  async unforbidAll(
    modelType: string,
    modelId: number,
    permissionsSlug: string[],
    entityType: string | null,
    entityId: number | null
  ) {
    // todo replace using reverseModelPermissionQuery() method
    const q = ModelPermission.query()
      .leftJoin(Permission.table + ' as p', 'p.id', '=', ModelPermission.table + '.permission_id')
      .where('model_type', modelType)
      .where('model_id', modelId)
      .whereIn('p.slug', permissionsSlug)
      .where('p.allowed', false)

    if (entityType) {
      q.where('p.entity_type', entityType)
      if (entityId) {
        q.where('p.entity_id', entityId)
      }
    }

    return q.delete()
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
        .whereRaw('mp2.id=mp.id')
    })

    return q
  }

  private modelPermissionQuery(conditions: Partial<ModelPermissionsQuery>) {
    const { modelId, modelType, permissionSlugs, directPermissions, includeForbiddings } =
      conditions

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

    if (!includeForbiddings) {
      q.whereNotExists((subQuery) => {
        subQuery
          .from(Permission.table + ' as p2')
          .join(ModelPermission.table + ' as mp2', 'mp2.permission_id', '=', 'p2.id')
          .where('p2.allowed', false)
          .whereRaw('p2.slug=' + Permission.table + '.slug')
          .whereRaw('mp2.id=mp.id')
      })
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

  findAssignableEntity(
    permission: string[],
    entityClass: string | null,
    entityId: number | null,
    allowed: boolean
  ) {
    const q = Permission.query().whereIn('slug', permission).where('allowed', allowed)

    if (entityClass) {
      q.where('entity_type', entityClass)
      if (entityId) {
        q.where('entity_id', entityId)
      } else {
        q.whereNull('entity_id')
      }
    } else {
      q.whereNull('entity_type').whereNull('entity_id')
    }

    return q
  }

  private applyTargetRestriction(
    q: ModelQueryBuilderContract<typeof Permission, Permission>,
    entityType: string | null,
    entityId: number | null
  ) {
    if (entityType) {
      q.where((query) => {
        query
          .where(Permission.table + '.entity_type', entityType)
          .orWhereNull(Permission.table + '.entity_type')
      })
      if (entityId) {
        q.where((query) => {
          query
            .where(Permission.table + '.entity_id', entityId)
            .orWhereNull(Permission.table + '.entity_id')
        })
      }
    } else {
      q.whereNull(Permission.table + '.entity_type').whereNull(Permission.table + '.entity_id')
    }
  }
}
