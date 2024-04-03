import { BaseModel } from '@adonisjs/lucid/orm'
import { getRoleModelQuery } from '../query_helper.js'

export default class EmptyRoles {
  private roleQuery
  constructor(private roleClassName: typeof BaseModel) {
    this.roleQuery = getRoleModelQuery(this.roleClassName)
  }

  delete(role: string) {
    // get all permissions by slug
    // if there is permission with allowed false then check if it has `links`
    return this.roleQuery.where('slug', role).delete()
  }

  query() {
    return this.roleQuery
  }
}
