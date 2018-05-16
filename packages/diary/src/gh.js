var ghauthcb = require('ghauth')
var util = require('util')
var ghauth = util.promisify(ghauthcb)
var SCOPES = ['repo', 'read:org', 'read:user']
var gh = {
  scopes: SCOPES,
  async getToken () {
    var authData = await ghauth({
      configName: 'github-diary.creds',
      noSave: true,
      scopes: SCOPES,
      note: 'GitHub Diary Token',
      userAgent: 'GitHub Diary'
    })
    return authData.token
  }
}

module.exports = gh
