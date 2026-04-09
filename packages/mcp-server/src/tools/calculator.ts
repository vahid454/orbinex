import type { OrbinexTool } from '../lib/types'

// Safe math evaluator — no eval(), uses a simple recursive parser
function parse(expr: string): number {
  const tokens = expr.replace(/\s+/g, '').match(/([+\-*/^()%]|\d+\.?\d*)/g) ?? []
  let pos = 0

  function parseExpr(): number { return parseAddSub() }

  function parseAddSub(): number {
    let left = parseMulDiv()
    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++]
      const right = parseMulDiv()
      left = op === '+' ? left + right : left - right
    }
    return left
  }

  function parseMulDiv(): number {
    let left = parsePow()
    while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/' || tokens[pos] === '%')) {
      const op = tokens[pos++]
      const right = parsePow()
      if (op === '*') left *= right
      else if (op === '/') { if (right === 0) throw new Error('Division by zero'); left /= right }
      else left %= right
    }
    return left
  }

  function parsePow(): number {
    let base = parseUnary()
    if (pos < tokens.length && tokens[pos] === '^') {
      pos++
      base = Math.pow(base, parsePow())
    }
    return base
  }

  function parseUnary(): number {
    if (tokens[pos] === '-') { pos++; return -parsePrimary() }
    if (tokens[pos] === '+') { pos++; return parsePrimary() }
    return parsePrimary()
  }

  function parsePrimary(): number {
    if (tokens[pos] === '(') {
      pos++
      const val = parseExpr()
      pos++ // ')'
      return val
    }
    return parseFloat(tokens[pos++])
  }

  return parseExpr()
}

export const calculatorTool: OrbinexTool = {
  name: 'calculate',
  description: 'Evaluate mathematical expressions. Supports +, -, *, /, ^ (power), % (modulo), and parentheses. Use for any arithmetic or math calculation.',
  parameters: {
    expression: {
      type: 'string',
      description: 'Math expression to evaluate, e.g. "2 + 2", "(15 * 4) / 3", "2^10"',
      required: true,
    },
  },
  handler: async ({ expression }) => {
    const expr = String(expression).trim()
    try {
      const result = parse(expr)
      if (!isFinite(result)) return { error: 'Result is not finite', expression: expr }
      return {
        expression: expr,
        result,
        formatted: Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, ''),
      }
    } catch (err: any) {
      return { error: `Could not parse: ${err.message}`, expression: expr }
    }
  },
}