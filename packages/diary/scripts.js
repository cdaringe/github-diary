var cmd = process.argv[2]
var rest = Array.from(process.argv).splice(2)
var cp = require('child_process')
var pkg = require('./package.json')

var projectRoot = __dirname

var latestTag = `cdaringe/${pkg.name}`
var currentTag =  `cdaringe/${pkg.name}:${pkg.version}`

var scripts = {
  async build () {
    cp.execSync(`docker build -t ${latestTag} -t ${currentTag} .`, { cwd: projectRoot, stdio: 'inherit' })
  },
  async publish () {
    cp.execSync(`docker publish ${currentTag}`, { cwd: projectRoot, stdio: 'inherit' })
    cp.execSync(`docker publish ${latestTag}`, { cwd: projectRoot, stdio: 'inherit' })
  }
}

if (cmd) scripts[cmd].apply(scripts, rest)
module.exports = scripts
