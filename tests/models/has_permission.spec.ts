import { test } from '@japa/runner'

import {
  createDatabase,
  createTables,
  defineModels,
  makeId,
  morphMap,
  seedDb,
  wantsUUID,
} from '../../test-helpers/index.js'

import { Acl, AclManager } from '../../src/acl.js'
import ModelManager from '../../src/model_manager.js'
import { Scope } from '../../src/scope.js'

test.group('', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  // group.each.setup(async () => {})
  group.each.disableTimeout()

  test('Creating permission by acl', async ({ assert }) => {
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
    const create = await Acl.permission().create({
      slug: 'create',
    })

    assert.isTrue(create instanceof Permission)
  })

  test('Ensure that correct scope can be assigned during create', async ({ assert }) => {
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
    const create = await Acl.permission().create({
      slug: 'create',
    })

    const duplicate = await Acl.permission().create({
      slug: 'create',
    })

    assert.isTrue(duplicate.id === create.id)
  })
})

test.group('Has permission | model - permission direct global interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  // group.each.setup(async () => {})
  group.each.disableTimeout()

  test('Ensure model can assign permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
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
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
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
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
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
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
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
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
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
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
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
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
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
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
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
    await Acl.model(user).revokeAllPermissions(['create', 'edit'])

    const perms = await Acl.model(user).permissions()

    assert.lengthOf(perms, 0)
  })

  test('Flush permissions', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    AclManager.setModelManager(modelManager)
    AclManager.setMorphMap(morphMap)

    modelManager.setModel('scope', Scope)
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
    await Acl.model(user).flushPermissions()

    const perms = await Acl.model(user).permissions()

    assert.lengthOf(perms, 0)
  })
})

test.group('Has permission | model - permission direct resource interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  group.each.setup(async () => {})
  group.each.disableTimeout()

  test('Ensure model can assign permission on a resource', async ({ assert }) => {
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

    await Acl.model(user).forbid('delete')
    const hasGlobalPermission = await Acl.model(user).hasPermission('delete')
    assert.isFalse(hasGlobalPermission)
  })

  test('Forbidding permission on a resource', async ({ assert }) => {
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

  test('Get only global permissions', async ({ assert }) => {
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

  test('Forbid multiple time will not make effect', async ({ assert }) => {
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

  test('Ability to assign same slug permission from different scopes', async ({ assert }) => {
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
})
