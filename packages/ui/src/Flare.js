import './Flare.css'
import * as d3 from 'd3'
import cx from 'classnames'
import DEFAULT_DATA from './flare-demo-data'
import React, { PureComponent } from 'react'
import panzoom from 'panzoom'

function radialPoint (x, y) {
  return [(y = +y) * Math.cos((x -= Math.PI / 2)), y * Math.sin(x)]
}

export class Flare extends PureComponent {
  constructor (props) {
    // eslint-disable-line
    super(props)
    this.state = { width: 0 }
  }
  componentDidMount () {
    const { width } = this.node.getBoundingClientRect()
    this.setState({ width })
    panzoom(this.node.children[0], {
      smoothScroll: false
    })
  }
  render () {
    const { width } = this.state
    const { data } = this.props
    var stratify = d3
      .stratify()
      .parentId(d => d.id.substring(0, d.id.lastIndexOf('.')))
    var tree = d3
      .tree()
      .size([2 * Math.PI, 500])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)
    var root = tree(stratify(data || DEFAULT_DATA))
    return (
      <svg
        style={{ width: '100%', height: width }}
        ref={node => (this.node = node)}
        // width={w} height={h}
      >
        <g transform={`translate(${width / 2 + 40}, ${width / 2 + 90})`}>
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
            const isXLessThanPi = d.x < Math.PI
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
                  x={isXLessThanPi === !d.children ? 6 : -6}
                  textAnchor={isXLessThanPi === !d.children ? 'start' : 'end'}
                  transform={`rotate(${(isXLessThanPi
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
