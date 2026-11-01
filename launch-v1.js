/* Health Dashboard v1.0 Launch Edition finishing layer.
   - one-time clean pre-launch reset requested by the user
   - Road to Madrid explainers
   - progress photo compare/full-screen viewer
   - final mobile overflow hardening
*/
(() => {
  const FINAL_PREP_KEY='healthdash_v1_launch_prepared';
  const FINAL_START='2026-11-02';
  const LEVELS=['Starting Line','Building Momentum','Finding Rhythm','Consistent','Stronger','Halfway Mindset','Training Engine','Spain in Sight','Madrid Ready','Finish-Line Mindset'];
  const THRESHOLDS=[0,400,1000,1900,3000,4300,5800,7500,9500,11500];

  async function finalCleanPrepare(){
    if(localStorage.getItem(FINAL_PREP_KEY)==='1') return false;
    // This build is intentionally the clean launch edition. The user explicitly requested
    // all test/demo/injury/history data be removed before Day 1.
    try{
      for(const store of HealthDB.STORES) await HealthDB.clear(store);
      await ensureDefaults();
      let p=await HealthDB.get('profile','main');
      p={...p,id:'main',name:'Matt',startDate:FINAL_START,madridDate:'2027-04-25',madridWeight:190,ultimateWeight:180,
        startWeight:null,currentWeight:null,waist:null,vo2max:null,weeklyRunBaseline:null,
        stepTarget:null,calorieTarget:null,proteinTarget:null,fibreTarget:null,waterTarget:null,
        strengthTarget:2,bedtimeTarget:'22:30',updatedAt:nowIso()};
      await HealthDB.put('profile',p);
      // Recreate goals from the clean launch profile.
      for(const g of await HealthDB.getAll('goals')) await HealthDB.remove('goals',g.id);
      await HealthDB.put('goals',{id:'goal_madrid_weight',type:'weight',title:'Madrid weight',target:190,targetDate:'2027-04-25',unit:'lb',active:true});
      await HealthDB.put('goals',{id:'goal_ultimate_weight',type:'weight',title:'Ultimate weight',target:180,targetDate:null,unit:'lb',active:true});
      await HealthDB.put('goals',{id:'goal_strength',type:'behaviour',title:'Strength sessions',target:2,period:'week',unit:'sessions',active:true});
      await HealthDB.put('settings',{id:'finalLaunchPrepared',version:'1.0.0',preparedAt:nowIso(),startDate:FINAL_START});
      state.profile=p;
      localStorage.setItem(FINAL_PREP_KEY,'1');
      return true;
    }catch(err){
      console.error('Final launch preparation failed',err);
      throw err;
    }
  }

  function roadLevelRows(g){
    return LEVELS.map((name,i)=>{
      const start=THRESHOLDS[i], next=i===LEVELS.length-1?g.targetXp:THRESHOLDS[i+1];
      const reached=g.xp>=start;
      return `<div class="road-level-row ${reached?'reached':''}"><span>${reached?'✓':'○'}</span><div><strong>Level ${i+1} · ${esc(name)}</strong><small>${i===LEVELS.length-1?'Final progression level':`${start.toLocaleString()}–${Math.max(start,next-1).toLocaleString()} XP`}</small></div></div>`;
    }).join('');
  }

  async function openRoadOverview(){
    const g=await window.healthJourneyGameData();
    modal(`<div class="modal-head"><div><h2>Road to Madrid</h2><p>Your long-term behaviour journey. Weight does not decide your level.</p></div><button class="close-btn" data-close-modal>×</button></div>
      <section class="notice good"><strong>Level ${g.level}: ${esc(g.name)}</strong><br>${g.xp.toLocaleString()} Momentum XP · ${g.daysBanked} banked day${g.daysBanked===1?'':'s'} · ${Math.round(g.routePct)}% of the behaviour route.</section>
      <div class="modal-section-title">How it works</div>
      <p class="explainer-copy">Every day you bank contributes the Momentum points you actually earned to your lifetime XP. Strong days move you faster, but a rough day never takes XP away. The route is designed to reward repeatable behaviour even while weight fluctuates or training has to adapt.</p>
      <div class="road-level-list">${roadLevelRows(g)}</div>
      <div class="notice"><strong>Why this exists</strong><br>The scale can stall even when your habits are improving. Road to Madrid gives you a second form of visible progress that you control directly.</div>`);
    document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal);
  }

  async function openAvgMomentumExplain(){
    const g=await window.healthJourneyGameData();
    const reports=(await HealthDB.getAll('dailyReports')).filter(r=>r.date>=state.profile.startDate).sort((a,b)=>a.date.localeCompare(b.date));
    const recent=reports.slice(-7);
    const recentAvg=recent.length?Math.round(recent.reduce((s,r)=>s+(Number(r.score)||0),0)/recent.length):null;
    modal(`<div class="modal-head"><div><h2>Average Momentum</h2><p>What the ${g.avgScore} means.</p></div><button class="close-btn" data-close-modal>×</button></div>
      <section class="daily-report-hero ${g.avgScore>=85?'good':g.avgScore>=55?'watch':'bad'}"><span>ALL RECORDED DAYS</span><strong>${g.avgScore}/100</strong><h3>Average Momentum</h3><p>Your average daily behaviour score across the days the dashboard has recorded.</p></section>
      <div class="modal-section-title">What goes into it?</div>
      <p class="explainer-copy">Momentum is earned from the behaviours available that day: Morning Check-in, nutrition, protein, fibre/fruit & veg, hydration, planned movement or appropriate rest, steps, learning, supplements and bedtime. Injury adaptations can change what counts as appropriate movement.</p>
      ${recentAvg!=null?`<div class="notice"><strong>Last ${recent.length} banked day${recent.length===1?'':'s'}: ${recentAvg}/100</strong><br>This gives you a short-term comparison with the all-time ${g.avgScore}/100 average.</div>`:''}
      <div class="notice good"><strong>The goal is not 100 every day.</strong><br>A repeatable run of good-enough days matters more than occasional perfect days followed by burnout.</div>`);
    document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal);
  }

  async function openMomentumXpExplain(){
    const g=await window.healthJourneyGameData();
    const nextNeed=Math.max(0,g.nextLevelXp-g.xp);
    modal(`<div class="modal-head"><div><h2>Momentum XP</h2><p>Behaviour progress that never goes backwards.</p></div><button class="close-btn" data-close-modal>×</button></div>
      <section class="calorie-hero"><span>CURRENT TOTAL</span><strong>${g.xp.toLocaleString()} XP</strong><p>${g.level>=10?'You have reached the top Road to Madrid level.':`${nextNeed.toLocaleString()} XP until Level ${g.level+1}: ${esc(g.nextName)}.`}</p></section>
      <div class="modal-section-title">How XP is earned</div>
      <p class="explainer-copy">When you bank a day, that day’s Momentum score becomes XP. An 84/100 day adds 84 XP. A 55/100 day still adds 55 XP. This deliberately rewards continuing through imperfect days rather than treating them as wasted.</p>
      <div class="notice"><strong>XP cannot be lost.</strong><br>Missed habits can slow the journey, but the app never deletes progress you have already earned.</div>
      <div class="modal-section-title">Levels</div><div class="road-level-list">${roadLevelRows(g)}</div>`);
    document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal);
  }

  function photoLabel(ph){return `${ph.view} · ${fmtDate(ph.date,{day:'numeric',month:'short',year:'numeric'})}`;}
  async function photoWeightFor(date){const rows=await weightRows();const same=rows.find(r=>r.date===date);if(same)return Number(same.value);const prior=rows.filter(r=>r.date<=date).at(-1);return prior?Number(prior.value):null;}
  async function openPhotoFull(ph){const wt=await photoWeightFor(ph.date);modal(`<div class="modal-head"><div><h2>${esc(ph.view)} progress photo</h2><p>${fmtDate(ph.date,{day:'numeric',month:'long',year:'numeric'})}${wt?` · ${wt.toFixed(1)} lb`:''}</p></div><button class="close-btn" data-close-modal>×</button></div><div class="photo-full"><img src="${ph.dataUrl}" alt="${esc(ph.view)} progress photo"></div>${ph.note?`<div class="notice">${esc(ph.note)}</div>`:''}`);document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal);}

  async function openPhotoCompareModal(initialView='Front'){
    const all=(await HealthDB.getAll('photos')).sort((a,b)=>a.date.localeCompare(b.date)||String(a.createdAt).localeCompare(String(b.createdAt)));
    if(all.length<2){alert('Add at least two progress photos before comparing.');return;}
    const views=[...new Set(all.map(p=>p.view))];
    let view=views.includes(initialView)?initialView:views[0];
    const renderCompare=async()=>{
      const rows=all.filter(p=>p.view===view);
      if(rows.length<2){document.getElementById('photoCompareBody').innerHTML=`<div class="empty">You need at least two ${esc(view)} photos to compare.</div>`;return;}
      const from=rows[0],to=rows[rows.length-1],w1=await photoWeightFor(from.date),w2=await photoWeightFor(to.date);
      document.getElementById('photoCompareBody').innerHTML=`<div class="photo-compare-grid"><button class="photo-compare-item" data-photo-id="${from.id}"><img src="${from.dataUrl}" alt="Earlier ${esc(view)} photo"><strong>${fmtDate(from.date,{day:'numeric',month:'short',year:'numeric'})}</strong><small>${w1?`${w1.toFixed(1)} lb`:''}${from.note?`${w1?' · ':''}${esc(from.note)}`:''}</small></button><button class="photo-compare-item" data-photo-id="${to.id}"><img src="${to.dataUrl}" alt="Latest ${esc(view)} photo"><strong>${fmtDate(to.date,{day:'numeric',month:'short',year:'numeric'})}</strong><small>${w2?`${w2.toFixed(1)} lb`:''}${to.note?`${w2?' · ':''}${esc(to.note)}`:''}</small></button></div><p class="compare-hint">Earliest vs latest ${esc(view)} photo. Tap either image for full screen.</p>`;
      document.querySelectorAll('[data-photo-id]').forEach(b=>b.onclick=()=>openPhotoFull(all.find(p=>p.id===b.dataset.photoId)));
    };
    modal(`<div class="modal-head"><div><h2>Compare progress photos</h2><p>Same-view comparisons make changes easier to see.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="compare-view-tabs">${views.map(v=>`<button class="secondary-btn ${v===view?'active':''}" data-compare-view="${esc(v)}">${esc(v)}</button>`).join('')}</div><div id="photoCompareBody"></div>`);
    document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal);
    document.querySelectorAll('[data-compare-view]').forEach(b=>b.onclick=async()=>{view=b.dataset.compareView;document.querySelectorAll('[data-compare-view]').forEach(x=>x.classList.toggle('active',x.dataset.compareView===view));await renderCompare();});
    await renderCompare();
  }

  openPhotoGalleryModal=async function(){
    const photos=(await HealthDB.getAll('photos')).sort((a,b)=>b.date.localeCompare(a.date)||String(b.createdAt).localeCompare(String(a.createdAt)));
    if(!photos.length){openProgressPhotoModal();return;}
    const views=['All',...[...new Set(photos.map(p=>p.view))]];
    modal(`<div class="modal-head"><div><h2>Progress photos</h2><p>${photos.length} local-only image${photos.length===1?'':'s'} · gallery, timeline and compare.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="photo-toolbar"><button class="primary-btn" id="galleryCompare">Compare</button><button class="secondary-btn" id="galleryAddPhoto">Add photo</button></div><div class="compare-view-tabs">${views.map((v,i)=>`<button class="secondary-btn ${i===0?'active':''}" data-gallery-view="${esc(v)}">${esc(v)}</button>`).join('')}</div><div class="photo-gallery" id="photoGalleryGrid"></div>`);
    const grid=document.getElementById('photoGalleryGrid');
    const paint=(view='All')=>{const rows=view==='All'?photos:photos.filter(p=>p.view===view);grid.innerHTML=rows.map(ph=>`<button class="photo-figure" data-photo-id="${ph.id}"><img src="${ph.dataUrl}" alt="${esc(ph.view)} progress photo"><span><strong>${esc(ph.view)}</strong><small>${fmtDate(ph.date,{day:'numeric',month:'short',year:'numeric'})}</small>${ph.note?`<em>${esc(ph.note)}</em>`:''}</span></button>`).join('');grid.querySelectorAll('[data-photo-id]').forEach(b=>b.onclick=()=>openPhotoFull(photos.find(p=>p.id===b.dataset.photoId)));};
    paint();
    document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal);
    document.getElementById('galleryAddPhoto').onclick=()=>openProgressPhotoModal();
    document.getElementById('galleryCompare').onclick=()=>openPhotoCompareModal();
    document.querySelectorAll('[data-gallery-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-gallery-view]').forEach(x=>x.classList.remove('active'));b.classList.add('active');paint(b.dataset.galleryView);});
  };

  // v1.0 is intentionally manual-first. Keep this screen simple and offline-friendly.
  openSourcesModal=async function(){
    modal(`<div class="modal-head"><div><h2>Manual data workflow</h2><p>Three apps collect the detail; Health Dashboard keeps the story.</p></div><button class="close-btn" data-close-modal>×</button></div>
      <section class="card compact" style="box-shadow:none"><div class="source-card"><div class="source-icon">W</div><div><strong>Withings Body+</strong><small>Enter your morning weight in Morning Check-in. Body composition can stay in Withings unless it helps explain a fluctuation.</small></div><span class="pill good">MANUAL</span></div><div class="source-card"><div class="source-icon">G</div><div><strong>Garmin Forerunner 945</strong><small>After training, copy the useful basics: activity, distance/time and Garmin-reported calories burned. The dashboard learns your personal burn pattern over time.</small></div><span class="pill good">MANUAL</span></div><div class="source-card"><div class="source-icon">N</div><div><strong>Nutracheck</strong><small>Log food in Nutracheck, then copy calories, protein, fibre and fruit/veg totals into the dashboard. No duplicate food diary needed.</small></div><span class="pill good">MANUAL</span></div></section>
      <div class="notice"><strong>Offline by design.</strong><br>Automatic Garmin/Withings sync is on the future backlog. v1.0 does not need a connector or internet for daily tracking.</div>`);
    document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal);
  };

  // Extend event binding for the new Road to Madrid tappable zones.
  const previousBind=bindViewEvents;
  bindViewEvents=function(){
    previousBind();
    document.querySelectorAll('[data-road="overview"]').forEach(el=>el.onclick=(e)=>{e.stopPropagation();openRoadOverview();});
    document.querySelectorAll('[data-road="avg"]').forEach(el=>el.onclick=(e)=>{e.stopPropagation();openAvgMomentumExplain();});
    document.querySelectorAll('[data-road="xp"]').forEach(el=>el.onclick=(e)=>{e.stopPropagation();openMomentumXpExplain();});
  };

  async function bootFinal(){
    try{
      const cleaned=await finalCleanPrepare();
      if(cleaned){toast('v1.0 ready — clean Day 1 state prepared');await render();}
    }catch(err){
      console.error(err);
      const root=document.getElementById('appContent');if(root)root.innerHTML=`<section class="card"><h2>Launch preparation needs attention</h2><p>${esc(err.message||String(err))}</p><p>Your data has not been silently continued into Day 1. Reload once, or restore a backup if needed.</p></section>`;
    }
  }
  setTimeout(bootFinal,650);
})();
