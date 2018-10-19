import { canzoom, CanzoomRender } from './canzoom'
import { draw as drawGrid } from './util/canvas/grid'
import { HierarchyPointLink, HierarchyPointNode } from 'd3'
import * as d3 from 'd3'
import * as React from 'react'
import DEFAULT_DATA from './flare-demo-data'

const ONE_QUARTER_PI = Math.PI / 2
const THREE_QUARTER_PI = 3 * ONE_QUARTER_PI
const shouldFlipText = (theta: number) => theta > ONE_QUARTER_PI && theta < THREE_QUARTER_PI

function drawLineLink (ctx: CanvasRenderingContext2D, link: HierarchyPointLink<any>, center: Point) {
  ctx.beginPath()
  let [ x1, y1 ] = toCartesion(link.source.x, link.source.y, center)
  let [ x2, y2 ] = toCartesion(link.target.x, link.target.y, center)
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function drawNode (ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#4e4e4e'
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.arc(x, y, 2.5, 0, 360)
  ctx.fill()
}

function drawNodeText (ctx: CanvasRenderingContext2D, x: number, y: number, d: HierarchyPointNode<any>) {
  ctx.beginPath()
  ctx.fillStyle = '#000'
  ctx.font = '12px Helvetica'
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(d.x)
  const isTextFlipped = shouldFlipText(d.x)
  if (isTextFlipped) ctx.rotate(Math.PI)
  const text = d.id!.substring(d.id!.lastIndexOf('.') + 1)
  if (isTextFlipped) {
    ctx.textAlign = d.children ? 'left' : 'right'
    ctx.fillText(text, d.children ? 5 : -5, 2)
  } else {
    ctx.textAlign = d.children ? 'right' : 'left'
    ctx.fillText(text, d.children ? -5 : 5, 2)
  }
  ctx.restore()
}

// function inBounds (point: Point, bounds: Bounds) {
//   const [x, y] = point
//   const [ b1, b2 ] = bounds
//   const isInBounds = x >= b1[0] && x <= b2[0] && y >= b1[1] && y <= b2[1]
//   return isInBounds
// }

function drawBezierLink (ctx: CanvasRenderingContext2D, link: HierarchyPointLink<any>, center: Point, bounds: Bounds) {
  let { source: { x: x1, y: y1 }, target: { x: x2, y: y2 } } = link
  // if (!inBounds([x1, y1], bounds) && !inBounds([x2, y2], bounds)) {
  //   console.log('oob', link, bounds)
  //   return
  // }
  var p0 = toCartesion(x1, y1, center)
  var p1 = toCartesion(x1, y1 = (y1 + y2) / 2, center)
  var p2 = toCartesion(x2, y1, center)
  var p3 = toCartesion(x2, y2, center)
  ctx.moveTo(p0[0], p0[1]);
  ctx.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
}

function drawD3RadialLink (link: any) {
  // let { source: { x: t1, y: r1 }, target: { x: t2, y: r2 } } = link
  // console.log(`drawing link from (t1, r1) => (t2, r2): (${t1}, ${r1}) => (${t2}, ${r2})`)
  // const draw = d3
  //   // .lineRadial()
  //   .linkRadial()
  //   .angle((d: any) => d.x)
  //   .radius((d: any) => d.y)
  //   .context(ctx)
  // draw(link as any)
}

function toCartesion (theta: number, radius: number, center: Point) {
  return [
    radius * Math.cos(theta) + center[0],
    radius * Math.sin(theta) + center[1]
  ]
}

// function radialPoint (x: number, y: number) {
//   return [(y = +y) * Math.cos((x -= Math.PI / 2)), y * Math.sin(x)]
// }

export type Point = [number, number]
export type Bounds = [Point, Point]

// function pointString (...points: Point[]): string {
//   return points.map(([x, y]) => `(${x.toFixed(0)}, ${y.toFixed(0)})`).join(', ')
// }

export type FlareProps = {
  data: any
}

export type FlareState = {
  width: number
}

export class Flare extends React.PureComponent<FlareProps, FlareState> {
  public node: HTMLCanvasElement
  public canvasContext: CanvasRenderingContext2D
  public renderer: CanzoomRender
  constructor (props: FlareProps) {
    super(props)
    this.state = { width: 0 }
  }
  componentDidMount () {
    const { width } = this.node.getBoundingClientRect()
    this.setState({ width })
    // panzoom(this.node, { smoothScroll: false })
    this.canvasContext = this.node.getContext('2d')!
    this.renderCanvas(this.canvasContext,this.props.data || DEFAULT_DATA, width)
  }
  componentDidUpdate () {
    this.renderCanvas(this.canvasContext, this.props.data || DEFAULT_DATA, this.state.width)
  }
  renderCanvas (ctx: CanvasRenderingContext2D, data: {id: string, value: string}[], width: number) {
    if (!width) return
    ctx.canvas.setAttribute('width', width.toString())
    ctx.canvas.setAttribute('height', width.toString())
    if (this.renderer) return this.renderer()
    this.renderer = canzoom(ctx.canvas, (ctx, scale, xCenter, yCenter) => {
      ;(window as any)._ctx = ctx
      ctx.save()
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      const center: Point = [width/2, width/2]
      const [dx, dy] = [xCenter - center[0], yCenter - center[1]]
      const bounds: Bounds = [[-dx,-dy], [-dx+width, -dy+width]]
      if (dx || dy) {
        ctx.setTransform(1,0,0,1, dx, dy) // reset!
      }
      ctx.save()
      var stratify = d3.stratify().parentId((d: any) => d.id.substring(0, d.id.lastIndexOf('.')!))
      var tree = d3.tree().size([2 * Math.PI, width]).separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)
      var root = tree(stratify(data))
      ctx.scale(scale, scale)
      ctx.strokeStyle = '#dedede'
      ctx.lineWidth = 0.5
      ctx.shadowColor = "rgba(240,240,240,.5)"
      ctx.shadowBlur = 0.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      if (false) {
        drawGrid(ctx, width)
        root.links().forEach(link => drawLineLink(ctx, link, center))
        root.links().forEach(drawD3RadialLink)
      }
      root.links().forEach(link => drawBezierLink(ctx, link, center, bounds))
      ctx.stroke()
      ctx.restore()
      root.descendants().map((d, i) => {
        const [x, y] = toCartesion(d.x, d.y, center)
        const [ xp, yp ] = [x*scale, y*scale]
        drawNode(ctx, xp, yp)
        drawNodeText(ctx, xp, yp, d)
      })
      ctx.restore()
    })
  }
  render () {
    return <canvas draggable style={{ cursor: 'move', width: '100%' }} ref={node => (this.node = node!)} />
  }
}
