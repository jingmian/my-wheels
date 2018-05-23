const notifies = new Map()
let enabled = false
let duration = 1000

function _Timer (offsetSecond, callback, endCallback, id) {
  this.offsetSecond = offsetSecond
  this.callback = callback
  this.endCallback = endCallback
  this.paused = false
  this.valid = true
  this.id = id
}

if (!_Timer.prototype.countDown) {
  _Timer.prototype.countDown = function () {
    if (this.paused) {
      return
    }
    this.offsetSecond -= 1// 计时过程
    let hour = parseInt(this.offsetSecond / 3600)
    let originalMin = parseInt(this.offsetSecond % 3600 / 60)
    let originalSecond = parseInt(this.offsetSecond % 3600 % 60)
    // 补0
    let min = _leftPad(originalMin, 0, 1)
    let second = _leftPad(originalSecond, 0, 1)

    let timing = {
      id: this.id,
      hour: hour,
      min: min,
      second: second
    }
    this.callback && this.callback(timing)
    if (this.offsetSecond <= 0) {
      this.endCallback && this.endCallback(timing)
      this.valid = false// 下一次删除
    }
  }
}

function startCountDown () {
  if (enabled) {
    return
  }
  enabled = true// 计时器运行中
  // 参数校验
  function countDown (error) {
    /*
     阻塞纠偏
     */
    setTimeout(function () {
      let start = Date.now()
      for (let item of notifies.entries()) {
        if (item[1].valid) {
          item[1].countDown()
        } else {
          notifies.delete(item[0])
        }
      }
      if (notifies.size === 0) {
        enabled = false
        return
      }
      countDown(Date.now() - start) // 时间误差
    }, duration - error)
  }

  countDown(0)
}

function initTimer (timer) {
  if (timer && typeof timer.duration === 'number') {
    duration = timer.duration
  }
}

function addTimer (timer) {
  if (!timer) {
    return
  }
  // TODO 参数校验
  /* eslint-disable symbol-description */
  let id = Symbol()
  notifies.set(id, new _Timer(timer.offsetSecond, timer.callback, timer.endCallback, id))
  return id
}
function getTimer (id) {
  if (id) {
    return notifies.get(id)
  }
}
function removeTimer (id) {
  let t = notifies.get(id)
  t && (t.valid = false)
}

function pauseTimer (id) {
  let t = notifies.get(id)
  t && (t.paused = true)
}

function recoverTimer (id) {
  let t = notifies.get(id)
  t && (t.paused = false)
}

function size () {
  return notifies.size
}
function _leftPad (target, pad, length) {
  if (target >= 10) {
    return target
  }
  pad += ''
  let left = ''
  while (--length >= 0) {
    left += pad
  }
  return left + target
}

export default {
  init: initTimer,
  startCountDown: startCountDown,
  add: addTimer,
  get: getTimer,
  remove: removeTimer,
  pause: pauseTimer,
  recover: recoverTimer,
  size: size
}
