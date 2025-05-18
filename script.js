$(document).ready(function () {
    // --- Глобальні змінні ---
    let baseTime = 30;              // Базовий час для першого рівня
    let level = 1;                  // Поточний рівень
    let interval;                   // Інтервал таймера
    let timer = 0;                  // Поточне значення таймера
    let currentExpected = 1;        // Поточне правильне число
    let isMuted = false;           // Чи вимкнений звук
    let started = false;           // Чи розпочато гру (для запуску таймера)
    let gameOver = false;          // Чи закінчена гра (виграш/програш)
    let userInteracted = false;    // Чи була перша взаємодія з сайтом (для запуску музики)
  
    const audio = $('#bg-music')[0];
  
    // --- Функція запуску музики ---
    function playMusic() {
      if (!isMuted && userInteracted) {
        audio.play().catch(() => {});
      }
    }
  
    function pauseMusic() {
      audio.pause();
    }
  
    // --- Скидання та запуск таймера ---
    function resetTimer() {
        clearInterval(interval);
      
        // Розрахунок часу залежно від рівня
        let additionalTime = 0;
      
        if (level <= 3) {
          additionalTime = (level - 1) * 5;
        } else if (level <= 10) {
          additionalTime = 2 * 5 + (level - 3) * 20;
        } else {
          additionalTime = 2 * 5 + 7 * 10 + (level - 10) * 30;
        }
      
        timer = baseTime + additionalTime;
        $('#time').text(timer);
    }
  
    function startTimer() {
      interval = setInterval(() => {
        timer--;
        $('#time').text(timer);
        if (timer <= 0) {
          clearInterval(interval);
          gameOver = true;
          showMenu(true, 'Час вийшов!', 'Спробуйте ще раз.');
        }
      }, 1000);
    }
  
    // --- Показ або приховування меню ---
    function showMenu(show, title = '', message = '') {
      if (show) {
        $('#menu-title').text(title);
        $('#menu-message').text(message);
        $('#menu').removeClass('hidden');
  
        // Зупинити музику і таймер
        clearInterval(interval);
        pauseMusic();
  
        // Налаштування кнопок у меню
        if (title === 'Час вийшов!' || title === 'Помилка!') {
          $('#resume').addClass('hidden');
          $('#next-level').addClass('hidden');
        } else if (title === 'Вітаємо!') {
          $('#resume').addClass('hidden');
          $('#next-level').removeClass('hidden');
        } else {
          $('#resume').removeClass('hidden');
          $('#next-level').addClass('hidden');
        }
  
      } else {
        $('#menu').addClass('hidden');
        gameOver = false;
        playMusic();
      }
    }
  
    // --- Генерація випадкового кольору для числа ---
    function getRandomColor() {
      const letters = '0123456789ABCDEF';
      return '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join('');
    }
  
    // --- Побудова ігрового поля ---
    function drawField(size) {
      const field = $('.field');
      const total = size * size;
      const nums = Array.from({ length: total }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  
      field.empty();
      let index = 0;
      for (let i = 0; i < size; i++) {
        const row = $('<tr></tr>');
        for (let j = 0; j < size; j++) {
          const num = nums[index++];
          const cell = $('<td></td>').text(num).css({
            'font-size': `${12 + Math.floor(Math.random() * 10)}pt`,
            'color': getRandomColor()
          });
          row.append(cell);
        }
        field.append(row);
      }
    }
  
    // --- Старт гри ---
    function startGame() {
      showMenu(false);
      started = false;
      gameOver = false;
      $('#level').text(level);
      const size = level + 2;
      drawField(size);
      resetTimer();
      currentExpected = 1;
  
      // Запуск музики (якщо вже була взаємодія)
      playMusic();
  
      // Обробка кліків по числах
      $('td').off('click').on('click', function () {
        if (!userInteracted) {
          userInteracted = true;
          playMusic();
        }
  
        if (gameOver) return;
  
        if (!started) {
          started = true;
          startTimer();
        }
  
        const num = parseInt($(this).text());
        if (num === currentExpected) {
          $(this).addClass('active');
          currentExpected++;
          if (currentExpected > size * size) {
            clearInterval(interval);
            setTimeout(() => {
              showMenu(true, 'Вітаємо!', 'Рівень пройдено!');
            }, 300);
          }
        } else {
          clearInterval(interval);
          gameOver = true;
          showMenu(true, 'Помилка!', 'Це не те число. Спробуйте спочатку.');
        }
      });
    }
  
    // --- Обробники подій інтерфейсу ---
    $('#resume').click(() => {
      showMenu(false);
      if (!started) {
        started = true;
        startTimer();
      } else {
        startTimer();
      }
    });
  
    $('#restart').click(() => {
      level = 1;
      startGame();
    });
  
    $('#next-level').click(() => {
      level++;
      startGame();
    });
  
    $('#menu-toggle').click(() => {
      if (!gameOver) {
        showMenu(true, 'Пауза', 'Гру призупинено.');
      }
    });
  
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape' && !gameOver) {
        showMenu(true, 'Пауза', 'Гру призупинено.');
      }
    });
  
    $('#mute-toggle').click(() => {
      isMuted = !isMuted;
      $('#mute-toggle').text(isMuted ? '🔇' : '♫');
      if (isMuted) pauseMusic();
      else playMusic();
    });
  
    // --- Початковий запуск гри ---
    startGame();
  
    //Автоматично відтворити музику
    $(window).one('click', () => {
      userInteracted = true;
      playMusic();
    });
});
  
