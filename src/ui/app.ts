import { categories, demoReports, tips } from '../data/content';
import { readHabits, readReports, saveHabits, saveReport } from '../services/storage';
import { fetchPublicReports, publishReport, supabaseConfigured } from '../services/supabase';
import type { Habit, IssueReport, IssueCategory } from '../types';
import { icon } from './icons';

let reports = readReports(demoReports);
let habits = readHabits();
let activeFilter = 'All issues';
let searchTerm = '';
let toastTimer = 0;

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char] ?? char));

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}
function toast(message: string): void {
  const el = document.querySelector<HTMLElement>('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 3800);
}
function statusClass(status: IssueReport['status']): string {
  return status === 'Resolved' ? 'resolved' : status === 'Under review' ? 'review' : 'received';
}
function reportCard(report: IssueReport): string {
  const image = report.imageUrl
    ? `<img class="report-image" src="${escapeHtml(report.imageUrl)}" alt="Photo submitted with ${escapeHtml(report.title)}" loading="lazy">`
    : `<div class="report-placeholder"><span>${report.category.includes('road') ? '🛣️' : report.category.includes('water') || report.category.includes('River') ? '💧' : '🌱'}</span><small>${report.source === 'demo' ? 'SAMPLE REPORT' : report.source === 'local' ? 'LOCAL ONLY' : 'COMMUNITY REPORT'}</small></div>`;
  return `<article class="report-card">${image}<div class="report-card-body">
    <div class="report-meta"><span class="category-pill">${escapeHtml(report.category)}</span><span class="status-pill ${statusClass(report.status)}">${escapeHtml(report.status)}</span></div>
    <h3>${escapeHtml(report.title)}</h3><p>${escapeHtml(report.description)}</p>
    <div class="report-location">${icon('pin', 16)} <span>${escapeHtml(report.address)}, ${escapeHtml(report.city)}, ${escapeHtml(report.state)}</span></div>
    <div class="report-footer"><span>By ${escapeHtml(report.reporterName)}</span><span>${formatDate(report.createdAt)}</span></div>
    ${report.source === 'demo' ? '<div class="sample-note">Example only · not an official complaint</div>' : report.source === 'local' ? '<div class="sample-note">Saved in this browser only · not sent to authorities</div>' : ''}
  </div></article>`;
}

function normalizeSearchText(value: string): string {
  return value.toLocaleLowerCase('en-IN').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

function renderReports(): void {
  const list = document.querySelector<HTMLElement>('#report-list');
  const count = document.querySelector<HTMLElement>('#report-count');
  if (!list || !count) return;
  const searchTokens = normalizeSearchText(searchTerm).split(' ').filter(Boolean);
  const filtered = reports.filter(report => {
    const matchesFilter = activeFilter === 'All issues' || report.category === activeFilter;
    const haystack = normalizeSearchText(`${report.title} ${report.description} ${report.city} ${report.state} ${report.address} ${report.category}`);
    const matchesSearch = searchTokens.every(token => haystack.includes(token));
    return matchesFilter && matchesSearch;
  });
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'report' : 'reports'}`;
  list.innerHTML = filtered.length
    ? filtered.map(reportCard).join('')
    : '<div class="empty-state"><span>🌿</span><h3>No reports found</h3><p>Try another search or category.</p></div>';
}

function renderHabits(): void {
  const list = document.querySelector<HTMLElement>('#habit-list');
  const score = document.querySelector<HTMLElement>('#habit-score');
  const progress = document.querySelector<HTMLElement>('#habit-progress');
  if (!list || !score || !progress) return;
  const done = habits.filter(habit => habit.done).length;
  const percent = Math.round(done / habits.length * 100);
  score.textContent = `${done}/${habits.length}`;
  progress.style.width = `${percent}%`;
  list.innerHTML = habits.map(habit => `<label class="habit-item ${habit.done ? 'is-done' : ''}">
    <input type="checkbox" data-habit="${habit.id}" ${habit.done ? 'checked' : ''}>
    <span class="habit-check">${habit.done ? icon('check', 16) : ''}</span><span>${escapeHtml(habit.label)}</span>
  </label>`).join('');
}

function modalMarkup(): string {
  return `<div class="modal-backdrop" id="report-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-panel"><div class="modal-head"><div><span class="eyebrow">MAKE YOUR VOICE COUNT</span><h2 id="modal-title">Report a local issue</h2><p>Share clear details so the community can understand what needs attention.</p></div><button class="icon-button" id="close-modal" aria-label="Close report form">${icon('close')}</button></div>
    <form id="report-form">
      <div class="form-grid">
        <label class="field full">Issue title *<input name="title" maxlength="90" required placeholder="e.g. Deep pothole near the bus stop"></label>
        <label class="field">Issue type *<select name="category" required>${categories.map(c => `<option>${escapeHtml(c)}</option>`).join('')}</select></label>
        <label class="field">City / town *<input name="city" maxlength="60" required placeholder="e.g. Bhopal"></label>
        <label class="field">State / UT *<input name="state" maxlength="60" required placeholder="e.g. Madhya Pradesh"></label>
        <label class="field">Location / address *<input name="address" maxlength="180" required placeholder="Street, landmark or area"></label>
        <label class="field full">What did you notice? *<textarea name="description" rows="4" maxlength="1200" minlength="15" required placeholder="Describe what you saw, when you noticed it, and why it needs attention (at least 15 characters)."></textarea></label>
        <label class="field full">Photo (optional)<span class="upload-box" id="upload-box">${icon('camera', 22)}<strong id="upload-label">Choose a photo</strong><small>JPG, PNG or WebP · maximum 5 MB</small><input id="issue-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp"></span></label>
        <label class="field">Your display name *<input name="reporterName" maxlength="50" required placeholder="Name or nickname"></label>
        <label class="field">Mobile number (optional; not published)<input name="phone" type="tel" inputmode="tel" maxlength="16" placeholder="Only if you want to share"></label>
      </div>
      <div class="privacy-note">🔒 Privacy tip: avoid sharing your home address, faces, vehicle number plates or other private information. In shared mode, your optional mobile number is not published. In local-only mode, details stay in this browser. Never include information you do not want to share.</div>
      <label class="consent"><input name="consent" type="checkbox" required><span>I confirm this report is honest and does not contain someone else's private information. *</span></label>
      <p class="form-error" id="form-error" role="alert"></p>
      <button class="button button-primary button-wide" type="submit" id="submit-report">${icon('plus', 18)} Submit report</button>
    </form>
  </div></div>`;
}

export function renderApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="announcement"><span class="announcement-dot"></span> One community. A greener India. <span class="announcement-divider">·</span> Every small action matters.</div>
    <header class="site-header"><a href="#home" class="brand" aria-label="Green India home"><span class="brand-mark">${icon('leaf', 25)}</span><span>green<span class="brand-accent">india</span><small>CARE FOR OUR COMMON HOME</small></span></a>
      <nav class="desktop-nav" aria-label="Main navigation"><a href="#issues">Community reports</a><a href="#action">Take action</a><a href="#learn">Learn & grow</a></nav>
      <button class="button button-primary header-cta" id="open-report">${icon('plus', 17)} Report an issue</button><button class="icon-button mobile-menu" id="mobile-menu" aria-label="Toggle navigation">${icon('menu')}</button>
    </header>
    <main id="home">
      <section class="hero section-wrap"><div class="hero-copy"><div class="hero-kicker"><span class="kicker-icon">${icon('leaf', 15)}</span> YOUR CITY. YOUR PLANET. YOUR VOICE.</div>
        <h1>A cleaner India<br>starts <span>right here.</span></h1>
        <p class="hero-description">Spot a problem? Share it. Want to make a difference? Start small. Together, we can build cleaner streets, healthier rivers and greener neighbourhoods.</p>
        <div class="hero-actions"><button class="button button-primary button-large" id="hero-report">${icon('plus', 19)} Report an issue</button><a class="button button-secondary button-large" href="#action">Explore ways to help ${icon('arrow', 17)}</a></div>
        <div class="hero-trust"><div class="avatar-stack"><span>🌱</span><span>💧</span><span>♻️</span></div><div><strong>Small steps. Real change.</strong><small>Start with one action today.</small></div></div>
      </div><div class="hero-art" aria-label="Illustration of a greener city"><div class="art-sun"></div><div class="art-cloud cloud-one"></div><div class="art-cloud cloud-two"></div><div class="art-hill hill-back"></div><div class="art-hill hill-front"></div><div class="city-building building-one"></div><div class="city-building building-two"></div><div class="city-building building-three"></div><div class="art-tree tree-one"><i></i><b></b></div><div class="art-tree tree-two"><i></i><b></b></div><div class="art-tree tree-three"><i></i><b></b></div><div class="art-road"></div><div class="art-label"><span>🌿</span><div><strong>Make room for nature</strong><small>One greener choice at a time</small></div></div><div class="art-leaf leaf-one">✦</div><div class="art-leaf leaf-two">✦</div></div>
      <div class="hero-bottom-note"><span>↓</span> A little action can make a big difference</div></section>
      <section class="impact-strip"><div class="impact-item"><span class="impact-icon mint">${icon('pin', 22)}</span><div><strong>Local action</strong><small>Start in your neighbourhood</small></div></div><div class="impact-item"><span class="impact-icon yellow">♻</span><div><strong>Smarter habits</strong><small>Everyday choices add up</small></div></div><div class="impact-item"><span class="impact-icon blue">${icon('drop', 22)}</span><div><strong>Cleaner water</strong><small>Protect rivers and lakes</small></div></div><div class="impact-item"><span class="impact-icon peach">🌳</span><div><strong>Greener spaces</strong><small>Care for nature together</small></div></div></section>
      <section class="section-wrap issues-section" id="issues"><div class="section-heading"><div><span class="eyebrow">SEE IT. SHARE IT. IMPROVE IT.</span><h2>What's happening<br><span>around us?</span></h2><p>Explore community-submitted concerns about roads, waste, water and green spaces.</p></div><button class="button button-primary" id="issues-report">${icon('plus', 17)} Add a report</button></div>
        <div class="reports-toolbar"><div class="filter-tabs" id="filter-tabs"><button class="filter-tab active" data-filter="All issues">All issues</button>${categories.map(c => `<button class="filter-tab" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div><form class="location-search-form" id="report-search-form"><label class="search-box">${icon('search', 18)}<input id="report-search" type="search" placeholder="Search city, area, street, landmark..." aria-label="Search reports by city or address"></label><button class="button button-primary search-submit" type="submit">Search</button></form></div>
        <div class="reports-caption"><span id="report-count"></span><span class="demo-indicator"><span></span> Public community posts · sample cards are labelled</span></div><div class="report-grid" id="report-list"></div>
        <div class="civic-note"><span>ⓘ</span><p><strong>Community awareness, not an official complaint portal.</strong> Green India is an independent community project. Submitting here does not automatically notify a municipal authority or guarantee action. For urgent hazards, contact your local authority or emergency service directly.</p></div>
      </section>
      <section class="action-section" id="action"><div class="section-wrap action-layout"><div class="action-copy"><span class="eyebrow">YOUR DAILY GREEN CHECK-IN</span><h2>Good for the planet.<br><span>Good for your habits.</span></h2><p>Pick a few small actions. Tick them off as you do them and build a greener routine, one day at a time.</p><div class="habit-card"><div class="habit-card-head"><div><span class="habit-label">TODAY'S GREEN GOALS</span><h3>Your eco checklist</h3></div><div class="habit-score" id="habit-score">0/5</div></div><div class="progress-track"><span id="habit-progress"></span></div><div id="habit-list" class="habit-list"></div><div class="habit-card-foot"><span>🌱 Every little bit counts.</span><button id="reset-habits" class="text-button">Reset checklist</button></div></div></div><div class="action-side"><div class="side-decoration deco-one">✳</div><div class="side-decoration deco-two">✦</div><div class="action-illustration"><div class="plant-pot"><div class="plant-stem"></div><i></i><b></b><em></em><span></span></div><div class="soil"></div><div class="small-sprout">✧</div></div><div class="quote-card"><span>“</span><p>We do not inherit the Earth from our ancestors; we borrow it from our children.</p><small>A reminder to leave the planet better than we found it.</small></div></div></div></section>
      <section class="section-wrap learn-section" id="learn"><div class="section-heading"><div><span class="eyebrow">KNOW A LITTLE. DO A LOT.</span><h2>Greener living, <span>made simple.</span></h2><p>Easy, practical ideas you can bring into your everyday life.</p></div><span class="learn-stamp">LEARN · ACT · REPEAT</span></div><div class="tips-grid">${tips.map((tip, index) => `<article class="tip-card tip-${index + 1}"><div class="tip-top"><span class="tip-emoji">${tip.icon}</span><span class="tip-tag">${tip.tag}</span></div><h3>${tip.title}</h3><p>${tip.body}</p><a href="#resources">Explore the basics ${icon('arrow', 16)}</a></article>`).join('')}</div></section>
      <section class="school-section"><div class="section-wrap school-banner"><div class="school-icon">🏫</div><div><span class="eyebrow">FOR SCHOOLS & COMMUNITIES</span><h2>Make green action a team sport.</h2><p>Try a clean-up awareness day, a waste-separation demo, a water-saving audit or a native-plant care group. Always work with a teacher or responsible adult for outdoor activities.</p></div><a href="#resources" class="button button-light">Explore activity ideas ${icon('arrow', 17)}</a><div class="school-deco">✳</div></div></section>
      <section class="section-wrap resources-section" id="resources"><div class="resource-heading"><span class="eyebrow">A GOOD PLACE TO START</span><h2>Learn from trusted sources.</h2><p>Check official guidance and local rules before organising an activity.</p></div><div class="resource-grid">
        <a class="resource-card" href="https://moef.gov.in/" target="_blank" rel="noopener noreferrer"><span class="resource-icon green">🌿</span><div><strong>Ministry of Environment, Forest and Climate Change</strong><small>National environment policies and updates</small></div>${icon('arrow', 17)}</a>
        <a class="resource-card" href="https://cpcb.nic.in/" target="_blank" rel="noopener noreferrer"><span class="resource-icon blue">💧</span><div><strong>Central Pollution Control Board</strong><small>Pollution monitoring and public information</small></div>${icon('arrow', 17)}</a>
        <a class="resource-card" href="https://swachhbharatmission.ddws.gov.in/" target="_blank" rel="noopener noreferrer"><span class="resource-icon yellow">♻️</span><div><strong>Swachh Bharat Mission (Grameen)</strong><small>Sanitation, cleanliness and waste awareness</small></div>${icon('arrow', 17)}</a>
      </div></section>
      <section class="final-cta"><div class="final-cta-inner"><div class="final-leaf">${icon('leaf', 28)}</div><span class="eyebrow">THE NEXT STEP IS YOURS</span><h2>Don't just wish for a<br>better world. <span>Help grow one.</span></h2><p>Notice something that needs attention? Share a clear, respectful report with your community.</p><button class="button button-light button-large" id="final-report">${icon('plus', 18)} Share a local issue</button><div class="cta-orbit orbit-one"></div><div class="cta-orbit orbit-two"></div></div></section>
    </main>
    <footer class="site-footer"><div class="footer-top"><a href="#home" class="brand footer-brand"><span class="brand-mark">${icon('leaf', 23)}</span><span>green<span class="brand-accent">india</span><small>CARE FOR OUR COMMON HOME</small></span></a><p>A community project for a cleaner, greener tomorrow.</p><div class="footer-links"><a href="#issues">Community</a><a href="#action">Eco tracker</a><a href="#resources">Resources</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Green India</span><span>Web Created By <strong>Xtreme</strong></span><span>Made with care for our planet <span class="footer-heart">♥</span></span></div><p class="footer-disclaimer">Independent community project. Not affiliated with any government authority. Demo reports are examples, not verified incidents.</p></footer>
    ${modalMarkup()}<div id="toast" class="toast" role="status" aria-live="polite"></div>`;

  renderReports();
  renderHabits();
  bindEvents();
  void loadOnlineReports();
}

async function loadOnlineReports(): Promise<void> {
  if (!supabaseConfigured) return;
  try {
    const online = await fetchPublicReports();
    if (online) {
      reports = [...online, ...reports.filter(report => report.source !== 'community')];
      renderReports();
    }
  } catch (error) {
    console.error(error);
    toast('Community reports could not be refreshed. Showing saved examples for now.');
  }
}

function openModal(): void {
  const modal = document.querySelector<HTMLElement>('#report-modal');
  modal?.classList.add('is-open');
  document.body.classList.add('modal-open');
  window.setTimeout(() => modal?.querySelector<HTMLInputElement>('input[name="title"]')?.focus(), 80);
}
function closeModal(): void {
  document.querySelector<HTMLElement>('#report-modal')?.classList.remove('is-open');
  document.body.classList.remove('modal-open');
}
function bindEvents(): void {
  ['open-report', 'hero-report', 'issues-report', 'final-report'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', openModal);
  });
  document.getElementById('close-modal')?.addEventListener('click', closeModal);
  document.getElementById('report-modal')?.addEventListener('click', event => {
    if (event.target === event.currentTarget) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });
  document.getElementById('mobile-menu')?.addEventListener('click', () => {
    document.querySelector('.desktop-nav')?.classList.toggle('nav-open');
  });
  document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a').forEach(link => link.addEventListener('click', () => {
    document.querySelector('.desktop-nav')?.classList.remove('nav-open');
  }));
  document.getElementById('filter-tabs')?.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter ?? 'All issues';
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.toggle('active', tab === button));
    renderReports();
  });
  document.getElementById('report-search-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>('#report-search');
    searchTerm = (input?.value ?? '').trim();
    renderReports();
    document.getElementById('report-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.getElementById('habit-list')?.addEventListener('change', event => {
    const input = event.target as HTMLInputElement;
    const id = input.dataset.habit;
    if (!id) return;
    habits = habits.map((habit: Habit) => habit.id === id ? { ...habit, done: input.checked } : habit);
    saveHabits(habits);
    renderHabits();
  });
  document.getElementById('reset-habits')?.addEventListener('click', () => {
    habits = habits.map(habit => ({ ...habit, done: false }));
    saveHabits(habits);
    renderHabits();
    toast('Your checklist is ready for a fresh start.');
  });
  const photo = document.querySelector<HTMLInputElement>('#issue-photo');
  photo?.addEventListener('change', () => {
    const file = photo.files?.[0];
    const label = document.querySelector<HTMLElement>('#upload-label');
    if (label) label.textContent = file ? file.name : 'Choose a photo';
  });
  document.getElementById('report-form')?.addEventListener('submit', event => {
    event.preventDefault();
    void submitReport(event.currentTarget as HTMLFormElement);
  });
}

async function submitReport(form: HTMLFormElement): Promise<void> {
  const errorEl = document.querySelector<HTMLElement>('#form-error');
  const button = document.querySelector<HTMLButtonElement>('#submit-report');
  if (errorEl) errorEl.textContent = '';
  const data = new FormData(form);
  const file = data.get('photo');
  const image = file instanceof File && file.size > 0 ? file : undefined;
  if (image && !['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
    if (errorEl) errorEl.textContent = 'Please choose a JPG, PNG or WebP image.';
    return;
  }
  if (image && image.size > 5 * 1024 * 1024) {
    if (errorEl) errorEl.textContent = 'That photo is over 5 MB. Please choose a smaller image.';
    return;
  }
  const phone = String(data.get('phone') ?? '').trim();
  if (phone && !/^[+()\d\s-]{7,16}$/.test(phone)) {
    if (errorEl) errorEl.textContent = 'Please check the mobile number format, or leave it blank.';
    return;
  }
  const report: IssueReport = {
    id: crypto.randomUUID(),
    title: String(data.get('title') ?? '').trim(),
    category: String(data.get('category') ?? 'Other') as IssueCategory,
    description: String(data.get('description') ?? '').trim(),
    address: String(data.get('address') ?? '').trim(),
    city: String(data.get('city') ?? '').trim(),
    state: String(data.get('state') ?? '').trim(),
    reporterName: String(data.get('reporterName') ?? '').trim(),
    contactPhone: phone || undefined,
    createdAt: new Date().toISOString(),
    status: 'Received',
    source: 'community'
  };
  if (report.description.length < 15) {
    if (errorEl) errorEl.textContent = 'Please add a little more detail (at least 15 characters).';
    return;
  }
  if (button) { button.disabled = true; button.textContent = 'Submitting…'; }
  try {
    const result = await publishReport(report, image);
    if (result === 'local') {
      report.source = 'local';
      if (image) {
        report.imageName = image.name;
        // Show the selected photo for this session; the temporary URL is not persisted.
        report.imageUrl = URL.createObjectURL(image);
      }
      saveReport(report);
      reports = [report, ...reports];
      toast('Saved in this browser only. Configure Supabase to share reports publicly.');
    } else {
      reports = [report, ...reports];
      toast('Report submitted to the Green India community feed.');
    }
    activeFilter = 'All issues';
    searchTerm = '';
    const search = document.querySelector<HTMLInputElement>('#report-search');
    if (search) search.value = '';
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.toggle('active', (tab as HTMLButtonElement).dataset.filter === 'All issues'));
    renderReports();
    form.reset();
    const uploadLabel = document.querySelector<HTMLElement>('#upload-label');
    if (uploadLabel) uploadLabel.textContent = 'Choose a photo';
    closeModal();
    document.getElementById('issues')?.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong while submitting your report.';
    if (errorEl) errorEl.textContent = `${message} Your report has not been marked as submitted.`;
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = `${icon('plus', 18)} Submit report`;
    }
  }
}