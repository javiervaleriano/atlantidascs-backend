const formatKeyValue = (obj) => {
  const data = [];

  for (const prop in obj) {
    data.push([prop.replaceAll('-', ' ').toUpperCase(), obj[prop]]);
  }

  return data;
};

module.exports = {
  formatKeyValue,
};