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

test.group('Has permission | model - permission direct global interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  group.each.setup(async () => {})

  test('Ensure model can assign permission', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Role, Permission, ModelRole, ModelPermission } = await defineModels()
    const modelManager = new ModelManager()
    modelManager.setModel('permission', Permission)
    modelManager.setModel('role', Role)
    modelManager.setModel('modelPermission', ModelPermission)
    modelManager.setModel('modelRole', ModelRole)
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
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

    const post2 = await Post.create({})

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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    const post = await Post.first()
    const post2 = await Post.query().limit(1).offset(5).first()

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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    const post = await Post.first()
    const post2 = await Post.query().limit(1).offset(5).first()

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
    Acl.setModelManager(modelManager)
    Acl.setMorphMap(morphMap)
    await seedDb({ User, Post, Product })
    const user = await User.first()
    const post = await Post.first()
    const post2 = await Post.query().limit(1).offset(5).first()

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
})
