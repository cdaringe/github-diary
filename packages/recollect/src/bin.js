var meow = require('meow')
var diary = require('../')
var cli = meow(
  `
  Usage
    $ diary <args>

  Options
    --login, -l GitHub login user
    --token, -t  GitHub token
    --endpoint, -e GitHub endpoint, defaults to GitHub.com's GQL API

  Examples
    $ diary --login cdaringe --token GITHUB_TOKEN
`,
  {
    flags: {
      login: {
        type: 'string',
        alias: 'l'
      },
      token: {
        type: 'string',
        alias: 't'
      },
      endpoint: {
        type: 'string',
        alias: 'e'
      }
    }
  }
)

diary.main(cli.flags)

// https://developer.github.com/v4/guides/forming-calls/#authenticating-with-graphql
