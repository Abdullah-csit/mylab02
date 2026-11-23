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
      { key: 'B', count: 8, name: 'جهة النوافذ' },
      { key: 'C', count: 9, name: 'الوسط' },
      { key: 'A', count: 8, name: 'جهة الباب' },
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
  const CX = [120, 300, 480], Y0 = 122, PITCH = 66, DW = 130, DH = 46;
  const tot = CONFIG.lines.reduce((a, l) => a + l.count, 0);

  function laptop(x, y, letter) {
    return `<g class="lap">
      <rect class="scr" x="${x}" y="${y + 4}" width="42" height="7" rx="2"/>
      <rect class="kb" x="${x}" y="${y + 13}" width="42" height="27" rx="4"/>
      <text class="lt" x="${x + 21}" y="${y + 27}">${letter}</text>
    </g>`;
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
    // الحاجز الزجاجي (اليمين، في الجزء الأمامي)
    for (let i = 0; i < 3; i++) out += `<rect class="glass" x="577" y="${130 + i * 105}" width="10" height="90"/>`;
    // باب الدخول من جهة A (اليمين، قرب مؤخرة المختبر) مع قوس الفتح
    out += `<rect class="doorgap" x="576" y="636" width="12" height="70"/><path class="doorarc" d="M582 636 A70 70 0 0 0 512 706"/><line class="doorleaf" x1="582" y1="636" x2="512" y2="636"/><text class="wall-lbl door-lbl" x="545" y="672" text-anchor="middle">الباب</text>`;
    // السبلت: خلف آخر ميز في زاوية خط B
    out += `<rect class="ac" x="26" y="684" width="64" height="30" rx="3"/><text class="wall-lbl" x="58" y="703" text-anchor="middle">سبلت</text>`;

    let order = 0;
    CONFIG.lines.forEach((ln, c) => {
      const cx = CX[c];
      out += `<g class="col-head ln-${ln.key}"><circle cx="${cx}" cy="96" r="15" fill="var(--c)"/><text x="${cx}" y="96">${ln.key}</text></g>`;
      for (let r = 0; r < ln.count; r++) {
        const n = r + 1, y = Y0 + r * PITCH, x = cx - DW / 2;
        const code = ln.key + n;
        out += `<g class="desk ln-${ln.key}" data-line="${ln.key}" data-n="${n}" tabindex="0" role="button" aria-label="الميز ${code}" style="--i:${order++}">
          <rect class="d" x="${x}" y="${y}" width="${DW}" height="${DH}" rx="7"/>
          <text class="code" x="${cx}" y="${y + DH / 2}">${code}</text>
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
        <div class="sel-code">${code}</div>
        <div class="sel-meta">
          <b>الخط ${key}: ${ln.name}</b>
          <span>الميز ${ORD[n - 1] || n} من جهة السبورة</span>
          <div class="stickers">
            <span class="sticker ln-${key}"><i></i>${code}-L</span>
            <span class="sticker ln-${key}"><i></i>${code}-R</span>
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
     5) محاكاة التجميد
     ========================================================== */
  (() => {
    const demo = $('#freezeDemo'), screen = $('.lscreen', demo);
    const file = $('#userFile'), msg = $('#freezeMsg');
    const add = $('#addFile'), re = $('#restart');
    let has = false;
    const say = (t, ok) => { msg.textContent = t; msg.classList.toggle('ok', !!ok); };

    add.addEventListener('click', () => {
      has = true; file.hidden = false;
      say('أضفت ملف «تقريري» إلى سطح المكتب. أعد التشغيل لترى ماذا يحدث.', true);
    });
    re.addEventListener('click', () => {
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
     6) محاكاة الإطفاء المباشر
     ========================================================== */
  (() => {
    const demo = $('#offDemo'), screen = $('#offScreen');
    const msg = $('#offMsg');
    const lid = $('#closeLid'), pwr = $('#pressPower'), on = $('#powerOn');
    const say = (t, ok) => { msg.textContent = t; msg.classList.toggle('ok', !!ok); };

    function off(reason) {
      screen.classList.add('is-off');
      demo.classList.add('is-off');
      lid.disabled = pwr.disabled = true; on.disabled = false;
      say(reason + ' انطفأ الجهاز فوراً: بلا سكون وبلا انتظار. وما لم تحفظه لن يعود.', true);
    }
    lid.addEventListener('click', () => off('أغلقت الشاشة.'));
    pwr.addEventListener('click', () => off('ضغطت زر الإطفاء مرة واحدة.'));
    on.addEventListener('click', () => {
      screen.classList.remove('is-off');
      demo.classList.remove('is-off');
      lid.disabled = pwr.disabled = false; on.disabled = true;
      say('جرّب: أغلق الشاشة أو اضغط زر الإطفاء.');
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
