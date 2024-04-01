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

  test('Ensure model can assign role', async ({ assert }) => {
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

    await seedDb({ User, Post, Product, Permission })
    const user = await User.first()

    if (user) {
      const r = await Acl.model(user).roles()
      console.log(r)
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
