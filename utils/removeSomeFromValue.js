function removeSomeFromValue(value) {
  return value.replace(/^Some\((\d+)\)$/, '$1');
}

module.exports = removeSomeFromValue;