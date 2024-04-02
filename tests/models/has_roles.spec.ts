import { test } from '@japa/runner'

import {
  createDatabase,
  createTables,
  defineModels,
  morphMap,
  seedDb,
} from '../../test-helpers/index.js'

import { Acl } from '../../src/acl.js'
import ModelManager from '../../src/model_manager.js'

test.group('Has role | model - role interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  group.each.setup(async () => {})

  test('Ensure model can assign role by model', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role, Permission, ModelRole, ModelPermission } =
      await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const role = await Role.create({
      slug: 'admin',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignRole(role)

    const modelRole = await ModelRole.query()
      .where('model_type', 'users')
      .where('model_id', user.id)
      .where('role_id', role.id)
      .first()

    assert.isTrue(modelRole !== null)
  })

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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const admin = await Role.create({
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
    await Acl.model(user).assignAllRoles(admin, 'manager', client)

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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const role = await Role.create({
      slug: 'admin',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignRole(role)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const role = await Role.create({
      slug: 'admin',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignRole(role)

    const hasRoleBySlug = await Acl.model(user).hasRole('admin')
    const hasRoleByModel = await Acl.model(user).hasRole(role)

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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    await Acl.model(user).assignRole(admin)
    await Acl.model(user).assignRole(manager)
    await Acl.model(user).assignRole(client)

    const hasAllRoles = await Acl.model(user).hasAllRoles(admin, manager, client)

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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    await Acl.model(user).assignRole(admin)
    // await Acl.model(user).assignRole(manager) // do no assigne manager
    await Acl.model(user).assignRole(client)

    const hasAllRoles = await Acl.model(user).hasAllRoles(admin, manager, client)

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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    await Acl.model(user).assignRole(admin)
    // await Acl.model(user).assignRole(manager) // do no assigne manager
    await Acl.model(user).assignRole(client)

    const hasAllRoles = await Acl.model(user).hasAnyRole(admin, manager)

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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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

    const hasAllRoles = await Acl.model(user).hasAnyRole(admin, manager)

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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignRole(admin)

    await Acl.model(user).revokeRole(admin)
    const hasRole = await Acl.model(user).hasRole(admin)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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

    await Acl.model(user).assignRole(admin)
    await Acl.model(user).assignRole(manager)

    await Acl.model(user).revokeAllRoles(admin, manager)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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

    await Acl.model(user).assignRole(admin)
    await Acl.model(user).assignRole(manager)
    await Acl.model(user).flushRoles()
    const roles = await Acl.model(user).roles()

    assert.lengthOf(roles, 0)
  })
})
