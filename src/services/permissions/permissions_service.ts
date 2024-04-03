import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

import {
  ModelPermissionsQuery,
  MorphInterface,
  PermissionInterface,
  PermissionModel,
} from '../../types.js'
import BaseService from '../base_service.js'
import { BaseModel } from '@adonisjs/lucid/orm'
import { getModelPermissionModelQuery, getPermissionModelQuery } from '../query_helper.js'

export default class PermissionsService extends BaseService {
  private permissionQuery
  private readonly permissionTable

  // private roleQuery
  // private readonly roleTable

  private modelPermissionQuery
  private readonly modelPermissionTable

  // private modelRoleQuery
  private readonly modelRoleTable

  constructor(
    private permissionClassName: typeof BaseModel,
    private roleClassName: typeof BaseModel,
    private modelPermissionClassName: typeof BaseModel,
    private modelRoleClassName: typeof BaseModel,
    private map: MorphInterface
  ) {
    super()
    this.permissionQuery = getPermissionModelQuery(this.permissionClassName)
    this.permissionTable = this.permissionClassName.table

    // this.roleQuery = getRoleModelQuery(this.roleClassName)
    // this.roleTable = this.roleClassName.table

    this.modelPermissionQuery = getModelPermissionModelQuery(this.modelPermissionClassName)
    this.modelPermissionTable = this.modelPermissionClassName.table

    // this.modelRoleQuery = getModelRoleModelQuery(this.modelRoleClassName)
    this.modelRoleTable = this.modelRoleClassName.table
  }

  /**
   * return all permissions, including forbidden
   */
  async all(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    return this.modelPermissionQueryBuilder({
      modelType,
      modelId,
      directPermissions: this.map.getAlias(this.roleClassName) === modelType,
      includeForbiddings,
    }).select(this.permissionTable + '.*')
  }

  /**
   * return only global assigned permissions, through role or direct
   */
  async global(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    return this.modelPermissionQueryBuilder({
      modelType,
      modelId,
      directPermissions: this.map.getAlias(this.roleClassName) === modelType,
      includeForbiddings,
    })
      .where(this.permissionTable + '.entity_type', '*')
      .whereNull(this.permissionTable + '.entity_id')
      .select(this.permissionTable + '.*')
  }

  /**
   * get all permissions which is assigned to concrete resource
   */
  async onResource(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    return this.modelPermissionQueryBuilder({
      modelType,
      modelId,
      directPermissions: this.map.getAlias(this.roleClassName) === modelType,
      includeForbiddings,
    })
      .where(this.permissionTable + '.entity_type', '!=', '*')

      .select(this.permissionTable + '.*')
  }

  /**
   * all direct permissions
   */
  direct(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    return this.modelPermissionQueryBuilder({
      modelType,
      modelId,
      directPermissions: true,
      includeForbiddings,
    })

      .select(this.permissionTable + '.*')
  }

  directGlobal(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    return this.modelPermissionQueryBuilder({
      modelType,
      modelId,
      directPermissions: true,
      includeForbiddings,
    })
      .whereNull(this.permissionTable + '.entity_id')

      .select(this.permissionTable + '.*')
  }

  /**
   * return direct and resource assigned permissions
   */
  directResource(modelType: string, modelId: number, includeForbiddings: boolean = false) {
    return this.modelPermissionQueryBuilder({
      modelType,
      modelId,
      directPermissions: true,
      includeForbiddings,
    })
      .whereNotNull(this.permissionTable + '.entity_id')

      .select(this.permissionTable + '.*')
  }

  /**
   * @param modelType
   * @param modelId
   * @param permissions
   * @param entityType
   * @param entityId
   * @returns
   */
  async hasAnyDirect(
    modelType: string,
    modelId: number,
    permissions: (string | PermissionInterface)[],
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
      entity: {
        type: entityType,
        id: entityId,
      },
    })

    this.applyTargetRestriction(this.permissionTable, q, entityType, entityId)
    const r = await q.select(this.permissionTable + '.id')

    return r.length > 0
  }
  async hasAllDirect(
    modelType: string,
    modelId: number,
    permissions: (string | PermissionInterface)[],
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
      entity: {
        type: entityType,
        id: entityId,
      },
    })

    this.applyTargetRestriction(this.permissionTable, q, entityType, entityId)

    const r = await q.select(this.permissionTable + '.id')

    return r.length >= permissions.length
  }

  /**
   * has all permissions
   */
  async hasAll(
    modelType: string,
    modelId: number,
    permissions: (string | PermissionInterface)[],
    entityType: string | null,
    entityId: number | null
  ) {
    const { slugs, ids } = this.formatList(permissions)

    const q = this.modelPermissionQueryWithForbiddenCheck({
      modelType,
      modelId,
      directPermissions: this.map.getAlias(this.roleClassName) === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
      entity: {
        type: entityType,
        id: entityId,
      },
    })

    this.applyTargetRestriction(this.permissionTable, q, entityType, entityId)

    const r = await q.select(this.permissionTable + '.id')

    return r.length >= permissions.length
  }

  /**
   * has any of permissions
   */
  async hasAny(
    modelType: string,
    modelId: number,
    permission: (string | PermissionInterface)[],
    entityType: string | null,
    entityId: number | null
  ) {
    const { slugs, ids } = this.formatList(permission)

    const q = this.modelPermissionQueryWithForbiddenCheck({
      modelType,
      modelId,
      directPermissions: this.map.getAlias(this.roleClassName) === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
      entity: {
        type: entityType,
        id: entityId,
      },
    })

    this.applyTargetRestriction(this.permissionTable, q, entityType, entityId)

    const r = await q.select(this.permissionTable + '.id')

    return r.length > 0
  }

  /**
   * has all permissions
   */
  async containsAll(
    modelType: string,
    modelId: number,
    permission: (string | PermissionInterface)[]
  ) {
    const { slugs, ids } = this.formatList(permission)

    const q = this.modelPermissionQueryBuilder({
      modelType,
      modelId,
      directPermissions: this.map.getAlias(this.roleClassName) === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
    })
    const r = await q.select(this.permissionTable + '.id')

    return r.length >= permission.length
  }

  /**
   * has any of permissions
   */
  async containsAny(
    modelType: string,
    modelId: number,
    permission: (string | PermissionInterface)[]
  ) {
    const { slugs, ids } = this.formatList(permission)

    const q = this.modelPermissionQueryBuilder({
      modelType,
      modelId,
      directPermissions: this.map.getAlias(this.roleClassName) === modelType,
      permissionSlugs: slugs,
      permissionIds: ids,
    })
    const r = await q.select(this.permissionTable + '.id')

    // @ts-ignore
    return r.length > 0
  }

  /**
   * has all permissions
   */
  async containsAllDirect(
    modelType: string,
    modelId: number,
    permission: (string | PermissionInterface)[]
  ) {
    const { slugs, ids } = this.formatList(permission)

    const q = this.modelPermissionQueryBuilder({
      modelType,
      modelId,
      directPermissions: true,
      permissionSlugs: slugs,
      permissionIds: ids,
    })
    const r = await q.select(this.permissionTable + '.id')

    return r.length >= permission.length
  }

  /**
   * has any of permissions
   */
  async containsAnyDirect(
    modelType: string,
    modelId: number,
    permission: (string | PermissionInterface)[]
  ) {
    const { slugs, ids } = this.formatList(permission)

    const q = this.modelPermissionQueryBuilder({
      modelType,
      modelId,
      directPermissions: true,
      permissionSlugs: slugs,
      permissionIds: ids,
    })
    const r = await q.select(this.permissionTable + '.id')

    // @ts-ignore
    return r.length > 0
  }

  /**
   * check if permission is forbidden, if there is same permission with allowed=false then return true;
   */
  forbidden(
    modelType: string,
    modelId: number,
    permission: string | PermissionInterface,
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
    // if entityType is not null then we need to assign permission for specific entity

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
          entityType: entityType || '*',
          entityId,
          allowed,
        })
      } else {
        permissionIds.push(found.id)
      }
    }

    if (createManyData.length) {
      const newPermissions = (await this.permissionClassName.createMany(
        createManyData
      )) as unknown as PermissionModel<typeof this.permissionClassName>[]
      newPermissions.map((i) => permissionIds.push(i.id))
    }

    let modelPermissionMany = permissionIds.map((i) => ({
      modelType: modelType,
      modelId: modelId,
      permissionId: i,
    }))

    return this.modelPermissionClassName.createMany(modelPermissionMany)
  }

  revokeAll(
    modelType: string,
    modelId: number,
    permissions: string[],
    entityType: string | null,
    entityId: number | null
  ) {
    const q = this.modelPermissionQuery
      .leftJoin(
        this.permissionTable + ' as p',
        'p.id',
        '=',
        this.modelPermissionTable + '.permission_id'
      )
      .whereIn('p.slug', permissions)
      .where('p.allowed', true)
      .where(this.modelPermissionTable + '.model_type', modelType)
      .where(this.modelPermissionTable + '.model_id', modelId)

    if (entityType) {
      q.where('p.entity_type', entityType)

      if (entityId) {
        q.where('p.entity_id', entityId)
      }
    }

    return q.delete()
  }

  flush(modelType: string, modelId: number) {
    return this.modelPermissionQuery
      .where(this.modelPermissionTable + '.model_type', modelType)
      .where(this.modelPermissionTable + '.model_id', modelId)
      .delete()
  }

  /**
   * sync permissions, remove everything outside of the list
   */
  async sync(modelType: string, modelId: number, permissionId: string[]) {
    await this.modelPermissionQuery
      .where('model_type', modelType)
      .where('model_id', modelId)
      .delete()

    return await this.giveAll(modelType, modelId, permissionId, null, null, true)
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
    const q = this.modelPermissionQuery
      .leftJoin(
        this.permissionTable + ' as p',
        'p.id',
        '=',
        this.modelPermissionTable + '.permission_id'
      )
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

  async findBySlug(slug: string, allowed: boolean = true) {
    return this.permissionQuery.where('slug', slug).where('allowed', allowed).firstOrFail()
  }

  private modelPermissionQueryWithForbiddenCheck(conditions: Partial<ModelPermissionsQuery>) {
    conditions.includeForbiddings = false
    return this.modelPermissionQueryBuilder(conditions)
  }

  private modelPermissionQueryBuilder(conditions: Partial<ModelPermissionsQuery>) {
    const { modelId, modelType, permissionSlugs, directPermissions, includeForbiddings } =
      conditions

    const q = this.permissionQuery.leftJoin(
      this.modelPermissionTable + ' as mp',
      'mp.permission_id',
      '=',
      this.permissionTable + '.id'
    )

    if (modelId && modelType) {
      if (directPermissions) {
        q.where('mp.model_type', modelType).where('mp.model_id', modelId)
      } else {
        q.leftJoin(this.modelRoleTable + ' as mr', (joinQuery) => {
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
          .from(this.permissionTable + ' as p2')
          .leftJoin(this.modelPermissionTable + ' as mp2', 'mp2.permission_id', '=', 'p2.id')
          .where('p2.allowed', false)
          .whereRaw('p2.slug=' + this.permissionTable + '.slug')
          .select('p2.slug')
          .groupBy('p2.slug')
        if (conditions.entity) {
          this.applyTargetRestriction('p2', subQuery, conditions.entity.type, conditions.entity.id)
        }
      })
    }

    if (permissionSlugs) {
      q.whereIn(this.permissionTable + '.slug', permissionSlugs)
    }

    return q
  }

  reverseModelPermissionQuery(conditions: Partial<ModelPermissionsQuery>) {
    const { modelId, modelType, permissionSlugs, directPermissions } = conditions
    const q = this.modelPermissionQuery.leftJoin(
      this.permissionTable + ' as p',
      'p.id',
      '=',
      this.modelPermissionTable + '.permission_id'
    )

    if (modelId && modelType) {
      if (directPermissions) {
        q.where(this.modelPermissionTable + '.model_type', modelType).where(
          this.modelPermissionTable + '.model_id',
          modelId
        )
      } else {
        q.join(this.modelRoleTable + ' as mr', (joinQuery) => {
          joinQuery.onVal('mr.model_type', modelType).andOnVal('mr.model_id', modelId)
        }).where((subQuery) => {
          subQuery
            .where((query) => {
              query
                .where(this.modelPermissionTable + '.model_type', modelType)
                .where(this.modelPermissionTable + '.model_id', modelId)
            })
            .orWhere((query) => {
              query
                .whereRaw('mr.role_id=' + this.modelPermissionTable + '.model_id')
                .where(this.modelPermissionTable + '.model_type', 'roles')
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
    const q = this.permissionQuery.whereIn('slug', permission).where('allowed', allowed)

    if (entityClass) {
      q.where('entity_type', entityClass)
      if (entityId) {
        q.where('entity_id', entityId)
      } else {
        q.whereNull('entity_id')
      }
    } else {
      q.where('entity_type', '*').whereNull('entity_id')
    }

    return q
  }

  private applyTargetRestriction(
    table: string,
    q: ModelQueryBuilderContract<typeof BaseModel, PermissionInterface>,
    entityType: string | null,
    entityId: number | null
  ) {
    if (entityType) {
      q.where((query) => {
        query.where(table + '.entity_type', entityType).orWhere(table + '.entity_type', '*')
      })
      if (entityId) {
        q.where((query) => {
          query.where(table + '.entity_id', entityId).orWhereNull(table + '.entity_id')
        })
      } else {
        q.whereNull(table + '.entity_id')
      }
    } else {
      q.where(table + '.entity_type', '*').whereNull(table + '.entity_id')
    }
  }
}
