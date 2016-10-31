#!/usr/bin/env node
const request = require('request-promise')
const co = require('co')
const commander = require('commander')
const fs = require('fs')
const pkg = require('../package.json')

const LINE_API_URL = 'https://notify-api.line.me/api/notify'

let auth = {}
try {
  auth = require('../auth.json')
} catch (e) {
  // Ignore
}

commander
  .version(pkg.version)

commander
  .command('config')
  .usage('-t <token>')
  .option('-t, --token <token>', 'Your LINE access token')
  .action(setConfig)

commander.parse(process.argv)

let defaultAction = commander.args[0] !== 'config'
if (defaultAction) {
  postMessage(commander.args[0])
}

function setConfig (options) {
  let {token} = options
  if (!token) {
    commander.help()
  }
  let auth = {
    token
  }
  let writer = fs.createWriteStream(__dirname + '/../auth.json')
  writer.write(JSON.stringify(auth))
  writer.end()
}

function postMessage (text) {
  return co(function * () {
    let message = text || 'Yo!'
    let {token} = auth
    let url = LINE_API_URL
    let res = yield request(url, {
      method: 'POST',
      json: true,
      headers: {
        'User-Agent': 'Request-Promise',
        'Authorization': `Bearer ${token}`
      },
      formData: {message}
    })
    if (res.status !== 200) {
      console.error('Something Wrong!, Status=', res.status)
      console.error(res.message)
    }
  }).catch(err => console.log(err.error))
}
