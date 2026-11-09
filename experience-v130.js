/* Health Dashboard 1.3.0 — motivation, weekly milestones, precise sleep, body composition,
   screen-time insights. Additive only: reuses the v1.2 IndexedDB schema and does not
   rewrite closed daily reports, old weigh-ins or original bathroom-only sleep records. */
(()=>{
'use strict';
const VERSION='1.3.0',LIB=window.HealthMotivationLibrary;
const day=()=>isoDate(),num=x=>x==null||x===''?null:(Number.isFinite(Number(x))?Number(x):null);
const integer=x=>Number.isInteger(Number(x))&&Number(x)>=0;
const fm=(x,d=0)=>Number(x).toLocaleString('en-GB',{maximumFractionDigits:d});
const niceDate=d=>fmtDate(d,{day:'numeric',month:'short',year:'numeric'});
const yesterday=d=>addDays(d,-1);
const records=store=>HealthDB.getAll(store);
const monday=d=>parseLocal(d).getDay()===1;
const safe=s=>esc(String(s??''));
const nfmt=x=>x==null?'—':fm(x,1);
const weekday=d=>fmtDate(d,{weekday:'long'});
const wkIndex=(date=day())=>Math.max(0,Math.floor(daysBetween(state.profile.startDate||date,date)/7));
const weekBounds=(i)=>({start:addDays(state.profile.startDate,i*7),end:addDays(state.profile.startDate,i*7+6)});
const lastWeekIndex=()=>wkIndex()>=1?wkIndex()-1:null;
async function weekData(i){
 if(i==null||i<0)return null;
 const {start,end}=weekBounds(i);const [reports,activities,habits,weights,photos,checkins]=await Promise.all([records('dailyReports'),records('activities'),records('habits'),weightRows(),records('photos'),records('checkins')]);
 const inside=x=>x.date>=start&&x.date<=end;
 const eligible=weights.filter(x=>x.date<=end),atStart=weights.filter(x=>x.date<=start).at(-1),atEnd=eligible.at(-1);
 const result={index:i,number:i+1,start,end,banked:reports.filter(inside).length,activities:activities.filter(inside),habits:habits.filter(inside),photos:photos.filter(inside),checkins:checkins.filter(x=>inside(x)&&String(x.id).startsWith('daily_')),startWeight:atStart?.value??state.profile.startWeight,endWeight:atEnd?.value??null};
 result.change=result.startWeight!=null&&result.endWeight!=null?+(Number(result.endWeight)-Number(result.startWeight)).toFixed(1):null;
 result.strength=result.activities.filter(a=>a.type==='strength'||a.type==='gym'&&String(a.subtype).toLowerCase()==='strength').length;
 result.movement=result.activities.length;
 result.protein=result.habits.filter(h=>h.protein===true).length;
 result.nutrition=result.habits.filter(h=>h.nutritionLogged===true||h.nutrition===true).length;
 result.lessons=result.habits.filter(h=>h.learning===true).length;
 result.steps=result.habits.filter(h=>num(h.stepsValue)!=null).reduce((a,h)=>a+Number(h.stepsValue),0);
 return result;
}
function weekMilestone(c){const d=c.day||journeyDay();if(!(d>=8&&(d-1)%7===0))return false;const reports=c.reports||[];const prev=addDays(c.date||day(),-7);return reports.filter(r=>r.date>=prev&&r.date<=(c.date?addDays(c.date,-1):addDays(day(),-1))).length>=5;}
function milestonesText(c,w){const completed=c.reports.filter(x=>x.date>=state.profile.startDate&&x.date<c.date).length;return `${completed} completed day${completed===1?'':'s'}`;}
function getCategory(c){
 const d=c.day||journeyDay(),sleep=num(c.c?.sleepHours),hunger=num(c.c?.hunger),energy=num(c.c?.energy),confidence=num(c.lastCheck?.tomorrowConfidence);
 if(weekMilestone(c))return 'week';
 const lastVal=num(c.last?.value),prevVal=num(c.prev?.value),start=num(state.profile.startWeight),loss=start!=null&&lastVal!=null?start-lastVal:0,prevLoss=start!=null&&prevVal!=null?start-prevVal:0;
 if(loss>=5&&Math.floor(loss/5)>Math.floor(prevLoss/5))return 'milestone';
 if(d===10||d===30||d===60||d===90||d===100||d===180)return 'milestone';
 if(d>=3&&d<=5)return 'early';
 if(hunger!=null&&hunger>=4||confidence!=null&&confidence<=2)return 'hunger';
 if(sleep!=null&&sleep<6.5||energy!=null&&energy<=2)return 'fatigue';
 if(c.yesterday&&num(c.yesterday.calories)!=null&&num(c.yesterday.calorieTarget)!=null&&Number(c.yesterday.calories)>Number(c.yesterday.calorieTarget)+100)return 'food';
 if(c.inj&&d%4===0)return 'recovery';
 if(c.b?.actual>0)return 'training';
 if(d>25&&d%17===0)return 'plateau';
 if(c.yesterday?.score!=null&&Number(c.yesterday.score)<40)return 'comeback';
 return 'ordinary';
}
function motivation(c){
 const d=c.day||journeyDay(),ready=!!c.c?.morningCompletedAt,category=getCategory(c);
 if(!ready)return {title:'What would make today manageable?',lead:'Set a realistic day, then let the app help you work with it. You do not need a perfect start.',signals:[],ready:false,category:'setup'};
 const group=LIB.messages[category]||LIB.messages.ordinary;
 const catKeys=Object.keys(LIB.messages),ci=Math.max(0,catKeys.indexOf(category));
 // 48-day repeat cycle inside each context; varied context and week events make long-term repeats rarer.
 const ix=((d*7+ci*13)%group.length),endIx=(Math.floor(d/4)+ci)%4;
 let [title,lead]=group[ix];lead+=' '+LIB.closers[category][endIx];
 const banked=c.reports.filter(x=>x.date>=state.profile.startDate&&x.date<c.date).length;
 if(category==='week'){
  const weeks=Math.floor((d-1)/7);
  title=weeks===1&&banked===7?'One whole week. You actually did it.':`Week ${weeks} completed — ${banked} days banked.`;
  lead=weeks===1&&banked===7?`Seven days completed. It's a new week, and you haven't needed to restart. You kept tracking, adapting and showing up on days when it was less exciting. That's worth celebrating.`:`${banked} days banked so far. Your effort carries into the new week; the score doesn't reset your history. Keep what helped and make room for real life.`;
 }
 if(category==='milestone'){
  const loss=num(state.profile.startWeight)!=null&&num(c.last?.value)!=null?Math.max(0,state.profile.startWeight-Number(c.last.value)):null;
  if(loss!=null&&loss>=5)title=`${Math.floor(loss/5)*5} lb milestone — take the win.`;
  lead=`You've earned a moment to recognise the work behind this milestone. Your latest recorded weight is ${num(c.last?.value)!=null?fm(c.last.value,1)+' lb':'moving in the right direction'}, and you've banked ${banked} days. No need to push harder tomorrow.`;
 }
 const signals=[];
 const support=c.planForTomorrow?.anchor;
 if(support){const labels={meals:'three satisfying meals',treat:'including something enjoyable',sleep:'protecting sleep and spreading fluids earlier',ordinary:'carrying on after an imperfect moment'};signals.push({emoji:'🎯',title:'Your plan for today',detail:`You chose ${labels[support]||'a practical action'}${c.planForTomorrow.note?' — '+c.planForTomorrow.note:''}.`});}
 if(weekMilestone(c))signals.unshift({emoji:'🏆',title:`${Math.floor((d-1)/7)} full week${d===8?'':'s'} behind you`,detail:`${banked} days banked. Your previous week's results remain available in Progress, and today is a good time for comparison photos.`});
 const l=num(c.last?.value),p=num(c.prev?.value);
 if(l!=null&&p!=null&&c.last?.date===c.date&&l<p){
  const drop=p-l;
  const largeEarly=d<=5&&drop>=1;
  const explanation=largeEarly?'Early readings can move quickly, including fluid changes.':d<=7?'Give the trend time to settle.':'The accumulating trend and your logged habits are what matter now.';
  signals.push({emoji:'⚖️',title:weekMilestone(c)?`${fm(l,1)} lb today`:'A new lower weigh-in',detail:`${fm(l,1)} lb, ${fm(drop,1)} lb below your previous recorded weight. ${explanation}`});
 }
 if(num(c.c?.nightWakings)!=null&&num(c.lastCheck?.nightWakings)!=null&&Number(c.c.nightWakings)<Number(c.lastCheck.nightWakings))signals.push({emoji:'🌙',title:'A quieter night',detail:`${c.c.nightWakings} wake-ups compared with ${c.lastCheck.nightWakings} before. Worth monitoring, without assuming why.`});
 if(c.b?.actual>0)signals.push({emoji:'💪',title:'Your food budget has responded',detail:`${fm(c.b.actual)} recorded exercise kcal; +${fm(c.b.actualCredit)} kcal credited, subject to estimate uncertainty.`});
 if(c.inj&&category==='recovery')signals.push({emoji:'🩹',title:'Appropriate recovery counts',detail:`Follow the restrictions in your active ${injuryName(c.inj)} record. This message disappears when it is resolved.`});
 if(!signals.length&&banked>0)signals.push({emoji:'✓',title:`${banked} day${banked===1?'':'s'} in the record`,detail:'Your previous work carries forward even when this morning feels ordinary.'});
 return {title,lead,signals:signals.slice(0,weekMilestone(c)?3:2),ready:true,category};
}

async function photoDue(){
 const index=wkIndex();if(index<1)return null;
 const {start,end}=weekBounds(index),due=start,meta=await HealthDB.get('settings',`photoWeek_${index}`)||{};
 if(meta.skipped||meta.snoozeUntil&&meta.snoozeUntil>day())return null;
 const photos=await records('photos');const baseline=photos.filter(p=>p.date>=state.profile.startDate&&p.date<addDays(state.profile.startDate,7));
 const views=[...new Set(baseline.map(p=>p.view).filter(v=>['Front','Side','Back','Face'].includes(v)))];if(!views.length)views.push('Front','Side','Back','Face');
 const current=photos.filter(p=>p.date>=due&&p.date<=end).map(p=>p.view);const missing=views.filter(v=>!current.includes(v));
 if(!missing.length)return null;
 return {index,due,views,missing,count:views.length-missing.length};
}
function photoHtml(p){return `<section class="card v13-photo-prompt" id="v13PhotoPrompt"><div class="v13-overline">📸 WEEK ${p.index} COMPARISON</div><h3>Capture how far you've come.</h3><p>You took your starting photos ${p.index*7} days ago. A weekly comparison builds a record that becomes useful over months, without expecting dramatic changes every week.</p><div class="v13-tags">${p.views.map(v=>`<span class="${p.missing.includes(v)?'v13-awaiting':'v13-taken'}">${p.missing.includes(v)?'○':'✓'} ${safe(v)}</span>`).join('')}</div><div class="v13-actions"><button class="primary-btn" id="v13AddPhoto">Add photo</button><button class="secondary-btn" id="v13LaterPhoto">Remind in 2 days</button><button class="link-btn" id="v13SkipPhoto">Skip this week</button></div><small>Optional. Skipping doesn't affect Momentum, and photos stay local in your encrypted backup.</small></section>`;}
function reviewHtml(w,compact=false){
 if(!w)return '';
 const change=w.change==null?'—':`${w.change>0?'+':''}${fm(w.change,1)} lb`;
 const weekName=w.number===1?'Your first seven days':`Week ${w.number} — the work you banked`;
 return `<section class="card v13-week-review ${compact?'v13-compact':''}"><div class="v13-overline">🏆 COMPLETED WEEK · ${niceDate(w.start)} – ${niceDate(w.end)}</div><h3>${weekName}</h3><p>Last week's work stays visible even though the new Monday starts a fresh checklist.</p><div class="v13-grid"><div><strong>${w.banked}/7</strong><small>days banked</small></div><div><strong>${change}</strong><small>weight change*</small></div><div><strong>${w.movement}</strong><small>activities logged</small></div><div><strong>${w.lessons}</strong><small>lessons completed</small></div></div><p class="v13-footnote">${w.strength} strength session${w.strength===1?'':'s'} · ${w.nutrition} nutrition-logging day${w.nutrition===1?'':'s'} · ${w.protein} protein-target day${w.protein===1?'':'s'}. *Scale change is not a precise measure of fat lost.</p></section>`;
}
function milestoneHtml(w){
 const change=w.change==null?'—':`${w.change>0?'+':''}${fm(w.change,1)} lb`;
 const title=w.number===1&&w.banked===7?'One whole week. You actually did it.':`Week ${w.number}: ${w.banked} days banked.`;
 const intro=w.number===1&&w.banked===7?`You made it to a new Monday with seven completed days behind you. This is continuation, not another restart.`:`The last seven days are part of your story even when the calendar changes.`;
 return `<section class="card v13-milestone"><div class="v13-overline">🎉 WEEK ${w.number} · A MILESTONE WORTH CELEBRATING</div><h3>${safe(title)}</h3><p>${safe(intro)}</p><div class="v13-grid"><div><strong>${w.banked}/7</strong><small>days banked</small></div><div><strong>${change}</strong><small>recorded weight change*</small></div><div><strong>${w.movement}</strong><small>exercise sessions</small></div><div><strong>${w.lessons}</strong><small>lessons completed</small></div></div><p class="v13-footnote">*Bodyweight change includes normal fluctuations; your nutrition and movement habits are achievements independently of the scale.</p><button class="secondary-btn" id="v13ReviewWeek">Open your Week ${w.number} review</button></section>`;
}
async function newToday(){
 let html=await priorToday130();const launch=await launchState();if(!isJourneyStarted(state.profile)||!launch?.launchedAt)return html;
 const [candidate,p]=await Promise.all([weekData(lastWeekIndex()),photoDue()]);const w=journeyDay()>=8&&(journeyDay()-1)%7===0&&candidate?.banked>=5?candidate:null;
 let extra='';if(w){extra+=milestoneHtml(w);
  // On milestone mornings the hero IS the coach: avoid repeating the same celebration twice.
  html=html.replace(/<section class="card v12-coach">[\s\S]*?<\/section>/,'');
 }
 if(p)extra+=photoHtml(p);
 if(!extra)return html;
 const marker='</header>';const i=html.indexOf(marker);return i>=0?html.slice(0,i+marker.length)+extra+html.slice(i+marker.length):extra+html;
}
const priorToday130=renderToday;
renderToday=newToday;

// Keep the new Monday's in-progress stats, but present the completed week first.
const priorProgress130=renderProgress;
renderProgress=async function(){let html=await priorProgress130();if(!isJourneyStarted(state.profile))return html;
 const [w,composition,screen]=await Promise.all([weekData(lastWeekIndex()),bodyHtml(),screenHtml()]);
 if(w){const priorWeeks=Array.from({length:w.index},(_,i)=>i).reverse();const archive=priorWeeks.length?`<details class="v13-week-archive card"><summary>Browse ${priorWeeks.length} older completed week${priorWeeks.length===1?'':'s'}</summary><div>${priorWeeks.map(i=>`<button class="secondary-btn" data-v13-week="${i}">Week ${i+1} · ${niceDate(weekBounds(i).start)}</button>`).join('')}</div></details>`:'';const block=`<div class="section-title"><h2>Last completed week</h2><span>Saved milestone</span></div>${reviewHtml(w)}${archive}`;
 html=block+html;html=html.replace('<strong>This week\'s review</strong>','<strong>This week so far</strong>');}
 const before='<div class="section-title"><h2>Beyond the scale</h2>';
 if(html.includes(before))html=html.replace(before,composition+screen+before);else html+=composition+screen;
 return html;
};

// Body composition is optional and reported in the same imperial units as the scale.
const compTypes=[['fat_mass','Fat mass'],['muscle_mass','Muscle mass'],['bone_mass','Bone mass']];
const compId=(type,date)=>`v13_${type}_${date}`;
async function latestComp(type){return (await records('measurements')).filter(m=>m.type===type&&num(m.value)!=null).sort((a,b)=>a.date.localeCompare(b.date)).at(-1)||null;}
async function weightOnOrBefore(date){const r=await weightRows();return r.filter(x=>x.date<=date).at(-1)||null;}
async function saveComposition(date,vals){for(const [type] of compTypes){const v=num(vals[type]);if(v==null)continue;if(v<0||v>1000)throw Error('Check body composition values are in pounds.');await HealthDB.put('measurements',{id:compId(type,date),type,date,value:v,unit:'lb',source:'manual/withings',updatedAt:nowIso()});}}
async function bodyHtml(){const [fat,muscle,bone]=await Promise.all(compTypes.map(([t])=>latestComp(t)));const w=fat?await weightOnOrBefore(fat.date):null;const pct=fat&&w&&Number(w.value)>0?100*Number(fat.value)/Number(w.value):null;
 const all=(await records('measurements')).filter(x=>['fat_mass','muscle_mass'].includes(x.type));
 const firstDate=addDays(day(),-28),priorFat=all.filter(x=>x.type==='fat_mass'&&x.date<=firstDate).sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
 const note=fat&&priorFat?`Change versus 4+ weeks ago: ${fm(Number(fat.value)-Number(priorFat.value),1)} lb estimated fat mass. Interpret cautiously; bioimpedance changes with hydration.`:'Build at least four weeks of comparable readings before interpreting fat or muscle changes.';
 return `<div class="section-title"><h2>Body composition</h2><span>Withings · optional</span></div><section class="card v13-body"><div class="v13-grid"><div><strong>${fat?fm(fat.value,1)+' lb':'—'}</strong><small>estimated fat mass</small></div><div><strong>${pct!=null?fm(pct,1)+'%':'—'}</strong><small>estimated body fat*</small></div><div><strong>${muscle?fm(muscle.value,1)+' lb':'—'}</strong><small>estimated muscle mass</small></div><div><strong>${bone?fm(bone.value,1)+' lb':'—'}</strong><small>bone mass (optional)</small></div></div><p class="v13-footnote">${safe(note)} *Calculated from the nearest earlier weight; the scale provides estimates, not direct tissue measurements.</p><button class="secondary-btn" id="v13BodyAdd">Add Withings values (lb)</button></section>`;}
function compInputs(values={}){return `<details class="v13-composition-details"><summary>⚖️ Optional Withings body composition (lb)</summary><p>Enter the values exactly as your scale shows them. Leave blank if you aren't recording them today.</p><div class="form-grid cols-2">${compTypes.map(([type,label])=>`<div class="field"><label>${label} (lb)</label><input type="number" inputmode="decimal" step="any" min="0" max="1000" name="v13_${type}" value="${values[type]??''}" placeholder="From Withings"></div>`).join('')}</div><small>Calculated body-fat percentage is derived from fat mass ÷ your recorded weight. Muscle is recorded independently.</small></details>`;}
async function compositionFor(date){const rows=await records('measurements'),r={};for(const [t] of compTypes)r[t]=rows.find(x=>x.id===compId(t,date))?.value;return r;}
async function openBodyModal(){const date=day(),existing=await compositionFor(date),w=await weightOnOrBefore(date);
 modal(`<div class="modal-head"><div><h2>Body composition</h2><p>Withings values in pounds, saved locally.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="v13CompForm" class="form-grid"><div class="field"><label>Date</label><input type="date" name="date" value="${date}" required></div>${compInputs(existing)}<p>Latest weight for percentage: <b>${w?fm(w.value,1)+' lb':'No weight recorded yet'}</b>. Record bodyweight with your normal weigh-in.</p><button class="primary-btn wide">Save composition</button></form>`);
 const det=document.querySelector('#v13CompForm details');if(det)det.open=true;
 document.getElementById('v13CompForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),d=f.get('date');try{await saveComposition(d,Object.fromEntries(compTypes.map(([t])=>[t,f.get('v13_'+t)])));closeModal();toast('Withings body composition saved in lb');await render();}catch(ex){alert(ex.message);}};
}
// Reuse the original weight form while allowing voluntary composition data.
const originalWeight130=openWeightModal;
openWeightModal=function(){originalWeight130();const form=document.getElementById('weightForm');if(!form)return;
 const button=form.querySelector('button[type="submit"],button:not([type])');button?.insertAdjacentHTML('beforebegin',compInputs());const old=form.onsubmit;
 form.onsubmit=async e=>{if(!form.reportValidity())return;const f=new FormData(form),date=f.get('date'),values=Object.fromEntries(compTypes.map(([t])=>[t,f.get('v13_'+t)]));await old(e);await saveComposition(date,values);await render();};
};

// All v1.2 check-in paths resolve to this one wrapper. Split sleep into exact hours
// and minutes; update hidden legacy hours input just before its existing submit handler.
const originalMorning130=openDailyCheckinModal;
openDailyCheckinModal=async function(){await originalMorning130();const form=document.getElementById('morningForm');if(!form)return;
 const old=form.elements.sleepHours;if(old){
  const saved=await dailyCheckin(day())||{},total=saved.sleepDurationMinutes!=null?Math.round(Number(saved.sleepDurationMinutes)):num(old.value)!=null?Math.round(Number(old.value)*60):null;
  const field=old.closest('.field');if(field){field.insertAdjacentHTML('beforebegin',`<div class="v13-sleep"><div class="modal-section-title">Sleep duration</div><p>Exact hours and minutes — no decimal points.</p><div class="form-grid cols-2"><div class="field"><label>Hours</label><input type="number" inputmode="numeric" name="v13SleepHours" min="0" max="23" step="1" value="${total!=null?Math.floor(total/60):''}" placeholder="7"></div><div class="field"><label>Minutes</label><input type="number" inputmode="numeric" name="v13SleepMinutes" min="0" max="59" step="1" value="${total!=null?total%60:''}" placeholder="53"></div></div><small>Example: 7 hours 53 minutes → stored as 473 minutes.</small></div>`);
   old.type='hidden';old.removeAttribute('min');old.removeAttribute('max');old.removeAttribute('step');field.style.display='none';}
 }
 const sessionRoot=document.getElementById('morningSessions');if(sessionRoot){sessionRoot.insertAdjacentHTML('beforebegin',`<button type="button" id="v13RestDay" class="secondary-btn wide v13-rest">😌 Choose Rest / Recovery day</button><small class="v13-rest-help">A deliberate rest day is a valid plan. You can still log additional activity later.</small>`);
 const rest=document.getElementById('v13RestDay');rest.onclick=()=>{const rows=[...sessionRoot.querySelectorAll('.planned-session')];rows.slice(1).forEach(row=>row.remove());const select=rows[0]?.querySelector('.session-type');if(select){select.value='rest';select.dispatchEvent(new Event('change',{bubbles:true}));}rest.textContent='✓ Rest / Recovery day planned';};}
 const existing=await compositionFor(day());const weight=form.elements.weight?.closest('.field');if(weight)weight.insertAdjacentHTML('afterend',compInputs(existing));
 const oldSubmit=form.onsubmit;
 form.onsubmit=async e=>{const hr=form.elements.v13SleepHours?.value,mn=form.elements.v13SleepMinutes?.value;
  if(hr!==''||mn!==''){
   if(!integer(hr||'0')||!integer(mn||'0')||Number(hr||0)>23||Number(mn||0)>59){e.preventDefault();alert('Sleep minutes must be 0–59 and hours 0–23.');return;}
   const total=Number(hr||0)*60+Number(mn||0);form.elements.sleepHours.value=(total/60).toString();
  }else form.elements.sleepHours.value='';
  if(!form.reportValidity()){e.preventDefault();return;}
  const f=new FormData(form),vals=Object.fromEntries(compTypes.map(([t])=>[t,f.get('v13_'+t)]));
  await oldSubmit(e);const c=await dailyCheckin(day());if(c){c.sleepDurationMinutes=hr!==''||mn!==''?Number(hr||0)*60+Number(mn||0):null;c.updatedAt=nowIso();await HealthDB.put('checkins',c);}
  await saveComposition(day(),vals);await render();
 };
};

async function screenData(){const rows=(await records('checkins')).filter(x=>String(x.id||'').startsWith('daily_')).sort((a,b)=>a.date.localeCompare(b.date));const current=rows.filter(x=>x.date>=addDays(day(),-6)&&x.date<=day());const prior=rows.filter(x=>x.date>=addDays(day(),-13)&&x.date<addDays(day(),-6));
 const mean=(xs,key)=>{const vals=xs.map(x=>num(x[key])).filter(v=>v!=null);return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;};
 return {rows,current,prior,latest:rows.filter(x=>num(x.screenTimeMinutes)!=null).at(-1),avg:mean(current,'screenTimeMinutes'),priorAvg:mean(prior,'screenTimeMinutes'),socialAvg:mean(current,'socialMediaMinutes'),sample:current.filter(x=>num(x.screenTimeMinutes)!=null).length};}
const hm=m=>m==null?'—':`${Math.floor(Number(m)/60)}h ${String(Math.round(Number(m)%60)).padStart(2,'0')}m`;
async function screenHtml(){const x=await screenData();const s=x.latest;
 let insight='Log several days of screen time before interpreting patterns.';
 if(x.sample>=4&&x.avg!=null){insight=x.priorAvg!=null?`Average screen time is ${hm(x.avg)} this week versus ${hm(x.priorAvg)} the previous seven days. This is a trend to explore, not proof of an effect on sleep.`:`${x.sample} days recorded this week. Notice whether later use coincides with shorter sleep, without assuming it caused it.`;}
 return `<div class="section-title"><h2>Sleep & digital balance</h2><span>${x.sample} days recorded</span></div><section class="card v13-screen"><div class="v13-grid"><div><strong>${hm(s?.screenTimeMinutes)}</strong><small>last total screen time${s?' · '+niceDate(s.date):''}</small></div><div><strong>${hm(x.avg)}</strong><small>7-day average</small></div><div><strong>${hm(x.socialAvg)}</strong><small>social media average</small></div><div><strong>${s?.topApp?safe(s.topApp):'—'}</strong><small>last top app</small></div></div><p class="v13-footnote">${safe(insight)}</p><button class="secondary-btn" id="v13ScreenLog">Record today's screen time</button></section>`;}
async function screenModal(){const d=day(),current=await dailyCheckin(d)||{};
 modal(`<div class="modal-head"><div><h2>Digital balance</h2><p>Make the screen-time data useful, not another box to tick.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="v13ScreenForm" class="form-grid"><div class="field"><label>Total screen time (minutes)</label><input name="screenTimeMinutes" type="number" min="0" max="1440" step="1" value="${current.screenTimeMinutes??''}"></div><div class="field"><label>Social media time (minutes)</label><input name="socialMediaMinutes" type="number" min="0" max="1440" step="1" value="${current.socialMediaMinutes??''}"></div><div class="field"><label>Top app (optional)</label><input name="topApp" maxlength="70" value="${safe(current.topApp||'')}" placeholder="e.g. Instagram"></div><div class="field"><label>Top app time (minutes, optional)</label><input name="topAppMinutes" type="number" min="0" max="1440" step="1" value="${current.topAppMinutes??''}"></div><button class="primary-btn wide">Save screen time</button></form>`);
 document.getElementById('v13ScreenForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),total=num(f.get('screenTimeMinutes')),social=num(f.get('socialMediaMinutes'));
  if(total!=null&&social!=null&&social>total){alert('Social time should not be greater than total screen time.');return;}
  const c=await dailyCheckin(d)||{id:`daily_${d}`,date:d};Object.assign(c,{screenTimeMinutes:total,socialMediaMinutes:social,topApp:String(f.get('topApp')||'').slice(0,70),topAppMinutes:num(f.get('topAppMinutes')),updatedAt:nowIso()});await HealthDB.put('checkins',c);closeModal();toast('Digital balance record saved');await render();};
}

const previousBind130=bindViewEvents;
bindViewEvents=function(){previousBind130();
 const on=(id,fn)=>{const el=document.getElementById(id);if(el)el.onclick=fn;};
 on('v13AddPhoto',()=>openProgressPhotoModal());
 on('v13LaterPhoto',async()=>{const x=await photoDue();if(!x)return;await HealthDB.put('settings',{id:`photoWeek_${x.index}`,snoozeUntil:addDays(day(),2)});toast('Photo reminder postponed for two days');await render();});
 on('v13SkipPhoto',async()=>{const x=await photoDue();if(!x)return;await HealthDB.put('settings',{id:`photoWeek_${x.index}`,skipped:true});toast('Weekly photo skipped; your streak is unaffected');await render();});
 on('v13ReviewWeek',async()=>{const w=await weekData(lastWeekIndex());modal(`<div class="modal-head"><div><h2>🏆 Your completed week</h2><p>${safe(niceDate(w.start))} – ${safe(niceDate(w.end))}</p></div><button class="close-btn" data-close-modal>×</button></div>${reviewHtml(w)}<button class="primary-btn wide" data-close-modal>Keep going</button>`);document.querySelectorAll('#modalRoot [data-close-modal]').forEach(b=>b.onclick=closeModal);});
 on('v13BodyAdd',()=>openBodyModal());on('v13ScreenLog',()=>screenModal());
 document.querySelectorAll('[data-v13-week]').forEach(btn=>btn.onclick=async()=>{const w=await weekData(Number(btn.dataset.v13Week));modal(`<div class="modal-head"><div><h2>Week ${w.number} · your history</h2><p>${niceDate(w.start)} – ${niceDate(w.end)}</p></div><button class="close-btn" data-close-modal>×</button></div>${reviewHtml(w)}<button class="primary-btn wide" data-close-modal>Back to Progress</button>`);document.querySelectorAll('#modalRoot [data-close-modal]').forEach(b=>b.onclick=closeModal);});
};
// Central hook called from BOTH Today and the morning briefing (unlike earlier patches).
window.HealthV13={version:VERSION,motivation,weekData,photoDue,bodyHtml,screenData,openBodyModal,screenModal,saveComposition};
})();
