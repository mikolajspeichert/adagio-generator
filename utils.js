const values = {
  a: 21,
  b: 23,
  c: 12,
  d: 14,
  e: 16,
  f: 17,
  g: 19,
}

const resolveMIDIValue = key => {
  const keys = key.split('')
  const letter = keys[0].toLowerCase()
  const multiplier = parseInt(keys[1], 10)
  const accidental = keys[2] === 's' ? 1 : keys[2] === 'f' ? -1 : 0
  return values[letter] + 12 * multiplier + accidental
}

module.exports = { resolveMIDIValue }