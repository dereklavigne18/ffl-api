function getObjectValues(obj) {
  return Object.keys(obj).map(k => obj[k]);
}

function range(start, end) {
  const result = [];
  // eslint-disable-next-line no-const-assign,no-plusplus
  for (let i = start; i < end; i++) {
    result.push(i);
  }

  return result;
}

module.exports = {
  getObjectValues,
  range,
};
