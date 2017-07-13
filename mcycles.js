/*
 * Copyright (C) m-click.aero GmbH
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

mcycles = (function() {
  var pathToRef = function(name, path) {
    var refParts = [name]
    for (var i = 0, len = path.length; i < len; i++) {
      refParts.push('[')
      refParts.push(JSON.stringify(path[i]))
      refParts.push(']')
    }
    return refParts.join('')
  }
  var findCycles = function(obj) {
    var path = []
    var ancestors = []
    var cycles = []
    var findCyclesRecursive = function(obj) {
      var cyclicAncestorIndex = ancestors.indexOf(obj)
      if (cyclicAncestorIndex >= 0) {
        cycles.push({obj: obj, fromPath: path.slice(), toPath: path.slice(0, cyclicAncestorIndex)})
        return
      }
      if (Object.prototype.toString.call(obj) === '[object Array]') {
        ancestors.push(obj)
        for (var i = 0, len = obj.length; i < len; i++) {
          path.push(i)
          findCyclesRecursive(obj[i])
          path.pop(i)
        }
        ancestors.pop(obj)
        return
      }
      if (Object.prototype.toString.call(obj) === '[object Object]') {
        ancestors.push(obj)
        for (var key in obj) {
          path.push(key)
          findCyclesRecursive(obj[key])
          path.pop(key)
        }
        ancestors.pop(obj)
        return
      }
    }
    findCyclesRecursive(obj)
    return cycles
  }
  var analyzeCycles = function(name, obj) {
    var resultParts = []
    var cycles = findCycles(obj)
    cycles.forEach(function (cycle) {
      resultParts.push('#/' + cycle.toPath.join('/') + ' ... ' + cycle.fromPath.slice(cycle.toPath.length).join('/'))
      resultParts.push('\n')
      resultParts.push(pathToRef(name, cycle.fromPath))
      resultParts.push('\n  === ')
      resultParts.push(pathToRef(name, cycle.toPath))
      resultParts.push('\n')
    })
    return resultParts.join('')
  }
  return {
    findCycles: findCycles,
    pathToRef: pathToRef,
    analyzeCycles: analyzeCycles
  }
})()
