/* Static presentation entrance only. Public files remain accessible on GitHub Pages.
   The independent access code is retained locally, never embedded in this package. */
(() => {
  'use strict';
  const DIGEST = 'e22c9e17b527f697317889c4ece5cb8c13f656ee843a264dff0709f0ea8b8d70';
  const KEY = 'mmea.presentation.session';
  const TTL = 8 * 60 * 60 * 1000;
  const loginPage = /\/login\.html$/.test(location.pathname);
  function valid() {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEY));
      return !!s && s.version === DIGEST && Number.isFinite(s.started) &&
        s.started <= Date.now() && Date.now() - s.started < TTL;
    } catch { return false; }
  }
  function redirect() {
    document.documentElement.classList.remove('access-ready');
    location.replace(new URL('login.html', location.href).href);
  }
  function logout() { try { sessionStorage.removeItem(KEY); } catch {} redirect(); }
  async function signIn(token) {
    if (!crypto.subtle) throw new Error('secure-context');
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token.trim()));
    const digest = Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, '0')).join('');
    if (digest !== DIGEST) return false;
    sessionStorage.setItem(KEY, JSON.stringify({ version: DIGEST, started: Date.now() }));
    return true;
  }
  window.MMEAAccess = Object.freeze({ signIn, logout, valid });
  if (!loginPage) {
    if (!valid()) { redirect(); return; }
    document.documentElement.classList.add('access-ready');
    const check = () => { if (!valid()) logout(); };
    addEventListener('pageshow', check);
    addEventListener('focus', check);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    setInterval(check, 30000);
    document.addEventListener('DOMContentLoaded', () => {
      try { if (localStorage.getItem('mmea.login.language') === 'ms' && typeof window.setLang === 'function') window.setLang('ms'); } catch {}
      const button = document.getElementById('session-signout');
      if (!button) return;
      button.addEventListener('click', logout);
      const label = () => {
        const ms = document.documentElement.lang === 'ms';
        button.title = ms ? 'Log keluar' : 'Sign out';
        button.setAttribute('aria-label', button.title);
        try { localStorage.setItem('mmea.login.language', ms ? 'ms' : 'en'); } catch {}
      };
      label(); new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    });
  }
})();
