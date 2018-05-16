var fetch = require('node-fetch')
var query = require('./query')
var assert = require('assert')
var db = require('./db')
var keyBy = require('lodash/keyBy')
var gh = require('./gh')

var diary = {
  async getLatestCursorTokens () {
    var res = await Promise.all([
      db.read(db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS),
      db.read(db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS)
    ])
    return {
      [db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS]: res[0],
      [db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS]: res[1]
    }
  },
  async main (opts) {
    var config = opts || {}
    config.endpoint = config.endpoint || 'https://api.github.com/graphql'
    assert(config.login, 'GitHub login (user) required')
    config.token = config.token || (await gh.getToken())
    await db.open()
    await db.write('login', config.login)
    this.updateDiary({ config })
  },
  async updateDiary ({ config }) {
    var latestCursorTokens = await this.getLatestCursorTokens()
    var hasMoreComments = latestCursorTokens[
      db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS
    ]
      ? latestCursorTokens[db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS].hasNextPage
      : true
    var hasMorePullRequests = latestCursorTokens[
      db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS
    ]
      ? latestCursorTokens[db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS].hasNextPage
      : true
    var i = 5 // temp!
    if (hasMoreComments || hasMorePullRequests) {
      --i
      if (!i) return
      console.info(`[diary] info: requesting additionally diary data`)
      var body = query.history({
        login: config.login,
        includeComments: hasMoreComments,
        includeCommentsEndCursor: latestCursorTokens[
          db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS
        ]
          ? latestCursorTokens[db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS]
            .endCursor
          : null,
        includePullRequests: hasMorePullRequests,
        includePullRequestsEndCursor: latestCursorTokens[
          db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS
        ]
          ? latestCursorTokens[db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS].endCursor
          : null
      })
      var res = await fetch(config.endpoint, {
        body,
        method: 'POST',
        headers: new fetch.Headers({
          Authorization: `bearer ${config.token}`
        })
      })
      var json = await res.json()
      if (json.errors) {
        throw new Error(json.errors.map(e => toString(e)).join(', '))
      }
      if (res.status >= 400) {
        throw new Error(`[${res.status}: ${res.statusText}] ${json.message || JSON.stringify(json)}`)
      }
      this.appendDiary(json)
      // sleep to not piss off github :)
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.updateDiary({ config })
    } else {
      console.info(`[diary] info: no additional diary data to collect`)
    }
  },
  async appendDiary (res) {
    var { issueComments: ic, pullRequests: pr } = res.data.user
    var { pageInfo: issueCommentsPageInfo, nodes: issueComments } = ic || {}
    var { pageInfo: pullRequestsPageInfo, nodes: pullRequests } = pr || {}
    var prsById = keyBy(pullRequests, 'id')
    var comsById = keyBy(issueComments, 'id')
    var [inDbComsById = {}, inDbPrsById = {}] = await Promise.all([
      db.read(db.KEYS.ISSUE_COMMENTS),
      db.read(db.KEYS.PULL_REQUESTS)
    ])
    Object.assign(inDbComsById, comsById)
    Object.assign(inDbPrsById, prsById)
    await Promise.all([
      db.write(db.KEYS.ISSUE_COMMENTS, inDbComsById),
      db.write(db.KEYS.PULL_REQUESTS, inDbPrsById)
    ])
    // write pageInfo last s.t. on failure we will re-try the prior pages
    await Promise.all([
      db.write(db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS, issueCommentsPageInfo),
      db.write(db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS, pullRequestsPageInfo)
    ])
  }
}

module.exports = diary
