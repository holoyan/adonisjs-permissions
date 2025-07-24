import { test } from '@japa/runner'

import {
  createDatabase,
  createTables,
  makeId,
  seedDb,
  wantsUUID,
} from '../../test-helpers/index.js'

import { Scope } from '../../src/scope.js'
import { emitter, User, Post, Product } from '../../test-helpers/index.js'
import {
  PermissionCreatedEvent,
  PermissionDeletedEvent,
  PermissionsAttachedToModelEvent,
  PermissionsAttachedToRoleEvent,
  PermissionsDetachedFromModelEvent,
  PermissionsDetachedFromRoleEvent,
  PermissionsFlushedEvent,
  PermissionsFlushedFromRoleEvent,
  PermissionsForbadeEvent,
  PermissionsUnForbadeEvent,
} from '../../src/events/permissions/permissions.js'
import Permission from '../../src/models/permission.js'
import Role from '../../src/models/role.js'
import ModelPermission from '../../src/models/model_permission.js'
import { Acl } from '../../src/acl.js'

test.group('Permissions | Basic operations', (group) => {
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

  test('Creating permission by acl', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    let eventFired = false
    emitter.on(PermissionCreatedEvent, () => {
      eventFired = true
    })

    const create = await Acl.permission().create({
      slug: 'create',
    })

    assert.isTrue(create instanceof Permission)
    assert.isTrue(eventFired)
  })

  test('Deleting permission by acl', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    await Acl.permission().create({
      slug: 'create',
    })

    let eventFired = false
    emitter.on(PermissionDeletedEvent, () => {
      eventFired = true
    })

    const deleted = await Acl.permission().delete('create')

    assert.isTrue(deleted)
    assert.isTrue(eventFired)
  })

  test('Deleting permission by acl on non default scope', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    await Acl.permission().create({
      slug: 'create',
    })

    await Acl.permission().on('scope_2').create({
      slug: 'create',
    })

    await Acl.permission().on('scope_2').delete('create')

    const defaultCreatePermission = await Permission.query()
      .where('slug', 'create')
      .where('scope', Scope.defaultScope)
      .first()

    assert.isTrue(defaultCreatePermission instanceof Permission)
  })

  test('Attach permission to the role', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const permission = await Acl.permission().create({
      slug: 'create',
    })

    const role = await Acl.role().create({
      slug: 'admin',
    })

    let eventFired = false
    emitter.on(PermissionsAttachedToRoleEvent, () => {
      eventFired = true
    })

    await Acl.permission(permission).attachToRole(role.slug)

    assert.isTrue(eventFired)
  })

  test('Detach permission from role', async () => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    await Acl.permission().create({
      slug: 'create',
    })

    const permission = await Acl.permission().on('scope_2').create({
      slug: 'create',
    })

    const role = await Acl.role().create({
      slug: 'admin',
    })

    // let eventFired = false
    // emitter.on(PermissionsAttached, () => {
    //   eventFired = true
    // })

    await Acl.permission(permission).attachToRole(role.slug)

    // assert.isTrue(eventFired)
  })

  test('Ensure that correct scope can be assigned during create', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })
    //
    const create = await Acl.permission().create({
      slug: 'create',
    })

    const edit = await Acl.permission().create({
      slug: 'create',
      scope: '5',
    })

    assert.equal(create.scope, Scope.defaultScope)
    assert.equal(edit.scope, '5')
  })

  test('Ensure that duplicate permissions are ignored', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })
    //
    const create = await Acl.permission().create({
      slug: 'create',
    })

    const duplicate = await Acl.permission().create({
      slug: 'create',
    })

    assert.isTrue(duplicate.id === create.id)
  })

  test('Flushing permissions', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })
    //
    await Acl.permission().create({
      slug: 'create',
    })

    await Acl.permission().create({
      slug: 'edit',
    })

    await Acl.permission().create({
      slug: 'delete',
    })

    const admin = await Acl.role().create({
      slug: 'admin',
    })

    await Acl.role(admin).assignAll(['create', 'edit', 'delete'])

    let eventCalled = false
    emitter.on(PermissionsFlushedFromRoleEvent, () => {
      eventCalled = true
    })

    await Acl.role(admin).flush()

    const hasPermission = await Acl.role(admin).hasAnyPermissions(['create', 'edit', 'delete'])

    assert.isFalse(hasPermission)
    assert.isTrue(eventCalled)
  })
})

test.group('Permissions | model - permission direct global interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  // group.tap((t) => {
  //   t.pin()
  // })

  group.each.setup(async () => {
    // reset scope to default before the test
    Acl.scope(new Scope(), true)
  })
  group.each.disableTimeout()

  test('Ensure model can assign permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    const create = await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignDirectPermission('create')

    const modelPermission = await ModelPermission.query()
      .where('model_type', 'users')
      .where('model_id', user.id)
      .where('permission_id', create.id)
      .first()

    assert.isTrue(modelPermission instanceof ModelPermission)
  })

  test('Ensure model can assign multiple permissions', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    const create = await Permission.create({
      slug: 'create',
    })

    const edit = await Permission.create({
      slug: 'edit',
    })

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assignDirectAllPermissions(['create', 'edit'])

    const modelPermission = await ModelPermission.query()
      .where('model_type', 'users')
      .where('model_id', user.id)
      .whereIn('permission_id', [create.id, edit.id])
      .count('* as total')

    assert.isTrue(+modelPermission[0].$extras.total === [create, edit].length)
  })

  test('Get model permissions', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    const create = await Permission.create({
      slug: 'create',
    })

    const edit = await Permission.create({
      slug: 'edit',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit'])

    const permissions = await Acl.model(user).permissions()

    assert.lengthOf(permissions, [create, edit].length)
  })

  test('Checking permission by hasPermission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignDirectPermission('create')
    const has = await Acl.model(user).hasPermission('create')

    assert.isTrue(has)
  })

  test('Checking permission by hasAnyPermission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create'])
    const has = await Acl.model(user).hasAnyPermission(['create', 'edit'])

    assert.isTrue(has)
  })

  test('Checking permission by hasAllPermission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit'])
    const has = await Acl.model(user).hasAllPermissions(['create', 'edit'])

    assert.isTrue(has)
  })

  test('Revoke permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create'])
    await Acl.model(user).revokePermission('create')

    const perms = await Acl.model(user).permissions()

    assert.lengthOf(perms, 0)
  })

  test('Revoke list of permissions', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create'])

    let eventCalled = false
    emitter.on(PermissionsDetachedFromModelEvent, () => {
      eventCalled = true
    })

    await Acl.model(user).revokeAllPermissions(['create', 'edit'])

    const perms = await Acl.model(user).permissions()

    assert.lengthOf(perms, 0)
    assert.isTrue(eventCalled)
  })

  test('Flush permissions', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create'])

    let eventCalled = false
    emitter.on(PermissionsFlushedEvent, () => {
      eventCalled = true
    })

    await Acl.model(user).flushPermissions()

    const perms = await Acl.model(user).permissions()

    assert.lengthOf(perms, 0)
    assert.isTrue(eventCalled)
  })

  test('Sync permissions for a role', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const role = await Role.create({
      slug: 'Manager',
    })

    //
    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    await Acl.role(role).allow('create')

    await Acl.role(role).sync(['edit', 'delete'])

    const perms = await Acl.role(role).permissions()

    assert.lengthOf(perms, 2)
    perms.forEach((perm) => {
      assert.isTrue(['edit', 'delete'].includes(perm.slug))
    })
  })

  test('Sync permissions for a model', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.firstOrFail()

    //
    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    await Acl.model(user).allow('create')

    await Acl.model(user).syncPermissions(['edit', 'delete'])

    const perms = await Acl.model(user).permissions()

    assert.lengthOf(perms, 2)
    perms.forEach((perm) => {
      assert.isTrue(['edit', 'delete'].includes(perm.slug))
    })
  })
})

test.group('Permissions | model - permission direct resource interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  // group.tap((t) => {
  //   t.pin()
  // })

  group.each.setup(async () => {
    // reset scope to default before the test
    Acl.scope(new Scope(), true)
  })
  group.each.disableTimeout()

  // group.tap((t) => {
  //   t.pin()
  // })

  test('Ensure model can assign permission on a resource', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectPermission('create', post)

    const hasGlobalPermission = await Acl.model(user).can('create')
    const hasClassPermission = await Acl.model(user).can('create', Post)
    const hasResourcePermission = await Acl.model(user).can('create', post)

    assert.isFalse(hasGlobalPermission)
    assert.isFalse(hasClassPermission)
    assert.isTrue(hasResourcePermission)
  })

  test('Ensure model can assign permission on a resource class and subs', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectPermission('create', Post)

    const hasGlobalPermission = await Acl.model(user).can('create')
    const hasResourcePermission = await Acl.model(user).can('create', post)
    const hasClassPermission = await Acl.model(user).can('create', Post)

    assert.isFalse(hasGlobalPermission)
    assert.isTrue(hasResourcePermission)
    assert.isTrue(hasClassPermission)
  })

  test('Global level assign permissions affects on a resource', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectPermission('create') // assign globaly

    const hasGlobalPermission = await Acl.model(user).can('create', post)

    assert.isTrue(hasGlobalPermission)
  })

  test('Revoke permission on a resource', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectPermission('create', post)

    await Acl.model(user).revokePermission('create', post)
    const hasResourcePermission = await Acl.model(user).hasPermission('create', post) // should not make any effect
    assert.isFalse(hasResourcePermission)
  })

  test('Global level revoke will remove permissions from the resources as well', async ({
    assert,
  }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectPermission('create', post)

    await Acl.model(user).revokePermission('create')
    const hasResourcePermission = await Acl.model(user).hasPermission('create', post)
    const hasGlobalPermission = await Acl.model(user).hasPermission('create')

    assert.isFalse(hasResourcePermission)
    assert.isFalse(hasGlobalPermission)
  })

  test('Forbidding permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit', 'delete'])

    let eventFired = false
    emitter.on(PermissionsForbadeEvent, () => {
      eventFired = true
    })

    await Acl.model(user).forbid('delete')
    const hasGlobalPermission = await Acl.model(user).hasPermission('delete')

    assert.isFalse(hasGlobalPermission)
    assert.isTrue(eventFired)
  })

  test('Assign direct all permissions', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    let eventFired = false
    emitter.on(PermissionsAttachedToModelEvent, () => {
      eventFired = true
    })

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit', 'delete'])

    const hasCreatePermission = await Acl.model(user).hasPermission('create')
    const hasEditPermission = await Acl.model(user).hasPermission('edit')
    const hasDeletePermission = await Acl.model(user).hasPermission('delete')

    assert.isTrue(hasCreatePermission)
    assert.isTrue(hasEditPermission)
    assert.isTrue(hasDeletePermission)
    assert.isTrue(eventFired)
  })

  test('Forbidding permission on a resource', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit', 'delete'], post)

    await Acl.model(user).forbid('delete', post)
    const hasGlobalPermission = await Acl.model(user).hasPermission('delete', post)
    assert.isFalse(hasGlobalPermission)
  })

  test('Global forbidding will affect on resource', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit', 'delete'], post)

    // forbid globally
    await Acl.model(user).forbid('delete')
    const hasGlobalPermission = await Acl.model(user).hasPermission('delete', post)
    assert.isFalse(hasGlobalPermission)
  })

  test('Forbidding on a resource will not affect globally', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit', 'delete'])

    // forbid ona single resource
    await Acl.model(user).forbid('delete', post)

    // create new post

    const post2 = await Post.create(wantsUUID() ? { id: makeId() } : {})

    const hasResourcePermission = await Acl.model(user).hasPermission('delete', post)
    const hasGlobalPermission = await Acl.model(user).hasPermission('delete')
    const hasPermissionOnOthers = await Acl.model(user).hasPermission('delete', post2)
    assert.isFalse(hasResourcePermission)
    assert.isTrue(hasGlobalPermission)
    assert.isTrue(hasPermissionOnOthers)
  })

  test('Allow all except one', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }
    const post2 = await Post.query().where('id', '<>', post.id).first()

    if (!post2) {
      throw new Error('Post2 not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit', 'delete'])

    await Acl.model(user).forbid('delete', post)
    const hasOnOthers = await Acl.model(user).hasPermission('delete', post2)
    assert.isTrue(hasOnOthers)
  })

  test('Forbidding class level will forbid all its models', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    const post2 = await Post.query().where('id', '<>', post.id).first()

    if (!post2) {
      throw new Error('Post2 not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit', 'delete'])

    await Acl.model(user).forbid('delete', Post)
    const hasGlobaly = await Acl.model(user).hasPermission('delete')
    const hasOnFirst = await Acl.model(user).hasPermission('delete', post)
    const hasOnOthers = await Acl.model(user).hasPermission('delete', post2)
    assert.isTrue(hasGlobaly)
    assert.isFalse(hasOnOthers)
    assert.isFalse(hasOnFirst)
  })

  test('Forbidding globally will forbid to all subs', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    const post2 = await Post.query().where('id', '<>', post.id).first()

    if (!post2) {
      throw new Error('Post2 not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit', 'delete'])

    await Acl.model(user).forbid('delete')
    const hasGlobaly = await Acl.model(user).hasPermission('delete')
    const hasOnFirst = await Acl.model(user).hasPermission('delete', post)
    const hasOnOthers = await Acl.model(user).hasPermission('delete', post2)
    assert.isFalse(hasGlobaly)
    assert.isFalse(hasOnOthers)
    assert.isFalse(hasOnFirst)
  })

  test('Forbid multiple time will not make effect', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create'])
    await Acl.model(user).forbid('create', post)
    await Acl.model(user).forbid('create', post)
    await Acl.model(user).forbid('create', post)

    const modelPermissions = await ModelPermission.query()
      .where('model_type', 'users')
      .where('model_id', user.id)

    assert.lengthOf(modelPermissions, 2)
  })

  test('Un-forbidding permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit', 'delete'])
    await Acl.model(user).forbid('edit')
    await Acl.model(user).forbid('delete')

    let eventFired = false
    emitter.on(PermissionsUnForbadeEvent, () => {
      eventFired = true
    })

    await Acl.model(user).unforbid('delete')

    const hasCreatePermission = await Acl.model(user).hasPermission('create')
    const hasEditPermission = await Acl.model(user).hasPermission('edit')
    const hasDeletePermission = await Acl.model(user).hasPermission('delete')

    assert.isTrue(hasCreatePermission)
    assert.isFalse(hasEditPermission)
    assert.isTrue(hasDeletePermission)
    assert.isTrue(eventFired)
  })

  test('Get only global permissions', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit'])
    await Acl.model(user).assignDirectAllPermissions(['delete'], post)

    const onlyGlobals = await Acl.model(user).globalPermissions()
    assert.lengthOf(onlyGlobals, 2)
  })

  test('Get only on resource permissions', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create', 'edit'])
    await Acl.model(user).assignDirectAllPermissions(['delete'], post)

    const onlyGlobals = await Acl.model(user).onResourcePermissions()
    assert.lengthOf(onlyGlobals, 1)
  })

  test('Duplicate global assign will not make effect', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    const create = await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create'])
    await Acl.model(user).assignDirectAllPermissions(['create'])
    await Acl.model(user).assignDirectAllPermissions(['create'])

    const modelPermissions = await ModelPermission.query()
      .where('model_type', 'users')
      .where('model_id', user.id)
      .where('permission_id', create.id)

    assert.lengthOf(modelPermissions, 1)
  })

  test('Duplicate global and resource assign will not make effect', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()
    const post = await Post.first()

    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).assignDirectAllPermissions(['create'])
    await Acl.model(user).assignDirectAllPermissions(['create'], post)
    await Acl.model(user).assignDirectAllPermissions(['create'], Post)
    await Acl.model(user).assignDirectAllPermissions(['create'], post)

    const modelPermissions = await ModelPermission.query()
      .where('model_type', 'users')
      .where('model_id', user.id)

    assert.lengthOf(modelPermissions, 3)
  })

  test('Ability to assign same slug permission from different scopes', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    const scope = new Scope()

    await Permission.create({
      slug: 'create',
      scope: scope.default(),
    })

    const createScope5 = await Permission.create({
      slug: 'create',
      scope: '5',
    })

    await Permission.create({
      slug: 'edit',
      scope: '5',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).on(scope.default()).assignDirectAllPermissions(['create'])
    await Acl.model(user).on(createScope5.scope).assignDirectAllPermissions(['create', 'edit'])

    const modelPermissions = await ModelPermission.query()
      .where('model_type', 'users')
      .where('model_id', user.id)

    const permsOnDefaultScope = await Acl.model(user).on(scope.default()).permissions()
    const permsOnScope5 = await Acl.model(user).on(createScope5.scope).permissions()

    assert.lengthOf(modelPermissions, 3)
    assert.lengthOf(permsOnDefaultScope, 1)
    assert.lengthOf(permsOnScope5, 2)
  })

  test('Get permissions from the role', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    const admin = await Role.create({
      slug: 'admin',
    })

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    await Acl.role(admin).assign('create')
    await Acl.role(admin).assign('edit')

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).assignRole(admin.slug)
    await Acl.model(user).allow('delete')

    const permsFromRole = await Acl.model(user).permissions()
    const rolePerms = await Acl.model(user).rolePermissions()

    assert.lengthOf(permsFromRole, 3)
    assert.lengthOf(rolePerms, 2)
  })

  test('Assign non existing permissions to the role on different then default scope', async ({
    assert,
  }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const admin = await Acl.role().create({
      slug: 'admin',
      scope: 'group',
    })

    await Acl.role(admin).on('group').assignAll(['create', 'edit'])

    const perms = await Acl.role(admin).on('group').permissions()
    assert.lengthOf(perms, 2)
  })

  test('Give and rollback permissions', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })
    const user = await User.first()

    const admin = await Role.create({
      slug: 'admin',
    })

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    const trx = await db.transaction()

    await Acl.role(admin).withQueryOptions({ client: trx }).assign('create')
    await Acl.role(admin).withQueryOptions({ client: trx }).assign('edit')

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).withQueryOptions({ client: trx }).assignRole(admin.slug)
    await Acl.model(user).withQueryOptions({ client: trx }).allow('delete')

    await trx.rollback()

    const permsFromRole = await Acl.model(user).permissions()
    const rolePerms = await Acl.model(user).rolePermissions()
    const roles = await Acl.model(user).roles()

    assert.lengthOf(permsFromRole, 0)
    assert.lengthOf(rolePerms, 0)
    assert.lengthOf(roles, 0)
  })

  test('Give permissions and commit transaction', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    const admin = await Role.create({
      slug: 'admin',
    })

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    const trx = await db.transaction()

    await Acl.role(admin).withQueryOptions({ client: trx }).assign('create')
    await Acl.role(admin).withQueryOptions({ client: trx }).assign('edit')

    if (!user) {
      throw new Error('User not found')
    }

    await Acl.model(user).withQueryOptions({ client: trx }).assignRole(admin.slug)
    await Acl.model(user).withQueryOptions({ client: trx }).allow('delete')

    await trx.commit()

    const permsFromRole = await Acl.model(user).permissions()
    const rolePerms = await Acl.model(user).rolePermissions()
    const roles = await Acl.model(user).roles()
    const directPerms = await Acl.model(user).directPermissions()

    assert.lengthOf(permsFromRole, 3)
    assert.lengthOf(rolePerms, 2)
    assert.lengthOf(roles, 1)
    assert.lengthOf(directPerms, 1)
  })

  test('Revoke permissions and rollback transaction', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })
    const user = await User.first()

    const admin = await Role.create({
      slug: 'admin',
    })

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    await Acl.role(admin).assign('create')
    await Acl.role(admin).assign('edit')

    if (!user) {
      throw new Error('User not found')
    }
    await Acl.model(user).assign('admin')

    const trx = await db.transaction()

    await Acl.role(admin).withQueryOptions({ client: trx }).revoke('create')
    await Acl.role(admin).withQueryOptions({ client: trx }).revoke('edit')

    await trx.rollback()

    const permsFromRole = await Acl.model(user).permissions()
    const rolePerms = await Acl.model(user).rolePermissions()
    const roles = await Acl.model(user).roles()
    const directPerms = await Acl.model(user).directPermissions()

    assert.lengthOf(permsFromRole, 2)
    assert.lengthOf(rolePerms, 2)
    assert.lengthOf(roles, 1)
    assert.lengthOf(directPerms, 0)
  })

  test('hasPermission v containsPermission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })
    const user = await User.first()

    if (!user) {
      throw new Error('User not found')
    }

    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    await Permission.create({
      slug: 'delete',
    })

    await Acl.model(user).allowAll(['create', 'edit', 'delete'])

    await Acl.model(user).forbid('create')

    const hasPermission = await Acl.model(user).hasPermission('create')
    const containsPermission = await Acl.model(user).containsPermission('create')

    assert.isTrue(containsPermission)
    assert.isFalse(hasPermission)
  })
})

test.group('Permissions |  - permission interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  // group.tap((t) => {
  //   t.pin()
  // })

  group.each.setup(async () => {
    // reset scope to default before the test
    Acl.scope(new Scope(), true)
  })
  group.each.disableTimeout()

  // group.tap((t) => {
  //   t.pin()
  // })

  test('Attach role from permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const create = await Permission.create({
      slug: 'create',
    })

    const role = await Acl.role().create({
      slug: 'admin',
    })

    let eventFired = false
    emitter.on(PermissionsAttachedToRoleEvent, () => {
      eventFired = true
    })

    await Acl.permission(create).attachToRole('admin')

    const hasPermission = await Acl.role(role).hasPermission('create')
    assert.isTrue(hasPermission)
    assert.isTrue(eventFired)
  })

  test('Detach role from permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const create = await Permission.create({
      slug: 'create',
    })

    const role = await Acl.role().create({
      slug: 'admin',
    })

    let eventFired = false
    emitter.on(PermissionsDetachedFromRoleEvent, () => {
      eventFired = true
    })

    await Acl.permission(create).detachFromRole('admin')

    const hasPermission = await Acl.role(role).hasPermission('create')
    assert.isTrue(!hasPermission)
    assert.isTrue(eventFired)
  })
})

test.group('hasPermissions mixin', (group) => {
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

  test('allow permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await user.allow('create')
    const has = await Acl.model(user).hasPermission('create')

    assert.isTrue(has)
  })

  test('check permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const user = await User.first()
    //
    await Permission.create({
      slug: 'create',
    })

    if (!user) {
      throw new Error('User not found')
    }

    await user.allow('create')
    const has = await user.hasPermission('create')

    assert.isTrue(has)
  })
})

test.group('Has permission | fetch models by permissions', (group) => {
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

  test('Fetch all users which has create direct permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const usersWithCreatePermissions = await User.query().limit(5)

    // create role
    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    for (const user of usersWithCreatePermissions) {
      await Acl.model(user).allow('create')
    }

    const usersWithEditPermissions = await User.query().offset(5).limit(5)

    for (const user of usersWithEditPermissions) {
      await Acl.model(user).allow('edit')
    }

    const info = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'])
      })
      .count('* as total')

    assert.equal(info[0].$extras.total, 5)
  })

  test('Fetch all users which has "Manager" role', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const users = await User.query().limit(5)

    await Permission.create({
      slug: 'edit',
    })

    const role = await Role.create({
      slug: 'Manager',
    })

    await Acl.role(role).allow('edit')

    for (const user of users) {
      await Acl.model(user).assignRole('Manager')
    }

    const usersWithManagerRole = await User.query().withScopes((scopes) => {
      scopes.whereRoles('Manager')
    })

    assert.equal(usersWithManagerRole.length, users.length)
  })

  test('Fetch all users which has "create" direct permission, ignore forbidden', async ({
    assert,
  }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const usersWithCreatePermissions = await User.query().limit(5)

    // create role
    await Permission.create({
      slug: 'create',
    })

    const crateUsers = []
    for (const user of usersWithCreatePermissions) {
      await Acl.model(user).allow('create')
      crateUsers.push(user)
    }

    const userToForbid = crateUsers[0]
    await Acl.model(userToForbid).forbid('create')

    const info = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'])
      })
      .count('* as total')
    //
    assert.equal(info[0].$extras.total, usersWithCreatePermissions.length - 1)
  })

  test('Fetch all users with roles and permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const usersWithRoleAndPermission = await User.query().limit(5)
    const usersWithRoleAndPermissionIds = usersWithRoleAndPermission.map((u) => u.id)
    const usersWithRoleOnly = await User.query()
      .whereNotIn('id', usersWithRoleAndPermissionIds)
      .limit(5)
    const usersWithRoleOnlyIds = usersWithRoleOnly.map((u) => u.id)
    const usersWithPermissionOnly = await User.query()
      .whereNotIn('id', [...usersWithRoleAndPermissionIds, ...usersWithRoleOnlyIds])
      .limit(5)
    const usersWithPermissionOnlyIds = usersWithPermissionOnly.map((u) => u.id)

    // create role
    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    const role = await Role.create({
      slug: 'Manager',
    })

    await Acl.role(role).allow('edit')

    for (const user of usersWithRoleAndPermission) {
      await Acl.model(user).allow('create')
      await Acl.model(user).assignRole('Manager')
    }

    for (const user of usersWithRoleOnly) {
      await Acl.model(user).assignRole('Manager')
    }

    for (const user of usersWithPermissionOnly) {
      await Acl.model(user).allow('create')
    }

    // for (const user of users) {
    const directPerms = await User.query().withScopes((scopes) => {
      scopes.whereDirectPermissions(['create'])
    })
    const directPermUserIds = directPerms.map((u) => u.id)
    assert.equal(
      directPermUserIds.length,
      usersWithPermissionOnlyIds.length + usersWithRoleAndPermissionIds.length
    )

    const usersWithRoles = await User.query().withScopes((scopes) => {
      scopes.whereRoles('Manager')
    })
    const usersWithRolesIds = usersWithRoles.map((u) => u.id)
    assert.equal(
      usersWithRolesIds.length,
      usersWithRoleAndPermissionIds.length + usersWithRoleOnlyIds.length
    )
  })

  test('Fetch all users which has "create" permission on specific resource', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    if (!user) {
      throw new Error('User not found')
    }
    // create role
    await Permission.create({
      slug: 'create',
    })

    const post = await Post.first()
    if (!post) {
      throw new Error('Post not found')
    }

    await Acl.model(user).allow('create', post)

    const usersWithPostInstancePermission = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'], post)
      })
      .count('* as total')

    const usersWithPostClassPermission = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'], Post)
      })
      .count('* as total')

    const usersWithGlobalPermission = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'])
      })
      .count('* as total')

    assert.equal(usersWithPostInstancePermission[0].$extras.total, 1)
    assert.equal(usersWithPostClassPermission[0].$extras.total, 0)
    assert.equal(usersWithGlobalPermission[0].$extras.total, 0)
  })

  test('Fetch all users which has "create" permission on class level', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    if (!user) {
      throw new Error('User not found')
    }
    // create role
    await Permission.create({
      slug: 'create',
    })

    await Acl.model(user).allow('create', Post)

    const post = await Post.first()
    if (!post) {
      throw new Error('Post not found')
    }

    const usersWithPostInstancePermission = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'], post)
      })
      .count('* as total')

    const usersWithPostClassPermission = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'], Post)
      })
      .count('* as total')

    const usersWithGlobalPermission = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'])
      })
      .count('* as total')

    assert.equal(usersWithPostInstancePermission[0].$extras.total, 1)
    assert.equal(usersWithPostClassPermission[0].$extras.total, 1)
    assert.equal(usersWithGlobalPermission[0].$extras.total, 0)
  })

  test('Fetch all users which has "create" permission on global level', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    if (!user) {
      throw new Error('User not found')
    }
    // create role
    await Permission.create({
      slug: 'create',
    })

    await Acl.model(user).allow('create')

    const post = await Post.first()
    if (!post) {
      throw new Error('Post not found')
    }

    const usersWithPostInstancePermission = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'], post)
      })
      .count('* as total')

    const usersWithPostClassPermission = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'], Post)
      })
      .count('* as total')

    const usersWithGlobalPermission = await User.query()
      .withScopes((scopes) => {
        scopes.whereDirectPermissions(['create'])
      })
      .count('* as total')

    assert.equal(usersWithPostInstancePermission[0].$extras.total, 1)
    assert.equal(usersWithPostClassPermission[0].$extras.total, 1)
    assert.equal(usersWithGlobalPermission[0].$extras.total, 1)
  })

  test('Fetch all users which has "create" permission through role', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    if (!user) {
      throw new Error('User not found')
    }
    // create role
    await Permission.create({
      slug: 'create',
    })

    const role = await Acl.role().create({
      slug: 'admin',
    })

    const user2 = await User.query().where('id', '<>', user.id).first()
    if (!user2) {
      throw new Error('User2 not found')
    }

    await Acl.role(role).allow('create')

    await Acl.model(user).assign('admin')

    await Acl.model(user2).allow('create')

    const userWithPermissionThroughRole = await User.query().withScopes((scopes) => {
      scopes.whereRolePermissions(['create'])
    })

    assert.equal(userWithPermissionThroughRole[0].id, user.id)
  })

  test('Fetch all users which has "create" permission through role on resource', async ({
    assert,
  }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    if (!user) {
      throw new Error('User not found')
    }
    // create role
    await Permission.create({
      slug: 'create',
    })

    const role = await Acl.role().create({
      slug: 'admin',
    })

    const post = await Post.first()

    if (!post) {
      throw new Error('Post not found')
    }

    const user2 = await User.query().where('id', '<>', user.id).first()
    if (!user2) {
      throw new Error('User2 not found')
    }

    await Acl.role(role).allow('create', post)

    await Acl.model(user).assign('admin')

    await Acl.model(user2).allow('create')

    const userWithPermissionThroughRoleOnResource = await User.query().withScopes((scopes) => {
      scopes.whereRolePermissions(['create'], post)
    })

    const userWithPermissionThroughRole = await User.query().withScopes((scopes) => {
      scopes.whereRolePermissions(['create'])
    })

    assert.equal(userWithPermissionThroughRoleOnResource[0].id, user.id)
    assert.equal(userWithPermissionThroughRole.length, 0)
  })

  test('Fetch all users which has permissions through role or direct', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post, Product })

    const user = await User.first()

    if (!user) {
      throw new Error('User not found')
    }
    // create role
    await Permission.create({
      slug: 'create',
    })

    await Permission.create({
      slug: 'edit',
    })

    const role = await Acl.role().create({
      slug: 'admin',
    })

    const user2 = await User.query().where('id', '<>', user.id).first()
    if (!user2) {
      throw new Error('User2 not found')
    }

    await Acl.role(role).allow('create')

    await Acl.model(user).assign('admin')

    await Acl.model(user2).allowAll(['create', 'edit'])

    const userWithPermissionThroughRoleAndDirect = await User.query().withScopes((scopes) => {
      scopes.wherePermissions(['create', 'edit'])
    })

    assert.equal(userWithPermissionThroughRoleAndDirect.length, 2)
  })
})
