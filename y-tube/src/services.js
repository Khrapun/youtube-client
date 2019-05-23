/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
export function mergeById({ ...object }, { ...src }) {
  for (let i = 0; i < object.items.length; i += 1) {
    object.items[i].statistics = src.items[i].statistics;
  }
  return object;
}

export function getId(data) {
  const [...items] = data.items;
  const idN = items.reduce((arr, item) => {
    return arr.concat(item.id.videoId);
  }, []);
  return idN.join(',');
}
