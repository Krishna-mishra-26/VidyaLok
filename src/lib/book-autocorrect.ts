import fs from 'node:fs'
import path from 'node:path'

export type BookSuggestion = {
  title: string
  score: number
}

type PreparedBookEntry = {
  title: string
  normalized: string
}

type DatasetCache = {
  entries: PreparedBookEntry[]
}

const DATASET_FILENAME = 'Books Dataset.csv'
const MIN_AUTOCORRECT_SCORE = 0.62

const globalCache = globalThis as typeof globalThis & {
  __vidyalokBookDataset?: DatasetCache
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const parseCsv = (input: string): string[][] => {
  const rows: string[][] = []
  let currentField = ''
  let currentRow: string[] = []
  let inQuotes = false

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const isLastChar = index === input.length - 1

    if (char === '"') {
      if (inQuotes && input[index + 1] === '"') {
        currentField += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && (char === ',' || char === '\n' || char === '\r')) {
      if (char === ',' ) {
        currentRow.push(currentField)
        currentField = ''
        continue
      }

      if (char === '\r') {
        if (input[index + 1] === '\n') {
          index += 1
        }
      }

      currentRow.push(currentField)
      currentField = ''

      if (currentRow.length > 0) {
        rows.push(currentRow)
        currentRow = []
      }

      continue
    }

    currentField += char

    if (isLastChar) {
      currentRow.push(currentField)
      rows.push(currentRow)
    }
  }

  if (currentField && currentRow.length === 0) {
    rows.push([currentField])
  }

  return rows
}

const loadDataset = (): DatasetCache => {
  if (globalCache.__vidyalokBookDataset) {
    return globalCache.__vidyalokBookDataset
  }

  const datasetPath = path.join(process.cwd(), DATASET_FILENAME)
  const rawCsv = fs.readFileSync(datasetPath, 'utf-8')
  const rows = parseCsv(rawCsv)

  const entries: PreparedBookEntry[] = []
  const seenNormalized = new Set<string>()

  for (const row of rows.slice(1)) {
    if (!row || row.length < 4) {
      continue
    }

    const title = row[3]?.trim()

    if (!title) {
      continue
    }

    const normalized = normalizeText(title)

    if (!normalized || seenNormalized.has(normalized)) {
      continue
    }

    seenNormalized.add(normalized)
    entries.push({ title, normalized })
  }

  const cache: DatasetCache = { entries }
  globalCache.__vidyalokBookDataset = cache
  return cache
}

const levenshteinDistance = (a: string, b: string): number => {
  if (a === b) {
    return 0
  }

  if (!a.length) {
    return b.length
  }

  if (!b.length) {
    return a.length
  }

  const previousRow = new Array(b.length + 1)
  const currentRow = new Array(b.length + 1)

  for (let j = 0; j <= b.length; j += 1) {
    previousRow[j] = j
  }

  for (let i = 0; i < a.length; i += 1) {
    currentRow[0] = i + 1

    for (let j = 0; j < b.length; j += 1) {
      const cost = a[i] === b[j] ? 0 : 1
      currentRow[j + 1] = Math.min(
        currentRow[j] + 1,
        previousRow[j + 1] + 1,
        previousRow[j] + cost
      )
    }

    for (let j = 0; j <= b.length; j += 1) {
      previousRow[j] = currentRow[j]
    }
  }

  return previousRow[b.length]
}

const jaccardSimilarity = (leftTokens: string[], rightTokens: string[]): number => {
  if (leftTokens.length === 0 && rightTokens.length === 0) {
    return 1
  }

  const leftSet = new Set(leftTokens)
  const rightSet = new Set(rightTokens)

  let intersectionSize = 0
  for (const token of leftSet) {
    if (rightSet.has(token)) {
      intersectionSize += 1
    }
  }

  const unionSize = leftSet.size + rightSet.size - intersectionSize
  return unionSize === 0 ? 0 : intersectionSize / unionSize
}

const computeScore = (candidate: PreparedBookEntry, normalizedQuery: string): number => {
  if (!candidate.normalized || !normalizedQuery) {
    return 0
  }

  if (candidate.normalized === normalizedQuery) {
    return 1
  }

  let score = 0

  if (candidate.normalized.includes(normalizedQuery)) {
    score = Math.max(score, 0.95)
  }

  if (normalizedQuery.includes(candidate.normalized)) {
    score = Math.max(score, 0.9)
  }

  const distance = levenshteinDistance(candidate.normalized, normalizedQuery)
  const maxLength = Math.max(candidate.normalized.length, normalizedQuery.length)
  const distanceScore = maxLength === 0 ? 0 : 1 - distance / maxLength
  score = Math.max(score, distanceScore)

  const candidateTokens = candidate.normalized.split(' ')
  const queryTokens = normalizedQuery.split(' ')
  const jaccard = jaccardSimilarity(candidateTokens, queryTokens)
  score = Math.max(score, jaccard * 0.9 + distanceScore * 0.1)

  if (candidateTokens[0] && queryTokens[0] && candidateTokens[0] === queryTokens[0]) {
    score = Math.max(score, 0.93)
  }

  return score
}

export const findBestBookSuggestion = (query: string): BookSuggestion | null => {
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return null
  }

  const { entries } = loadDataset()
  let bestMatch: BookSuggestion | null = null

  for (const entry of entries) {
    const score = computeScore(entry, normalizedQuery)

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { title: entry.title, score }

      if (score >= 0.98) {
        break
      }
    }
  }

  if (!bestMatch || bestMatch.score < MIN_AUTOCORRECT_SCORE) {
    return null
  }

  return bestMatch
}
