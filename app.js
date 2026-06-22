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

// ===== 3D ROBOT RENDERER (Three.js) =====
const canvasContainer = document.getElementById('robot-3d-canvas-container');
const contactSect = document.getElementById('contact');

if (canvasContainer && contactSect) {
  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(260, 260);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasContainer.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x333344, 2.5);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const purpleLight = new THREE.PointLight(0xa855f7, 12, 15);
  purpleLight.position.set(-2.5, 1.5, 2);
  scene.add(purpleLight);

  const pinkLight = new THREE.PointLight(0xec4899, 12, 15);
  pinkLight.position.set(2.5, -1.5, 2);
  scene.add(pinkLight);

  // Robot Model Group
  const robotGroup = new THREE.Group();
  const headGroup = new THREE.Group();

  // Head Outer Frame (Lighter metallic grey for better contrast)
  const headGeo = new THREE.BoxGeometry(1.5, 1.0, 0.7);
  const headMat = new THREE.MeshPhysicalMaterial({
    color: 0x4a4a50,
    metalness: 0.95,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.9
  });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headGroup.add(headMesh);

  // Face Screen (Dark purple neon faceplate)
  const screenGeo = new THREE.BoxGeometry(1.3, 0.8, 0.05);
  const screenMat = new THREE.MeshPhysicalMaterial({
    color: 0x06010b,
    metalness: 0.8,
    roughness: 0.05,
    emissive: 0x14042b,
    emissiveIntensity: 0.6
  });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 0, 0.351);
  headGroup.add(screenMesh);

  // Glowing Screen Rim Wireframe
  const borderGeo = new THREE.BoxGeometry(1.32, 0.82, 0.02);
  const borderMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    wireframe: true
  });
  const borderMesh = new THREE.Mesh(borderGeo, borderMat);
  borderMesh.position.set(0, 0, 0.355);
  headGroup.add(borderMesh);

  // Eyes (Emissive glowing white spheres)
  const eyeGeo = new THREE.SphereGeometry(0.13, 32, 32);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
  
  // Set initial position
  eyeLeft.position.set(-0.32, 0.02, 0.36);
  eyeRight.position.set(0.32, 0.02, 0.36);
  
  headGroup.add(eyeLeft);
  headGroup.add(eyeRight);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.5, 32);
  const neckMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a2a2e,
    metalness: 0.95,
    roughness: 0.15
  });
  const neckMesh = new THREE.Mesh(neckGeo, neckMat);
  neckMesh.position.set(0, -0.65, 0);
  robotGroup.add(neckMesh);

  // Shoulders Base
  const baseGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.2, 32);
  const baseMesh = new THREE.Mesh(baseGeo, neckMat);
  baseMesh.position.set(0, -0.95, 0);
  robotGroup.add(baseMesh);

  // Add all to scene
  headGroup.position.set(0, 0.05, 0);
  robotGroup.add(headGroup);
  scene.add(robotGroup);

  // Mouse Coordinates Tracking
  let targetMouseX = 0, targetMouseY = 0;
  let currentMouseX = 0, currentMouseY = 0;

  contactSect.addEventListener('mousemove', (e) => {
    const rect = contactSect.getBoundingClientRect();
    targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    targetMouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  });

  contactSect.addEventListener('mouseleave', () => {
    targetMouseX = 0;
    targetMouseY = 0;
  });

  // Render & Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    // Lerp mouse coordinates
    currentMouseX += (targetMouseX - currentMouseX) * 0.08;
    currentMouseY += (targetMouseY - currentMouseY) * 0.08;

    // Bobbing float animation
    const time = Date.now() * 0.0015;
    robotGroup.position.y = Math.sin(time) * 0.1;

    // Rotate head based on mouse coordinates
    headGroup.rotation.y = currentMouseX * 0.45;
    headGroup.rotation.x = -currentMouseY * 0.25;

    // Move eyes inside screen to look at cursor
    eyeLeft.position.x = -0.32 + currentMouseX * 0.12;
    eyeLeft.position.y = 0.02 + currentMouseY * 0.08;

    eyeRight.position.x = 0.32 + currentMouseX * 0.12;
    eyeRight.position.y = 0.02 + currentMouseY * 0.08;

    renderer.render(scene, camera);
  };

  animate();
}
