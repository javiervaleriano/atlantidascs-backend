const destructureKeyValue = (obj) => {
  const keys = [],
    values = [];

  for (const prop in obj) {
    keys.push(prop);
    values.push(obj[prop]);
  }

  return [keys, values];
};

module.exports = {
  destructureKeyValue,
};