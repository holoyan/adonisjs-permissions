/*
 * @poppinss/data-models
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { BaseModel, column } from '@adonisjs/lucid/orm'

import { createDatabase, createTables } from '../../test-helpers/index.js'

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
      declare username: string

      @column()
      declare email: string

      @column()
      declare password: string
    }

    const a = await User.find(1)

    assert.instanceOf(a, User)
  })
})
