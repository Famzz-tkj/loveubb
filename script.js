/* ======================================================
   EDITABLE CONTENT — semua nama, tanggal, dan kata-kata di SEMUA
   halaman diambil dari 1 objek ini. Tinggal ganti nilai di sini,
   tidak perlu edit tiap file .html satu-satu.
   ====================================================== */
const birthdayGirl = {
  name: "adekkk",           // GANTI: nama panggilan, muncul di hero.html
  age: "17",                 // GANTI: umur, muncul di bintang hero.html
  dateLabel: "25",           // GANTI TANGGAL: tanggal lahir (angka), ditandai di kalender index.html
  monthLabel: "August",      // GANTI TANGGAL: nama bulan yang ditampilkan di atas kalender
  cardMessage: "A spesial day for my cutie baby ♡", // GANTI KATA-KATA: caption di bawah kalender

  letterTo: "haiii adekk sayangg", // GANTI KATA-KATA: sapaan pembuka surat
  letter: [                        // GANTI KATA-KATA: isi surat, 1 array item = 1 paragraf
    "On your special day, aku berharap banyak hal hal baik yang menghampiri adekk, banyak orang yang sayang sama adekk, dan adekk selalu merasakan happy.. and i will be the reason u feel happier than ever",
    "i'll make sure this is a happier birthday than before"
  ],

  notes: [ // GANTI KATA-KATA: kartu catatan kecil di notes.html, boleh tambah/kurang item
    { title: "ur soo cute and beautiful bb", text: "karna setiap abang liat adekk, rasanya abang jatuh cinta lagi lagi dan lagi" },
    { title: "very very veryy kind", text: "abang sukaa orang orang baik, dan abang nemuin itu di adekk.. adekk baikk banget, even orang itu udah jahat sama adek" },
    { title: "u make me feel lovely", text: "semenjak sama adek, abang jadi ngerasain di sayang, di perhatiin, di denger.. ohh so lucky im" }
  ],

  // GANTI LAGU: title/artist = teks yang tampil di music.html.
  // src = path/URL file mp3-nya, contoh: "assets/song.mp3" (taruh file mp3 di folder assets).
  song: { title: "star.", artist: "Nadin Amizah", src: "assets/songs.mp3" },

  closingLine: "I lovee uuu sooOoo Much BB!!" // GANTI KATA-KATA: kalimat penutup di end.html
};

/* ======================================================
   PAGE FADE-IN ON LOAD
   ====================================================== */
window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.body.classList.add('ready'));
  initGlobalPlayer();   // musik & mini widget yg persist lintas halaman
  initPageBehaviors();  // reveal, lightbox, cake, parallax, dll utk halaman ini
  initRouter();         // navigasi antar-halaman tanpa reload, biar musik ga putus
});

/* Semua hal yang harus di-setup ulang tiap kali konten halaman berganti
   (baik saat load pertama maupun setelah navigasi via router). */
function initPageBehaviors(){
  initReveal();
  initLightbox();
  initCake();
  initParallax();
  bindMusicPageUI();
}

/* ======================================================
   SCROLL REVEAL (IntersectionObserver, no external deps)
   ====================================================== */
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .2 });
  items.forEach(el => io.observe(el));
}

/* ======================================================
   CONFETTI
   ====================================================== */
function launchConfetti(count = 26){
  const colors = ['#712D38','#EDDEBA','#C9A05A','#F3E6C4','#9C4F5A']; // GANTI: warna confetti (skema gold & wine)
  for(let i=0;i<count;i++){
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random()*100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random()*colors.length)];
    piece.style.borderRadius = Math.random()>.5 ? '50%' : '2px';
    piece.style.transition = `transform ${2.2+Math.random()*1.2}s cubic-bezier(.3,.6,.4,1), opacity ${2.4}s ease`;
    document.body.appendChild(piece);
    requestAnimationFrame(() => {
      const x = (Math.random()-.5)*140;
      const rot = Math.random()*360;
      piece.style.transform = `translate(${x}px, ${window.innerHeight + 60}px) rotate(${rot}deg)`;
      piece.style.opacity = '.9';
    });
    setTimeout(() => piece.remove(), 3800);
  }
}

/* ======================================================
   CAKE — MAKE A WISH (wish.html)
   ====================================================== */
function initCake(){
  const stage = document.getElementById('cakeStage');
  const btn = document.getElementById('wishBtn');
  if(!stage || !btn) return;
  const msg = document.getElementById('wishMsg');
  const pup = document.getElementById('mascotGift');
  const nextBtn = document.getElementById('nextAfterWish');
  let wished = false;

  btn.addEventListener('click', () => {
    if(wished) return;
    wished = true;
    stage.classList.add('blown');
    if(msg) msg.classList.add('show');
    if(pup) pup.classList.add('show');
    launchConfetti(34);
    btn.style.opacity = .5;
    btn.style.pointerEvents = 'none';
    if(nextBtn){
      nextBtn.style.display = 'inline-block';
      nextBtn.style.opacity = 0;
      requestAnimationFrame(() => {
        nextBtn.style.transition = 'opacity .6s ease';
        nextBtn.style.opacity = 1;
      });
    }
  });
}

/* ======================================================
   GLOBAL PERSISTENT MUSIC PLAYER
   Audio-nya dibuat sekali lewat JS (bukan tag <audio> di tiap
   halaman), jadi walaupun user pindah2 halaman (lewat router di
   bawah), audio-nya gak ke-reset / gak restart dari 0.
   Ada juga widget mini mengambang yg muncul di SEMUA halaman
   supaya musik bisa di play/pause dari mana aja, gak cuma di
   music.html.
   ====================================================== */
let bgAudio = null;
let miniPlayerEl = null;

function fmtTime(t){ if(!isFinite(t)) return "0:00"; const m=Math.floor(t/60), s=Math.floor(t%60); return `${m}:${s.toString().padStart(2,'0')}`; }

function initGlobalPlayer(){
  if(bgAudio) return; // jangan double-init

  bgAudio = new Audio(birthdayGirl.song.src);
  bgAudio.preload = 'none';
  bgAudio.loop = true;
  bgAudio.volume = 0.7;
  window.__bgAudio = bgAudio;

  // coba lanjutin posisi & volume terakhir (kalau sebelumnya sempat direfresh)
  try{
    const saved = JSON.parse(localStorage.getItem('bgMusicState') || 'null');
    if(saved){
      if(typeof saved.volume === 'number') bgAudio.volume = saved.volume;
      if(typeof saved.time === 'number' && isFinite(saved.time)){
        bgAudio.addEventListener('loadedmetadata', () => { bgAudio.currentTime = saved.time; }, { once:true });
      }
    }
  }catch(e){}

  const persist = () => {
    try{
      localStorage.setItem('bgMusicState', JSON.stringify({
        time: bgAudio.currentTime, volume: bgAudio.volume, playing: !bgAudio.paused
      }));
    }catch(e){}
  };

  // ---- widget mini mengambang (persist di luar #app, gak ikut ke-swap router) ----
  miniPlayerEl = document.createElement('button');
  miniPlayerEl.id = 'miniPlayer';
  miniPlayerEl.type = 'button';
  miniPlayerEl.setAttribute('aria-label', 'Play atau pause musik');
  miniPlayerEl.innerHTML = `
    <span class="mini-vinyl"></span>
    <span class="mini-eq"><i></i><i></i><i></i></span>
  `;
  miniPlayerEl.addEventListener('click', toggleBgAudio);
  document.body.appendChild(miniPlayerEl);

  bgAudio.addEventListener('timeupdate', () => {
    persist();
    const fill = document.getElementById('pFill');
    const curEl = document.getElementById('pCur');
    const pct = (bgAudio.currentTime / bgAudio.duration) * 100 || 0;
    if(fill) fill.style.width = pct + '%';
    if(curEl) curEl.textContent = fmtTime(bgAudio.currentTime);
  });
  bgAudio.addEventListener('loadedmetadata', () => {
    const durEl = document.getElementById('pDur');
    if(durEl) durEl.textContent = fmtTime(bgAudio.duration);
  });
  bgAudio.addEventListener('play', () => {
    document.body.classList.add('music-on');
    miniPlayerEl.classList.add('playing');
    const playBtn = document.getElementById('pPlay');
    if(playBtn) playBtn.textContent = '❚❚';
    const card = document.getElementById('playerCard');
    if(card) card.classList.add('playing');
    persist();
  });
  bgAudio.addEventListener('pause', () => {
    document.body.classList.remove('music-on');
    miniPlayerEl.classList.remove('playing');
    const playBtn = document.getElementById('pPlay');
    if(playBtn) playBtn.textContent = '▶';
    const card = document.getElementById('playerCard');
    if(card) card.classList.remove('playing');
    persist();
  });
  bgAudio.addEventListener('ended', persist);
  window.addEventListener('pagehide', persist);
}

function toggleBgAudio(){
  if(!bgAudio) return;
  if(bgAudio.paused){ bgAudio.play().catch(() => {}); }
  else{ bgAudio.pause(); }
}

/* Dipanggil tiap kali halaman music.html aktif (baik load pertama
   maupun setelah navigasi router), buat nyambungin UI besar (vinyl,
   progress bar, dll) ke bgAudio yang sama. */
function bindMusicPageUI(){
  const playBtn = document.getElementById('pPlay');
  if(!playBtn || !bgAudio) return;

  const vol = document.getElementById('pVol');
  const fill = document.getElementById('pFill');
  const progress = document.getElementById('pProgress');
  const curEl = document.getElementById('pCur');
  const durEl = document.getElementById('pDur');
  const card = document.getElementById('playerCard');

  // sinkronkan tampilan ke kondisi audio saat ini (mungkin udah playing dari halaman lain)
  playBtn.textContent = bgAudio.paused ? '▶' : '❚❚';
  if(card) card.classList.toggle('playing', !bgAudio.paused);
  if(vol) vol.value = bgAudio.volume;
  if(durEl && isFinite(bgAudio.duration)) durEl.textContent = fmtTime(bgAudio.duration);
  if(curEl) curEl.textContent = fmtTime(bgAudio.currentTime || 0);
  if(fill) fill.style.width = ((bgAudio.currentTime / bgAudio.duration) * 100 || 0) + '%';

  playBtn.addEventListener('click', toggleBgAudio);
  if(progress){
    progress.addEventListener('click', e => {
      if(!bgAudio.duration) return;
      const rect = progress.getBoundingClientRect();
      bgAudio.currentTime = ((e.clientX - rect.left) / rect.width) * bgAudio.duration;
    });
  }
  if(vol) vol.addEventListener('input', () => { bgAudio.volume = vol.value; });
}

/* ======================================================
   ROUTER — navigasi antar-halaman lewat fetch + swap #app,
   TANPA reload penuh, supaya elemen <audio> global di atas
   gak pernah kebuat ulang / keputus musiknya.
   Kalau fetch gagal (misalnya web-nya dibuka langsung dari
   file, bukan lewat hosting), otomatis fallback ke navigasi
   biasa supaya situs tetap jalan normal.
   ====================================================== */
let isNavigating = false;

function initRouter(){
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if(!link) return;
    if(link.target === '_blank' || link.hasAttribute('download')) return;

    const raw = link.getAttribute('href');
    if(!raw || raw.startsWith('#')) return;
    if(/^(mailto:|tel:|javascript:)/i.test(raw)) return;

    let url;
    try{ url = new URL(raw, location.href); }catch(err){ return; }
    if(url.origin !== location.origin) return;
    if(!/\.html?($|\?)/i.test(url.pathname)) return;

    e.preventDefault();
    navigateTo(raw);
  });

  window.addEventListener('popstate', () => {
    const page = location.pathname.split('/').pop() || 'index.html';
    navigateTo(page, false);
  });
}

async function navigateTo(url, push = true){
  if(isNavigating) return;
  const appEl = document.getElementById('app');
  if(!appEl){ window.location.href = url; return; }
  isNavigating = true;

  try{
    const res = await fetch(url, { cache: 'no-store' });
    if(!res.ok) throw new Error('fetch not ok');
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const newApp = doc.getElementById('app');
    if(!newApp) throw new Error('no #app in fetched page');

    appEl.style.opacity = '0';
    await new Promise(r => setTimeout(r, 160));

    appEl.innerHTML = newApp.innerHTML;
    document.title = doc.title;
    window.scrollTo(0, 0);

    // jalanin ulang script inline unik tiap halaman (bukan js/script.js-nya)
    doc.querySelectorAll('script:not([src])').forEach(old => {
      const s = document.createElement('script');
      s.textContent = old.textContent;
      document.body.appendChild(s);
      s.remove();
    });

    if(push) history.pushState({ url }, '', url);
    requestAnimationFrame(() => { appEl.style.opacity = '1'; });
    initPageBehaviors();
  }catch(err){
    window.location.href = url; // fallback aman, situs tetap jalan seperti biasa
  }finally{
    isNavigating = false;
  }
}

/* ======================================================
   LIGHTBOX (gallery.html, and any page with .mini-polaroid)
   ====================================================== */
function initLightbox(){
  const lightbox = document.getElementById('lightbox');
  if(!lightbox) return;
  const lbPhoto = document.getElementById('lbPhoto');
  const lbCap = document.getElementById('lbCap');
  document.querySelectorAll('.mini-polaroid').forEach(card => {
    card.addEventListener('click', () => {
      const photo = card.querySelector('.mini-photo');
      lbPhoto.className = 'lb-photo ' + photo.className.replace('mini-photo','').trim();
      lbPhoto.style.backgroundImage = photo.style.backgroundImage || '';
      lbPhoto.style.backgroundSize = 'cover';
      lbPhoto.style.backgroundPosition = 'center';
      lbCap.textContent = card.dataset.cap || '';
      lightbox.classList.add('show');
    });
  });
  const closeBtn = document.getElementById('lbClose');
  if(closeBtn) closeBtn.addEventListener('click', () => lightbox.classList.remove('show'));
  lightbox.addEventListener('click', e => { if(e.target===lightbox) lightbox.classList.remove('show'); });
}

/* ======================================================
   SUBTLE PARALLAX ON FLOATING DECOR
   ====================================================== */
let parallaxBound = false;
function initParallax(){
  if(!document.querySelector('.page > .deco')) return;
  if(parallaxBound) return; // listener dipasang sekali aja, decos di-query ulang tiap gerak
  parallaxBound = true;
  document.addEventListener('mousemove', e => {
    const decos = document.querySelectorAll('.page > .deco');
    if(!decos.length) return;
    const {innerWidth:w, innerHeight:h} = window;
    const dx = (e.clientX/w - .5) * 14, dy = (e.clientY/h - .5) * 14;
    decos.forEach((el,i) => {
      const depth = (i%3+1) * .35;
      el.style.transform = `translate(${dx*depth}px, ${dy*depth}px)`;
    });
  });
}
