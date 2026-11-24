import wedding from '../../wedding.js'

const $ = (id) => document.getElementById(id)
const asset = (file) => new URL('../../assets/' + encodeURIComponent(file), import.meta.url).href
const own = (file) => new URL('./assets/' + file, import.meta.url).href
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value
    else if (key === 'text') node.textContent = value
    else if (key.startsWith('data-') || key.startsWith('aria-') || key === 'style') node.setAttribute(key, value)
    else node[key] = value
  }
  node.append(...children.filter(Boolean))
  return node
}
const icon = (id, cls = 'ico') => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', cls)
  svg.setAttribute('aria-hidden', 'true')
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttribute('href', '#i-' + id)
  svg.append(use)
  return svg
}

/* ---------- content ---------- */
document.title = wedding.names + ' | Undangan Pernikahan'
document.querySelector('meta[name="description"]').content = 'Undangan pernikahan ' + wedding.names + '.'
document.querySelectorAll('[data-names]').forEach((node) => { node.textContent = wedding.names })
document.querySelectorAll('[data-short-date]').forEach((node) => { node.textContent = wedding.shortDate || wedding.date })
document.querySelectorAll('[data-date]').forEach((node) => { node.textContent = wedding.date })
const firstNames = wedding.couple.map(({ name }) => name.split(/\s+/)[0])
document.querySelectorAll('[data-name]').forEach((node) => { node.textContent = firstNames[node.dataset.name] || '' })

// Split the opening names into letters so they can arrive one by one.
{
  let index = 0
  const names = document.getElementById('hero-names')
  const walker = document.createTreeWalker(names, NodeFilter.SHOW_TEXT)
  const texts = []
  while (walker.nextNode()) texts.push(walker.currentNode)
  for (const text of texts) {
    const letters = document.createDocumentFragment()
    for (const char of text.textContent) {
      const span = document.createElement('span')
      span.className = 'ch'
      span.style.setProperty('--i', index++)
      span.textContent = char
      letters.append(span)
    }
    text.replaceWith(letters)
  }
  names.setAttribute('aria-label', names.textContent.replace(/\s+/g, ' ').trim())
}

const photos = wedding.photos || []
const photoAt = (index) => photos[index % Math.max(photos.length, 1)]
const setPhoto = (selector, photo) => document.querySelectorAll(selector).forEach((img) => {
  if (!photo) return img.closest('figure')?.setAttribute('hidden', '')
  img.src = asset(photo.file)
  img.alt = photo.alt
})
setPhoto('[data-cover-photo]', wedding.coverPhoto ? { file: wedding.coverPhoto, alt: wedding.names } : photoAt(0))
setPhoto('[data-story-photo]', photoAt(1))
setPhoto('[data-closing-photo]', photoAt(0))
setPhoto('[data-aside-photo]', photoAt(0))

if (wedding.quote) {
  $('quote-text').textContent = wedding.quote.text
  $('quote-source').textContent = wedding.quote.source || ''
} else {
  $('quote-text').textContent = wedding.blessing || ''
}
$('invite-line').textContent = wedding.inviteLine || wedding.welcome
$('closing-text').textContent = wedding.closing || wedding.welcome
{
  // "Beserta keluarga besar" line, built from each partner's parents
  const families = wedding.couple.map(({ family }) => family?.match(/\bdari\s+(.+)$/i)?.[1]).filter(Boolean)
  if (families.length) {
    const line = $('closing-families')
    line.append(el('span', { class: 'cl-with', text: 'Beserta keluarga besar' }))
    for (const parents of families) line.append(el('span', { text: 'Keluarga ' + parents.replace(/\s+dan\s+/i, ' & ') }))
    line.hidden = false
  }
  // Falling petals while the closing is on screen
  const petals = $('petals')
  if (!reducedMotion) {
    for (let i = 0; i < 16; i++) {
      petals.append(el('i', { style: `--x:${Math.round(Math.random() * 100)}%;--s:${(8 + Math.random() * 9).toFixed(1)}px;--dur:${(7 + Math.random() * 6).toFixed(1)}s;--delay:${(-Math.random() * 12).toFixed(1)}s;--drift:${Math.round(Math.random() * 80 - 40)}px;--c:${['#f2a9bb', '#e9879f', '#f7d6c4', '#f3dfb4', '#fbe3ea'][i % 5]}` }))
    }
    if (typeof IntersectionObserver === 'function') {
      new IntersectionObserver(([entry]) => $('penutup').classList.toggle('live', entry.isIntersecting)).observe($('penutup'))
    }
  }
}

wedding.couple.forEach((partner, index) => {
  const bride = index === 0
  const [first] = partner.name.trim().split(/\s+/)
  const portrait = el('div', { class: 'pf-portrait' },
    el('span', { class: 'pf-halo', 'aria-hidden': 'true' }),
    el('div', { class: 'pf-arch' }, partner.portrait && el('img', { src: asset(partner.portrait), alt: partner.name, loading: 'lazy' })),
    el('img', { class: 'pf-bouquet', src: own('bouquet.webp'), alt: '', 'aria-hidden': 'true' }),
  )
  const name = el('h3', { class: 'pf-name' },
    el('span', { class: 'pf-first', text: first, 'aria-hidden': 'true' }),
    el('span', { class: 'pf-full', text: partner.name }))
  const family = el('p', { class: 'pf-family' })
  const split = partner.family?.match(/^(.*?\bdari)\s+(.+)$/i)
  if (split) family.append(el('span', { text: split[1] }), el('strong', { text: split[2] }))
  else if (partner.family) family.append(el('strong', { text: partner.family }))
  const article = el('article', { class: 'profile ' + (bride ? 'bride' : 'groom'), 'data-reveal': 'pf' },
    el('p', { class: 'kicker pf-role', text: bride ? 'Mempelai Wanita' : 'Mempelai Pria' }),
    portrait, name, el('span', { class: 'pf-rule', 'aria-hidden': 'true' }), family)
  const handle = partner.instagram?.replace(/^@/, '').trim()
  if (handle && /^[\w.]{1,30}$/.test(handle)) {
    const link = el('a', { class: 'social', href: 'https://www.instagram.com/' + handle + '/', target: '_blank', rel: 'noopener', 'aria-label': 'Instagram ' + partner.name })
    link.append(icon('camera', ''), el('span', { text: '@' + handle }))
    article.append(link)
  }
  $('couple').append(article)
  if (bride && wedding.couple.length > 1) {
    $('couple').append(el('div', { class: 'pf-amp', 'data-reveal': 'zoom', 'aria-hidden': 'true' }, el('span', { text: '&' })))
  }
})

/* ---------- events ---------- */
if (wedding.attendanceNote) {
  $('attendance-note').textContent = wedding.attendanceNote
  $('attendance-note').hidden = false
}
const mapLink = (event) => {
  const pin = event.mapPin && /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(event.mapPin)
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(pin ? event.mapPin : event.mapQuery || event.venue + ', ' + event.address)
}
const stamp = (time) => new Date(time).toISOString().replace(/[-:]|\.\d{3}/g, '')
wedding.events.forEach((event, index) => {
  const parts = event.date?.match(/^(\S+),\s*(\d{1,2})\s+(\S+)\s+(\d{4})$/)
  const date = parts
    ? el('div', { class: 'ev-date', 'aria-label': event.date },
      el('span', { class: 'ev-day', text: parts[1], 'aria-hidden': 'true' }),
      el('strong', { class: 'ev-num', text: parts[2], 'aria-hidden': 'true' }),
      el('span', { class: 'ev-month', 'aria-hidden': 'true' }, parts[3], el('br'), parts[4]))
    : el('p', { class: 'ev-date-text', text: event.date })
  const row = (iconId, ...content) => {
    const line = el('p', { class: 'ev-row' })
    line.append(icon(iconId, 'ev-ico'), el('span', {}, ...content))
    return line
  }
  const actions = el('div', { class: 'ev-actions' })
  const map = el('a', { class: 'ev-btn solid', href: mapLink(event), target: '_blank', rel: 'noopener', 'aria-label': 'Lihat lokasi ' + event.title + ' di Google Maps' })
  map.append(icon('pin', ''), 'Lihat Lokasi')
  actions.append(map)
  const start = Date.parse(event.startsAt)
  const end = Date.parse(event.endsAt)
  if (Number.isFinite(start) && end > start) {
    const cal = el('a', {
      class: 'ev-btn line', target: '_blank', rel: 'noopener', 'aria-label': 'Simpan ' + event.title + ' ke Google Calendar',
      href: 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
        action: 'TEMPLATE', text: event.title + ' · ' + wedding.names, dates: stamp(start) + '/' + stamp(end), location: event.venue + ', ' + event.address,
      }),
    })
    cal.append(icon('cal', ''), 'Simpan Tanggal')
    actions.append(cal)
  }
  if (index) $('events').append(el('span', { class: 'ev-link', 'aria-hidden': 'true', 'data-reveal': 'up' }))
  $('events').append(el('article', { class: 'ev-card', 'data-reveal': 'rise', style: `--d:${index ? 0.1 : 0}s` },
    el('span', { class: 'ev-crest', 'aria-hidden': 'true' }),
    el('h3', { class: 'ev-title', text: event.title }),
    date,
    el('span', { class: 'pf-rule', 'aria-hidden': 'true' }),
    row('clock', event.time),
    row('pin', el('strong', { text: event.venue }), el('br'), event.address),
    actions))
})

/* ---------- countdown ---------- */
const starts = wedding.events.map(({ startsAt }) => Date.parse(startsAt)).filter(Number.isFinite)
const target = Math.min(...starts)
if (Number.isFinite(target) && target > Date.now()) {
  const box = $('countdown')
  box.hidden = false
  const tick = () => {
    const left = Math.max(0, Math.floor((target - Date.now()) / 1000))
    const parts = { days: Math.floor(left / 86400), hours: Math.floor(left / 3600) % 24, minutes: Math.floor(left / 60) % 60, seconds: left % 60 }
    for (const [unit, value] of Object.entries(parts)) box.querySelector(`[data-unit="${unit}"]`).textContent = value
    if (!left) clearInterval(timer)
  }
  const timer = setInterval(tick, 1000)
  tick()
}

/* ---------- story & gallery ---------- */
;(wedding.story || []).forEach((chapter, index) => {
  const card = el('div', { class: 'tl-card' },
    chapter.date && el('span', { class: 'tl-date', text: chapter.date }),
    el('h3', { text: chapter.title }),
    chapter.photo && el('img', { class: 'tl-photo', src: asset(chapter.photo), alt: chapter.title, loading: 'lazy' }),
    el('p', { text: chapter.text }))
  $('chapters').append(el('li', { class: 'tl-item', 'data-reveal': 'tl', style: `--d:${0.15 + index * 0.12}s` },
    el('span', { class: 'tl-node', text: String(index + 1).padStart(2, '0'), 'aria-hidden': 'true' }), card))
})
if (wedding.story?.length) {
  $('chapters').append(el('li', { class: 'tl-item tl-end', 'data-reveal': 'tl', style: '--d:.3s' },
    el('span', { class: 'tl-node', 'aria-hidden': 'true' }),
    el('div', { class: 'tl-card' },
      el('span', { class: 'tl-date', text: wedding.date }),
      el('h3', { text: 'Menuju Hari Bahagia' }),
      el('p', { text: 'Dengan restu keluarga dan doa Anda, kami melangkah ke babak berikutnya bersama.' }))))
}
$('cerita').hidden = !wedding.story?.length
$('galeri').hidden = !photos.length

const viewer = $('viewer')
let current = 0
let opener
function show(index) {
  current = (index + photos.length) % photos.length
  $('viewer-img').src = asset(photos[current].file)
  $('viewer-img').alt = photos[current].alt
  $('viewer-pos').textContent = current + 1 + ' / ' + photos.length
}
/* "Jendela Kenangan": a window-framed slideshow with polaroid thumbnails */
const slides = $('slides')
const thumbs = []
let slide = 0
const pad = (n) => String(n).padStart(2, '0')
$('slide-total').textContent = pad(photos.length)
photos.forEach((photo, index) => {
  const src = asset(photo.file)
  const figure = el('figure', { class: 'slide', 'aria-hidden': 'true', style: `--src:url("${src}")` },
    el('img', { src, alt: photo.alt, loading: index ? 'lazy' : 'eager', draggable: false }))
  figure.addEventListener('click', () => {
    if (typeof viewer.showModal !== 'function' || moved) return
    opener = $('slide-next')
    show(index)
    viewer.showModal()
  })
  slides.append(figure)
  const thumb = el('button', { type: 'button', class: 'polaroid', 'aria-label': 'Tampilkan foto ' + (index + 1) + ': ' + photo.alt, 'data-reveal': 'drop', style: `--d:${index * 0.08}s;--tilt:${[-4, 3, -2, 4, -3, 2][index % 6]}deg` },
    el('img', { src, alt: '', loading: 'lazy' }))
  thumb.addEventListener('click', () => { go(index); hold() })
  thumbs.push(thumb)
  $('photos').append(thumb)
})
function go(index, dir) {
  const next = (index + photos.length) % photos.length
  dir = dir || (next > slide ? 1 : -1)
  slides.querySelectorAll('.prev').forEach((node) => node.classList.remove('prev'))
  if (next !== slide) slides.children[slide]?.classList.replace('on', 'prev')
  slides.children[slide]?.setAttribute('aria-hidden', 'true')
  slides.style.setProperty('--dir', dir)
  slide = next
  const active = slides.children[slide]
  active.classList.remove('on')
  void active.offsetWidth
  active.classList.add('on')
  active.removeAttribute('aria-hidden')
  thumbs.forEach((thumb, i) => thumb.toggleAttribute('aria-current', i === slide))
  $('slide-pos').textContent = pad(slide + 1)
}
let timer
let visible = false
let heldUntil = 0
const hold = () => { heldUntil = Date.now() + 9000 }
function tick() {
  if (visible && Date.now() > heldUntil && !document.hidden) go(slide + 1, 1)
}
if (photos.length) {
  go(0, 1)
  $('slide-prev').addEventListener('click', () => { go(slide - 1, -1); hold() })
  $('slide-next').addEventListener('click', () => { go(slide + 1, 1); hold() })
  if (photos.length > 1 && !reducedMotion) {
    timer = setInterval(tick, 4800)
    if (typeof IntersectionObserver === 'function') {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: .4 }).observe(slides)
    } else visible = true
  }
}
// Swipe between photos on touch screens
let startX = null
let moved = false
slides.addEventListener('pointerdown', (event) => { startX = event.clientX; moved = false })
slides.addEventListener('pointerup', (event) => {
  if (startX === null) return
  const dx = event.clientX - startX
  startX = null
  if (Math.abs(dx) > 40) {
    moved = true
    go(slide + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1)
    hold()
    setTimeout(() => { moved = false }, 50)
  }
})
$('viewer-close').addEventListener('click', () => viewer.close())
$('viewer-prev').addEventListener('click', () => show(current - 1))
$('viewer-next').addEventListener('click', () => show(current + 1))
viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close() })
viewer.addEventListener('close', () => opener?.focus({ preventScroll: true }))
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') show(current - 1)
  if (event.key === 'ArrowRight') show(current + 1)
})

/* ---------- gift ---------- */
const accounts = wedding.giftAccounts || []
if (wedding.gift || accounts.length || wedding.giftAddress) {
  $('gift').hidden = false
  $('gift-text').textContent = wedding.gift || 'Bagi Bapak/Ibu/Saudara/i yang ingin mengirimkan hadiah, dapat melalui tautan di bawah ini.'
  const list = $('gift-list')
  const copyButton = (value, label) => {
    const button = el('button', { class: 'gift-copy', type: 'button', 'aria-label': label })
    const text = el('span', { text: 'Salin' })
    button.append(icon('copy', ''), text)
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(value)
        text.textContent = 'Tersalin'
        button.classList.add('done')
      } catch {
        text.textContent = value
      }
      setTimeout(() => { text.textContent = 'Salin'; button.classList.remove('done') }, 2200)
    })
    return button
  }
  accounts.forEach((account, index) => {
    list.append(el('div', { class: 'gift-bank ' + (index % 2 ? 'merah' : 'hijau'), style: `--i:${index}` },
      el('span', { class: 'gb-trim', 'aria-hidden': 'true' }),
      el('span', { class: 'gb-name', text: account.bank }),
      el('span', { class: 'gb-chip', 'aria-hidden': 'true' }),
      el('span', { class: 'gb-number', text: account.number }),
      el('span', { class: 'gb-holder', text: 'a.n. ' + account.holder }),
      copyButton(account.number.replace(/\s+/g, ''), 'Salin nomor ' + account.bank),
    ))
  })
  if (wedding.giftAddress) {
    const { recipient, address } = wedding.giftAddress
    const card = el('div', { class: 'gift-address', style: `--i:${accounts.length}` })
    card.append(el('span', { class: 'ga-icon' }, icon('gift', '')), el('strong', { text: 'Kirim Hadiah' }),
      el('p', { class: 'ga-to', text: 'Penerima: ' + recipient }),
      el('p', { text: address }),
      copyButton(recipient + ', ' + address, 'Salin alamat pengiriman hadiah'))
    list.append(card)
  }
  const toggle = $('gift-toggle')
  toggle.hidden = !list.children.length
  toggle.addEventListener('click', () => {
    const open = list.hidden
    $('gift').classList.toggle('open', open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.querySelector('.seal-label').textContent = open ? 'Tutup Amplop' : 'Buka Amplop'
    if (open) setTimeout(() => { list.hidden = false }, reducedMotion ? 0 : 650)
    else list.hidden = true
  })
}

/* ---------- wishes (demo: stored on this device) ---------- */
const form = $('reply')
const status = $('reply-status')
const guest = new URLSearchParams(location.search).get('to')?.trim().slice(0, 80)
if (guest) {
  $('guest').textContent = guest
  form.elements.guest.value = guest
}
const storeKey = 'invitation:wishes:' + wedding.id
const readWishes = () => {
  try { return JSON.parse(localStorage.getItem(storeKey)) || [] } catch { return [] }
}
const ago = (time) => {
  const minutes = Math.max(0, Math.round((Date.now() - time) / 60000))
  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return minutes + ' menit lalu'
  if (minutes < 1440) return Math.round(minutes / 60) + ' jam lalu'
  return Math.round(minutes / 1440) + ' hari lalu'
}
function renderWishes() {
  const wishes = readWishes()
  $('wish-total').textContent = wishes.length
  $('count-yes').textContent = wishes.filter((w) => w.attendance === 'yes').length
  $('count-no').textContent = wishes.filter((w) => w.attendance === 'no').length
  const list = $('wishes')
  list.replaceChildren()
  if (!wishes.length) list.append(el('li', { class: 'empty', text: 'Belum ada ucapan. Jadilah yang pertama menitipkan doa.' }))
  for (const wish of wishes) {
    const tone = ['merah', 'hijau', 'emas'][[...wish.name].reduce((sum, char) => sum + char.codePointAt(0), 0) % 3]
    const attending = wish.attendance === 'yes'
    const head = el('div', { class: 'wish-head' },
      el('strong', { text: wish.name }),
      el('span', { class: 'badge ' + (attending ? 'yes' : 'no'), text: attending ? 'Hadir' : 'Berhalangan' }))
    list.append(el('li', {},
      el('span', { class: 'avatar ' + tone, text: Array.from(wish.name.trim())[0]?.toUpperCase() || '?', 'aria-hidden': 'true' }),
      el('div', { class: 'bubble' }, head, el('p', { text: wish.wish }), el('time', { dateTime: new Date(wish.at).toISOString(), text: ago(wish.at) }))))
  }
}

if (wedding.demo) {
  $('demo-note').hidden = false
  renderWishes()
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const data = new FormData(form)
    const name = String(data.get('guest') || '').trim()
    const wish = String(data.get('wish') || '').trim()
    const attendance = data.get('attendance')
    if (!name || !wish || !attendance) {
      status.textContent = 'Mohon isi nama, ucapan, dan konfirmasi kehadiran.'
      form.querySelector(':invalid')?.focus()
      return
    }
    try {
      localStorage.setItem(storeKey, JSON.stringify([{ name, wish, attendance, at: Date.now() }, ...readWishes()].slice(0, 50)))
      status.textContent = 'Terima kasih atas ucapan dan doanya.'
      form.elements.wish.value = ''
      renderWishes()
    } catch {
      status.textContent = 'Ucapan tidak tersimpan. Penyimpanan perangkat tidak tersedia.'
    }
  })
} else {
  form.hidden = true
  document.querySelector('#rsvp .tally').hidden = true
  $('wishes').hidden = true
  const email = wedding.contactEmail?.trim()
  if (email && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)) {
    form.before(el('a', { class: 'pill small', href: 'mailto:' + email, text: 'Kirim ucapan lewat email' }))
  } else {
    form.before(el('p', { text: 'Formulir ucapan belum tersedia.' }))
  }
}

/* ---------- music ---------- */
let player
const music = $('music')
if (wedding.music) {
  player = new Audio(asset(wedding.music))
  player.loop = true
  player.preload = 'none'
  music.hidden = false
  const sync = () => {
    music.setAttribute('aria-pressed', String(!player.paused))
    music.setAttribute('aria-label', player.paused ? 'Putar musik' : 'Jeda musik')
  }
  player.addEventListener('play', sync)
  player.addEventListener('pause', sync)
  music.addEventListener('click', () => (player.paused ? player.play().catch(() => {}) : player.pause()))
}

/* ---------- reveals & parallax ---------- */
let observer
function watchReveals() {
  const nodes = document.querySelectorAll('[data-reveal]')
  if (reducedMotion || typeof IntersectionObserver !== 'function') {
    nodes.forEach((node) => node.classList.add('in'))
    return
  }
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('in')
      observer.unobserve(entry.target)
    }
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' })
  nodes.forEach((node) => observer.observe(node))
}

const hero = $('pembuka')
const depthNodes = [...hero.querySelectorAll('[data-depth]')]
let ticking = false
function parallax() {
  ticking = false
  const y = Math.min(scrollY, hero.offsetHeight)
  for (const node of depthNodes) node.style.transform = `translate3d(0, ${(y * Number(node.dataset.depth)).toFixed(1)}px, 0)`
}
if (!reducedMotion) {
  addEventListener('scroll', () => {
    if (!ticking) requestAnimationFrame(parallax)
    ticking = true
  }, { passive: true })
}

/* ---------- cover ---------- */
const cover = $('sampul')
const main = $('isi')
function begin() {
  document.body.classList.remove('locked')
  document.body.classList.add('opened')
  main.inert = false
  watchReveals()
}
const shortcut = location.hash && document.getElementById(location.hash.slice(1))
if (shortcut && shortcut !== cover) {
  cover.hidden = true
  begin()
  requestAnimationFrame(() => shortcut.scrollIntoView())
} else {
  main.inert = true
  scrollTo(0, 0)
  $('open-invitation').addEventListener('click', () => {
    player?.play().catch(() => {})
    begin()
    hero.focus({ preventScroll: true })
    if (reducedMotion) {
      cover.hidden = true
      return
    }
    cover.classList.add('leaving')
    cover.addEventListener('animationend', (event) => { if (event.target === cover) cover.hidden = true })
  }, { once: true })
}
