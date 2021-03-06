import { DiaryRunOpts } from './bin'
import { init as initDb, Toilet} from './db'
import { gh } from './gh'
import * as query from './query'
import assert from 'assert'
import fetch, { Headers } from 'node-fetch'
import keyBy from 'lodash/keyBy'

export type AppendDiaryOpts = { db: Toilet, res: any }

export const diary = {
  async getLatestCursorTokens (db: Toilet) {
    var res = await Promise.all([
      db.read(db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS),
      db.read(db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS)
    ])
    return {
      [db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS]: res[0],
      [db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS]: res[1]
    }
  },
  async main (opts: DiaryRunOpts) {
    var config = opts || {}
    config.endpoint = config.endpoint || 'https://api.github.com/graphql'
    assert(config.login, 'GitHub login (user) required')
    config.token = config.token || (await gh.getToken())
    var db = initDb({ filename: config.output })
    await db.open()
    await db.write('login', config.login)
    await this.updateDiary({ config, db, firstRun: true })
  },
  async updateDiary (opts: { config: DiaryRunOpts, db: Toilet, firstRun?: boolean }): Promise<undefined> {
    const { config, db, firstRun = false } = opts
    const { endpoint } = config
    if (!endpoint) throw new Error('no endpoint provided')
    var tokens = await this.getLatestCursorTokens(db)
    var hasMoreComments = firstRun ? true : tokens[db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS]
      ? (tokens[db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS].hasNextPage === true)
      : true
    var hasMorePullRequests = firstRun ? true : tokens[db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS]
      ? (tokens[db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS].hasNextPage === true)
      : true
    if (hasMoreComments || hasMorePullRequests) {
      console.info(`[diary] info: requesting additionally diary data`)
      var body = query.history({
        login: config.login,
        includeComments: !!hasMoreComments,
        includeCommentsEndCursor: tokens[db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS]
          ? tokens[db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS].endCursor
          : null,
        includePullRequests: !!hasMorePullRequests,
        includePullRequestsEndCursor: tokens[db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS]
          ? tokens[db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS].endCursor
          : null
      })
      if (!endpoint) throw new Error('no endpoint provided')
      var res = await fetch(endpoint, {
        body,
        method: 'POST',
        headers: new Headers({
          Authorization: `bearer ${config.token}`
        })
      })
      var json = await res.json()
      if (json.errors) {
        throw new Error(json.errors.map((e: any) => `${JSON.stringify(e, null, 2)}`).join(', '))
      }
      if (res.status >= 400) {
        throw new Error(
          `[${res.status}: ${res.statusText}] ${json.message ||
            JSON.stringify(json)}`
        )
      }
      this.appendDiary({ res: json, db })
      // sleep to not piss off github :)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return this.updateDiary({ config, db })
    } else {
      console.info(`[diary] info: no additional diary data to collect`)
    }
  },
  async appendDiary (opts: AppendDiaryOpts) {
    const { db, res } = opts
    var { issueComments: ic, pullRequests: pr } = res.data.user
    var { pageInfo: issueCommentsPageInfo = {}, nodes: issueComments = [] } = ic || {}
    var { pageInfo: pullRequestsPageInfo = {}, nodes: pullRequests = [] } = pr || {}
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
    if (issueCommentsPageInfo.endCursor) await db.write(db.CURSOR_PAGE_INFO_KEYS.ISSUE_COMMENTS, issueCommentsPageInfo)
    if (pullRequestsPageInfo.endCursor) await db.write(db.CURSOR_PAGE_INFO_KEYS.PULL_REQUESTS, pullRequestsPageInfo)
  }
}

export {
  DiaryRunOpts
}
