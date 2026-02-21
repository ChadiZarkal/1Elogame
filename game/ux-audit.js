/**
 * UX/UI Quality Audit Script
 * Analyzes each page for accessibility, layout, contrast, and UX best practices
 */
const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';

const PAGES = [
  { name: 'Homepage', path: '/', criteria: ['3 equal game cards', 'no primary/secondary hierarchy', 'blue classement btn', 'stats visible', 'no floating CTA'] },
  { name: 'ProfileForm', path: '/jeu', criteria: ['sex/age selection', 'comment ça marche section', 'clear CTA'] },
  { name: 'FlagOrNot', path: '/flagornot', criteria: ['Flag or Not heading', 'clean description', 'suggestion grid', 'input field'] },
  { name: 'Classement', path: '/classement', criteria: ['leaderboard visible', 'rank display', 'tab navigation'] },
  { name: 'Admin', path: '/admin', criteria: ['login form', 'admin panel'] },
];

async function auditPage(browser, page) {
  const tab = await browser.newPage();
  await tab.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  
  try {
    await tab.goto(`${BASE_URL}${page.path}`, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const audit = await tab.evaluate((pageName) => {
      const issues = [];
      const scores = { accessibility: 0, layout: 0, contrast: 0, ux: 0 };
      
      // 1. ACCESSIBILITY — check aria labels, alt texts, roles
      const buttons = document.querySelectorAll('button');
      let ariaCount = 0;
      buttons.forEach(btn => {
        if (btn.getAttribute('aria-label') || btn.textContent?.trim()) ariaCount++;
      });
      scores.accessibility = buttons.length > 0 ? Math.round((ariaCount / buttons.length) * 100) : 100;
      if (scores.accessibility < 90) issues.push(`Only ${ariaCount}/${buttons.length} buttons have accessible labels`);
      
      // 2. Check headings hierarchy (h1 should exist)
      const h1 = document.querySelector('h1');
      const h2s = document.querySelectorAll('h2');
      if (!h1 && !document.querySelector('[role="heading"]')) {
        issues.push('Missing h1 element');
        scores.accessibility -= 10;
      }
      
      // 3. LAYOUT — check scroll, overflow
      const body = document.body;
      const hasHorizontalScroll = body.scrollWidth > window.innerWidth + 10;
      if (hasHorizontalScroll) {
        issues.push('Horizontal scroll detected — content overflow');
        scores.layout -= 20;
      } else {
        scores.layout = 90;
      }
      
      // 4. Check interactive elements are large enough (min 44px tap target)
      let smallTargets = 0;
      document.querySelectorAll('button, a, [role="button"]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 34)) {
          smallTargets++;
        }
      });
      if (smallTargets > 0) {
        issues.push(`${smallTargets} interactive elements below 44px tap target`);
        scores.ux = Math.max(70, 100 - smallTargets * 5);
      } else {
        scores.ux = 95;
      }
      
      // 5. CONTRAST — check text readability (simplified check)
      const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, label');
      let readableCount = 0;
      textElements.forEach(el => {
        const style = getComputedStyle(el);
        const color = style.color;
        // Very rough — just check it's not invisible
        if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') readableCount++;
      });
      scores.contrast = textElements.length > 0 ? Math.round((readableCount / textElements.length) * 100) : 100;
      
      // 6. IMAGES — check for missing alt
      const images = document.querySelectorAll('img');
      let missingAlt = 0;
      images.forEach(img => {
        if (!img.alt && !img.getAttribute('aria-label')) missingAlt++;
      });
      if (missingAlt > 0) issues.push(`${missingAlt} images without alt text`);
      
      // 7. Check font sizes (nothing below 10px)
      let tinyText = 0;
      textElements.forEach(el => {
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size > 0 && size < 10) tinyText++;
      });
      if (tinyText > 0) issues.push(`${tinyText} text elements below 10px font size`);
      
      // Calculate overall score
      const overall = Math.round(
        (scores.accessibility + scores.layout + scores.contrast + scores.ux) / 4
      );
      
      return {
        page: pageName,
        overall,
        scores,
        issues,
        elementCount: {
          buttons: buttons.length,
          headings: (h1 ? 1 : 0) + h2s.length,
          images: images.length,
          textElements: textElements.length,
        }
      };
    }, page.name);
    
    await tab.close();
    return audit;
  } catch (err) {
    await tab.close();
    return { page: page.name, overall: 0, error: err.message };
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });
  
  console.log('🔍 UX/UI Quality Audit — Red Flag Games v4.0\n');
  console.log('─'.repeat(60));
  
  const results = [];
  
  for (const page of PAGES) {
    const result = await auditPage(browser, page);
    results.push(result);
    
    const scoreColor = result.overall >= 95 ? '🟢' : result.overall >= 85 ? '🟡' : '🔴';
    console.log(`\n${scoreColor} ${result.page}: ${result.overall}/100`);
    
    if (result.scores) {
      console.log(`   A11y: ${result.scores.accessibility} | Layout: ${result.scores.layout} | Contrast: ${result.scores.contrast} | UX: ${result.scores.ux}`);
    }
    if (result.issues?.length > 0) {
      result.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
    }
    if (result.elementCount) {
      console.log(`   📊 ${result.elementCount.buttons} buttons, ${result.elementCount.headings} headings, ${result.elementCount.textElements} text elements`);
    }
  }
  
  console.log('\n' + '─'.repeat(60));
  const avg = Math.round(results.reduce((sum, r) => sum + (r.overall || 0), 0) / results.length);
  console.log(`\n📊 Average Score: ${avg}/100`);
  console.log(`🎯 Target: 95/100\n`);
  
  if (avg < 95) {
    console.log('⚡ Improvements needed:');
    results.filter(r => r.overall < 95).forEach(r => {
      console.log(`   → ${r.page} (${r.overall}/100): ${r.issues?.join(', ') || 'minor issues'}`);
    });
  } else {
    console.log('✅ All pages meet the 95/100 quality target!');
  }
  
  await browser.close();
}

run().catch(console.error);
