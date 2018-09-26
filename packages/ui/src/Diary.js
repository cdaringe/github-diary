import React from 'react'
import groupBy from 'lodash/groupBy'
import './gfm.css'
import './Diary.css'
import domtoimage from 'dom-to-image'

function toTable (stats) {
  return (
    <table>
      <tbody>
        {stats.map((stat, i) => (
          <tr key={i}>
            <td>{stat.text}</td>
            <td>{stat.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default class Diary extends React.PureComponent {
  diaryRef = ref => {
    this.__diary_node = ref
    window.__diary_node = ref
  }
  buttonRef = ref => (this.__button_ref = ref)
  toImg = async () => {
    // hack around download bug
    var map = {
      margin: { wip: 0 },
      position: { wip: 'fixed' },
      top: { wip: 0 },
      background: { wip: 'white' },
      zIndex: { wip: 10 }
    }
    var buttonDisplay = this.__button_ref.style.display
    this.__button_ref.style.display = 'none'
    for (var k in map) {
      map[k].prev = this.__diary_node.style[k]
      this.__diary_node.style[k] = map[k].wip
    }
    var dataUrl = await domtoimage.toPng(this.__diary_node, {
      bgcolor: 'white'
    })
    // unhack download bug
    for (k in map) this.__diary_node.style[k] = map[k].prev
    this.__button_ref.style.display = buttonDisplay
    var link = document.createElement('a')
    link.download = 'diary.png'
    link.href = dataUrl
    link.click()
  }
  render () {
    var {
      diary: {
        login,
        issueComments: issueCommentsById,
        pullRequests: pullRequestsById
      }
    } = this.props
    var issueComments = Object.values(issueCommentsById)
    var pullRequests = Object.values(pullRequestsById)
    var numComments = issueComments.length
    var numPrs = pullRequests.length
    var numInteractions = numComments + numPrs
    var prsByRepo = groupBy(pullRequests, 'repository.nameWithOwner')
    var commentsByRepo = groupBy(issueComments, 'repository.nameWithOwner')
    var numUniqueRepoPrAgainst = Object.keys(prsByRepo).length
    var numUniqueRepoCommentAgainst = Object.keys(commentsByRepo).length
    var numUniqueRepos = Object.keys(
      Object.assign({}, prsByRepo, commentsByRepo)
    ).length
    var mostCommentedOn = Object.values(commentsByRepo)
      .sort((a, b) => {
        if (a.length < b.length) return 1
        if (a.length === b.length) return 0
        return -1
      })
      .slice(0, 10)
      .map(set => ({
        text: set[0].repository.nameWithOwner,
        value: set.length
      }))
    var mostPrOn = Object.values(prsByRepo)
      .sort((a, b) => {
        if (a.length < b.length) return 1
        if (a.length === b.length) return 0
        return -1
      })
      .slice(0, 10)
      .map(set => ({
        text: set[0].repository.nameWithOwner,
        value: set.length
      }))
    var statGroup1 = [
      { text: 'Number of comments', value: numComments },
      { text: 'Number of pull requests', value: numPrs },
      { text: 'Total number of interactions', value: numInteractions }
    ]
    var statGroupUnique = [
      { text: 'Pull requested against:', value: numUniqueRepoPrAgainst },
      { text: 'Commented against:', value: numUniqueRepoCommentAgainst },
      { text: 'Interacted with:', value: numUniqueRepos }
    ]
    return (
      <div
        id='diary_container'
        ref={this.diaryRef}
        className='diary markdown-body'
      >
        <button
          ref={this.buttonRef}
          onClick={this.toImg}
          style={{ float: 'right', margin: 10 }}
        >
          download
        </button>
        <h1>
          GitHub.com Diary -{' '}
          <a
            target='_blank'
            rel='noopener noreferrer'
            href={`https://github.com/${login}`}
          >
            {login}
          </a>
        </h1>
        <h2>Overall</h2>
        {toTable(statGroup1)}
        <h2>Unique Contributions</h2>
        Number of unique repositories...
        {toTable(statGroupUnique)}
        <h2>Discussed most</h2>
        {toTable(mostCommentedOn)}
        <h2>Pull Requested most</h2>
        {toTable(mostPrOn)}
      </div>
    )
  }
}
