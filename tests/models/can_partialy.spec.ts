import { test } from '@japa/runner'

import { createDatabase, createTables, seedDb } from '../../test-helpers/index.js'

import { Scope } from '../../src/scope.js'
import { User, Post } from '../../test-helpers/index.js'
import Permission from '../../src/models/permission.js'
import { Acl } from '../../src/acl.js'

test.group('Permissions | canPartially method', (group) => {
  group.each.setup(async () => {
    // reset scope to default before the test
    Acl.scope(new Scope(), true)
  })
  group.each.disableTimeout()

  test('Check canPartially method', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User, Post })

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

    // Assign permission on a specific post instance
    await Acl.model(user).assignDirectPermission('create', post)

    // Check permissions
    const hasGlobalPermission = await Acl.model(user).can('create')
    const hasClassPermission = await Acl.model(user).can('create', Post)
    const hasResourcePermission = await Acl.model(user).can('create', post)
    const hasPartialPermission = await Acl.model(user).canPartially('create', Post)

    // User doesn't have global or class-level permission
    assert.isFalse(hasGlobalPermission)
    assert.isFalse(hasClassPermission)

    // User has permission on the specific post instance
    assert.isTrue(hasResourcePermission)

    // User has permission on at least one Post instance, so canPartially should return true
    assert.isTrue(hasPartialPermission)

    // Create another user without any permissions
    const user2 = await User.create({})

    // This user should not have any permissions
    const hasPartialPermission2 = await Acl.model(user2).canPartially('create', Post)
    assert.isFalse(hasPartialPermission2)
  })
})
