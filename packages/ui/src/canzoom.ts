// import { debounce } from 'lodash'
export type CanzoomRender = () => void
export type CanzoomUserRenderer = (
  ctx: CanvasRenderingContext2D,
  scale: number,
  x_center: number,
  y_center: number
) => void

export type Point = [number, number]

const DEFAULT_ZOOM_SPEED = 0.1

function getScaleMultiplier (delta: number) {
  var scaleMultiplier = 1
  if (delta > 0) {
    // zoom out
    scaleMultiplier = 1 - DEFAULT_ZOOM_SPEED
  } else if (delta < 0) {
    // zoom in
    scaleMultiplier = 1 + DEFAULT_ZOOM_SPEED
  }
  return scaleMultiplier
}

export function canzoom (
  canvas: HTMLCanvasElement,
  renderer: CanzoomUserRenderer
) {
  const ctx = canvas.getContext('2d')
  if (!canvas.draggable) {
    throw new Error(
      'canvas is not draggable.  did you mean to add the `draggable` attribute?'
    )
  }
  canvas.draggable = true
  if (!ctx) throw new Error('failed to get canvas 2d context')
  const { width, height } = canvas.getBoundingClientRect() as DOMRect
  let [xCenter, yCenter] = [width / 2, height / 2]
  let startDragPoint: Point | null = null
  let endDragPoint: Point = [-1, -1]
  let isRequesting = false
  let scale = 1

  const render = () => {
    if (isRequesting) return
    isRequesting = true
    window.requestAnimationFrame(() => {
      isRequesting = false
      renderer(ctx, scale, xCenter, yCenter)
    })
  }

  const onDrag = (ev: DragEvent) => {
    endDragPoint = [ev.clientX, ev.clientY]
    if (!startDragPoint) return
    const [x1, y1] = startDragPoint
    const [x2, y2] = endDragPoint
    const [dx, dy] = [x2 - x1, y2 - y1] as Point
    startDragPoint = endDragPoint
    ;[xCenter, yCenter] = [xCenter - dx, yCenter - dy]
    render()
  }
  function onScroll (evt: WheelEvent) {
    evt.preventDefault()
    evt.stopPropagation()
    evt.stopImmediatePropagation()
    // const [lcx, lcy] = [xCenter, yCenter]
    const scalar = getScaleMultiplier(evt.deltaY)
    scale *= scalar
    const [dx, dy] = [
      -canvas.width / 2 + evt.offsetX,
      -canvas.height / 2 + evt.offsetY
    ]
    const [px, py] = [(xCenter + dx) * scalar, (yCenter + dy) * scalar]
    xCenter = px - dx
    yCenter = py - dy
    // console.table([
    //   ['last-center', lcx, lcy],
    //   ['zoom-offset', dx, dy],
    //   ['unadjusted-next-center', lcx*scalar, lcy*scalar],
    //   ['zoom-point', px, py],
    //   ['next-center', xCenter, yCenter],
    // ])
    render()
  }
  canvas.addEventListener('wheel', onScroll)
  canvas.addEventListener('drag', onDrag)
  canvas.addEventListener('dragstart', (ev: DragEvent) => {
    startDragPoint = [ev.clientX, ev.clientY]
  })
  canvas.addEventListener('dragend', (ev: DragEvent) => {
    startDragPoint = null
  })
  return render
}
