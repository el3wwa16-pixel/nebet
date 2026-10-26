/* =====================================================================
   NEBET — accessible recipe reader (accessible.html)
   Read-aloud (Web Speech API), hands-free voice commands, Braille text,
   large text / high contrast. Depends on app.js (R, CATS, ingText, T, lang, store, esc).
   ===================================================================== */
(function () {
  if (!document.getElementById('reader')) return;

  /* ---------- state ---------- */
  const ORDER = ['rare', 'pharaonic', 'greco', 'islamic', 'modern', 'dessert', 'drink'];
  let rid = null, segs = [], cur = 0, playing = false, soundOn = store.get('rd_sound', true);
  let rate = store.get('rd_rate', 0.9), voiceName = store.get('rd_voice', '');
  let servings = null, recog = null, listening = false;
  const synth = window.speechSynthesis;
  const $ = id => document.getElementById(id);

  /* ---------- text helpers ---------- */
  const FR_AR = { '½': 'نص', '¼': 'ربع', '⅓': 'تلت', '⅔': 'تلتين', '¾': 'تلت تربع' };
  const FR_EN = { '½': 'a half', '¼': 'a quarter', '⅓': 'a third', '⅔': 'two thirds', '¾': 'three quarters' };
  function spoken(s) {
    // fractions to words so both speech and Braille read them correctly
    return String(s).replace(/(\d+)?([½¼⅓⅔¾])/g, (m, n, f) =>
      lang === 'ar' ? (n ? n + ' و' + FR_AR[f] : FR_AR[f]) : (n ? n + ' and ' + FR_EN[f] : FR_EN[f]));
  }
  function factor() { const r = R[rid]; return (servings || r.serves) / r.serves; }

  function buildSegments() {
    const r = R[rid], t = r[lang], f = factor();
    const s = [];
    s.push({ kind: 'title', text: t.title + '. ' + T('لـ ' + (servings || r.serves) + ' أشخاص.', 'Serves ' + (servings || r.serves) + '.') });
    s.push({ kind: 'head', text: T('المقادير', 'Ingredients') });
    r.ing.forEach((i, k) => s.push({ kind: 'ing', idx: k, text: spoken(ingText(i, f)) }));
    s.push({ kind: 'head', text: T('الخطوات', 'Steps') });
    t.steps.forEach((x, k) => s.push({ kind: 'step', idx: k, text: T('الخطوة ', 'Step ') + (k + 1) + '. ' + spoken(x) }));
    s.push({ kind: 'end', text: T('بالهنا والشفا.', 'Enjoy your meal.') });
    return s;
  }

  /* ---------- rendering ---------- */
  function renderSelect() {
    const sel = $('rdRecipe'); if (!sel) return;
    sel.innerHTML = ORDER.map(c => {
      const ids = Object.keys(R).filter(id => R[id].cat === c);
      if (!ids.length) return '';
      return '<optgroup label="' + esc(CATS[c][lang]) + '">' + ids.map(id => '<option value="' + id + '"' + (id === rid ? ' selected' : '') + '>' + esc(R[id][lang].title) + '</option>').join('') + '</optgroup>';
    }).join('');
  }
  function renderRecipe() {
    const r = R[rid], t = r[lang], f = factor();
    $('rdServings').value = servings || r.serves;
    $('rdTitle').textContent = t.title;
    $('rdMeta').textContent = (t.era || CATS[r.cat][lang]) + ' · ' + fmtTime(r.time) + ' · ' + DIFF[lang][r.diff];
    $('rdStory').textContent = t.story;
    $('rdIng').innerHTML = r.ing.map((i, k) => '<li data-seg="ing-' + k + '">' + esc(ingText(i, f)) + '</li>').join('');
    $('rdSteps').innerHTML = t.steps.map((x, k) => '<li data-seg="step-' + k + '">' + esc(x) + '</li>').join('');
    segs = buildSegments();
    if (cur >= segs.length) cur = 0;
    renderBraille();
    highlight();
    const img = $('rdImg');
    if (img) { img.dataset.img = rid; delete img.dataset.done; img.alt = t.title; decorateImages(img.parentElement); }
  }
  function highlight() {
    document.querySelectorAll('#reader [data-seg], #rdTitle').forEach(el => el.classList.remove('now'));
    const s = segs[cur]; if (!s) return;
    const el = (s.kind === 'ing' || s.kind === 'step') ? document.querySelector('#reader [data-seg="' + s.kind + '-' + s.idx + '"]') : (s.kind === 'title' ? $('rdTitle') : null);
    if (el) {
      el.classList.add('now');
      const r = el.getBoundingClientRect();
      if (r.top < 90 || r.bottom > innerHeight - 140) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    $('rdPos').textContent = (s.kind === 'step' ? T('الخطوة ', 'Step ') + (s.idx + 1) + ' / ' + R[rid][lang].steps.length
      : s.kind === 'ing' ? T('المكوّن ', 'Ingredient ') + (s.idx + 1) + ' / ' + R[rid].ing.length : '') ;
  }
  function setPlayUI() {
    const b = $('rdPlay');
    b.innerHTML = '<i class="fa-solid ' + (playing ? 'fa-pause' : 'fa-play') + '" aria-hidden="true"></i><span>' + (playing ? T('إيقاف مؤقت', 'Pause') : T('اقرأ', 'Read')) + '</span>';
    b.setAttribute('aria-pressed', playing);
  }

  /* ---------- speech ---------- */
  function voices() { return synth ? synth.getVoices() : []; }
  function pickVoice() {
    const want = lang === 'ar' ? 'ar' : 'en', vs = voices();
    return vs.find(v => v.name === voiceName && v.lang.toLowerCase().startsWith(want)) ||
      vs.find(v => v.lang.toLowerCase() === (lang === 'ar' ? 'ar-eg' : 'en-gb')) ||
      vs.find(v => v.lang.toLowerCase().startsWith(want)) || null;
  }
  function renderVoices() {
    const sel = $('rdVoice'); if (!sel) return;
    const want = lang === 'ar' ? 'ar' : 'en', vs = voices().filter(v => v.lang.toLowerCase().startsWith(want));
    const pv = pickVoice();
    sel.innerHTML = vs.length ? vs.map(v => '<option value="' + esc(v.name) + '"' + (pv && v.name === pv.name ? ' selected' : '') + '>' + esc(v.name) + ' (' + v.lang + ')</option>').join('')
      : '<option value="">' + T('لا يوجد صوت عربي على هذا الجهاز', 'No English voice on this device') + '</option>';
    $('rdVoiceWarn').hidden = !!vs.length || !synth;
    $('rdNoSpeech').hidden = !!synth;
  }
  function announce(text) { const lv = $('rdLive'); lv.textContent = ''; setTimeout(() => { lv.textContent = text; }, 30); }
  function speakCurrent() {
    const s = segs[cur]; if (!s) return stop();
    highlight();
    if (!soundOn || !synth) { if (!soundOn) announce(s.text); playing = false; setPlayUI(); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(s.text);
    const v = pickVoice(); if (v) u.voice = v;
    u.lang = v ? v.lang : (lang === 'ar' ? 'ar-EG' : 'en-GB');
    u.rate = rate;
    const mine = cur;
    u.onend = () => { if (playing && cur === mine) { if (cur < segs.length - 1) { cur++; speakCurrent(); } else { playing = false; setPlayUI(); } } };
    u.onerror = e => { if (e.error !== 'interrupted' && e.error !== 'canceled') { playing = false; setPlayUI(); } };
    synth.speak(u);
  }
  function play() { playing = true; setPlayUI(); speakCurrent(); }
  function pause() { playing = false; if (synth) synth.cancel(); setPlayUI(); }
  function stop() { pause(); cur = 0; highlight(); }
  function toggle() { playing ? pause() : play(); }
  function go(delta, kinds) {
    // jump to next/previous ingredient or step (skipping headings)
    let i = cur;
    do { i += delta; } while (i > 0 && i < segs.length - 1 && kinds && !kinds.includes(segs[i].kind));
    cur = Math.max(0, Math.min(segs.length - 1, i));
    if (playing || !soundOn) speakCurrent(); else { highlight(); if (soundOn) { playing = true; setPlayUI(); speakCurrent(); } }
  }
  const next = () => go(1, ['ing', 'step', 'end']);
  const prev = () => go(-1, ['title', 'ing', 'step']);
  function repeat() { if (soundOn) { playing = true; setPlayUI(); } speakCurrent(); }
  function jumpTo(kind) { cur = Math.max(0, segs.findIndex(s => s.kind === kind) - 1); playing = true; setPlayUI(); speakCurrent(); }

  /* ---------- voice commands ---------- */
  const CMD = [
    [/^(التالي|اللي بعده|بعده|بعد كده|next)$/i, () => next()],
    [/^(السابق|اللي قبله|قبله|ارجع|رجوع|back|previous)$/i, () => prev()],
    [/^(كرر|عيد|تاني|كمان مره|repeat|again)$/i, () => repeat()],
    [/^(وقف|استنى|اسكت|ستوب|stop|pause|wait)$/i, () => pause()],
    [/^(كمل|ابدا|ابدأ|اقرا|اقرأ|شغل|play|start|read|continue)$/i, () => play()],
    [/^(المقادير|ingredients)$/i, () => jumpTo('ing')],
    [/^(الخطوات|steps)$/i, () => jumpTo('step')]
  ];
  function setupRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const btn = $('rdListen');
    if (!SR) { btn.disabled = true; $('rdListenNote').textContent = T('الأوامر الصوتية غير مدعومة في هذا المتصفح. جرّب Chrome أو Edge.', 'Voice commands are not supported in this browser. Try Chrome or Edge.'); return; }
    btn.onclick = () => {
      if (listening) { listening = false; recog && recog.stop(); updListen(); return; }
      recog = new SR(); recog.lang = lang === 'ar' ? 'ar-EG' : 'en-US'; recog.continuous = true; recog.interimResults = false;
      recog.onresult = e => {
        const said = e.results[e.results.length - 1][0].transcript.trim().replace(/[.,،؟?!]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة$/, 'ه');
        if (said.split(/\s+/).length > 3) return; // only short commands, so the reader's own voice is ignored
        $('rdHeard').textContent = '«' + said + '»';
        for (const [re, fn] of CMD) if (re.test(said)) { fn(); break; }
      };
      recog.onend = () => { if (listening) { try { recog.start(); } catch (e) {} } };
      recog.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { listening = false; updListen(); $('rdListenNote').textContent = T('لم يُسمح باستخدام الميكروفون.', 'Microphone permission was denied.'); } };
      try { recog.start(); listening = true; } catch (e) {}
      updListen();
    };
    function updListen() {
      btn.setAttribute('aria-pressed', listening);
      btn.innerHTML = '<i class="fa-solid ' + (listening ? 'fa-microphone-lines' : 'fa-microphone') + '" aria-hidden="true"></i><span>' + (listening ? T('الميكروفون شغّال — قل «التالي» أو «وقف»', 'Listening — say “next” or “stop”') : T('التحكم بالصوت', 'Voice control')) + '</span>';
    }
    updListen();
  }

  /* ---------- Braille (uncontracted, 6-dot) ---------- */
  const cell = dots => String.fromCharCode(0x2800 + [...String(dots)].reduce((a, d) => a | (1 << (d - 1)), 0));
  const AR = { 'ا': 1, 'ب': 12, 'ت': 2345, 'ث': 1456, 'ج': 245, 'ح': 156, 'خ': 1346, 'د': 145, 'ذ': 2346, 'ر': 1235, 'ز': 1356, 'س': 234, 'ش': 146, 'ص': 12346, 'ض': 1246, 'ط': 23456, 'ظ': 123456, 'ع': 12356, 'غ': 126, 'ف': 124, 'ق': 12345, 'ك': 13, 'ل': 123, 'م': 134, 'ن': 1345, 'ه': 125, 'و': 2456, 'ي': 24, 'ى': 135, 'ة': 16, 'ء': 3, 'أ': 34, 'إ': 46, 'آ': 345, 'ؤ': 1256, 'ئ': 13456,
    '،': 5, ',': 5, '؛': 56, ';': 56, '.': 256, '!': 235, '؟': 236, '?': 236, '-': 36, ':': '5|2' };
  const EN = { a: 1, b: 12, c: 14, d: 145, e: 15, f: 124, g: 1245, h: 125, i: 24, j: 245, k: 13, l: 123, m: 134, n: 1345, o: 135, p: 1234, q: 12345, r: 1235, s: 234, t: 2345, u: 136, v: 1236, w: 2456, x: 1346, y: 13456, z: 1356,
    ',': 2, ';': 23, ':': 25, '.': 256, '!': 235, '?': 236, "'": 3, '-': 36 };
  const DIG = { '1': 1, '2': 12, '3': 14, '4': 145, '5': 15, '6': 124, '7': 1245, '8': 125, '9': 24, '0': 245 };
  const toLatinDigits = s => s.replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x6F0));
  function braille(text, isAr) {
    let s = toLatinDigits(spoken(text)).replace(/[ً-ْـ]/g, '').replace(/[«»"“”()\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
    let out = '', inNum = false;
    for (let k = 0; k < s.length; k++) {
      const ch = s[k], low = ch.toLowerCase();
      if (DIG[ch]) { if (!inNum) out += cell(3456); out += cell(DIG[ch]); inNum = true; continue; }
      if (inNum && !isAr && /[a-j]/i.test(ch)) out += cell(56); // letter after a number
      inNum = false;
      if (ch === ' ') { out += ' '; continue; }
      if (isAr && ch === 'ل' && s[k + 1] === 'ا') { out += cell(1236); k++; continue; } // لا
      if (isAr && AR[ch] != null) { out += String(AR[ch]).split('|').map(cell).join(''); continue; }
      if (EN[low] != null) { if (ch !== low) out += cell(6); out += cell(EN[low]); continue; }
      // anything else (symbols) is omitted
    }
    return out;
  }
  function plainText() {
    const r = R[rid], t = r[lang], f = factor();
    return [t.title, T('لـ ' + (servings || r.serves) + ' أشخاص', 'Serves ' + (servings || r.serves)), '',
      T('المقادير', 'Ingredients') + ':', ...r.ing.map(i => '- ' + spoken(ingText(i, f))), '',
      T('الخطوات', 'Steps') + ':', ...t.steps.map((x, k) => (k + 1) + '. ' + spoken(x))].join('\n');
  }
  function renderBraille() {
    const isAr = lang === 'ar';
    $('rdBraille').textContent = plainText().split('\n').map(l => braille(l, isAr)).join('\n');
    $('rdBraille').setAttribute('lang', isAr ? 'ar-Brai' : 'en-Brai');
  }
  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- display preferences ---------- */
  function applyDisplay() {
    const fs = store.get('rd_font', 1);
    document.documentElement.style.setProperty('--rd-scale', fs);
    $('rdFontVal').textContent = Math.round(fs * 100) + '%';
    document.body.classList.toggle('hc', !!store.get('rd_hc', false));
    $('rdContrast').setAttribute('aria-pressed', !!store.get('rd_hc', false));
    $('rdSound').setAttribute('aria-pressed', soundOn);
    $('rdSound').innerHTML = '<i class="fa-solid ' + (soundOn ? 'fa-volume-high' : 'fa-volume-xmark') + '" aria-hidden="true"></i><span>' + (soundOn ? T('الصوت شغّال', 'Sound on') : T('الصوت مقفول (لقارئ الشاشة)', 'Sound off (screen reader)')) + '</span>';
    $('rdRate').value = rate; $('rdRateVal').textContent = rate.toFixed(1) + '×';
  }

  /* ---------- wiring ---------- */
  function choose(id) { pause(); rid = id; servings = null; cur = 0; renderRecipe(); history.replaceState(null, '', '#r=' + id); }
  $('rdRecipe').onchange = e => choose(e.target.value);
  $('rdServings').oninput = e => { const v = parseInt(e.target.value, 10); if (v > 0 && v <= 50) { servings = v; const keep = cur; renderRecipe(); cur = Math.min(keep, segs.length - 1); highlight(); } };
  $('rdPlay').onclick = toggle;
  $('rdNext').onclick = next;
  $('rdPrev').onclick = prev;
  $('rdRepeat').onclick = repeat;
  $('rdStop').onclick = stop;
  $('rdIngBtn').onclick = () => jumpTo('ing');
  $('rdStepsBtn').onclick = () => jumpTo('step');
  $('rdRate').oninput = e => { rate = +e.target.value; store.set('rd_rate', rate); $('rdRateVal').textContent = rate.toFixed(1) + '×'; };
  $('rdVoice').onchange = e => { voiceName = e.target.value; store.set('rd_voice', voiceName); };
  $('rdSound').onclick = () => { soundOn = !soundOn; store.set('rd_sound', soundOn); if (!soundOn) pause(); applyDisplay(); };
  $('rdFontUp').onclick = () => { store.set('rd_font', Math.min(1.8, +(store.get('rd_font', 1) + 0.1).toFixed(1))); applyDisplay(); };
  $('rdFontDown').onclick = () => { store.set('rd_font', Math.max(0.9, +(store.get('rd_font', 1) - 0.1).toFixed(1))); applyDisplay(); };
  $('rdContrast').onclick = () => { store.set('rd_hc', !store.get('rd_hc', false)); applyDisplay(); };
  $('rdCopy').onclick = async () => { try { await navigator.clipboard.writeText($('rdBraille').textContent); $('rdCopy').querySelector('span').textContent = T('اتنسخ ✓', 'Copied ✓'); setTimeout(() => $('rdCopy').querySelector('span').textContent = T('نسخ نص برايل', 'Copy Braille'), 1800); } catch (e) {} };
  $('rdDlBraille').onclick = () => download(rid + '-braille.txt', $('rdBraille').textContent);
  $('rdDlText').onclick = () => download(rid + '.txt', plainText());
  $('reader').addEventListener('click', e => {
    const li = e.target.closest('[data-seg]'); if (!li) return;
    const [kind, idx] = li.dataset.seg.split('-');
    const i = segs.findIndex(s => s.kind === kind && s.idx === +idx);
    if (i >= 0) { cur = i; if (soundOn) { playing = true; setPlayUI(); } speakCurrent(); }
  });
  document.addEventListener('keydown', e => {
    if (e.target.closest('input,select,textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector('.modal[style*="block"]')) return;
    const rtl = document.documentElement.dir === 'rtl';
    const k = e.key;
    if (k === ' ' || k === 'k' || k === 'K') { e.preventDefault(); toggle(); }
    else if (k === 'n' || k === 'N' || k === (rtl ? 'ArrowLeft' : 'ArrowRight')) { e.preventDefault(); next(); }
    else if (k === 'p' || k === 'P' || k === (rtl ? 'ArrowRight' : 'ArrowLeft')) { e.preventDefault(); prev(); }
    else if (k === 'r' || k === 'R') { e.preventDefault(); repeat(); }
    else if (k === 'Escape') stop();
  });
  if (synth) { synth.onvoiceschanged = renderVoices; window.addEventListener('pagehide', () => synth.cancel()); }

  window.renderReader = function () {
    if (!rid) {
      const m = location.hash.match(/r=(\w+)/);
      rid = m && R[m[1]] ? m[1] : 'koshary';
    }
    pause();
    if (listening && recog) { listening = false; recog.stop(); }
    renderSelect(); renderVoices(); applyDisplay(); setPlayUI(); renderRecipe(); setupRecognition();
  };
  window.renderReader();
})();
