const S = '$S'
const K = '$K'
const I = '$I'
const apply = '`'
const lambda = 'fn'

const P = require('parsimmon')
const R = require('ramda')

// A little helper to wrap a parser with optional whitespace.
const spaced = (parser) => {
  return P.optWhitespace.then(parser).skip(P.optWhitespace)
}

// A little helper to wrap a parser with parens.
const parened = (parser) => {
  return spaced(P.string('(').then(spaced(parser)).skip(P.string(')')))
}

// The basic parsers (usually the ones described via regexp) should have a
// description for error message purposes.
const LVar = P.regex(/[a-zA-Z_-][a-zA-Z0-9_-]*/).desc('variable')

// We need to use `P.lazy` here because the other parsers don't exist yet.
const LBody =
P.lazy(() => {
  return spaced(P.alt(
    LLambda,
    LApply,
    LVar
    ))
})

const LLambda = parened(P.seq(
  P.string(lambda).desc('lambda'),
  spaced(LVar),
  LBody
  ))

const LApply = parened(LBody.many())

const LambdaCalculus = LBody

const multiApply2Single = (ast) => {
  if (Array.isArray(ast)) {
    if (ast.length > 3) {
      const last = ast.pop()
      return [multiApply2Single(ast), last]
    } else if (ast.length === 3) {
      if (ast[0] === lambda) {
        ast[2] = multiApply2Single(ast[2])
      } else {
        const last = ast.pop()
        return [ast, last]
      }
    } else {
      return ast.map(multiApply2Single)
    }
  }
  return ast
}

const addApply = (ast) => {
  if (Array.isArray(ast)) {
    if (ast.length === 2) {
      ast.unshift(apply)
      ast[1] = addApply(ast[1])
      ast[2] = addApply(ast[2])
    } else {
      ast[2] = addApply(ast[2])
    }
  }
  return ast
}

const eliminate = (ast, currentVar) => {
  return ast.map((token) => {
    if (token === apply) {
      return [apply, apply, S]
    } else if (token === currentVar) {
      return I
    } else {
      return [apply, K, token]
    }
  })
}

const translate = (ast) => {
  if (ast[0] === lambda) {
    if (Array.isArray(ast[2])) {
      ast[0] = eliminate(R.flatten(translate(ast[2])), ast[1])
      ast.pop()
      ast.pop()
    } else {
      if (ast[1] === ast[2]) {
        return I
      } else {
        return [apply, K, ast[2]]
      }
    }
  } else if (ast[0] === apply) {
    ast[1] = translate(ast[1])
    ast[2] = translate(ast[2])
  }
  return ast
}

module.exports = (calculus) => {
  const parsed = LambdaCalculus.parse(calculus)
  if (parsed.status) {
    return R.pipe(
      multiApply2Single,
      addApply,
      translate,
      R.flatten)(parsed.value)
      .join('')
      .replace(/\$/g, '')
  } else {
    throw new Error('Parse error ' + JSON.stringify(parsed))
  }
}
