export interface HasRoles {
  getMorphMapName: () => string
  getModelId: () => number | null
}

export interface HasPermissions extends HasRoles {}
