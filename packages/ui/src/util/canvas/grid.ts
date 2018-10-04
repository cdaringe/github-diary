export function draw (ctx: CanvasRenderingContext2D, width: number) {
  const cw = Math.floor(width/2)
  const ch = cw
  const prevLineWidth = ctx.lineWidth
  ctx.lineWidth = 2

  // main axes
  const lines = [
    [[cw, 0], [cw, width]],
    [[0, ch], [width, ch]]
  ]
  lines.forEach(([[x1, y1], [x2, y2]]) => {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  })
  const dirs = [
    [0,1],
    [1, 0],
    [0,-1],
    [-1, 0]
  ]
  ctx.lineWidth = 0.8
  dirs.forEach(([dx, dy]) => {
    let offset = width / 2
    while (offset > 0) {
      // hash-center-x, hash-center-y, from origin
      let [hcx, hcy] = [dx * offset + cw, dy * offset + ch]
      const [h1x, h1y] = [dx === 0 ? hcx - 5 : hcx, dy === 0 ? hcy - 5 : hcy ]
      const [h2x, h2y] = [dx === 0 ? hcx + 5 : hcx, dy === 0 ? hcy + 5 : hcy ]
      ctx.beginPath()
      ctx.moveTo(h1x, h1y)
      ctx.lineTo(h2x, h2y)
      ctx.stroke()
      offset = offset - 100
    }
  })
  ctx.lineWidth = prevLineWidth
}
