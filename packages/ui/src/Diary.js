import React from 'react'
import groupBy from 'lodash/groupBy'
import './gfm.css'
import './Diary.css'

function toTable (stats) {
  return (
    <table>
      {stats.map(stat => (
        <tr>
          <td>{stat.text}</td>
          <td>{stat.value}</td>
        </tr>
      ))}
    </table>
  )
}

export default function Diary (props) {
  var {
    diary: {
      login,
      issueComments: issueCommentsById,
      pullRequests: pullRequestsById
    }
  } = props
  var issueComments = Object.values(issueCommentsById)
  var pullRequests = Object.values(pullRequestsById)
  var numComments = issueComments.length
  var numPrs = pullRequests.length
  var numInteractions = numComments + numPrs
  var prsByRepo = groupBy(pullRequests, 'repository.nameWithOwner')
  var commentsByRepo = groupBy(issueComments, 'repository.nameWithOwner')
  var numUniqueRepoPrAgainst = Object.keys(prsByRepo).length
  var numUniqueRepoCommentAgainst = Object.keys(commentsByRepo).length
  var numUniqueRepos = Object.keys(Object.assign(prsByRepo, commentsByRepo))
    .length
  var mostCommentedOn = Object.values(commentsByRepo)
    .sort((a, b) => {
      if (a.length < b.length) return 1
      if (a.length === b.length) return 0
      return -1
    })
    .slice(0, 10)
    .map(set => ({
      name: set[0].repository.nameWithOwner,
      count: set.length
    }))
  var mostPrOn = Object.values(prsByRepo)
    .sort((a, b) => {
      if (a.length < b.length) return 1
      if (a.length === b.length) return 0
      return -1
    })
    .slice(0, 10)
    .map(set => ({
      name: set[0].repository.nameWithOwner,
      count: set.length
    }))

  var statGroup1 = [
    { text: 'Number of comments', value: numComments },
    { text: 'Number of PRs', value: numPrs },
    { text: 'Number of Interactions', value: numInteractions }
  ]
  return (
    <div className='diary markdown-body'>
      <h1>GitHub Diary</h1>
      <h4>{login}</h4>
      <hr />
      {toTable(statGroup1)}
      <p>num unique repos pull requested against: {numUniqueRepoPrAgainst}</p>
      <p>num unique repos commented against: {numUniqueRepoCommentAgainst}</p>
      <p>num unique repos interacted with: {numUniqueRepos}</p>
      <pre>{JSON.stringify(mostCommentedOn, null, 2)}</pre>
      <pre>{JSON.stringify(mostPrOn, null, 2)}</pre>
    </div>
  )
}
