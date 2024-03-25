import { test } from '@japa/runner'

import {
  createDatabase,
  createTables,
  defineModels,
  // morphMap,
  seedDb,
} from '../../test-helpers/index.js'
import TestService from '../../src/services/test_service.js'

test.group('Has role | model - role interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  test('Ensure model can assign role', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product, Role } = await defineModels()

    await seedDb({ User, Post, Product })

    await Role.create({
      slug: 'edit',
      title: 'Edit',
    }) // TypeError: Cannot read properties of undefined (reading 'booted')

    const service = new TestService(Role.query())
    const a = await service.permissions()
    console.log(a)

    // const user = await User.first()
    // console.log(user) // this is ok
    // const post = await Post.create({})
    // console.log(post) // this is ok too
    //
    // await Role.create({
    //   slug: 'edit',
    //   title: 'Edit',
    // }) // TypeError: Cannot read properties of undefined (reading 'booted')

    assert.isTrue(true)
  })

  // test('Ensure model exists', async ({ assert }) => {
  //   const db = await createDatabase()
  //   await createTables(db)
  //   const { User, Role } = await defineModels()

  //   const a = await User.create({})

  //   const r = await Role.create({
  //     slug: 'sss',
  //     title: 'sssss',
  //   })
  //   const map = await morphMap()
  //   console.log(map.getAlias(Role))

  //   assert.instanceOf(a, User)
  //   assert.instanceOf(r, Role)
  // })
})
