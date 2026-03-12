/**
 * generate-icons.js
 * Jalankan: node scripts/generate-icons.js
 * Butuh: npm install canvas
 *
 * Atau pakai https://realfavicongenerator.net / https://maskable.app
 * Upload logo TokoKu dan download semua ukuran.
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const OUT_DIR = path.join(__dirname, '../public/icons')

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

for (const size of SIZES) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#4ade80')
  grad.addColorStop(1, '#22d3ee')
  ctx.fillStyle = grad

  // Rounded rect
  const r = size * 0.2
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fill()

  // Text "T"
  ctx.fillStyle = '#0a0d14'
  ctx.font = `900 ${size * 0.55}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('T', size / 2, size / 2 + size * 0.04)

  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(path.join(OUT_DIR, `icon-${size}x${size}.png`), buffer)
  console.log(`✓ icon-${size}x${size}.png`)
}

console.log('\nDone! Icons saved to public/icons/')
console.log('Tip: Untuk icon yang lebih bagus, gunakan https://maskable.app')