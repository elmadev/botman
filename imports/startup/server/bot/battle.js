var http = require('http')
var moment = require('moment')
var eolapi = 'http://elmaonline.net/API/battlelist'
var currentid = 0
var resultsid = 0
var resultsInfo
var queue

var exports = module.exports = {}

var postQueue = function () {
  if (Object.keys(queue).length > 0) {
    var queuetext = 'Queue: '
    Object.keys(queue).forEach(key => {
      queuetext += queue[key].duration + ' mins ' + queue[key].type + ' by ' + queue[key].kuski + ' - '
    })
    return queuetext
  } else {
    return ''
  }
}

var alignPlacement = function (no) {
  if (no < 10) {
    no = ' ' + no
  }
  return no
}

var alignKuski = function (kuski) {
  var trailingSpaces = 16 - kuski.length
  while (trailingSpaces > 0) {
    kuski += ' '
    trailingSpaces--
  }
  return kuski
}

exports.getResults = function (id, callback) {
  if (resultsid !== id) {
    resultsid = id
    var resultsUrl = 'http://elmaonline.net/API/battle/' + id
    http.get(resultsUrl, function (res) {
      var body = ''

      res.on('data', function (chunk) {
        body += chunk
      })
      res.on('end', function () {
        try {
          var o = JSON.parse(body)
          if (o && typeof o === 'object' && o !== null) {
            var no = 1
            var resultstext = 'Top 10 results for **' + resultsInfo.levelname + '**.lev by **' + resultsInfo.kuski + '**:\n'
            resultstext += '```\n'
            for (no in o) {
              resultstext += alignPlacement(no) + '. ' + alignKuski(o[no].kuski) + ' ' + o[no].time + '\n'
              if (no >= 10) {
                break
              }
            }
            resultstext += '```\n'
            resultstext += 'Replay: <http://www.recsource.tv/battle/' + resultsInfo.index + '>'
            if (Object.keys(queue).length > 0) {
              resultstext += '\n' + postQueue()
            }
            return callback(resultstext)
          } else {
            return callback(-1)
          }
        } catch (e) {
          return callback(-1)
        }
      })
    }).on('error', function (e) {
      console.log('Got an error: ', e)
    })
  }
}

exports.checkQueue = function (callback) {
  var ret = {type: 0, message: ''}
  http.get(eolapi, function (res) {
    var body = ''

    res.on('data', function (chunk) {
      body += chunk
    })

    res.on('end', function () {
      try {
        var o = JSON.parse(body)
        if (o && typeof o === 'object' && o !== null) {
          queue = {}
          Object.keys(o).forEach(function (key) {
            var battle = o[key]
            var bfinished = parseInt(battle.finished)
            var bindex = parseInt(battle.index)
            var binqueue = parseInt(battle.inqueue)
            var baborted = parseInt(battle.aborted)
            var bstarted = parseInt(battle.started)
            var bduration = parseInt(battle.duration)
            if (bfinished === 1 && bindex === currentid && baborted === 0) {
              resultsInfo = battle
              ret.type = 1
              ret.message = currentid
            }
            if (bfinished === 0 && binqueue === 1 && baborted === 0) {
              queue[bindex] = battle
            }
            if (bfinished === 0 && binqueue === 0 && baborted === 0) {
              var left = (((bstarted - (60 * 60 * 10)) + (bduration * 60)) - moment().format('X'))
              ret.message = ':elma: **Battle started** :flower: ' + moment(left, 'X').format('m:ss') + ' left \n \n' + ret.message
              ret.message += battle.duration + ' mins ' + battle.type + ' in **' + battle.levelname + '**.lev by **' + battle.kuski
              ret.message += '**\n \n'
              ret.message += 'More info: <http://elmaonline.net/battles/' + bindex + '>'
              ret.message += '\nMap: http://elmaonline.net/images/map/' + battle.level + '/1000/1000'
              if (Object.keys(queue).length > 0) {
                ret.message += '\n' + postQueue()
              }
              if (bindex !== currentid) {
                currentid = bindex
                ret.type = 2
              } else {
                ret.type = 3
              }
            }
          })
          return callback(ret)
        } else {
          ret.type = -1
          return callback(ret)
        }
      } catch (e) {
        ret.type = -1
        console.log(e)
        return callback(ret)
      }
    })
  }).on('error', function (e) {
    console.log('Got an error: ', e)
    ret.type = -1
    return callback(ret)
  })
}
