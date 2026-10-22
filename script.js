(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    navLinks.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    navLinks.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });

  // Progressive scroll reveal. Content remains visible if IntersectionObserver is unavailable.
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // Portfolio category filtering.
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const workCards = [...document.querySelectorAll('.work-card')];
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      workCards.forEach(card => {
        card.hidden = !(filter === 'all' || card.dataset.category === filter);
      });
    });
  });

  // Accessible FAQ accordion.
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq-item');
      const shouldOpen = !item.classList.contains('open');
      item.classList.toggle('open', shouldOpen);
      question.setAttribute('aria-expanded', String(shouldOpen));
    });
  });

  // The contact form prepares an email; it does not pretend to submit to a server.
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Project enquiry from ${String(data.get('name')).trim()} — G-Cuts Media`;
    const body = [
      'Hello G-Cuts Media,',
      '',
      'I would like to discuss a project.',
      '',
      `Name: ${data.get('name') || ''}`,
      `Business / Brand: ${data.get('business') || 'Not provided'}`,
      `Phone: ${data.get('phone') || ''}`,
      `Email: ${data.get('email') || ''}`,
      `Service required: ${data.get('service') || ''}`,
      '',
      'Project details:',
      data.get('message') || 'Not provided',
      '',
      'Thank you.'
    ].join('\n');
    const mailto = `mailto:gcutsmedia@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.classList.remove('error');
    status.classList.add('success');
    status.textContent = 'Opening your email app with the enquiry details. Please review and send the email to complete your enquiry.';
    window.location.href = mailto;
  });

  document.getElementById('currentYear').textContent = new Date().getFullYear();
})();


/* =========================================================
   ADDED: G-Cuts showcase carousel, poster roll, AI and back-top
   ========================================================= */
(() => {
  const tabs = [...document.querySelectorAll('.showcase-tab')];
  const panels = [...document.querySelectorAll('.showcase-panel')];
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
      panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); panel.classList.toggle('active', panel.id === tab.getAttribute('aria-controls')); });
    });
  });

  // Responsive poster-roll distance: exactly six poster widths + five gaps.
  const posterTrack = document.getElementById('posterTrack');
  const updatePosterRoll = () => {
    const first = posterTrack?.querySelector('.poster-card');
    if (!posterTrack || !first) return;
    const styles = getComputedStyle(posterTrack);
    const gap = parseFloat(styles.columnGap || styles.gap || '14') || 14;
    const distance = (first.getBoundingClientRect().width + gap) * 6;
    posterTrack.style.setProperty('--poster-roll-distance', `${-distance}px`);
  };
  updatePosterRoll();
  window.addEventListener('resize', updatePosterRoll, {passive:true});

  // Five-phone video carousel: Instagram-style frames, muted autoplay and per-reel sound toggles.
  const phoneItems = [...document.querySelectorAll('.phone-item')];
  const prev = document.getElementById('videoPrev');
  const next = document.getElementById('videoNext');
  const count = document.getElementById('videoCount');
  let activeIndex = 2;
  let videoTimer;

  const stateByOffset = { '-2':'left2','-1':'left1','0':'center','1':'right1','2':'right2' };
  function normalize(n){ return (n + phoneItems.length) % phoneItems.length; }

  function setMuteState(item, muted) {
    const video = item.querySelector('video');
    const button = item.querySelector('.reel-mute');
    if (!video || !button) return;
    video.muted = muted;
    video.defaultMuted = muted;
    if (muted) video.setAttribute('muted',''); else video.removeAttribute('muted');
    button.classList.toggle('is-muted', muted);
    button.classList.toggle('is-live', !muted);
    button.setAttribute('aria-pressed', String(!muted));
    button.setAttribute('aria-label', muted ? 'Unmute reel' : 'Mute reel');
    const icon = button.querySelector('.mute-icon');
    const text = button.querySelector('.mute-text');
    if (icon) icon.textContent = muted ? '🔇' : '🔊';
    if (text) text.textContent = muted ? 'Sound off' : 'Sound on';
  }

  function renderPhones(){
    phoneItems.forEach((item, i) => {
      let delta = i - activeIndex;
      if (delta > 2) delta -= phoneItems.length;
      if (delta < -2) delta += phoneItems.length;
      item.dataset.state = stateByOffset[String(delta)] || 'right2';
      const video = item.querySelector('video');
      if (video) {
        video.setAttribute('playsinline','');
        video.play().catch(() => {});
      }
    });
    if (count) count.textContent = `${String(activeIndex + 1).padStart(2,'0')} / ${String(phoneItems.length).padStart(2,'0')}`;
  }
  function go(step){ activeIndex = normalize(activeIndex + step); renderPhones(); restartVideoTimer(); }
  function restartVideoTimer(){ clearInterval(videoTimer); videoTimer = setInterval(() => go(1), 5200); }
  prev?.addEventListener('click', e => { e.stopPropagation(); go(-1); });
  next?.addEventListener('click', e => { e.stopPropagation(); go(1); });

  phoneItems.forEach(item => {
    const mute = item.querySelector('.reel-mute');
    mute?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const video = item.querySelector('video');
      if (!video) return;
      setMuteState(item, !video.muted);
      video.play().catch(() => {});
    });

    item.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      activeIndex = Number(item.dataset.index);
      renderPhones();
      restartVideoTimer();
    });
  });

  phoneItems.forEach(item => setMuteState(item, true));
  renderPhones();
  restartVideoTimer();

  // Basic touch swipe for the five-phone stage.
  const stage = document.getElementById('phoneStage');
  let touchStartX = null;
  stage?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive:true });
  stage?.addEventListener('touchend', e => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive:true });

  // G-Cuts AI: local site-knowledge assistant, with an optional backend hook.
  const aiLauncher = document.getElementById('aiLauncher');
  const aiChat = document.getElementById('aiChat');
  const aiClose = document.getElementById('aiClose');
  const aiForm = document.getElementById('aiForm');
  const aiInput = document.getElementById('aiInput');
  const aiMessages = document.getElementById('aiMessages');
  const quickQs = [...document.querySelectorAll('.ai-quick button')];
  const AI_ENDPOINT = '';

  const kb = [
    { keys:['service','services','offer','what do you do'], answer:'We offer Digital Marketing, Social Media Management, Performance Marketing, Video Production, Branding & Design, Website Development, SEO & Local Marketing, and Photography.' },
    { keys:['video','editing','editor','reel','production','film'], answer:'Our video work includes commercial films, cinematic reels, promotional videos, storytelling, behind-the-scenes content and editing. The Works section above shows the five-phone video showcase.' },
    { keys:['graphic','design','poster','creative'], answer:'Our design work covers brand identity, logo design, campaign creatives and graphic design. Open the Graphic Designs tab in Works to see the horizontal poster roll.' },
    { keys:['social','instagram','content','reels'], answer:'We support content planning, reels, post creation, creative calendars and ongoing social communication around the brand and its goals.' },
    { keys:['ads','meta','google','performance'], answer:'We support Meta Ads, Google Ads, lead generation and retargeting, with campaign scope shaped around the business objective.' },
    { keys:['website','web','ecommerce','landing'], answer:'We build responsive business websites, landing pages and e-commerce experiences designed for clarity and conversion.' },
    { keys:['seo','google business','local'], answer:'We support SEO, local SEO and Google Business Profile optimization to help customers discover the business.' },
    { keys:['process','how do you work','workflow'], answer:'Our core process is Discover → Strategize → Create → Optimize. We start with the business goal, then shape the creative and execution around it.' },
    { keys:['founder','gokul','gokulmani'], answer:'Gokulmani is the Founder of G-Cuts Media and works as a Digital Marketing & Social Media Specialist.' },
    { keys:['career','careers','job','apply','vacancy'], answer:'Current roles include Video Editor, Content Writer, Social Media Manager, Videographer and Ads Manager. Each role has an Apply Now button in the Careers section.' },
    { keys:['contact','phone','call','whatsapp','email','address'], answer:'Call +91 90953 95121, email gcutsmedia@gmail.com, or visit No. 336, Opp. Police Station, Veeranam, Salem – 636122, Tamil Nadu.' },
    { keys:['salem','location','where are you'], answer:'G-Cuts Media is based in Veeranam, Salem, Tamil Nadu.' },
    { keys:['custom package','price','pricing','budget'], answer:'Yes. Share your goals, deliverables and budget; we can discuss a scope that fits the project. Pricing is confirmed after understanding the requirements.' }
  ];
  function aiAnswer(q){
    const normalized = q.toLowerCase().replace(/[^a-z0-9+ ]/g,' ');
    const match = kb.find(item => item.keys.some(k => normalized.includes(k)));
    return match ? match.answer : 'I can help with G-Cuts services, video editing, graphic design, social media, ads, websites, SEO, careers, founder details and contact information. Try asking: “What services do you offer?”';
  }
  function addAiMessage(text, who='bot'){
    const div = document.createElement('div'); div.className = `ai-msg ai-${who}`; div.textContent = text; aiMessages.appendChild(div); aiMessages.scrollTop = aiMessages.scrollHeight;
  }
  async function sendAiQuestion(q){
    const question = q.trim(); if (!question) return;
    addAiMessage(question,'user');
    if (AI_ENDPOINT) {
      try {
        const res = await fetch(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question})});
        if (!res.ok) throw new Error('AI endpoint unavailable');
        const data = await res.json(); addAiMessage(data.answer || aiAnswer(question)); return;
      } catch(e){}
    }
    window.setTimeout(() => addAiMessage(aiAnswer(question),'bot'),220);
  }
  function toggleAI(open){
    aiChat.classList.toggle('open', open); aiChat.setAttribute('aria-hidden', String(!open)); aiLauncher.setAttribute('aria-expanded', String(open)); if(open) setTimeout(() => aiInput?.focus(),120);
  }
  aiLauncher?.addEventListener('click', () => toggleAI(!aiChat.classList.contains('open')));
  aiClose?.addEventListener('click', () => toggleAI(false));
  aiForm?.addEventListener('submit', e => { e.preventDefault(); sendAiQuestion(aiInput.value); aiInput.value=''; });
  quickQs.forEach(btn => btn.addEventListener('click', () => sendAiQuestion(btn.dataset.q || '')));

  // Sticky back-to-top appears only after scrolling down; click returns to home.
  const backTop = document.getElementById('backTop');
  const updateBackTop = () => backTop?.classList.toggle('show', window.scrollY > 520);
  updateBackTop();
  window.addEventListener('scroll', updateBackTop, {passive:true});
})();
