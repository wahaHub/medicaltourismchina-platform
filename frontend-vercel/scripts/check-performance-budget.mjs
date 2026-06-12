import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..')
const DIST_DIR = path.join(PROJECT_ROOT, 'dist')
const ASSETS_DIR = path.join(DIST_DIR, 'assets')

const KiB = 1024

const budgets = {
  entryJsGzipKiB: 350,
  largestJsGzipKiB: 450,
  telemedicineJsGzipKiB: 450,
  telemedicineHeroKiB: 150,
}

const formatKiB = (bytes) => `${(bytes / KiB).toFixed(1)} KiB`

const fail = (message) => {
  throw new Error(message)
}

const readText = (file) => fs.readFileSync(file, 'utf8')
const readBytes = (file) => fs.readFileSync(file)
const gzipSize = (file) => zlib.gzipSync(readBytes(file)).byteLength

const assertFile = (file, label) => {
  if (!fs.existsSync(file)) fail(`${label} not found at ${file}`)
}

assertFile(DIST_DIR, 'dist directory')
assertFile(ASSETS_DIR, 'dist/assets directory')

const indexHtmlPath = path.join(DIST_DIR, 'index.html')
assertFile(indexHtmlPath, 'dist/index.html')

const indexHtml = readText(indexHtmlPath)
const entryScripts = [...indexHtml.matchAll(/<script[^>]+src="\/assets\/([^"]+\.js)"/g)].map((match) => match[1])
if (entryScripts.length === 0) fail('No entry script tags found in dist/index.html')

const assetFiles = fs.readdirSync(ASSETS_DIR)
const jsFiles = assetFiles.filter((file) => file.endsWith('.js'))
const webpFiles = assetFiles.filter((file) => file.endsWith('.webp'))

const metricRows = []
const assertBudget = ({ label, actualBytes, budgetKiB }) => {
  const budgetBytes = budgetKiB * KiB
  metricRows.push({
    label,
    actual: formatKiB(actualBytes),
    budget: `${budgetKiB} KiB`,
    status: actualBytes <= budgetBytes ? 'PASS' : 'FAIL',
  })
  if (actualBytes > budgetBytes) {
    fail(`${label} is ${formatKiB(actualBytes)}, over budget ${budgetKiB} KiB`)
  }
}

const entryJsGzipBytes = entryScripts.reduce((total, file) => {
  const assetPath = path.join(ASSETS_DIR, file)
  assertFile(assetPath, `entry script ${file}`)
  return total + gzipSize(assetPath)
}, 0)

assertBudget({
  label: `Entry JS gzip (${entryScripts.join(', ')})`,
  actualBytes: entryJsGzipBytes,
  budgetKiB: budgets.entryJsGzipKiB,
})

const largestJs = jsFiles
  .map((file) => ({ file, gzipBytes: gzipSize(path.join(ASSETS_DIR, file)) }))
  .sort((a, b) => b.gzipBytes - a.gzipBytes)[0]

assertBudget({
  label: `Largest JS gzip (${largestJs.file})`,
  actualBytes: largestJs.gzipBytes,
  budgetKiB: budgets.largestJsGzipKiB,
})

const telemedicineChunk = jsFiles.find((file) => /^Telemedicine-[\w-]+\.js$/.test(file))
if (!telemedicineChunk) fail('Telemedicine route chunk not found in dist/assets')

assertBudget({
  label: `Telemedicine route JS gzip (${telemedicineChunk})`,
  actualBytes: gzipSize(path.join(ASSETS_DIR, telemedicineChunk)),
  budgetKiB: budgets.telemedicineJsGzipKiB,
})

const telemedicineHero = webpFiles.find((file) => /^online-consultation-doctor-[\w-]+\.webp$/.test(file))
if (!telemedicineHero) fail('Telemedicine/home consultation hero WebP asset not found in dist/assets')

assertBudget({
  label: `Telemedicine hero image (${telemedicineHero})`,
  actualBytes: fs.statSync(path.join(ASSETS_DIR, telemedicineHero)).size,
  budgetKiB: budgets.telemedicineHeroKiB,
})

const vercelConfigPath = path.join(PROJECT_ROOT, 'vercel.json')
assertFile(vercelConfigPath, 'vercel.json')

const vercelConfig = JSON.parse(readText(vercelConfigPath))
const assetHeader = vercelConfig.headers?.find((entry) => entry.source === '/assets/(.*)')
const cacheControl = assetHeader?.headers?.find((header) => header.key.toLowerCase() === 'cache-control')?.value

if (cacheControl !== 'public, max-age=31536000, immutable') {
  fail('Vercel /assets/(.*) Cache-Control header must be public, max-age=31536000, immutable')
}

metricRows.push({
  label: 'Vercel /assets cache policy',
  actual: cacheControl,
  budget: 'immutable hashed assets',
  status: 'PASS',
})

console.table(metricRows)
console.log('Performance budget checks passed.')
