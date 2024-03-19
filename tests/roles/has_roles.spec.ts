import { test } from '@japa/runner'

import { BaseModel, column } from '@adonisjs/lucid/orm'

import { createDatabase, createTables } from '../../test-helpers/index.js'
import { DateTime } from 'luxon'

test.group('Some title | check type', (group) => {
  group.setup(async () => {})

  group.teardown(async () => {})

  test('Ensure model exists', async ({ assert }) => {
    const db = await createDatabase()
    await createTables(db)

    class User extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare full_name: string

      @column()
      declare email: string

      @column()
      declare password: string

      @column.dateTime({ autoCreate: true })
      declare createdAt: DateTime

      @column.dateTime({ autoCreate: true, autoUpdate: true })
      declare updatedAt: DateTime | null
    }

    const a = await User.create({
      full_name: 'sss',
      email: 'sssss',
      password: 'cc',
    })

    assert.instanceOf(a, User)
  })
})
