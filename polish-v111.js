/* v1.1.1 non-destructive UI polish: no data migrations, no destructive data writes. */
(()=>{
  'use strict';
  function durDisplay(activity){
    const seconds=activity.durationSeconds!=null?Math.round(Number(activity.durationSeconds)):Math.round(Number(activity.durationMinutes||0)*60);
    if(!Number.isFinite(seconds)||seconds<0)return '—';
    const hh=Math.floor(seconds/3600),mm=Math.floor((seconds%3600)/60),ss=seconds%60;
    return hh?`${hh}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`:`${mm}:${String(ss).padStart(2,'0')}`;
  }
  function compactSecondarySections(){
    if(state.view!=='today')return;
    document.querySelectorAll('#app .section-title').forEach(title=>{
      const key=title.querySelector('h2')?.textContent?.trim();
      if(!["This week's priorities",'Streaks'].includes(key))return;
      const next=title.nextElementSibling;
      if(!next||next.matches('details'))return;
      const fold=document.createElement('details');fold.className='v111-fold';
      const summary=document.createElement('summary');summary.textContent=(key==='Streaks'?'🔥 ':'📋 ')+key;
      title.parentNode.insertBefore(fold,title);fold.appendChild(summary);fold.appendChild(next);title.remove();
    });
  }
  async function recognition(){
    if(state.view!=='today'||!isJourneyStarted())return;
    const rows=(await weightRows()).filter(w=>w.date>=state.profile.startDate&&w.date<=isoDate()).sort((a,b)=>a.date.localeCompare(b.date));
    const last=rows.at(-1);let falling=0;
    for(let i=rows.length-1;i>0;i--){if(Number(rows[i].value)<Number(rows[i-1].value))falling++;else break;}
    const recentActs=(await HealthDB.getAll('activities')).filter(a=>a.date>=state.profile.startDate&&a.date<=isoDate()&&(a.type==='strength'||(a.type==='gym'&&String(a.subtype).toLowerCase()==='strength'))).sort((a,b)=>a.date.localeCompare(b.date));
    let headline='',detail='';
    if([2,5,7,10].includes(falling)&&last?.date===isoDate()){headline=`🎉 ${falling} lower weigh-ins in a row`;detail=`Today's weight is ${Number(last.value).toFixed(1)} lb. That's an encouraging early signal, though short-term changes include water and food mass — enjoy the progress without changing a sensible plan because of one reading.`;}
    else if(recentActs.length===1&&daysBetween(recentActs[0].date,isoDate())<=2){headline='💪 First strength session banked';detail='Strength training is part of your longer-term health and running goals. Getting started is the win; consistency comes next.';}
    else return;
    const anchor=document.querySelector('#app .v11-brief')||document.querySelector('#app .v11-dayhead');if(!anchor)return;
    const box=document.createElement('section');box.className='v111-recognition';
    const heading=document.createElement('strong');heading.textContent=headline;
    const p=document.createElement('p');p.textContent=detail;box.append(heading,p);anchor.parentNode.insertBefore(box,anchor);
  }
  async function trophyClick(title){
    const badges=await derivedBadges();const b=badges.find(x=>x.title===title&&x.hit);if(!b)return;
    modal(`<div class="modal-head"><div><h2>${b.emoji} ${esc(b.title)}</h2><p>Achievement unlocked</p></div><button class="close-btn" data-close-modal>×</button></div><section class="v111-trophy-details"><div class="v111-big-emoji">${b.emoji}</div><strong>Why you earned this</strong><p>${esc(b.detail)}</p><small>${esc((b.group||'Achievement').replaceAll('_',' '))} · Earned through your recorded progress</small></section><button class="primary-btn wide" data-close-modal>Back to achievements</button>`);
    document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal);
  }
  function bindTrophies(){
    document.querySelectorAll('[data-trophy-title]').forEach(b=>b.onclick=()=>trophyClick(b.dataset.trophyTitle));
  }
  const oldBind=bindViewEvents;
  bindViewEvents=function(){
    oldBind();
    compactSecondarySections();
    bindTrophies();
  };
  const oldToday=renderToday;
  renderToday=async function(){return oldToday();};
  const oldProgress=renderProgress;
  renderProgress=async function(){
    let html=await oldProgress();if(!isJourneyStarted())return html;
    const latest=await latestMeasurement('weight'),avg7=await sevenDayWeightAverage();
    if(!latest)return html;
    const isToday=latest.date===isoDate();const label=isToday?"THIS MORNING'S WEIGHT":'LATEST RECORDED WEIGHT';
    const loss=state.profile.startWeight!=null?Number(state.profile.startWeight)-Number(latest.value):null;
    const card=`<section class="card v111-latest-weight" aria-label="Actual recorded weight and trend"><div class="metric-label">${label}</div><div class="v111-weight-numbers"><div><strong>${Number(latest.value).toFixed(1)} <small>lb</small></strong><span>${isToday?'Weighed today':fmtDate(latest.date,{day:'numeric',month:'short'})}${loss!=null?` · ${Math.abs(loss).toFixed(1)} lb ${loss>=0?'down':'up'} since Day 1`:''}</span></div><div><span class="metric-label">7-DAY TREND</span><strong>${avg7!=null?avg7.toFixed(1)+' lb':'—'}</strong><span>Smoothed average, not today's number</span></div></div></section>`;
    return card+html;
  };
  // Keep the user-visible daily recognition fresh even when the rest of the app hasn't refreshed.
  const originalRender=render;
  render=async function(){await originalRender();
    const view=state.view;
    if(view==='today')try{await recognition();}catch(err){console.warn('Recognition card skipped',err);}
  };
  window.HealthV111Diagnostics={durDisplay};
})();
