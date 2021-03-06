'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {

  var save = function save(state) {
    var json = JSON.stringify(state);
    localStorage.setItem('jstimer', json);
    return state;
  };

  var load = function load(id) {
    var json = localStorage.getItem('jstimer');
    var state = JSON.parse(json);
    return state;
  };

  var timeToTarget = function timeToTarget(state) {
    return state.playing ? state.targetTime - now() : state.timeDiff;
  };

  var isExpired = function isExpired(state) {
    return timeToTarget(state) < 0;
  };

  var isNearExpiration = function isNearExpiration(state) {
    return timeToTarget(state) < 60000 && !isExpired(state);
  };

  var padLeft = function padLeft(a, b) {
    return (1e15 + a + "").slice(-b);
  };

  var now = function now() {
    return new Date().getTime();
  };

  var formatTime = function formatTime(t, format) {
    var sign = t >= 0 ? '' : '-';
    var tt = Math.abs(t);
    var milliseconds = t % 1000;
    tt = Math.floor(tt / 1000);
    var seconds = tt % 60;
    tt = (tt - seconds) / 60;
    var minutes = tt % 60;
    tt = (tt - minutes) / 60;
    var hours = tt % 24;
    tt = (tt - hours) / 24;
    var days = tt;

    var d = days !== 0 ? days + ' ' + (days === 1 ? 'day' : 'days') + ', ' : '';
    var h = padLeft(hours.toFixed(0), 2);
    var m = padLeft(minutes.toFixed(0), 2);
    var s = padLeft(seconds.toFixed(0), 2);
    var ms = padLeft(milliseconds.toFixed(0), 3);
    switch (format) {
      case 'mm:ss':
        return '' + sign + d + m + ':' + s;
      default:
        return '' + sign + d + h + ':' + m + ':' + s;
    }
  };

  var updateState = function updateState(state, update) {
    return save(Object.assign({}, state, update));
  };

  var renderTimeEl = function renderTimeEl(state, format) {
    return formatTime(timeToTarget(state), format);
  };

  var play = function play(state) {
    return state.playing ? state : updateState(state, {
      playing: true,
      targetTime: now() + state.timeDiff
    });
  };

  var pause = function pause(state) {
    return !state.playing ? state : updateState(state, {
      playing: false,
      timeDiff: state.targetTime - now()
    });
  };

  var showToolbar = function showToolbar(state) {
    return updateState(state, { showToolbarTimer: now() + 1000 });
  };

  var reset = function reset(state) {
    return updateState(state, {
      playing: false,
      timeDiff: 0,
      targetTime: now()
    });
  };

  var incrementTime = function incrementTime(state, milliseconds) {
    var playing = state.playing;
    state = pause(state);
    var timeDiff = state.timeDiff + milliseconds;
    return updateState(state, {
      playing: playing,
      timeDiff: timeDiff,
      targetTime: now() + timeDiff
    });
  };

  var setup = function setup(_ref) {
    var root = _ref.root,
      format = _ref.format,
      enableLocalStorage = _ref.enableLocalStorage || false,
      onTick = _ref.onTick,
      timerText = _ref.timerText,
      playBtn = _ref.playBtn,
      pauseBtn = _ref.pauseBtn,
      resetBtn = _ref.resetBtn,
      incrBtns = _ref.incrBtns,
      target = _ref.target;


    var defaultTimeDiff = 60 * 90 * 1000; // milliseconds

    var defaultState = {
      playing: false,
      timeDiff: defaultTimeDiff,
      targetTime: now() + defaultTimeDiff,
      showToolbarTimer: 0
    };

    var savedState = enableLocalStorage ? load() : {};

    var override = { targetTime: target, playing: _ref.playing || false };

    var state = Object.assign({}, defaultState, savedState, override);

    root.onmousemove = function () {
      state = showToolbar(state);
      loop();
    };

    if (playBtn) {
      playBtn.onclick = function () {
        state = play(state);
        loop();
        return false;
      };
    }

    if (pauseBtn) {
      pauseBtn.onclick = function () {
        state = pause(state);
        loop();
        return false;
      };
    }

    if (resetBtn) {
      resetBtn.onclick = function () {
        state = reset(state);
        loop();
        return false;
      };
    }

    if (incrBtns) {
      incrBtns.forEach(function (element) {
        var minutes = Number(element.hash.slice(1));
        var milliseconds = minutes * 60 * 1000;
        element.onclick = function (event) {
          state = incrementTime(state, milliseconds);
          loop();
          return false;
        };
      });
    }

    var loop = function () {
      timerText.innerHTML = renderTimeEl(state, format);
      root.classList.toggle('expired', isExpired(state));
      root.classList.toggle('near-expiration', isNearExpiration(state));
      root.classList.toggle('playing', state.playing === true);
      root.classList.toggle('toolbar-visible', state.showToolbarTimer > now());
      if (onTick) onTick(JSON.parse(JSON.stringify(state)));
    };

    loop();
    setInterval(loop, 1000);
  };

  window.timer = { setup: setup };
})();
