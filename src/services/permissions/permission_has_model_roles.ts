import Permission from '../../models/permission.js'

export default class PermissionHasModelRoles {
  constructor(private permission: Permission) {}

  roles() {
    return this.permission.id
  }
}
