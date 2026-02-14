<script>
  const canvas = document.getElementById("embers")
  const ctx = canvas.getContext("2d")

  let w = 0
  let h = 0
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))

  function resize() {
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = w + "px"
    canvas.style.height = h + "px"
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  window.addEventListener("resize", resize)
  resize()

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  function rand(min, max) {
    return Math.random() * (max - min) + min
  }

  const emberCount = prefersReduced ? 0 : 65
  const embers = []

  function spawnEmber(forceBottom = false) {
    const size = rand(1, 3.2)
    const x = rand(0, w)
    const y = forceBottom ? h + rand(0, 80) : rand(0, h)
    const vy = rand(-0.9, -0.25)
    const vx = rand(-0.25, 0.25)
    const life = rand(3.5, 7.5)
    const hue = rand(28, 48)
    const alpha = rand(0.25, 0.65)

    embers.push({
      x, y, vx, vy, size,
      age: 0,
      life,
      hue,
      alpha,
      tw: rand(0.8, 1.6)
    })
  }

  for (let i = 0; i < emberCount; i++) spawnEmber()

  let last = performance.now()
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000)
    last = now

    ctx.clearRect(0, 0, w, h)

    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i]
      e.age += dt
      e.x += e.vx * (60 * dt)
      e.y += e.vy * (60 * dt)

      e.vx += Math.sin((now / 1000) * e.tw + e.y * 0.01) * 0.002
      e.vx = Math.max(-0.6, Math.min(0.6, e.vx))

      const t = e.age / e.life
      const fade = t < 0.15 ? (t / 0.15) : (t > 0.85 ? (1 - t) / 0.15 : 1)
      const a = e.alpha * Math.max(0, Math.min(1, fade))

      const glow = 6 + e.size * 8
      ctx.beginPath()
      ctx.fillStyle = `hsla(${e.hue}, 100%, 60%, ${a})`
      ctx.shadowBlur = glow
      ctx.shadowColor = `hsla(${e.hue}, 100%, 60%, ${a})`
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      if (e.age >= e.life || e.y < -80 || e.x < -100 || e.x > w + 100) {
        embers.splice(i, 1)
        spawnEmber(true)
      }
    }

    if (!prefersReduced) requestAnimationFrame(tick)
  }

  if (!prefersReduced) requestAnimationFrame(tick)
</script>
