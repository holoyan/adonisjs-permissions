import { LucidModel } from '@adonisjs/lucid/types/model'

export interface Permissions {
  tables: Object
}

export interface AclModelInterface {
  getMorphMapName(): string

  getModelId(): number
}

export type AclModel = LucidModel & AclModelInterface
