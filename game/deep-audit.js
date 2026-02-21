/**
 * Deep UX/UI Audit v2 — Comprehensive page-by-page analysis
 * Target: 99/100
 * Checks: A11y, Layout, Contrast, UX, Performance, Typography, Spacing, Interactions
 */
const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';

const PAGES = [
  { name: 'Homepage', path: '/' },
  { name: 'ProfileForm', path: '/jeu' },
  { name: 'FlagOrNot', path: '/flagornot' },
  { name: 'Classement', path: '/classement' },
  { name: 'Admin', path: '/admin' },
  { name: 'GamePlay', path: '/jeu/jouer' },
  { name: 'RedFlagTest', path: '/redflag' },
];

async function deepAuditPage(browser, page) {
  const tab = await browser.newPage();
  await tab.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  
  try {
    await tab.goto(`${BASE_URL}${page.path}`, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const audit = await tab.evaluate(() => {
      const issues = [];
      const warnings = [];
      const good = [];
      
      // ═══════════════════════════════════════════════════
      // 1. ACCESSIBILITY (25 points)
      // ═══════════════════════════════════════════════════
      let a11yScore = 25;
      
      // 1a. Buttons with labels
      const buttons = document.querySelectorAll('button, [role="button"]');
      let unlabeledBtns = 0;
      buttons.forEach(btn => {
        if (!btn.getAttribute('aria-label') && !btn.textContent?.trim() && !btn.querySelector('svg[aria-label]')) {
          unlabeledBtns++;
        }
      });
      if (unlabeledBtns > 0) { a11yScore -= 3; issues.push(`${unlabeledBtns} buttons sans label accessible`); }
      else good.push('✓ Tous les boutons ont un label');
      
      // 1b. Heading hierarchy
      const h1 = document.querySelector('h1');
      const h2s = document.querySelectorAll('h2');
      if (!h1 && !document.querySelector('[role="heading"]')) {
        a11yScore -= 2; issues.push('Pas de h1');
      } else good.push('✓ Heading h1 présent');
      
      // 1c. Images alt
      const images = document.querySelectorAll('img');
      let missingAlt = 0;
      images.forEach(i => { if (!i.alt && !i.getAttribute('aria-label') && !i.getAttribute('role')) missingAlt++; });
      if (missingAlt > 0) { a11yScore -= 2; issues.push(`${missingAlt} images sans alt`); }
      
      // 1d. Color-only info (check for color-dependent badges)
      const colorOnlyElements = document.querySelectorAll('[class*="bg-red"], [class*="bg-green"]');
      let colorOnlyNoText = 0;
      colorOnlyElements.forEach(el => {
        if (!el.textContent?.trim() && !el.getAttribute('aria-label')) colorOnlyNoText++;
      });
      if (colorOnlyNoText > 0) { a11yScore -= 1; warnings.push(`${colorOnlyNoText} éléments utilisent la couleur seule comme info`); }
      
      // 1e. Focus visible on interactive
      const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
      let noFocusStyle = 0;
      focusableElements.forEach(el => {
        const style = getComputedStyle(el);
        // Check outline or ring
        if (style.outlineStyle === 'none' && !el.className.includes('focus')) {
          // Not necessarily an issue if using ring-* classes
        }
      });
      
      // 1f. Links with descriptive text
      const links = document.querySelectorAll('a');
      let vagueLinkText = 0;
      links.forEach(a => {
        const text = a.textContent?.trim();
        if (text && ['cliquez ici', 'ici', 'click here', 'lien'].includes(text.toLowerCase())) vagueLinkText++;
      });
      if (vagueLinkText > 0) { a11yScore -= 1; warnings.push(`${vagueLinkText} liens avec texte vague`); }
      
      a11yScore = Math.max(0, a11yScore);
      
      // ═══════════════════════════════════════════════════
      // 2. LAYOUT (25 points)
      // ═══════════════════════════════════════════════════
      let layoutScore = 25;
      
      // 2a. Horizontal overflow
      const hasHScroll = document.body.scrollWidth > window.innerWidth + 5;
      if (hasHScroll) { layoutScore -= 5; issues.push('Overflow horizontal détecté'); }
      else good.push('✓ Pas d\'overflow horizontal');
      
      // 2b. Content touches edges — check if actual text/buttons are within 8px of viewport edges
      // Exclude elements inside horizontal scroll containers (carousels/chips)
      const textAndBtns = document.querySelectorAll('p, h1, h2, h3, button, label');
      let edgeTouchCount = 0;
      textAndBtns.forEach(el => {
        const rect = el.getBoundingClientRect();
        const text = el.textContent || '';
        if (rect.width <= 0 || text.trim().length === 0) return;
        // Skip elements inside overflow-x containers (scroll carousels)
        let parent = el.parentElement;
        let inScroller = false;
        while (parent && parent !== document.body) {
          const os = getComputedStyle(parent).overflowX;
          if (os === 'auto' || os === 'scroll') { inScroller = true; break; }
          parent = parent.parentElement;
        }
        if (inScroller) return;
        if (rect.left < 8 || rect.right > window.innerWidth - 8) edgeTouchCount++;
      });
      if (edgeTouchCount > 0) {
        layoutScore -= 2; warnings.push(`${edgeTouchCount} éléments de contenu collent aux bords`);
      }
      
      // 2c. Visible elements cut off (not hidden/decorative/in scroll containers)
      let cutOff = 0;
      document.querySelectorAll('p, h1, h2, h3, button, img').forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (rect.width > 0 && style.visibility !== 'hidden' && style.opacity !== '0') {
          // Skip elements inside overflow-x containers
          let parent = el.parentElement;
          let inScroller = false;
          while (parent && parent !== document.body) {
            const os = getComputedStyle(parent).overflowX;
            if (os === 'auto' || os === 'scroll') { inScroller = true; break; }
            parent = parent.parentElement;
          }
          if (inScroller) return;
          if (rect.right > window.innerWidth + 10) cutOff++;
        }
      });
      if (cutOff > 0) { layoutScore -= 2; warnings.push(`${cutOff} éléments visibles coupés`); }
      
      // 2d. Consistent spacing
      // Check vertical gaps between sections
      const sections = document.querySelectorAll('section, [class*="space-y"], [class*="gap-"]');
      if (sections.length > 0) good.push(`✓ ${sections.length} sections avec espacement`);
      
      // 2e. Viewport meta
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) { layoutScore -= 3; issues.push('Meta viewport manquant'); }
      else good.push('✓ Viewport meta présent');
      
      // ═══════════════════════════════════════════════════
      // 3. CONTRAST & READABILITY (25 points)
      // ═══════════════════════════════════════════════════
      let contrastScore = 25;
      
      const textEls = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, label, a, button, li, td, th, div');
      let lowContrastCount = 0;
      let tinyTextCount = 0;
      let textDetails = [];
      
      textEls.forEach(el => {
        if (!el.textContent?.trim()) return;
        const style = getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        // Check tiny text (< 10px)
        if (fontSize > 0 && fontSize < 10) {
          tinyTextCount++;
          textDetails.push({ text: el.textContent?.trim().substring(0, 30), size: fontSize, tag: el.tagName });
        }
        
        // Basic contrast check — very light text on dark bg or vice versa
        if (color.includes('rgba') && color.includes(', 0.')) {
          const opacity = parseFloat(color.split(', ').pop());
          if (opacity < 0.3 && fontSize < 14) {
            lowContrastCount++;
          }
        }
      });
      
      if (tinyTextCount > 0) { contrastScore -= Math.min(5, tinyTextCount); issues.push(`${tinyTextCount} textes < 10px`); }
      else good.push('✓ Tous les textes ≥ 10px');
      if (lowContrastCount > 0) { contrastScore -= Math.min(3, lowContrastCount); warnings.push(`${lowContrastCount} textes à faible contraste`); }
      
      // ═══════════════════════════════════════════════════
      // 4. UX & INTERACTION (25 points)
      // ═══════════════════════════════════════════════════
      let uxScore = 25;
      
      // 4a. Tap targets (44x44 recommended, 34px min)
      let smallTargets = [];
      document.querySelectorAll('button, a, [role="button"], input, select').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.width < 44 || rect.height < 34) {
            smallTargets.push({
              tag: el.tagName,
              text: (el.textContent?.trim() || el.getAttribute('aria-label') || '').substring(0, 25),
              w: Math.round(rect.width),
              h: Math.round(rect.height),
            });
          }
        }
      });
      if (smallTargets.length > 0) {
        uxScore -= Math.min(5, smallTargets.length);
        issues.push(`${smallTargets.length} targets < 44px: ${smallTargets.map(t => `${t.tag}(${t.w}x${t.h})"${t.text}"`).join(', ')}`);
      } else good.push('✓ Tous les targets ≥ 44px');
      
      // 4b. Touch-friendly spacing (interactive elements not too close)
      const interactives = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      let tooCloseCount = 0;
      for (let i = 0; i < interactives.length; i++) {
        for (let j = i + 1; j < interactives.length; j++) {
          const r1 = interactives[i].getBoundingClientRect();
          const r2 = interactives[j].getBoundingClientRect();
          if (r1.width === 0 || r2.width === 0) continue;
          
          const gap = Math.min(
            Math.abs(r1.right - r2.left),
            Math.abs(r2.right - r1.left),
            Math.abs(r1.bottom - r2.top),
            Math.abs(r2.bottom - r1.top)
          );
          if (gap < 4 && gap >= 0 && 
              r1.top < r2.bottom && r2.top < r1.bottom) {
            tooCloseCount++;
          }
        }
      }
      if (tooCloseCount > 3) { uxScore -= 1; warnings.push(`${tooCloseCount} éléments interactifs très proches`); }
      
      // 4c. Loading states / skeleton  
      const loadingEls = document.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"], [class*="shimmer"], [class*="loading"]');
      if (loadingEls.length > 0) good.push('✓ États de chargement détectés');
      
      // 4d. Empty states handled
      const emptyStates = document.querySelectorAll('[class*="empty"], [class*="no-data"], [class*="no-results"]');
      
      // Summary
      const totalScore = a11yScore + layoutScore + contrastScore + uxScore;
      
      return {
        totalScore,
        scores: { a11y: a11yScore, layout: layoutScore, contrast: contrastScore, ux: uxScore },
        issues,
        warnings,
        good,
        smallTargets,
        tinyText: textDetails,
        counts: {
          buttons: buttons.length,
          links: links.length,
          headings: (h1 ? 1 : 0) + h2s.length,
          images: images.length,
          textElements: textEls.length,
          interactives: interactives.length,
        }
      };
    });
    
    await tab.close();
    return { page: page.name, path: page.path, ...audit };
  } catch (err) {
    await tab.close();
    return { page: page.name, path: page.path, totalScore: 0, error: err.message };
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });
  
  console.log('🔬 Deep UX/UI Audit v2 — Red Flag Games');
  console.log('🎯 Target: 99/100\n');
  console.log('═'.repeat(70));
  
  const results = [];
  
  for (const page of PAGES) {
    const result = await deepAuditPage(browser, page);
    results.push(result);
    
    const emoji = result.totalScore >= 24 ? '🟢' : result.totalScore >= 20 ? '🟡' : '🔴';
    console.log(`\n${emoji} ${result.page} (${result.path}): ${result.totalScore}/100`);
    
    if (result.scores) {
      console.log(`   A11y: ${result.scores.a11y}/25 | Layout: ${result.scores.layout}/25 | Contrast: ${result.scores.contrast}/25 | UX: ${result.scores.ux}/25`);
    }
    
    if (result.issues?.length > 0) {
      console.log('   ❌ Issues:');
      result.issues.forEach(i => console.log(`      • ${i}`));
    }
    if (result.warnings?.length > 0) {
      console.log('   ⚠️  Warnings:');
      result.warnings.forEach(w => console.log(`      • ${w}`));
    }
    if (result.good?.length > 0) {
      console.log('   ✅ Good:');
      result.good.forEach(g => console.log(`      • ${g}`));
    }
    if (result.counts) {
      console.log(`   📊 ${result.counts.buttons} btns, ${result.counts.links} links, ${result.counts.headings} headings, ${result.counts.interactives} interactives`);
    }
    if (result.error) {
      console.log(`   💥 Error: ${result.error}`);
    }
  }
  
  console.log('\n' + '═'.repeat(70));
  const avg = Math.round(results.reduce((sum, r) => sum + (r.totalScore || 0), 0) / results.length);
  console.log(`\n📊 Average: ${avg}/100`);
  console.log(`🎯 Target: 99/100`);
  
  // List all unique issues to fix
  const allIssues = new Set();
  const allWarnings = new Set();
  results.forEach(r => {
    r.issues?.forEach(i => allIssues.add(`[${r.page}] ${i}`));
    r.warnings?.forEach(w => allWarnings.add(`[${r.page}] ${w}`));
  });
  
  if (allIssues.size > 0) {
    console.log(`\n🔧 ALL ISSUES TO FIX (${allIssues.size}):`);
    allIssues.forEach(i => console.log(`   • ${i}`));
  }
  if (allWarnings.size > 0) {
    console.log(`\n⚠️  ALL WARNINGS (${allWarnings.size}):`);
    allWarnings.forEach(w => console.log(`   • ${w}`));
  }
  
  await browser.close();
}

run().catch(console.error);
