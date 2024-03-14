export default class BaseService {
  protected formatList(models: (string | any)[]) {
    let slugs: string[] = []
    let ids: number[] = []

    for (let model of models) {
      if (typeof model === 'string') {
        slugs.push(model)
      } else {
        // @ts-ignore
        ids.push(model.id)
      }
    }

    return { slugs, ids }
  }
}
