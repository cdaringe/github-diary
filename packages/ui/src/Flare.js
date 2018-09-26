import './Flare.css'
import * as d3 from 'd3'
import cx from 'classnames'
import data from './flare-demo-data'
import React, { PureComponent } from 'react'

function radialPoint (x, y) {
  return [(y = +y) * Math.cos((x -= Math.PI / 2)), y * Math.sin(x)]
}

export class Flare extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { w: 0, h: 0 }
  }
  componentDidMount () {
    const d = window.innerWidth
    this.setState({ w: d, h: d })
  }
  render () {
    const { w, h } = this.state
    var stratify = d3
      .stratify()
      .parentId(d => d.id.substring(0, d.id.lastIndexOf('.')))
    var tree = d3
      .tree()
      .size([2 * Math.PI, 500])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)
    var root = tree(stratify(data))
    return (
      <svg width={w} height={h}>
        <g transform={`translate(${w / 2 + 40}, ${h / 2 + 90})`}>
          {root.links().map((link, i) => {
            return (
              <path
                key={i}
                className='link'
                d={d3
                  .linkRadial()
                  .angle(d => d.x)
                  .radius(d => d.y)(link)}
              />
            )
          })}
          {root.descendants().map((d, i) => {
            return (
              <g
                key={i}
                className={cx(
                  'node',
                  d.children ? 'node--internal' : 'node--leaf'
                )}
                transform={`translate(${radialPoint(d.x, d.y)})`}
              >
                <circle r='2.5' />
                <text
                  dy='0.31em'
                  x={d.x < Math.PI === !d.children ? 6 : -6}
                  textAnchor={d.x < Math.PI === !d.children ? 'start' : 'end'}
                  transform={`rotate(${(d.x < Math.PI
                    ? d.x - Math.PI / 2
                    : d.x + Math.PI / 2) *
                    180 /
                    Math.PI})`}
                >
                  {d.id.substring(d.id.lastIndexOf('.') + 1)}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    )
  }
}
