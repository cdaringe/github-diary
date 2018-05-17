# github-diary

reflect over your life on GitHub. generate a GitHub history json file and upload it to create a stats card!

<div width='100%' style='text-align: center;'>
  <img src='https://github.com/cdaringe/github-diary/blob/master/packages/diary/img/screenshot.png?raw=true' width='500px' /><br/>
  <small><i><caption>partial diary screenshot</caption></i></small>
</div>

## install

- `npm install [--save-dev|--global] github-diary`, or
- `docker pull cdaringe/github-diary`

## usage

to generate your diary, run `github-diary` via one of the methods below, and
upload your `diary.json` to [diary.cdaringe.com](https://diary.cdaringe.com). **no private data is captured/persisted on the site**. you are welcome to run the ui manually via the [ui](https://github.com/cdaringe/github-diary/tree/master/packages/ui) project as well.

```
  Usage
    $ github-diary <args>

  Options
    --login, -l GitHub login user
    --token, -t GitHub token. If none provided, one will be generated for you
                on _each run_. It is strongly recommended to generate and use
                your own token in advance.  https://github.com/settings/tokens
    --endpoint, -e GitHub endpoint. Defaults to GitHub.com

  Examples
    $ github-diary --login cdaringe [--token GITHUB_TOKEN]
```

`github-diary` can be used in a few different ways:

- CLI mode
  - via a node executable, `npx github-diary <args>`
  - via docker,

```sh
docker run -it \
  --init \
  --rm \
  -v $PWD/output:/output \
  cdaringe/github-diary \
  -o /output/diary.json \
  --login <github-login/username> \
  [--token <github-token>]
```

for the latest CLI args, please run `github-diary --help`

- library mode
  - via a node library, `var diary = require('github-diary')`

the source code is sufficiently small that i recommend you simply view `src/index`
to see how to use it as a lib.  `diary.main(...)` is your entrypoint, and likely all you'd want.
