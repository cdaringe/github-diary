import * as  util from 'util'
const ghauthcb = require('ghauth')

const ghauth = util.promisify(ghauthcb)

const SCOPES = ['repo', 'read:org', 'read:user']
export const gh = {
  scopes: SCOPES,
  async getToken () {
    var authData = await ghauth({
      configName: 'github-diary.creds',
      noSave: true,
      scopes: SCOPES,
      note: 'GitHub Diary Token',
      userAgent: 'GitHub Diary'
    })
    return authData.token as string
  }
}
