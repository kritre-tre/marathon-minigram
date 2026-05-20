function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function pick(source, keys) {
  return keys.reduce((result, key) => {
    if (source[key] !== undefined) result[key] = source[key]
    return result
  }, {})
}

function toMysqlDateTime(value) {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value} 00:00:00`
  return value
}

module.exports = {
  required,
  pick,
  toMysqlDateTime
}

