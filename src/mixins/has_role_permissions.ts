import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'

export default <
  Model extends NormalizeConstructor<import('@adonisjs/lucid/types/model').LucidModel>,
>(
  superclass: Model
) => {
  return class extends superclass {
    getMorphMapName(): string {
      throw new Error(
        'method getMorphMapName must be implemented in target model, which will return string alias for model class'
      )
    }

    getModelId(): number {
      throw new Error(
        'method getModelId must be implemented in target model, which will return key for current object'
      )
    }
  }
}
