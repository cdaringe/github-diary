import * as path from 'path'
import * as util from 'util'
var toilet = require('toiletdb')

var KEYS = {
  ISSUE_COMMENTS: 'issueComments',
  PULL_REQUESTS: 'pullRequests'
}
var CURSOR_PAGE_INFO_KEYS = {
  ISSUE_COMMENTS: `${KEYS.ISSUE_COMMENTS}PageInfo`,
  PULL_REQUESTS: `${KEYS.PULL_REQUESTS}pullRequestsPageInfo`
}

export type Toilet = {
  open: ToiletCall
  read: ToiletCall
  write: ToiletCall
  delete: ToiletCall
  CURSOR_PAGE_INFO_KEYS: typeof CURSOR_PAGE_INFO_KEYS
  KEYS: typeof KEYS
  filename: string
}
export type ToiletCall = (...args: any[]) => Promise<any>

export const init = (opts: { filename?: string }) => {
  let { filename } = opts
  filename = filename || path.resolve(process.cwd(), 'diary.json')
  var db = toilet(filename)
  return {
    open: util.promisify(db.open),
    read: util.promisify(db.read),
    write: util.promisify(db.write),
    delete: util.promisify(db.delete),
    CURSOR_PAGE_INFO_KEYS,
    KEYS,
    filename
  } as Toilet
}
