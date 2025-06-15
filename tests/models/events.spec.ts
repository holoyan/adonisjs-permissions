import { test } from '@japa/runner'

import { createDatabase, createTables, emitter, seedDb, User } from '../../test-helpers/index.js'

import { Acl, AclManager } from '../../src/acl.js'
import { Scope } from '../../src/scope.js'
import { RoleCreatedEvent, RoleDeletedEvent } from '../../src/events/roles/roles.js'

test.group('Events | Basic operations', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  group.each.setup(async () => {
    // reset scope to default before the test
    Acl.scope(new Scope(), true)
    Acl.withEvents()
  })
  group.each.disableTimeout()

  test('Disabling event emitting globally', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    Acl.withoutEvents()

    let eventCalled = false
    emitter.on(RoleCreatedEvent, () => {
      eventCalled = true
    })

    //
    await Acl.role().create({
      slug: 'admin',
    })

    assert.isFalse(eventCalled)
  })

  test('Disabling event emitting per query', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    let eventCalled = false
    emitter.on(RoleCreatedEvent, () => {
      eventCalled = true
    })

    //
    await Acl.role().withoutEvents().create({
      slug: 'admin',
    })

    assert.isFalse(eventCalled)
  })

  test('Event emitting is disabled on run time', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    let roleCreatedEvent = false
    emitter.on(RoleCreatedEvent, () => {
      roleCreatedEvent = true
    })

    let roleDeletedEvent = false
    emitter.on(RoleDeletedEvent, () => {
      roleDeletedEvent = true
    })

    //
    await Acl.role().withoutEvents().create({
      slug: 'admin',
    })

    await Acl.role().delete('admin')

    assert.isFalse(roleCreatedEvent)
    assert.isTrue(roleDeletedEvent)
  })

  test('Event emitting is disabled per Acl', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)
    await seedDb({ User })

    const acl1 = new AclManager(false)
    const acl2 = new AclManager(false)

    acl1.withoutEvents()
    acl2.withEvents()

    let roleCreatedEvent = false
    emitter.on(RoleCreatedEvent, () => {
      roleCreatedEvent = true
    })

    await acl1.role().create({
      slug: 'admin_acl1',
    })

    assert.isFalse(roleCreatedEvent)

    await acl2.role().create({
      slug: 'admin_acl2',
    })

    assert.isTrue(roleCreatedEvent)
  })
})
