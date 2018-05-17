var meow = require('meow')
var diary = require('../')
var cli = meow(
  `
  Usage
    $ github-diary <args>

  Options
    --login, -l GitHub login user
    --token, -t GitHub token. If none provided, one will generate one for you
                on _each run_. It is strongly recommended to generate and use
                your own token
    --endpoint, -e GitHub endpoint. Defaults to GitHub.com
    --output, -o output file

  Examples
    $ github-diary --login cdaringe [--token GITHUB_TOKEN] [-o /path/to/diary.json]
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
      },
      output: {
        type: 'string',
        alias: 'o'
      }
    }
  }
)

diary.main(cli.flags)

// https://developer.github.com/v4/guides/forming-calls/#authenticating-with-graphql
