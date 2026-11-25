#!/usr/bin/env node
// Screenshot one section of a page on mobile and desktop, with scroll reveals forced to their end state.
// Usage: node shot.mjs --url http://localhost:8000/ --section "#jadwal" --out /tmp/shots/after [--click "#open-invitation"] [--wait 2500] [--full]
import { mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let chromium
try {
  ({ chromium } = require('playwright'))
} catch {
  ({ chromium } = await import('playwright'))
}

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, token, i, all) => {
    if (token.startsWith('--')) pairs.push([token.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]])
    return pairs
  }, []),
)
if (!args.url || !args.section) {
  console.error('Usage: node shot.mjs --url <url> --section <css selector> [--out dir] [--click selector] [--wait ms] [--full]')
  process.exit(1)
}
const out = args.out || './shots'
const wait = Number(args.wait || 2500)
await mkdir(out, { recursive: true })

const viewports = [
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1366, height: 860 },
]

const browser = await chromium.launch()
const errors = []
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: vp.isMobile, hasTouch: vp.hasTouch })
  page.on('pageerror', (e) => errors.push(`[${vp.name}] ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${vp.name}] console: ${m.text()}`) })
  await page.goto(args.url, { waitUntil: 'networkidle' })
  if (args.click) {
    const target = page.locator(args.click)
    if (await target.count()) await target.first().click().catch(() => {})
    await page.waitForTimeout(1500)
  }
  const section = page.locator(args.section).first()
  if (!(await section.count())) {
    console.error(`Section ${args.section} not found`)
    process.exit(2)
  }
  await section.evaluate((node) => { node.hidden = false; node.scrollIntoView({ block: 'start' }) })
  await page.waitForTimeout(300)
  // Force reveals inside the section so the screenshot shows the finished design.
  await section.evaluate((node) => node.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('in')))
  await page.waitForTimeout(wait)
  const file = `${out}/${vp.name}.png`
  if (args.full) await page.screenshot({ path: file, fullPage: true })
  else await section.screenshot({ path: file })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  console.log(`${file}${overflow ? '  WARNING: horizontal overflow on page' : ''}`)
  await page.close()
}
await browser.close()
if (errors.length) console.log('Errors:\n' + errors.join('\n'))
