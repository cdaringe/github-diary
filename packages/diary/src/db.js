var toilet = require('toiletdb')
var path = require('path')
var DB_FILENAME = path.resolve(process.cwd(), 'diary.json')
var db = toilet(DB_FILENAME)
var util = require('util')

var KEYS = {
  ISSUE_COMMENTS: 'issueComments',
  PULL_REQUESTS: 'pullRequests'
}
var CURSOR_PAGE_INFO_KEYS = {
  ISSUE_COMMENTS: `${KEYS.ISSUE_COMMENTS}PageInfo`,
  PULL_REQUESTS: `${KEYS.PULL_REQUESTS}pullRequestsPageInfo`
}

module.exports = {
  open: util.promisify(db.open),
  read: util.promisify(db.read),
  write: util.promisify(db.write),
  delete: util.promisify(db.delete),
  CURSOR_PAGE_INFO_KEYS,
  KEYS,
  DB_FILENAME
}
