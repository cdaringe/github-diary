import { values } from "lodash";

export function githubToFlare(
  root: string,
  keyedData: { [key: string]: any },
  extractLevels: any
) {
  var flareDataAggegator = { root };
  values(keyedData).forEach((pr: any) => {
    const levels = extractLevels(pr);
    let slug = root;
    while (levels.length) {
      slug += `.${levels[0].replace(/\./g, "_")}`;
      flareDataAggegator[slug] = slug;
      levels.shift();
    }
  });
  return values(flareDataAggegator).map((id: any) => ({
    id,
    value: id,
  }));
}
