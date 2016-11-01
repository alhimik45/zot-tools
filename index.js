const lambda2ski = require('./lambda2ski')
const ski2zot = require('./ski2zot')

const ski = lambda2ski('((fn x x) (fn x (x x)) (fn y (y y)))')
console.log(ski)
const zot = ski2zot(ski)
console.log(zot)
