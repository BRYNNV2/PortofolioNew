// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Scroll reveal animation
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('[data-reveal]').forEach((el, i) => {
  el.style.transitionDelay = (i % 6) * 0.06 + 's';
  io.observe(el);
});

// Projects carousel
const track = document.getElementById('workTrack');
if (track) {
  const prev = document.getElementById('workPrev');
  const next = document.getElementById('workNext');
  const bar = document.getElementById('workBar');
  const step = () => {
    const card = track.querySelector('.work-card');
    return card ? card.getBoundingClientRect().width + 32 : track.clientWidth * 0.5;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 0;
    bar.style.width = (28 + p * 72) + '%';
    prev.style.opacity = track.scrollLeft <= 2 ? '.4' : '1';
    next.style.opacity = track.scrollLeft >= max - 2 ? '.4' : '1';
  };
  track.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  update();
}

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 140) current = s.id;
  });
  navLinks.forEach((a) => {
    if (a.getAttribute('href') === '#' + current) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
});

// Audio Player Widget Logic
const musicCards = document.querySelectorAll('.music-card');
const pill = document.getElementById('audio-pill');
const pillCover = document.getElementById('pill-cover');
const pillTitle = document.getElementById('pill-title');
const pillArtist = document.getElementById('pill-artist');
const pillTrigger = document.getElementById('pill-trigger');

const panel = document.getElementById('audio-panel');
const panelCover = document.getElementById('panel-cover');
const panelTitle = document.getElementById('panel-title');
const panelArtist = document.getElementById('panel-artist');
const panelPlayToggle = document.getElementById('panel-play-toggle');
const panelClose = document.getElementById('panel-close');
const panelProgressFill = document.querySelector('.panel-progress-fill');
const panelTimeCurrent = document.getElementById('panel-time-current');

let currentActiveCard = null;
let isPlaying = false;
let progressInterval = null;
let currentSeconds = 5;
const totalSeconds = 342; // 5:42
let pillTriggered = false;

// Display pill on scroll when reaching the inspiration section AND already triggered by hover
const inspirationSection = document.getElementById('inspiration');
window.addEventListener('scroll', () => {
  if (inspirationSection) {
    if (pillTriggered && window.scrollY >= inspirationSection.offsetTop - window.innerHeight + 300) {
      pill.classList.add('visible');
    } else {
      pill.classList.remove('visible');
    }
  }
});

function updateProgress() {
  if (isPlaying) {
    if (!progressInterval) {
      progressInterval = setInterval(() => {
        currentSeconds++;
        if (currentSeconds >= totalSeconds) currentSeconds = 0;
        const min = Math.floor(currentSeconds / 60);
        const sec = currentSeconds % 60;
        panelTimeCurrent.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;
        panelProgressFill.style.width = `${(currentSeconds / totalSeconds) * 100}%`;
      }, 1000);
    }
  } else {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function updatePlayerUI() {
  if (isPlaying) {
    panelPlayToggle.textContent = '⏸';
    pillTrigger.innerHTML = '<span class="pill-play-icon">⏸</span>';
    if (currentActiveCard) {
      currentActiveCard.querySelector('.play-icon').textContent = '⏸';
    }
  } else {
    panelPlayToggle.textContent = '▶';
    pillTrigger.innerHTML = '<span class="pill-play-icon">▶</span>';
    if (currentActiveCard) {
      currentActiveCard.querySelector('.play-icon').textContent = '▶';
    }
  }
  updateProgress();
}

function selectSong(card) {
  const title = card.getAttribute('data-title');
  const artist = card.getAttribute('data-artist');
  const cover = card.getAttribute('data-cover');

  // Update Pill Content
  pillCover.src = cover;
  pillCover.alt = title;
  pillTitle.textContent = title;
  pillArtist.textContent = artist;

  // Update Panel Content
  panelCover.src = cover;
  panelCover.alt = title;
  panelTitle.textContent = title;
  panelArtist.textContent = artist;

  // Reset Progress
  currentSeconds = 0;
  panelTimeCurrent.textContent = "0:00";
  panelProgressFill.style.width = "0%";
}

musicCards.forEach(card => {
  // Trigger pill visibility on hover
  card.addEventListener('mouseenter', () => {
    pillTriggered = true;
    if (!isPlaying) {
      currentActiveCard = card;
      selectSong(card);
    }
    if (window.scrollY >= inspirationSection.offsetTop - window.innerHeight + 300) {
      pill.classList.add('visible');
    }
  });

  const playBtn = card.querySelector('.play-card-btn');
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!pillTriggered) {
      pillTriggered = true;
    }
    pill.classList.add('visible');

    if (currentActiveCard === card) {
      isPlaying = !isPlaying;
    } else {
      if (currentActiveCard) {
        currentActiveCard.querySelector('.play-icon').textContent = '▶';
      }
      currentActiveCard = card;
      selectSong(card);
      isPlaying = true;
    }
    panel.classList.add('active');
    updatePlayerUI();
  });
});

// Pill triggers panel visibility
pillTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  // If no card active, set the first card as active
  if (!currentActiveCard && musicCards.length > 0) {
    currentActiveCard = musicCards[0];
    selectSong(currentActiveCard);
  }
  panel.classList.toggle('active');
});

// Close panel
panelClose.addEventListener('click', () => {
  panel.classList.remove('active');
});

// Panel play/pause toggle
panelPlayToggle.addEventListener('click', () => {
  if (!currentActiveCard && musicCards.length > 0) {
    currentActiveCard = musicCards[0];
    selectSong(currentActiveCard);
    isPlaying = true;
  } else {
    isPlaying = !isPlaying;
  }
  updatePlayerUI();
});
