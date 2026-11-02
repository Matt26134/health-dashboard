/* Health Dashboard v1.1.0 Day 2 Edition
   Day-1 feedback release: exact data entry, time-aware bedtime, digital wellbeing,
   rating anchors, lesson locks, weekly photos and accessibility clarity. */
(()=>{
  const RATING_DAY={1:'Really poor',2:'Poor',3:'Okay / mixed',4:'Good',5:'Excellent'};
  const ENERGY={1:'Exhausted',2:'Low',3:'Okay',4:'Good',5:'Full of energy'};
  const HUNGER={1:'Not hungry',2:'Slightly hungry',3:'Normal',4:'Hungry',5:'Very hungry / persistent'};
  const ENJOY={1:'Hated it',2:'Didn’t enjoy it',3:'Neutral',4:'Enjoyed it',5:'Loved it'};
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  const toMinutes=(h,m)=>Math.max(0,(Number(h)||0)*60+(Number(m)||0));
  const splitMinutes=n=>({h:Math.floor((Number(n)||0)/60),m:Math.round((Number(n)||0)%60)});
  const minutesBetween=(actual,target)=>{
    if(!actual||!target)return null;
    const [ah,am]=actual.split(':').map(Number),[th,tm]=target.split(':').map(Number);
    let d=(ah*60+am)-(th*60+tm);
    if(d < -720)d+=1440;
    if(d > 720)d-=1440;
    return d;
  };
  const bedtimeStatus=(actual,target)=>{
    const d=minutesBetween(actual,target);
    if(d==null)return {status:'unlogged',delta:null,label:'Not logged'};
    if(d<=0)return {status:'hit',delta:d,label:'Hit'};
    if(d<=15)return {status:'near',delta:d,label:'Close'};
    return {status:'missed',delta:d,label:'Missed'};
  };
  const durationSeconds=value=>{
    const raw=String(value??'').trim();if(!raw)return null;
    if(!raw.includes(':')){const n=Number(raw);return Number.isFinite(n)&&n>=0?Math.round(n*60):null;}
    const parts=raw.split(':').map(Number);if(parts.some(x=>!Number.isFinite(x)||x<0))return null;
    if(parts.length===2){const [m,s]=parts;if(s>=60)return null;return Math.round(m*60+s);}
    if(parts.length===3){const [h,m,s]=parts;if(m>=60||s>=60)return null;return Math.round(h*3600+m*60+s);}
    return null;
  };
  const formatDuration=min=>{
    const sec=Math.round((Number(min)||0)*60);if(!sec)return '';
    const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
    return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`;
  };
  function setAnchoredOptions(select,map,current){
    if(!select)return;
    select.innerHTML=Object.entries(map).map(([v,l])=>`<option value="${v}" ${Number(current)===Number(v)?'selected':''}>${v} — ${l}</option>`).join('');
  }
  function enhanceCheckinForm(){
    const f=document.getElementById('morningForm');if(!f||f.dataset.day2)return;f.dataset.day2='1';
    setAnchoredOptions(f.elements.energy,ENERGY,f.elements.energy.value);setAnchoredOptions(f.elements.hunger,HUNGER,f.elements.hunger.value);
    const e=f.elements.energy?.closest('.field'),h=f.elements.hunger?.closest('.field');
    if(e)e.insertAdjacentHTML('beforeend','<small class="rating-help">1 = exhausted · 3 = okay · 5 = full of energy</small>');
    if(h)h.insertAdjacentHTML('beforeend','<small class="rating-help">1 = not hungry · 3 = normal · 5 = very hungry / persistent</small>');
  }
  function enhanceActivityForm(){
    const f=document.getElementById('activityFormV1');if(!f||f.dataset.day2)return;f.dataset.day2='1';
    const input=f.elements.durationMinutes;if(input){
      const original=input.value;input.type='text';input.inputMode='numeric';input.placeholder='e.g. 17:41 or 1:05:30';input.value=original?formatDuration(Number(original)):'';
      const field=input.closest('.field');field?.querySelector('label')?.replaceChildren(document.createTextNode('Duration (MM:SS or H:MM:SS)'));
      field?.insertAdjacentHTML('beforeend','<small>Exact time is stored; no rounding to whole minutes.</small>');
      const old=f.onsubmit;f.onsubmit=async e=>{e.preventDefault();const secs=durationSeconds(input.value);if(input.value.trim()&&secs==null){alert('Enter duration as MM:SS, H:MM:SS, or whole minutes.');return;}input.value=secs==null?'':String(secs/60);await old.call(f,e);};
    }
    setAnchoredOptions(f.elements.enjoyment,ENJOY,f.elements.enjoyment.value||'');
  }
  function enhanceWaterForms(){
    ['waterV1','profileV1','dayOneV1','profileForm','dayOneForm'].forEach(id=>{const f=document.getElementById(id);if(!f)return;const x=f.elements?.water||f.elements?.waterTarget;if(x){x.step='0.01';x.inputMode='decimal';}});
  }
  function enhanceCloseWeek(){
    ['closeWeekForm','weeklyReflectionForm'].forEach(id=>{const f=document.getElementById(id);if(!f||f.dataset.day2)return;f.dataset.day2='1';['rating','confidence'].forEach(n=>{const sel=f.elements[n];if(sel&&sel.options.length>=5){const map=n==='rating'?RATING_DAY:{1:'Very low',2:'Low',3:'Unsure',4:'Confident',5:'Very confident'};setAnchoredOptions(sel,map,sel.value);}});});
  }
  function enhanceModal(){enhanceCheckinForm();enhanceActivityForm();enhanceWaterForms();enhanceCloseWeek();}
  const obs=new MutationObserver(()=>enhanceModal());obs.observe(document.getElementById('modalRoot'),{childList:true,subtree:true});

  // Exact activity time wherever activities are summarised.
  if(typeof activityRow==='function'){
    activityRow=function(a){const icons={run:'🏃',strength:'💪',gym:'💪',swim:'🏊',football:'⚽',walk:'🚶',cycle:'🚴',other:'●'};return `<div class="activity-row"><div class="activity-icon">${icons[a.type]||'●'}</div><div><strong>${esc(a.title||a.type)}</strong><small>${fmtDate(a.date,{weekday:'short',day:'numeric',month:'short'})}${a.durationMinutes?` • ${formatDuration(a.durationMinutes)}`:''}${a.avgHr?` • ${a.avgHr} bpm`:''}</small></div><div class="activity-value">${a.distanceMiles?`${round(a.distanceMiles,2)} mi`:(a.type==='strength'||a.type==='gym')?'✓':''}</div></div>`;};
  }

  // Time-aware bedtime check-in; a bedtime cannot be manually banked.
  window.openBedtimeCheckin=async function(date=isoDate()){
    const check=await HealthDB.get('checkins',`daily_${date}`)||{id:`daily_${date}`,date};
    const target=state.profile.bedtimeTarget||'22:30';const prior=bedtimeStatus(check.bedtimeActual,target);
    const history=(await HealthDB.getAll('checkins')).filter(x=>x.date<date&&x.bedtimeActual).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,21);
    const weekday=new Intl.DateTimeFormat('en-GB',{weekday:'long'}).format(new Date(`${date}T12:00:00`));
    const sameDay=history.filter(x=>new Intl.DateTimeFormat('en-GB',{weekday:'long'}).format(new Date(`${x.date}T12:00:00`))===weekday);
    let pattern='';if(sameDay.length>=2){const avgDelta=Math.round(sameDay.reduce((s,x)=>s+(minutesBetween(x.bedtimeActual,target)||0),0)/sameDay.length);if(avgDelta>20)pattern=`${weekday}s have recently averaged ${avgDelta} minutes later than your target. We’ll track whether that is a real routine pattern rather than quietly lowering the standard.`;}
    modal(`<div class="modal-head"><div><h2>🌙 Bedtime check-in</h2><p>Target <strong>${target}</strong>. Log when you expect to get into bed; update it later if reality changes.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="bedtimeDay2" class="form-grid"><div class="field"><label>Expected / actual bedtime</label><input type="time" name="bedtime" value="${check.bedtimeActual||''}" required><small>This is compared automatically with your target. You do not manually award yourself the point.</small></div><div id="bedtimeResult" class="bedtime-result ${prior.status}"></div>${pattern?`<div class="notice"><strong>Pattern spotted</strong><br>${esc(pattern)}</div>`:''}<button class="primary-btn wide">Save bedtime</button></form>`);
    const f=document.getElementById('bedtimeDay2'),out=document.getElementById('bedtimeResult');
    const paint=()=>{const r=bedtimeStatus(f.elements.bedtime.value,target);const d=r.delta,now=new Date(),nowTime=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,targetPassed=date===isoDate()&&minutesBetween(nowTime,target)>0;out.className=`bedtime-result ${r.status==='unlogged'&&targetPassed?'missed':r.status}`;out.innerHTML=r.status==='hit'?`<strong>✓ Target hit</strong><span>${d===0?'Right on target':`${Math.abs(d)} min early`}</span>`:r.status==='near'?`<strong>Close, but not banked</strong><span>${d} min after target</span>`:r.status==='missed'?`<strong>Target missed</strong><span>${d} min late. Tomorrow, focus on what delayed the start of your wind-down rather than “trying harder” at bedtime.</span>`:targetPassed?`<strong>Target time has passed</strong><span>You cannot bank tonight’s ${target} target now. Log the bedtime you expect so we can learn the pattern.</span>`:`<strong>Still available tonight</strong><span>Your target is ${target}. Log the time once you know when you are heading to bed.</span>`;};f.elements.bedtime.oninput=paint;paint();
    f.onsubmit=async e=>{e.preventDefault();const actual=f.elements.bedtime.value,r=bedtimeStatus(actual,target);check.bedtimeActual=actual;check.bedtimeTargetUsed=target;check.bedtimeStatus=r.status;check.bedtimeDeltaMinutes=r.delta;check.updatedAt=nowIso();await HealthDB.put('checkins',check);const h=await habitFor(date);h.bedtime=r.status==='hit';await saveHabit(h);closeModal();toast(r.status==='hit'?'Bedtime target hit':r.status==='near'?'Bedtime logged — close to target':'Bedtime logged — target missed');render();};
  };

  // Future lessons stay locked until their day; completed lessons remain reviewable forever.
  const originalOpenLesson=openLesson;
  openLesson=async function(id){const l=await HealthDB.get('lessons',id);if(!l)return;const day=journeyDay();if(!l.completedAt&&Number(l.day)>day){toast(`Lesson ${l.day} unlocks on its day`);return;}return originalOpenLesson(id);};
  openLessonLibraryModal=async function(){const lessons=(await HealthDB.getAll('lessons')).sort((a,b)=>a.day-b.day),day=journeyDay();modal(`<div class="modal-head"><div><h2>Lesson library</h2><p>Completed lessons stay reviewable. Future lessons unlock on their scheduled day.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="lesson-library">${lessons.map(l=>{const locked=!l.completedAt&&Number(l.day)>day;return `<button class="library-lesson ${l.completedAt?'done':''} ${locked?'locked':''}" data-library-lesson="${l.id}" ${locked?'disabled':''}><span>${l.completedAt?'✓':locked?'🔒':l.day}</span><div><strong>${esc(l.title)}</strong><small>${locked?`Day ${l.day} · locked`: `${esc(l.theme)} • ${estimatedLessonMinutes(l)} min`}</small></div></button>`;}).join('')}</div>`);document.querySelectorAll('[data-library-lesson]:not([disabled])').forEach(b=>b.onclick=()=>openLesson(b.dataset.libraryLesson));};
  const previousRenderLearn=renderLearn;
  renderLearn=async function(){const raw=await previousRenderLearn();const day=journeyDay(),lessons=await HealthDB.getAll('lessons'),future=new Set(lessons.filter(l=>!l.completedAt&&Number(l.day)>day).map(l=>l.id));const holder=document.createElement('div');holder.innerHTML=raw;holder.querySelectorAll('[data-open-lesson]').forEach(el=>{if(future.has(el.dataset.openLesson)){el.disabled=true;el.classList.add('lesson-locked');if(el.tagName==='BUTTON')el.textContent='🔒 Locked';else el.setAttribute('aria-disabled','true');}});return holder.innerHTML;};

  // Photo terminology: Front / Side / Back / Face. Recurring task every 7th journey day.
  const originalPhoto=openProgressPhotoModal;
  openProgressPhotoModal=async function(){await originalPhoto();const f=document.getElementById('photoForm');if(!f)return;const s=f.elements.view;if(s){[...s.options].forEach(o=>{if(o.textContent==='Other')o.textContent=o.value='Face';});}};
  async function weeklyPhotoStatus(date=isoDate()){const d=Math.max(0,daysBetween(state.profile.startDate,date)+1);if(d<1||(d%7)!==0)return null;const photos=(await HealthDB.getAll('photos')).filter(p=>p.date===date);return {due:true,count:photos.length,done:photos.length>0,day:d};}
  const previousRenderToday=renderToday;
  renderToday=async function(){let html=await previousRenderToday();const s=await weeklyPhotoStatus();if(!s)return html;const card=`<section class="card weekly-photo-card ${s.done?'done':''}" id="weeklyPhotoTask"><div class="goal-head"><div><strong>📸 Progress photos</strong><small>${s.done?`${s.count} photo${s.count===1?'':'s'} saved today`:'Every 7 days · Front, Side, Back and Face'}</small></div><span class="pill ${s.done?'good':'watch'}">${s.done?'DONE':'WEEKLY'}</span></div><p>${s.done?'Review or add another view whenever you want.':'Add this week’s photos so visual progress can be compared over time.'}</p><button class="secondary-btn wide">${s.done?'Add / review photos':'Add progress photo'}</button></section>`;const pos=html.indexOf('<div class="section-title"><h2>This week');return pos>=0?html.slice(0,pos)+card+html.slice(pos):html+card;};

  // Digital wellbeing trend on Progress.
  async function digitalSummary(){const all=(await HealthDB.getAll('checkins')).filter(x=>x.date&&x.screenTimeMinutes!=null).sort((a,b)=>b.date.localeCompare(a.date));const now=all.slice(0,7),prev=all.slice(7,14);const avg=a=>a.length?Math.round(a.reduce((s,x)=>s+Number(x.screenTimeMinutes||0),0)/a.length):null;const social=a=>a.length?Math.round(a.reduce((s,x)=>s+Number(x.socialMediaMinutes||0),0)/a.length):null;return {now,avg:avg(now),prev:avg(prev),social:social(now)};}
  const previousRenderProgress=renderProgress;
  renderProgress=async function(){let html=await previousRenderProgress();const d=await digitalSummary();if(d.avg==null)return html;const delta=d.prev==null?null:d.avg-d.prev,fmt=n=>`${Math.floor(n/60)}h ${String(n%60).padStart(2,'0')}m`;const share=d.social!=null&&d.avg?Math.round(d.social/d.avg*100):null,coach=d.social==null?'Log social time separately to identify the most useful lever.':share>=50?`Social use is ${share}% of tracked screen time. If you want to reduce total time, this is currently the clearest place to experiment — try a small cut rather than a blanket phone ban.`:delta!=null&&delta>30?'Total screen time has risen noticeably versus the previous week. Check whether the increase is useful time or drift before changing anything.':'Keep collecting a few days. The coach will look for repeatable links with bedtime, mood and energy.';html+=`<div class="section-title"><h2>Digital wellbeing</h2><span>7-day view</span></div><section class="card digital-wellbeing" id="digitalWellbeingCard"><div class="grid-2"><div class="metric-card"><div class="metric-label">SCREEN TIME AVG</div><div class="metric-value">${fmt(d.avg)}</div><div class="metric-sub">${delta==null?'Building comparison':`${delta>0?'+':''}${delta} min/day vs prior 7`}</div></div><div class="metric-card"><div class="metric-label">SOCIAL AVG</div><div class="metric-value">${d.social==null?'—':fmt(d.social)}</div><div class="metric-sub">${share==null?'Track separately from total use':`${share}% of tracked screen time`}</div></div></div><p class="wellbeing-copy"><strong>Coach:</strong> ${coach}</p><p class="wellbeing-copy">The app treats these as associations, not proof that screen time caused your mood or sleep.</p></section>`;return html;};

  // Add digital wellbeing details to the closed-day report after the existing report renders.
  const previousDailyReport=openDailyReportModal;
  openDailyReportModal=async function(date=isoDate()){await previousDailyReport(date);const r=await HealthDB.get('dailyReports',date),c=await HealthDB.get('checkins',`daily_${date}`);if(!r||!c)return;const hero=document.querySelector('.daily-report-hero');if(!hero)return;const fmt=n=>n==null?'—':`${Math.floor(n/60)}h ${String(n%60).padStart(2,'0')}m`;const status=c.bedtimeStatus||bedtimeStatus(c.bedtimeActual,c.bedtimeTargetUsed||state.profile.bedtimeTarget).status;hero.insertAdjacentHTML('afterend',`<section class="card compact day2-report-extra" style="box-shadow:none"><div class="report-day-grid"><div><span>Bedtime</span><strong>${c.bedtimeActual||'—'} · ${status}</strong></div><div><span>Screen</span><strong>${fmt(c.screenTimeMinutes)}</strong></div><div><span>Social</span><strong>${fmt(c.socialMediaMinutes)}</strong></div></div></section>`);};

  // Final binding layer. Bedtime opens its check-in instead of toggling success.
  const previousBind=bindViewEvents;
  bindViewEvents=function(){previousBind();document.querySelectorAll('[data-habit-toggle="bedtime"],.action-row[data-habit="bedtime"],[data-open-input="bedtime"]').forEach(el=>el.onclick=()=>openBedtimeCheckin());const wp=document.getElementById('weeklyPhotoTask');if(wp)wp.onclick=()=>openProgressPhotoModal();const dw=document.getElementById('digitalWellbeingCard');if(dw)dw.onclick=async()=>{const rows=(await HealthDB.getAll('checkins')).filter(x=>x.date&&(x.screenTimeMinutes!=null||x.socialMediaMinutes!=null||x.bedtimeActual)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,14);modal(`<div class="modal-head"><div><h2>Digital wellbeing</h2><p>Screen habits, bedtime and how the day felt — patterns, not blame.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="wellbeing-history">${rows.length?rows.map(x=>`<div><strong>${fmtDate(x.date,{weekday:'short',day:'numeric',month:'short'})}</strong><span>Screen ${x.screenTimeMinutes==null?'—':`${Math.floor(x.screenTimeMinutes/60)}h ${x.screenTimeMinutes%60}m`} · Social ${x.socialMediaMinutes==null?'—':`${Math.floor(x.socialMediaMinutes/60)}h ${x.socialMediaMinutes%60}m`} · Bed ${x.bedtimeActual||'—'} · Day ${x.eveningRating?`${x.eveningRating}/5`: '—'}</span></div>`).join(''):'<div class="empty">Log a few evenings to build the pattern.</div>'}</div>`);};};

  // Keep exact seconds human-readable in report activity lists created from decimal minutes.
  window.HealthDay2={formatDuration,bedtimeStatus,durationSeconds};
})();
