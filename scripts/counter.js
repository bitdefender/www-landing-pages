const timerWrapper = document.querySelector('.timer');

    if (!timerWrapper) {
        return;
    }

    const timer = new FlipClock(timerWrapper, {
        clockFace: 'DailyCounter',
        autoStart: false,
        countdown: true,
        callbacks: {
            stop: function () {
                location.reload();
            }
        }
    });

    const CMtime = new Date('November 27, 2023 10:00:00').getTime() / 1000;
    const CMduration = 48 * 3600;

    fetch('/site/Promotions/getDate')
        .then(response => response.json())
        .then(data => {
            const serverTime = data.timestamp;

            if (serverTime < CMtime) {
                // before CM
                timer.setTime(CMtime - serverTime);
                timer.setCountdown(true);
                timer.start();
                document.querySelector('.show-bf').classList.remove('d-none');
                document.querySelector('.bfBanner').classList.add('section_bf');
            } else if (serverTime >= CMtime && serverTime < CMtime + CMduration) {
                // during CM
                timer.setTime(CMtime + CMduration - serverTime);
                timer.setCountdown(true);
                timer.start();
                document.querySelector('.show-cm').classList.remove('d-none');
                document.querySelector('.bfBanner').classList.add('section_cm');
            } else {
                // after CM
                timerWrapper.style.display = 'none';
                document.querySelector('.show-bf').classList.remove('d-none');
                document.querySelector('.bfBanner').classList.add('section_bf');
            }
        });

    document.querySelector('.flip-clock-divider.days .flip-clock-label').textContent = timerWrapper.getAttribute('data-days');
    document.querySelector('.flip-clock-divider.hours .flip-clock-label').textContent = timerWrapper.getAttribute('data-hours');
    document.querySelector('.flip-clock-divider.minutes .flip-clock-label').textContent = timerWrapper.getAttribute('data-minutes');
    document.querySelector('.flip-clock-divider.seconds .flip-clock-label').textContent = timerWrapper.getAttribute('data-seconds');