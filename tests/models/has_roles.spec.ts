import { test } from '@japa/runner'

import {
  createDatabase,
  createTables,
  defineModels,
  morphMap,
  seedDb,
} from '../../test-helpers/index.js'

import { Acl, AclManager } from '../../src/acl.js'
import ModelManager from '../../src/model_manager.js'
import { Scope } from '../../src/scope.js'

test.group('', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  // group.each.setup(async () => {})
  group.each.disableTimeout()

  test('Creating role by acl', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    modelManager.setModel('scope', Scope)

    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    await seedDb({ User })
    //
    const admin = await Acl.role().create({
      slug: 'admin',
    })

    assert.isTrue(admin instanceof Role)
  })

  test('Ensure that correct scope can be assigned to the role during create', async ({
    assert,
  }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    modelManager.setModel('scope', Scope)

    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    await seedDb({ User })
    //
    const admin = await Acl.role().create({
      slug: 'admin',
    })

    const admin2 = await Acl.role().create({
      slug: 'admin',
      scope: '5',
    })

    assert.equal(admin.scope, Scope.defaultScope)
    assert.equal(admin2.scope, '5')

    const roles = await Role.all()

    assert.lengthOf(roles, 2)
  })

  test('Ensure that duplicate roles are ignored', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    modelManager.setModel('scope', Scope)

    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    await seedDb({ User })
    //
    const admin = await Acl.role().create({
      slug: 'create',
    })

    const duplicate = await Acl.role().create({
      slug: 'create',
    })

    assert.isTrue(admin.id === duplicate.id)
  })
})

test.group('Has role | model - role interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  group.each.setup(async () => {})
  group.each.disableTimeout()

  test('Ensure model can assign multiple roles at once', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    await Role.create({
      slug: 'admin',
    })

    await Role.create({
      slug: 'manager',
    })

    const client = await Role.create({
      slug: 'client',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignAllRoles('admin', 'manager', client.slug)

    const modelRoles = await ModelRole.query()
      .where('model_type', 'users')
      .where('model_id', user.id)
      .count('* as total')

    assert.isTrue(+modelRoles[0].$extras.total === 3)
  })

  test('Ensure model can assign role by role slug', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const role = await Role.create({
      slug: 'admin',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignRole('admin')

    const modelRole = await ModelRole.query()
      .where('model_type', 'users')
      .where('model_id', user.id)
      .where('role_id', role.id)
      .first()

    assert.isTrue(modelRole !== null)
  })

  test('Get model roles', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const role = await Role.create({
      slug: 'admin',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignRole(role.slug)
    const userRoles = await Acl.model(user).roles()

    assert.lengthOf(userRoles, 1)
    assert.isTrue(userRoles[0] instanceof Role)
  })

  test('Check if model hasRole', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const role = await Role.create({
      slug: 'admin',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignRole(role.slug)

    const hasRoleBySlug = await Acl.model(user).hasRole('admin')
    const hasRoleByModel = await Acl.model(user).hasRole(role.slug)

    assert.isTrue(hasRoleBySlug)
    assert.isTrue(hasRoleByModel)
  })

  test('Check if model has all roles', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    const manager = await Role.create({
      slug: 'manager',
    })

    const client = await Role.create({
      slug: 'client',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignRole(admin.slug)
    await Acl.model(user).assignRole(manager.slug)
    await Acl.model(user).assignRole(client.slug)

    const hasAllRoles = await Acl.model(user).hasAllRoles(admin.slug, manager.slug, client.slug)

    assert.isTrue(hasAllRoles)
  })

  test('hasAllRoles must return false', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    const manager = await Role.create({
      slug: 'manager',
    })

    const client = await Role.create({
      slug: 'client',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignRole(admin.slug)
    // await Acl.model(user).assignRole(manager) // do no assigne manager
    await Acl.model(user).assignRole(client.slug)

    const hasAllRoles = await Acl.model(user).hasAllRoles(admin.slug, manager.slug, client.slug)

    assert.isFalse(hasAllRoles)
  })

  test('Check if model has at least one role', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    const manager = await Role.create({
      slug: 'manager',
    })

    const client = await Role.create({
      slug: 'client',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignRole(admin.slug)
    // await Acl.model(user).assignRole(manager) // do no assigne manager
    await Acl.model(user).assignRole(client.slug)

    const hasAllRoles = await Acl.model(user).hasAnyRole(admin.slug, manager.slug)

    assert.isTrue(hasAllRoles)
  })

  test('hasAnyRole must return false', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    const manager = await Role.create({
      slug: 'manager',
    })

    if (!user) {
      throw new Error('User not found')
    }
    // await Acl.model(user).assignRole(admin)
    // await Acl.model(user).assignRole(manager) // do no assigne manager

    const hasAllRoles = await Acl.model(user).hasAnyRole(admin.slug, manager.slug)

    assert.isFalse(hasAllRoles)
  })

  test('Revoke role from the model', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignRole(admin.slug)

    await Acl.model(user).revokeRole(admin.slug)
    const hasRole = await Acl.model(user).hasRole(admin.slug)
    const roles = await Acl.model(user).roles()

    assert.isFalse(hasRole)
    assert.lengthOf(roles, 0)
  })

  test('Revoke all roles from the model', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    const manager = await Role.create({
      slug: 'manager',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignRole(admin.slug)
    await Acl.model(user).assignRole(manager.slug)

    await Acl.model(user).revokeAllRoles(admin.slug, manager.slug)
    const roles = await Acl.model(user).roles()

    assert.lengthOf(roles, 0)
  })

  test('Flush roles', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    modelManager.setModel('scope', Scope)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    const manager = await Role.create({
      slug: 'manager',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignRole(admin.slug)
    await Acl.model(user).assignRole(manager.slug)
    await Acl.model(user).flushRoles()
    const roles = await Acl.model(user).roles()

    assert.lengthOf(roles, 0)
  })

  test('Duplicate assign will not make effect', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignRole(admin.slug)
    await Acl.model(user).assignRole(admin.slug)
    await Acl.model(user).assignRole(admin.slug)
    await Acl.model(user).assignRole(admin.slug)

    const modelRoles = await ModelRole.query()
      .where('model_type', 'users')
      .where('model_id', user.id)
      .where('role_id', admin.id)

    assert.lengthOf(modelRoles, 1)
  })
})
