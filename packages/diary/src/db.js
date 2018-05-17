var toilet = require('toiletdb')
var path = require('path')
var util = require('util')

var KEYS = {
  ISSUE_COMMENTS: 'issueComments',
  PULL_REQUESTS: 'pullRequests'
}
var CURSOR_PAGE_INFO_KEYS = {
  ISSUE_COMMENTS: `${KEYS.ISSUE_COMMENTS}PageInfo`,
  PULL_REQUESTS: `${KEYS.PULL_REQUESTS}pullRequestsPageInfo`
}

module.exports = function ({ filename }) {
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
  }
}
