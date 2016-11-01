'use strict'
const S = 'S'
const K = 'K'
const I = 'I'
const applySki = '`'

const applyZot = '1'
const SZot = '101010100'
const KZot = '1010100'
const IZot = '100'

module.exports = function ski2zot (ski) {
  let result = ''
  for (const char of ski) {
    switch (char.toUpperCase()) {
      case applySki:
        result += applyZot
        break
      case S:
        result += SZot
        break
      case K:
        result += KZot
        break
      case I:
        result += IZot
        break
      default: // ignore something else
    }
  }
  return result
}
