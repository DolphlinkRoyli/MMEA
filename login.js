(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const copy = {
    en: { eyebrow: 'MARITIME OPERATIONS', title: 'Connected assets.<br>Clear decisions.', subtitle: 'Your command centre, connected.', label: 'Access token', placeholder: 'Enter your access token', submit: 'Enter command centre', footer: 'Sea. Land. Air. One operational view.', pause: 'Pause motion', resume: 'Resume motion', fullscreen: 'Full screen', exit: 'Exit full screen', show: 'Show token', hide: 'Hide token', empty: 'Enter your access token.', invalid: 'This token is not recognised. Please try again.', storage: 'Allow browser storage and open this page using HTTPS.', checking: 'Signing in…' },
    ms: { eyebrow: 'OPERASI MARITIM', title: 'Aset terhubung.<br>Keputusan jelas.', subtitle: 'Pusat kawalan anda, saling terhubung.', label: 'Token akses', placeholder: 'Masukkan token akses anda', submit: 'Masuk ke pusat kawalan', footer: 'Laut. Darat. Udara. Satu paparan operasi.', pause: 'Jeda animasi', resume: 'Sambung animasi', fullscreen: 'Skrin penuh', exit: 'Keluar skrin penuh', show: 'Tunjukkan token', hide: 'Sembunyikan token', empty: 'Masukkan token akses anda.', invalid: 'Token ini tidak dikenali. Sila cuba lagi.', storage: 'Benarkan storan pelayar dan buka halaman ini melalui HTTPS.', checking: 'Sedang log masuk…' }
  };
  let language = 'en', errorKey = '', shown = false;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { language = localStorage.getItem('mmea.login.language') === 'ms' ? 'ms' : 'en'; } catch {}
  function render() {
    const t = copy[language];
    document.documentElement.lang = language;
    document.title = 'MMEA / APMM · ' + (language === 'ms' ? 'Log masuk' : 'Sign in');
    document.querySelectorAll('[data-copy]').forEach(el => { el.innerHTML = t[el.dataset.copy]; });
    document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === language)));
    $('access-token').placeholder = t.placeholder;
    $('visibility').setAttribute('aria-label', t[shown ? 'hide' : 'show']);
    $('visibility').setAttribute('aria-pressed', String(shown));
    $('motion').querySelector('span').textContent = t[paused ? 'resume' : 'pause'];
    $('motion').setAttribute('aria-label', t[paused ? 'resume' : 'pause']);
    $('motion').setAttribute('aria-pressed', String(paused));
    $('login-fullscreen').querySelector('span').textContent = t[document.fullscreenElement ? 'exit' : 'fullscreen'];
    $('login-fullscreen').setAttribute('aria-label', t[document.fullscreenElement ? 'exit' : 'fullscreen']);
    $('login-error').hidden = !errorKey;
    $('login-error').textContent = errorKey ? t[errorKey] : '';
    $('access-token').setAttribute('aria-invalid', String(!!errorKey));
  }
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => {
    language = button.dataset.lang; try { localStorage.setItem('mmea.login.language', language); } catch {} render();
  }));
  $('visibility').addEventListener('click', () => { shown = !shown; $('access-token').type = shown ? 'text' : 'password'; $('eye-slash').toggleAttribute('hidden', !shown); $('eye-slash').style.display = shown ? 'block' : 'none'; render(); });
  $('access-token').addEventListener('input', () => { if (errorKey) { errorKey = ''; render(); } });
  $('login-form').addEventListener('submit', async event => {
    event.preventDefault(); if ($('sign-in').disabled) return;
    if (!$('access-token').value.trim()) { errorKey = 'empty'; render(); $('access-token').focus(); return; }
    $('sign-in').disabled = true; $('sign-in').querySelector('span').textContent = copy[language].checking;
    try {
      if (await window.MMEAAccess.signIn($('access-token').value)) {
        $('access-token').value = ''; location.replace(new URL('index.html', location.href).href); return;
      }
      errorKey = 'invalid';
    } catch { errorKey = 'storage'; }
    $('sign-in').disabled = false; render(); $('access-token').focus();
  });
  const scene = $('main'), video = $('atlas');
  function size() {
    const w = scene.clientWidth, h = scene.clientHeight, scale = Math.max(w / 1478, h / 1064);
    const bw = 1478 * scale, bh = 1064 * scale, top = Math.min(0, Math.max(h - bh, h * .67 - 1064 * .667 * scale));
    scene.style.setProperty('--lg-earth-size', `${bw}px ${bh}px`);
    scene.style.setProperty('--lg-earth-pos', `${(w - bw) / 2}px ${top}px`);
  }
  size(); addEventListener('resize', size);
  let hasWebGL = false;
  try { const c = document.createElement('canvas'), gl = c.getContext('webgl2') || c.getContext('webgl'); hasWebGL = !!gl; gl?.getExtension('WEBGL_lose_context')?.loseContext(); } catch {}
  function syncMotion() {
    scene.classList.toggle('live', !paused && !document.hidden);
    if (paused || document.hidden || !hasWebGL) video.pause();
    else video.play().catch(() => { paused = true; render(); });
  }
  if (hasWebGL) {
    video.src = 'media/login-scene/atlas.mp4'; video.preload = paused ? 'metadata' : 'auto';
    video.muted = true; video.defaultMuted = true;
    const script = document.createElement('script'); script.src = 'media/login-scene/three-wall.js'; script.async = true; document.body.append(script);
    $('motion').hidden = false; syncMotion();
  }
  $('motion').addEventListener('click', () => { paused = !paused; syncMotion(); render(); });
  document.addEventListener('visibilitychange', syncMotion);
  $('login-fullscreen').hidden = !document.fullscreenEnabled;
  $('login-fullscreen').addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch {} });
  document.addEventListener('fullscreenchange', render);
  addEventListener('pagehide', () => { video.pause(); window.OctoMindWall?.destroy(); });
  addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  render();
})();
