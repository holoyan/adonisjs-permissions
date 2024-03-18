import app from '@adonisjs/core/services/app'

export async function morphMap() {
  const map = await app.container.make('morphMap')
  return map
}
