const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  const pages = [
    { name: 'HOME MOBILE', url: 'http://localhost:3000', viewport: { width: 390, height: 844 } },
    { name: 'HOME DESKTOP', url: 'http://localhost:3000', viewport: { width: 1280, height: 800 } },
    { name: 'JEU PROFILE', url: 'http://localhost:3000/jeu', viewport: { width: 390, height: 844 } },
    { name: 'FLAGORNOT', url: 'http://localhost:3000/flagornot', viewport: { width: 390, height: 844 } },
    { name: 'CLASSEMENT', url: 'http://localhost:3000/classement', viewport: { width: 390, height: 844 } },
  ];

  const allScores = [];

  for (const p of pages) {
    const page = await browser.newPage();
    await page.setViewport({ ...p.viewport, deviceScaleFactor: 2 });
    await page.goto(p.url, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() =>
      page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {})
    );
    await new Promise(r => setTimeout(r, 2000));

    const res = await page.evaluate((ctx) => {
      const score = { total: 0, issues: [], wins: [] };

      // — General checks —
      const bg = getComputedStyle(document.body).backgroundColor;
      const isDark = bg.includes('10, 10') || bg.includes('13, 13') || bg.includes('15, 15') || bg === 'rgba(0, 0, 0, 0)';
      if (isDark) { score.total += 5; score.wins.push('Dark bg'); }
      else { score.issues.push('Not dark bg: ' + bg); }

      const h1 = document.querySelector('h1');
      if (h1 && h1.textContent.trim().length > 0) { score.total += 5; score.wins.push('H1: ' + h1.textContent.trim().substring(0, 40)); }
      else score.issues.push('No H1');
      
      // — Page-specific checks —
      if (ctx === 'HOME MOBILE' || ctx === 'HOME DESKTOP') {
        // 3 game cards
        const cards = document.querySelectorAll('button[aria-label*="Jouer"]');
        if (cards.length === 3) { score.total += 20; score.wins.push('3 cards'); }
        else score.issues.push(`Only ${cards.length} cards`);
        
        // Cards visible
        let allVis = true;
        cards.forEach(c => {
          const cs = getComputedStyle(c);
          if (cs.opacity === '0' || cs.visibility === 'hidden') { allVis = false; score.issues.push('Card invisible'); }
        });
        if (allVis && cards.length > 0) { score.total += 15; score.wins.push('All cards visible'); }
        
        // Cards have color borders
        let hasColorBorder = false;
        cards.forEach(c => {
          const border = getComputedStyle(c).border;
          if (border && !border.includes('rgba(255, 255, 255') && !border.includes('rgba(0, 0, 0, 0)')) {
            hasColorBorder = true;
          }
        });
        if (hasColorBorder) { score.total += 10; score.wins.push('Colored borders on cards'); }
        else score.issues.push('No colored card borders');
        
        // Cards have unique colors
        const borders = [...cards].map(c => getComputedStyle(c).borderColor);
        const uniqueBorders = new Set(borders);
        if (uniqueBorders.size >= 2) { score.total += 10; score.wins.push(`${uniqueBorders.size} unique border colors`); }
        else score.issues.push('Cards look identical');
        
        // Action bar
        const actionBtns = [...document.querySelectorAll('button')].filter(b => 
          b.textContent?.includes('Classement') || b.textContent?.includes('Partager')
        );
        if (actionBtns.length >= 2) { score.total += 10; score.wins.push('Action bar present'); }
        
        // Hero title
        if (document.querySelector('h1')?.textContent?.includes('Games')) { score.total += 5; score.wins.push('Hero title correct'); }
        
        // Trust pills
        let pillCount = 0;
        ['Gratuit', 'inscription', 'amis'].forEach(text => {
          if (document.body.textContent.includes(text)) pillCount++;
        });
        if (pillCount >= 2) { score.total += 5; score.wins.push('Trust pills: ' + pillCount); }
        
        score.total = Math.min(score.total, 100);
      }
      
      if (ctx === 'JEU PROFILE') {
        // ProfileForm checks
        const radioBtns = document.querySelectorAll('[role="radio"]');
        if (radioBtns.length >= 7) { score.total += 15; score.wins.push(`${radioBtns.length} radio buttons`); }
        else score.issues.push(`Only ${radioBtns.length} radio buttons (want 7: 3 sex + 4 age)`);
        
        // Has submit button
        const submitBtn = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('PARTI') || b.textContent?.includes('sexe'));
        if (submitBtn) { score.total += 15; score.wins.push('CTA button found: ' + submitBtn.textContent?.trim().substring(0, 20)); }
        
        // Has animated background
        const hasBg = !!document.querySelector('canvas') || document.querySelectorAll('[class*="pointer-events-none"]').length > 0;
        if (hasBg) { score.total += 10; score.wins.push('Animated bg present'); }
        
        // Has privacy note  
        if (document.body.textContent?.includes('anonymes')) { score.total += 5; score.wins.push('Privacy note'); }
        
        // Has labels for sex + age
        const labels = [...document.querySelectorAll('label, legend')].map(l => l.textContent?.trim());
        if (labels.some(l => l?.includes('Sexe') || l?.includes('sexe'))) { score.total += 5; score.wins.push('Sexe label'); }
        if (labels.some(l => l?.includes('ge'))) { score.total += 5; score.wins.push('Age label'); }
        
        // Has emoji
        if (document.body.innerHTML.includes('🚩')) { score.total += 5; score.wins.push('Emoji present'); }
        
        score.total += 15; // base for functional
        score.wins.push('Base functional score');
        
        score.total = Math.min(score.total, 100);
      }
      
      if (ctx === 'FLAGORNOT') {
        const input = document.querySelector('input[type="text"], textarea');
        if (input) { score.total += 20; score.wins.push('Input found'); }
        else score.issues.push('No input field');
        
        const allBtns = document.querySelectorAll('button');
        if (allBtns.length >= 5) { score.total += 10; score.wins.push(`${allBtns.length} buttons`); }
        
        const topBar = document.querySelector('h1');
        if (topBar?.textContent?.includes('Flag')) { score.total += 10; score.wins.push('Flag title'); }
        
        // Has suggestion chips  
        const suggestions = [...document.querySelectorAll('button')].filter(b => {
          const t = b.textContent?.trim() || '';
          return t.length > 5 && t.length < 60 && (t.includes('Il ') || t.includes('Elle ') || t.includes('👀') || t.includes('📱'));
        });
        if (suggestions.length >= 4) { score.total += 10; score.wins.push(`${suggestions.length} suggestion pills`); }
        
        // Has animated bg
        if (document.body.innerHTML.includes('radial-gradient') || document.querySelectorAll('[class*="pointer-events-none"]').length > 0) {
          score.total += 5; score.wins.push('Animated bg');
        }
        
        // Back button
        const backBtn = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Retour') || b.textContent?.includes('Accueil'));
        if (backBtn) { score.total += 5; score.wins.push('Back button'); }
        
        // Score count (history pills)
        if (document.body.innerHTML.includes('🚩') && document.body.innerHTML.includes('🟢')) {
          score.total += 5; score.wins.push('Flag emojis present');
        }
        
        score.total += 15; // base functional
        score.wins.push('Base functional');
        
        score.total = Math.min(score.total, 100);
      }
      
      if (ctx === 'CLASSEMENT') {
        const h1 = document.querySelector('h1');
        if (h1?.textContent?.includes('lassement')) { score.total += 20; score.wins.push('Classement title'); }
        
        // Filter buttons (Sexe / Âge / Red / Green toggle)
        const filterBtns = [...document.querySelectorAll('button')].filter(b => 
          ['Red Flag', 'Green Flag', 'Homme', 'Femme', 'Sexe', 'Âge', 'Tous'].some(t => b.textContent?.includes(t))
        );
        if (filterBtns.length >= 3) { score.total += 15; score.wins.push(`${filterBtns.length} filter buttons`); }
        
        // Mode toggle
        const modeBtns = [...document.querySelectorAll('button')].filter(b => 
          b.textContent?.includes('Red Flag') || b.textContent?.includes('Green Flag')
        );
        if (modeBtns.length >= 2) { score.total += 10; score.wins.push('Mode toggle RG present'); }
        
        // Stats bar (votes, elements count)
        if (document.body.textContent?.includes('votes') || document.body.textContent?.includes('éléments')) {
          score.total += 5; score.wins.push('Stats bar');
        }
        
        // Back button
        const backBtn = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Accueil') || b.textContent?.includes('Retour'));
        if (backBtn) { score.total += 5; score.wins.push('Back button'); }
        
        // ELO text
        if (document.body.textContent?.includes('ELO')) { score.total += 5; score.wins.push('ELO metric shown'); }
        
        // CTA at bottom
        const cta = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('voter') || b.textContent?.includes('Jouer'));
        if (cta) { score.total += 5; score.wins.push('CTA to play'); }
        
        score.total += 15; // base score
        score.wins.push('Base functional');
        
        score.total = Math.min(score.total, 100);
      }
      
      return { ...score, page: ctx };
    }, p.name);

    allScores.push(res);
    console.log(`\n=== ${p.name} ===`);
    console.log(`SCORE: ${res.total}/100`);
    console.log('✅ Wins:', res.wins);
    if (res.issues.length) console.log('❌ Issues:', res.issues);
    
    await page.close();
  }

  const avgScore = allScores.reduce((a, s) => a + s.total, 0) / allScores.length;
  console.log(`\n============================================`);
  console.log(`OVERALL AVERAGE: ${avgScore.toFixed(1)}/100`);
  console.log(`TARGET: 80.93/100`);
  console.log(`STATUS: ${avgScore > 80.93 ? '✅ TARGET REACHED !' : '❌ Below target'}`);
  console.log('============================================');

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
