(function () {

  var playAlarm = function () {
    $('#audio-alarm')[0].play();

    var bg = [$('body').css('background-color'), 'red'];
    var i = 0;

    var t = setInterval(function () {
      ++i;
      $('body').css('background-color', bg[i % 2]);
      if (i > 11) {
        clearInterval(t);
      }
    }, 500);
  };

  var setupTimer = function (o) {
    var $timer = o.$timer;

    timer.setup({
      root: $timer[0],
      timerText: $timer.find('.timer-text')[0],
      target: o.target,
      playing: true,
      format: o.format,
      onTick: o.onTick
    });
  };

  var minutes = function (min) {
    return min * 60 * 1000;
  };

  var setup = function ($ctx, event) {
    if (!event) {
      return;
    }

    var startTime = event.startTime;
    var stopTime = event.startTime + (event.duration * 1000);
    var $challenges = $ctx.find('.challenge');
    var $beforeStart = $ctx.find('.before-start');
    var $afterStart = $ctx.find('.after-start');
    var $duringSession = $ctx.find('.during-session');
    var $afterStop = $ctx.find('.after-stop');
    var $startTimer = $ctx.find('.timer-start');

    $ctx.find('.location-btn')
      .attr('title', event.location.name)
      .attr('href', event.location.url);

    $ctx.find('.registration-btn')
      .attr('title', event.registration.name)
      .attr('href', event.registration.url);

    $ctx.find('.start-time')
      .text((new Date(startTime)).toLocaleString(event.locale));

    setupTimer({
      $timer: $ctx.find('.timer-start'),
      target: startTime
    });

    var eventTick = function (state) {
      var eventStarted = startTime <= new Date().getTime();
      var eventStopped = stopTime <= new Date().getTime();
      $beforeStart.toggle(eventStarted === false);
      $duringSession.toggle(eventStarted === true && eventStopped === false);
      $afterStart.toggle(eventStarted === true);
      $afterStop.toggle(eventStopped === true);
    };

    $challenges.each(function (i) {
      var challenge = event.challenges[i];

      var $challenge = $(this);
      var $title = $challenge.find('h3');
      var $retrospectiveTimer = $challenge.find('.timer.timer-retrospective');
      var $codingTimer = $challenge.find('.timer.timer-coding');

      var challengeTime = event.startTime + i * minutes(40);

      var challengeTick = function (state) {
        var diff = state.targetTime - new Date().getTime();
        $challenge.toggleClass('active', -minutes(10) < diff && diff < minutes(30));
        eventTick(state);
      };

      $challenge
        .attr('href', challenge.url)
        .attr('target', '_blank')
        .click(function () {
          return challengeTime < (new Date()).getTime();
        });

      $title.text(challenge.title);

      setupTimer({
        $timer: $codingTimer,
        target: challengeTime + minutes(30),
        format: 'mm:ss',
        onTick: function (state) {
          var diff = state.targetTime - new Date().getTime();

          if (!$codingTimer.hasClass('old') && -2000 < diff && diff < 0) {
            playAlarm();
          }

          $codingTimer.toggleClass('active', diff >= 0 && diff < minutes(30));
          $codingTimer.toggleClass('warn', diff < minutes(2));
          $codingTimer.toggleClass('old', diff < 0);
          $codingTimer.toggleClass('future', diff > minutes(30));

          challengeTick(state);
        }
      });

      setupTimer({
        $timer: $retrospectiveTimer,
        target: challengeTime + minutes(40),
        format: 'mm:ss',
        onTick: function (state) {
          var diff = state.targetTime - new Date().getTime();

          if (!$codingTimer.hasClass('old') && -2000 < diff && diff < 0) {
            playAlarm();
          }

          $retrospectiveTimer.toggleClass('active', diff >= 0 && diff < minutes(10));
          $retrospectiveTimer.toggleClass('warn', diff < minutes(2));
          $retrospectiveTimer.toggleClass('old', diff < 0);
          $retrospectiveTimer.toggleClass('future', diff > minutes(10));
        }
      });
    });

    /* Export data, so it can be modified */
    window.codingGymEvent = event;
  };

  var encodeData = function (data) {
    var json = JSON.stringify(data);
    var base64 = btoa(json);
    var url = window.location.href.substr(0, window.location.href.lastIndexOf('#') + 1) + base64;
    return base64;
  };

  var dataFromHash = function () {
    try {
      var base64 = window.location.hash.substr(1)
      var json = atob(base64);
      var data = JSON.parse(json);
      return data;
    } catch (e) {
      /* handle error */
    }
    return null;
  };

  window.quickref = {
    setup: setup,
    encodeData: encodeData,
    dataFromHash: dataFromHash
  };

}());
