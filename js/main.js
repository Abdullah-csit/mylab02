/* ==========================================================
   دليل مختبر هندسة تقنيات الحاسوب
   كل ما يمكن تعديله موجود في CONFIG بالأعلى.
   ========================================================== */
(() => {
  'use strict';

  /* ---------------- إعدادات قابلة للتعديل ---------------- */
  const CONFIG = {
    // نص الترحيب الذي يُنطق (يعتمد على صوت عربي في جهاز الطالب)
    speechText: 'أهلاً وسهلاً بك في مختبر هندسة تقنيات الحاسوب',
    // لتشغيل تسجيل صوتي خاص بك بدل الصوت الآلي: ضع الملف داخل assets
    // ثم اكتب مساره هنا، مثال: 'assets/welcome.mp3'
    audioFile: 'assets/welcome.mp3',
    // الخطوط الثلاثة وعدد الميز في كل خط
    // الخطوط بترتيب الأعمدة من اليسار (جهة النوافذ) إلى اليمين (جهة الباب)
    lines: [
      { key: 'B', count: 8, name: 'جهة النوافذ', shape: 'sq' },
      { key: 'C', count: 9, name: 'الوسط', shape: 'circ' },
      { key: 'A', count: 8, name: 'جهة الباب', shape: 'tri' },
    ],
    // البرامج: الاسم، الإصدار (اختياري)، النبذة (6 كلمات أو أقل)، اسم صورة الأيقونة في assets/programs
    programs: [
      { name: 'Arduino IDE', brief: 'برمجة المتحكمات الدقيقة والدوائر', img: 'arduino' },
      { name: 'MATLAB', ver: '2013 / 2016', brief: 'حسابات هندسية ومعالجة الإشارات', img: 'matlab' },
      { name: 'Code::Blocks', brief: 'برمجة C و C++ بسهولة', img: 'codeblocks' },
      { name: 'PyCharm', brief: 'بيئة متكاملة لبرمجة بايثون', img: 'pycharm' },
      { name: 'Multisim', brief: 'محاكاة الدوائر الإلكترونية قبل تنفيذها', img: 'multisim' },
      { name: 'Microsoft Office', brief: 'التقارير والجداول والعروض التقديمية', img: 'office' },
      { name: 'Cisco Packet Tracer', ver: '8.0', brief: 'محاكاة الشبكات وإعداد أجهزتها', img: 'packettracer' },
    ],
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ==========================================================
     1) الترحيب: دخول + صوت
     ========================================================== */
  const hero = $('#hero');
  const words = $$('.welcome .w');
  let entered = false;

  // تهيئة قائمة الأصوات مبكراً
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged', () => speechSynthesis.getVoices());
  }

  function finishWelcome() {
    hero.classList.remove('speaking');
    hero.classList.add('done');
    words.forEach(w => w.classList.remove('say'));
    $('#enterCta').hidden = true;
    const cue = $('#scrollCue');
    cue.hidden = false;
  }

  function karaoke(total) {
    const step = total / words.length;
    words.forEach((w, i) => setTimeout(() => {
      words.forEach(x => x.classList.remove('say'));
      w.classList.add('say');
    }, i * step));
    setTimeout(finishWelcome, total + 400);
  }

  function speakWithVoice(done) {
    if (!('speechSynthesis' in window)) return false;
    const u = new SpeechSynthesisUtterance(CONFIG.speechText);
    u.lang = 'ar-SA';
    u.rate = 0.9;
    const v = speechSynthesis.getVoices().find(x => /^ar/i.test(x.lang));
    if (v) { u.voice = v; u.lang = v.lang; }
    u.onend = done;
    u.onerror = done;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    return true;
  }

  function speak() {
    let finished = false;
    const done = () => { if (!finished) { finished = true; finishWelcome(); } };

    if (CONFIG.audioFile) {
      const a = new Audio(CONFIG.audioFile);
      a.addEventListener('ended', done);
      const viaSpeech = () => { if (!finished) speakWithVoice(done); };
      a.addEventListener('error', viaSpeech);
      a.play().catch(viaSpeech);
      karaoke(4600);
      return;
    }
    if (!speakWithVoice(done)) { karaoke(3600); return; }
    karaoke(4400);
  }

  function enter() {
    if (entered) return;
    entered = true;
    root.classList.remove('gate');
    document.body.classList.add('entered');
    hero.classList.add('speaking');
    speak();
  }

  $('#logoBtn').addEventListener('click', enter);
  $('#enterCta').addEventListener('click', enter);

  /* ==========================================================
     2) شريط التنقل + التقدم + ظهور الأقسام
     ========================================================== */
  const sections = $$('main > section[data-title]');
  const railNodes = $('.rail-nodes');
  const railFill = $('.rail-fill');
  const rail = $('.rail');

  sections.forEach(s => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + s.id;
    a.setAttribute('aria-label', s.dataset.title);
    a.innerHTML = `<span>${s.dataset.title}</span>`;
    li.appendChild(a);
    railNodes.appendChild(li);
  });
  const lis = $$('li', railNodes);

  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = window.scrollY + window.innerHeight * 0.5;
    let idx = 0;
    sections.forEach((s, i) => { if (s.offsetTop <= y) idx = i; });
    const s = sections[idx];
    const frac = Math.min(1, Math.max(0, (y - s.offsetTop) / s.offsetHeight));
    const p = Math.min(1, (idx + frac) / (sections.length - 1));
    rail.style.setProperty('--p', p.toFixed(4));
    railFill.style.setProperty('--p', p.toFixed(4));
    lis.forEach((li, i) => {
      li.classList.toggle('on', i <= idx);
      li.classList.toggle('cur', i === idx);
    });
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.25 });
  sections.forEach(s => { if (!s.classList.contains('in')) io.observe(s); });

  /* ==========================================================
     3) التذكير: كلمات العبارة تضيء تباعاً + ترس هندسي
     ========================================================== */
  const quote = $('#quote');
  quote.innerHTML = quote.textContent.trim().split(/\s+/)
    .map((w, i) => `<span class="q" style="--i:${i}">${w}</span>`).join(' ');

  function gearPath(cx, cy, ro, ri, teeth) {
    const step = Math.PI * 2 / teeth;
    let d = '';
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      [[ri, a - step * .3], [ro, a - step * .19], [ro, a + step * .19], [ri, a + step * .3]].forEach(([r, t], j) => {
        d += (i === 0 && j === 0 ? 'M' : 'L') + (cx + r * Math.cos(t)).toFixed(1) + ' ' + (cy + r * Math.sin(t)).toFixed(1) + ' ';
      });
    }
    return d + 'Z';
  }
  const circle = (cx, cy, r) => `M${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}Z`;
  $('.gear-a').setAttribute('d', gearPath(200, 200, 190, 160, 18));
  $('.gear-b').setAttribute('d', circle(200, 200, 120) + circle(200, 200, 40));

  /* ==========================================================
     4) خريطة المختبر
     ========================================================== */
  const ORD = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع'];
  const CX = [120, 300, 480], Y0 = 122, BACK = 46, PITCH = 66, DW = 130, DH = 46;
  const tot = CONFIG.lines.reduce((a, l) => a + l.count, 0);

  function laptop(x, y, letter) {
    return `<g class="lap">
      <rect class="scr" x="${x}" y="${y + 4}" width="42" height="7" rx="2"/>
      <rect class="kb" x="${x}" y="${y + 13}" width="42" height="27" rx="4"/>
      <text class="lt" x="${x + 21}" y="${y + 27}">${letter}</text>
    </g>`;
  }

  // رمز الخط: مثلث A، مربع B، دائرة C (بدل الألوان)
  function shapeSVG(shape, cx, cy, r, cls) {
    if (shape === 'tri') return `<polygon class="${cls}" points="${cx},${cy - r} ${(cx + r * 1.12).toFixed(1)},${(cy + r * .86).toFixed(1)} ${(cx - r * 1.12).toFixed(1)},${(cy + r * .86).toFixed(1)}"/>`;
    if (shape === 'sq') return `<rect class="${cls}" x="${(cx - r * .88).toFixed(1)}" y="${(cy - r * .88).toFixed(1)}" width="${(r * 1.76).toFixed(1)}" height="${(r * 1.76).toFixed(1)}" rx="2"/>`;
    return `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}"/>`;
  }

  function buildMap() {
    let out = `<svg viewBox="0 0 600 790" role="group" aria-label="مخطط المختبر: ${tot} ميزاً في ثلاثة خطوط">`;
    // الغرفة
    out += `<rect class="room" x="18" y="14" width="564" height="712" rx="3"/>`;
    // السبورة في واجهة المختبر
    out += `<rect class="board" x="260" y="26" width="150" height="14" rx="2"/><text class="wall-lbl" x="335" y="62" text-anchor="middle">السبورة</text>`;
    // النوافذ: ثلاث نوافذ في جهة B (اليسار) حصراً
    for (let i = 0; i < 3; i++) out += `<rect class="win" x="13" y="${210 + i * 150}" width="10" height="100"/>`;
    out += `<text class="wall-lbl" transform="translate(38 360) rotate(-90)" text-anchor="middle">النوافذ</text>`;
    // الحاجز الزجاجي (الجدار الأيمن، تحت الباب)
    for (let i = 0; i < 3; i++) out += `<rect class="glass" x="577" y="${215 + i * 105}" width="10" height="90"/>`;
    // باب الدخول: في الجدار الأيمن (جهة A) من الزاوية فوق الميز A1، يفتح للداخل من الزاوية
    out += `<rect class="doorgap" x="575" y="22" width="14" height="56"/><path class="doorarc" d="M526 22 A56 56 0 0 0 582 78"/><line class="doorleaf" x1="582" y1="22" x2="526" y2="22"/><text class="wall-lbl door-lbl" x="556" y="66" text-anchor="middle">الباب</text>`;
    // السبلت: خلف آخر ميز في زاوية خط B
    out += `<rect class="ac" x="26" y="684" width="64" height="30" rx="3"/><text class="wall-lbl" x="58" y="703" text-anchor="middle">سبلت</text>`;

    let order = 0;
    CONFIG.lines.forEach((ln, c) => {
      const cx = CX[c];
      // الوسط C يتقدّم نحو السبورة، والخطان الجانبيان يتراجعان قليلاً للخلف
      const off = ln.key === 'C' ? 0 : BACK;
      out += `<g class="col-head ln-${ln.key}">${shapeSVG(ln.shape, cx, 96 + off, 17, 'shp')}<text x="${cx}" y="${96 + off + (ln.shape === 'tri' ? 4 : 0)}">${ln.key}</text></g>`;
      for (let r = 0; r < ln.count; r++) {
        const n = r + 1, y = Y0 + off + r * PITCH, x = cx - DW / 2;
        const code = ln.key + n;
        out += `<g class="desk ln-${ln.key}" data-line="${ln.key}" data-n="${n}" tabindex="0" role="button" aria-label="الميز ${code}" style="--i:${order++}">
          <rect class="d" x="${x}" y="${y}" width="${DW}" height="${DH}" rx="7"/>
          ${shapeSVG(ln.shape, cx, y + 12, 5, 'mk')}
          <text class="code" x="${cx}" y="${y + 31}">${code}</text>
          ${laptop(x + 7, y + 3, 'L')}
          ${laptop(x + DW - 7 - 42, y + 3, 'R')}
        </g>`;
      }
    });
    // لوحة العنوان أسفل المخطط
    out += `<rect class="title-blk" x="18" y="738" width="564" height="44"/>
      <text class="title-txt" x="570" y="757" text-anchor="start">مخطط مختبر الحاسوب</text>
      <text class="title-sub" x="570" y="774" text-anchor="start">${tot} ميزاً · ${tot * 2} لابتوباً · مقدمة المختبر في الأعلى</text>`;
    out += `</svg>`;
    $('#plan').innerHTML = out;
  }
  buildMap();

  const info = $('#deskInfo');
  function selectDesk(g) {
    $$('.desk.sel').forEach(x => x.classList.remove('sel'));
    g.classList.add('sel');
    const key = g.dataset.line, n = +g.dataset.n, code = key + n;
    const ln = CONFIG.lines.find(l => l.key === key);
    info.innerHTML = `
      <div class="sel-card ln-${key}">
        <div class="sel-code"><i class="sh sh-${ln.shape}"></i>${code}</div>
        <div class="sel-meta">
          <b>الخط ${key}: ${ln.name}</b>
          <span>الميز ${ORD[n - 1] || n} من جهة السبورة</span>
          <div class="stickers">
            <span class="sticker"><i class="sh sh-${ln.shape}"></i>${code}-L</span>
            <span class="sticker"><i class="sh sh-${ln.shape}"></i>${code}-R</span>
          </div>
        </div>
      </div>`;
  }
  const plan = $('#plan');
  plan.addEventListener('click', e => { const g = e.target.closest('.desk'); if (g) selectDesk(g); });
  plan.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { const g = e.target.closest('.desk'); if (g) { e.preventDefault(); selectDesk(g); } }
  });
  $('.desk[data-line="A"][data-n="1"]').classList.add('nudge');

  /* ==========================================================
     مؤشر «جرّب»: بقعة ضوء حول الزر + يد تضغط عليه
     ========================================================== */
  const guides = [];
  function makeGuide(demo) {
    const el = document.createElement('div');
    el.className = 'spot';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<i class="halo"></i><span class="tip">جرّب!</span>
      <svg class="finger" viewBox="0 0 40 52"><path d="M15 25V8.5a4.5 4.5 0 0 1 9 0V22l9.5 2.2a5 5 0 0 1 3.8 5v8.8c0 6.4-4.2 12-11.3 12h-6.2c-5 0-8.2-3-11.2-8.2L4 34.5a3.6 3.6 0 0 1 5.2-4.4L15 35.5z" fill="#fff" stroke="#0A1730" stroke-width="2" stroke-linejoin="round"/></svg>`;
    demo.appendChild(el);
    const tip = $('.tip', el);
    let target = null, timer = 0;
    function place() {
      if (!target) return;
      const d = demo.getBoundingClientRect(), b = target.getBoundingClientRect();
      const x = b.left - d.left + b.width / 2, y = b.top - d.top + b.height / 2;
      el.style.setProperty('--x', x.toFixed(1) + 'px');
      el.style.setProperty('--y', y.toFixed(1) + 'px');
      el.style.setProperty('--w', (b.width + 22).toFixed(1) + 'px');
      el.style.setProperty('--h', (b.height + 14).toFixed(1) + 'px');
      el.style.setProperty('--r', (Math.max(b.width, b.height) / 2 + 24).toFixed(1) + 'px');
    }
    const g = {
      point(btn, label) {
        clearTimeout(timer);
        el.classList.remove('on');
        timer = setTimeout(() => {
          target = btn; tip.textContent = label || 'جرّب!';
          place(); el.classList.add('on');
        }, 300);
      },
      hide() { clearTimeout(timer); target = null; el.classList.remove('on'); },
      place,
    };
    guides.push(g);
    return g;
  }
  window.addEventListener('resize', () => guides.forEach(g => g.place()));
  function whenVisible(el, fn) {
    new IntersectionObserver((es, ob) => {
      if (es.some(e => e.isIntersecting)) { ob.disconnect(); fn(); }
    }, { threshold: 0.55 }).observe(el);
  }

  /* ==========================================================
     5) محاكاة التجميد
     ========================================================== */
  (() => {
    const demo = $('#freezeDemo'), screen = $('.lscreen', demo);
    const file = $('#userFile'), msg = $('#freezeMsg');
    const add = $('#addFile'), re = $('#restart');
    const guide = makeGuide(demo);
    let has = false;
    const say = (t, ok) => { msg.textContent = t; msg.classList.toggle('ok', !!ok); };

    whenVisible(demo, () => guide.point(add, 'جرّب: أضف ملفاً'));

    add.addEventListener('click', () => {
      has = true; file.hidden = false;
      say('أضفت ملف «تقريري» إلى سطح المكتب. الآن أعد التشغيل لترى ماذا يحدث.', true);
      guide.point(re, 'الآن أعد التشغيل');
    });
    re.addEventListener('click', () => {
      guide.hide();
      add.disabled = re.disabled = true;
      screen.classList.add('is-booting');
      say('جارٍ إعادة التشغيل…');
      setTimeout(() => {
        file.hidden = true;
        screen.classList.remove('is-booting');
        add.disabled = re.disabled = false;
        say(has ? 'عاد الجهاز كما كان واختفى الملف. لذلك احفظ عملك خارج الجهاز.' : 'عاد الجهاز كما كان تماماً.', true);
        has = false;
      }, reduce ? 300 : 2500);
    });
  })();

  /* ==========================================================
     6) محاكاة الإطفاء المباشر (لابتوب ثلاثي الأبعاد)
     ========================================================== */
  (() => {
    const demo = $('#offDemo'), l3d = $('#l3d'), key = $('#pwrKey');
    const msg = $('#offMsg');
    const lid = $('#closeLid'), pwr = $('#pressPower'), on = $('#powerOn');
    const guide = makeGuide(demo);
    const say = (t, ok) => { msg.textContent = t; msg.classList.toggle('ok', !!ok); };
    const tried = { lid: false, pwr: false };
    let closed = false;

    function fit() {
      const k = Math.min(1, l3d.parentElement.clientWidth / 470);
      l3d.style.setProperty('--k', k.toFixed(3));
      l3d.style.height = Math.round((window.innerWidth <= 520 ? 340 : 400) * Math.max(k, .72)) + 'px';
    }
    fit();
    window.addEventListener('resize', fit);

    whenVisible(demo, () => guide.point(lid, 'جرّب: أغلق الشاشة'));

    function off(how) {
      demo.classList.remove('waking');
      demo.classList.add('is-off');           // الشاشة تنطفئ فوراً
      lid.disabled = pwr.disabled = true;
      if (how === 'lid') {
        tried.lid = true; closed = true;
        l3d.classList.add('closed');          // والغطاء ينغلق فعلاً
        say('أغلقت الشاشة، فانطفأ الجهاز فوراً: بلا سكون وبلا انتظار. وما لم تحفظه لن يعود.', true);
      } else {
        tried.pwr = true;
        key.classList.remove('press'); void key.offsetWidth; key.classList.add('press');
        say('ضغطت زر الإطفاء مرة واحدة، فانطفأ الجهاز فوراً. وما لم تحفظه لن يعود.', true);
      }
      setTimeout(() => { on.disabled = false; guide.point(on, 'شغّل الجهاز من جديد'); }, reduce ? 100 : 1400);
    }
    function wake() {
      demo.classList.remove('is-off');
      demo.classList.add('waking');
      lid.disabled = pwr.disabled = false; on.disabled = true;
      say(closed ? 'فتحت الشاشة وشغّلت الجهاز من جديد.' : 'شغّلت الجهاز من جديد.', true);
      closed = false;
      if (!tried.lid) guide.point(lid, 'جرّب أيضاً: أغلق الشاشة');
      else if (!tried.pwr) guide.point(pwr, 'جرّب أيضاً: زر الإطفاء');
      else guide.hide();
    }
    lid.addEventListener('click', () => { guide.hide(); off('lid'); });
    pwr.addEventListener('click', () => { guide.hide(); off('pwr'); });
    on.addEventListener('click', () => {
      guide.hide(); on.disabled = true;
      if (closed) { l3d.classList.remove('closed'); setTimeout(wake, reduce ? 0 : 1000); }
      else wake();
    });
  })();

  /* ==========================================================
     7) البرامج
     ========================================================== */
  const list = $('#progList');
  list.innerHTML = CONFIG.programs.map((p, i) => `
    <li style="--i:${i}">
      <span class="pi"><img src="assets/programs/${p.img}.png" alt="" width="64" height="64" loading="lazy"></span>
      <span><span class="pn">${p.name}${p.ver ? `<small>${p.ver}</small>` : ''}</span><span class="pd">${p.brief}</span></span>
    </li>`).join('') + `
    <li class="more" style="--i:${CONFIG.programs.length}">
      <span class="pi" aria-hidden="true"><i></i><i></i><i></i></span>
      <span>وغيرها من البرامج التعليمية...</span>
    </li>`;

  /* ==========================================================
     8) تفاصيل صغيرة
     ========================================================== */
  $('#year').textContent = new Date().getFullYear();
  $('#toTop').addEventListener('click', () => { $('#hero').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });

  if (reduce) $$('.pulses animateMotion').forEach(a => a.remove());
})();
