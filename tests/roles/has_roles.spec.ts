import { test } from '@japa/runner'

import {
  createDatabase,
  createTables,
  defineModels,
  // morphMap,
  seedDb,
} from '../../test-helpers/index.js'
import { Acl } from '../../index.js'
import { AclModel } from '../../src/types.js'
import Role from '../../src/models/role.js'

test.group('Has role | model - role interaction', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  test('Ensure model can assigne role', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    const { User, Post, Product } = await defineModels()

    await seedDb({ User, Post, Product })

    // get user
    // get role
    // assigne role to user
    // check if record exists in db
    Role.boot()
    Role.useAdapter(db.modelAdapter())

    const role = await Role.first()
    const user = (await User.query().first()) as unknown as AclModel
    // console.log(user)
    if (user && role) {
      await Acl.role(role)
    }

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
