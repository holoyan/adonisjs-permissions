import { test } from '@japa/runner'

import {
  createDatabase,
  createTables,
  emitter,
  Post,
  Product,
  seedDb,
  User,
} from '../../test-helpers/index.js'

import { AclManager, Acl } from '../../src/acl.js'
import { Scope } from '../../src/scope.js'
import { ModelRole, Role } from '../../index.js'
import {
  PermissionsAttachedToRoleEvent,
  PermissionsDetachedFromRoleEvent,
} from '../../src/events/permissions/permissions.js'

test.group('Role | Basic operations', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  group.each.setup(async () => {
    // reset scope to default before the test
    Acl.scope(new Scope(), true)
  })
  group.each.disableTimeout()

  test('Creating role by acl', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
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

test.group('Role | role - permission interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  group.each.setup(async () => {
    // reset scope to default before the test
    Acl.scope(new Scope(), true)
  })
  group.each.disableTimeout()

  test('Giving role a permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })
    //
    const admin = await Acl.role().create({
      slug: 'admin',
    })

    const create = await Acl.permission().create({
      slug: 'create',
    })

    const edit = await Acl.permission().create({
      slug: 'ed',
    })

    let eventCalled = false
    emitter.on(PermissionsAttachedToRoleEvent, () => {
      eventCalled = true
    })

    await Acl.role(admin).give(create.slug)

    const canCreate = await Acl.role(admin).can(create.slug)
    const canEdit = await Acl.role(admin).can(edit.slug)

    assert.isTrue(canCreate)
    assert.isTrue(!canEdit)
    assert.isTrue(eventCalled)
  })

  test('Removing permission from the role', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })
    //
    const admin = await Acl.role().create({
      slug: 'admin',
    })

    const create = await Acl.permission().create({
      slug: 'create',
    })

    await Acl.role(admin).give(create.slug)

    let eventCalled = false
    emitter.on(PermissionsDetachedFromRoleEvent, () => {
      eventCalled = true
    })

    await Acl.role(admin).revoke(create.slug)

    const canCreate = await Acl.role(admin).can(create.slug)

    assert.isTrue(!canCreate)
    assert.isTrue(eventCalled)
  })
})

test.group('Has role | model - role interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  group.each.setup(async () => {
    // reset scope to default before the test
    Acl.scope(new Scope(), true)
  })
  group.each.disableTimeout()
  // group.tap((t) => {
  //   t.pin()
  // })

  test('Ensure model can assign multiple roles at once', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
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

  test('Assign role on other then default scope', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    // create role
    await Role.create({
      slug: 'admin',
      scope: 'other',
    })

    await Role.create({
      slug: 'manager',
      scope: 'other',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).on('other').assignAllRoles('admin', 'manager')

    const modelRoles = await ModelRole.query()
      .where('model_type', 'users')
      .where('model_id', user.id)
      .count('* as total')

    const defRoles = await Acl.model(user).roles()
    const roles = await Acl.model(user).on('other').roles()

    assert.lengthOf(roles, 2)
    assert.lengthOf(defRoles, 0)
    assert.isTrue(+modelRoles[0].$extras.total === 2)
  })

  test('Revoke role on other then default scope', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    // create role
    await Role.create({
      slug: 'admin',
      scope: 'other',
    })

    await Role.create({
      slug: 'manager',
      scope: 'other',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).on('other').assignAllRoles('admin', 'manager')

    await Acl.model(user).on('other').revokeAllRoles('admin', 'manager')

    const roles = await Acl.model(user).on('other').roles()
    assert.lengthOf(roles, 0)
  })

  test('Overwrite global middleware scope', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const scope = new Scope()
    const acl = new AclManager(true).scope(scope)

    const user = await User.first()
    // create role
    await Role.create({
      slug: 'admin',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await acl.model(user).assignRole('admin')
    const roles = await acl.model(user).roles()
    assert.equal(roles.length, 1)
    assert.equal(roles[0].slug, 'admin')
  })

  test('Sync role for a model', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.firstOrFail()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    const manager = await Role.create({
      slug: 'manager',
    })

    await Acl.model(user).assignRole(admin.slug)
    await Acl.model(user).syncRoles([manager.slug])

    const roles = await Acl.model(user).roles()

    assert.lengthOf(roles, 1)
    assert.equal(roles[0].slug, manager.slug)
  })

  test('Sync without detaching role for a model', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.firstOrFail()
    // create role
    const admin = await Role.create({
      slug: 'admin',
    })

    const manager = await Role.create({
      slug: 'manager',
    })

    await Acl.model(user).assignRole(admin.slug)
    await Acl.model(user).syncRolesWithoutDetaching([manager.slug])

    const roles = await Acl.model(user).roles()

    assert.lengthOf(roles, 2)
    roles.forEach((role) => {
      assert.isTrue(role.slug === admin.slug || role.slug === manager.slug)
    })
  })
})
