/* v1.1.4 — Day 4: personal closeout, next-day anchor, bedtime and total fluid clarity.
   Presentation changes are data-safe. This script never migrates or clears saved history. */
(()=>{
'use strict';
const today114=()=>isoDate();
const finite114=v=>v===null||v===undefined||v===''?null:Number.isFinite(Number(v))?Number(v):null;
const fmt114=(v,d=0)=>Number(v).toLocaleString('en-GB',{minimumFractionDigits:0,maximumFractionDigits:d});
const date114=d=>fmtDate(d,{weekday:'short',day:'numeric',month:'short'});
const time114=v=>/^\d{2}:\d{2}$/.test(String(v||''))?v:'—';
const support114={
 meals:{label:'Eat three satisfying meals',why:'Breakfast, lunch and dinner with enough food to be comfortable. There is no need to save all your calories for later.'},
 treat:{label:'Include a food I really enjoy',why:'Choose it deliberately alongside regular meals. Enjoyment is allowed in a sustainable plan.'},
 sleep:{label:'Protect sleep and move drinks earlier',why:'Most drinks earlier in the day, sensible rehydration after activity and a calmer evening. Drink when thirsty.'},
 ordinary:{label:'If I drift, make the next meal ordinary',why:'No Monday reset, skipped meals or punishment exercise. One choice is not the whole week.'}
};
const reasons114={hunger:'I am genuinely hungry',freedom:'I miss eating freely',tired:'I am tired',motivation:'My motivation is fading',over:'I have already eaten over target'};

// The existing support_<YYYY-MM-DD> setting is read by the Day 4/5 morning coach.
// The text/action is selected explicitly by the user; don't quietly alter plan calories.
openTomorrowPlanModal=async function(){
 const d=addDays(today114(),1),existing=await HealthDB.get('settings',`support_${d}`)||{};
 const anchor=support114[existing.anchor]?existing.anchor:'meals';
 modal(`<div class="modal-head"><div><h2>🌅 One useful plan for ${esc(date114(d))}</h2><p>Tomorrow's morning check-in will still set your exercise and calorie plan. Tonight, choose one practical action that helps when motivation dips.</p></div><button class="close-btn" data-close-modal>×</button></div>
 <form class="form-grid" id="v114TomorrowForm">
 <div class="field"><label>What might make tomorrow difficult?</label><select name="reason">${Object.entries(reasons114).map(([k,v])=>`<option value="${k}" ${existing.reason===k?'selected':''}>${esc(v)}</option>`).join('')}</select></div>
 <div class="field"><label>Choose one thing to do differently</label><div class="v114-anchor-list">${Object.entries(support114).map(([k,v])=>`<label class="v114-anchor"><input type="radio" name="anchor" value="${k}" ${k===anchor?'checked':''}><span><b>${esc(v.label)}</b><small>${esc(v.why)}</small></span></label>`).join('')}</div></div>
 <section class="v114-plan-preview" aria-live="polite"><strong>Tomorrow's reminder</strong><p id="v114PlanPreview">${esc(support114[anchor].why)}</p></section>
 <div class="field"><label>Optional personal reminder</label><textarea name="note" rows="2" maxlength="240" placeholder="Only if something specific would help">${esc(existing.note||'')}</textarea></div>
 <button class="primary-btn wide" type="submit">Save this for tomorrow</button></form>`);
 const form=document.getElementById('v114TomorrowForm');
 form.querySelectorAll('[name="anchor"]').forEach(el=>el.onchange=()=>{document.getElementById('v114PlanPreview').textContent=support114[el.value]?.why||'';});
 form.onsubmit=async e=>{e.preventDefault();const f=new FormData(form),chosen=f.get('anchor');if(!support114[chosen])return;
   await HealthDB.put('settings',{...existing,id:`support_${d}`,date:d,reason:f.get('reason'),anchor:chosen,note:String(f.get('note')||'').trim(),updatedAt:nowIso()});
   closeModal();toast(`Plan saved for ${date114(d)} — your morning coach will remember`);render();};
};

// Replace the misleading generic note card; don't change planned sessions.
tomorrowPlanCard=async function(){
 const d=addDays(today114(),1),saved=await HealthDB.get('settings',`support_${d}`),a=support114[saved?.anchor];
 const title=a?.label||'Pick one action for tomorrow';
 const body=a?.why||'A short, realistic response to tomorrow’s hunger, tiredness or temptation — not another blank note.';
 return `<section class="card v114-tomorrow-card"><div class="goal-head"><div><div class="metric-label">TOMORROW · ${esc(date114(d))}</div><strong>${esc(title)}</strong></div>${a?'<span class="pill good">SAVED</span>':'<span class="pill">1 MIN</span>'}</div><p>${esc(body)}${saved?.note?` <em>${esc(saved.note)}</em>`:''}</p><button class="secondary-btn" type="button" id="v114TomorrowButton">${a?'Change my support plan':'Choose tomorrow’s support plan'}</button><small>Movement and calorie targets are set in the morning check-in.</small></section>`;
};

// One truthful metric: historical water-only records retain their meaning;
// entries with otherFluidsLitres show the explicit combined sum.
const originalMetric114=todayMetricCards;
todayMetricCards=async function(h){
 const base=await originalMetric114(h),p=state.profile;
 const explicit=h.totalFluidsLitres!=null?finite114(h.totalFluidsLitres):null;
 const calculated=h.otherFluidsLitres!=null&&h.waterLitres!=null?finite114(h.otherFluidsLitres)+finite114(h.waterLitres):null;
 const combined=explicit!=null?explicit:calculated;
 const water=finite114(h.waterLitres),amount=combined!=null?combined:water;
 const label=combined!=null?'TOTAL FLUIDS':'WATER ONLY';
 const explain=combined!=null?`Water + other drinks${p.waterTarget?` · guide ${fmt114(p.waterTarget,2)}L`:''}`:`${p.waterTarget?`Daily guide ${fmt114(p.waterTarget,2)}L`: 'Tap to record drinks'} · includes water only`;
 const replacement=`<div class="metric-card tappable-card" data-open-input="water"><div class="metric-label">${label}</div><div class="metric-value">${amount!=null?`${fmt114(amount,2)}L`:'—'}</div><div class="metric-sub">${esc(explain)}</div></div>`;
 const regex=/<div class="metric-card tappable-card" data-open-input="water"><div class="metric-label">(?:WATER|FLUIDS)<\/div>[\s\S]*?<\/div><\/div>/;
 return regex.test(base)?base.replace(regex,replacement):base;
};

// Show the true stored target wherever the bedroom task is presented. Keep
// next-morning confirmation as the only path to confirming last night's bedtime.
const priorNextWin114=nextWinButton;
nextWinButton=function(next){if(next?.key==='bedtime')return `<button class="secondary-btn" type="button" id="v114BedtimeNext">See target</button>`;return priorNextWin114(next);};
async function bedtimeHelp114(){
 const target=time114(state.profile.bedtimeTarget||'22:30');
 modal(`<div class="modal-head"><div><h2>🌙 Your bedtime target</h2><p>Make the target visible rather than remembering it from setup.</p></div><button class="close-btn" data-close-modal>×</button></div><section class="v114-bedtime-lead"><span>YOUR CURRENT TARGET</span><strong>${esc(target)}</strong><p>This is your chosen target, not a predicted or automatically recorded bedtime.</p></section>
 <div class="notice">Your bedtime is confirmed in <b>tomorrow morning’s check-in</b>, when you know when you actually went to bed. You cannot earn the points early just by tapping the checklist.</div>
 <form id="v114BedtimeForm" class="form-grid"><div class="field"><label>Change bedtime target</label><input type="time" name="bedtime" required value="${esc(target)}"></div><button class="primary-btn wide" type="submit">Save bedtime target</button></form>`);
 document.getElementById('v114BedtimeForm').onsubmit=async e=>{e.preventDefault();const val=e.target.elements.bedtime.value;if(!/^\d{2}:\d{2}$/.test(val))return;
 state.profile={...state.profile,bedtimeTarget:val,updatedAt:nowIso()};await HealthDB.put('profile',state.profile);closeModal();toast(`Bedtime target set to ${val}`);render();};
}
const beforeToday114=renderToday;
renderToday=async function(){
 if(state.profile){const d=HABIT_DEFS.find(x=>x.key==='bedtime');if(d){d.label=`Bedtime target · ${time114(state.profile.bedtimeTarget||'22:30')}`;d.detail='Actual bedtime confirmed in tomorrow morning’s check-in · tap for details';}}
 return await beforeToday114();
};

function streak114(rows,date){const ds=new Set(rows.map(r=>r.date));let n=0;for(let d=date;n<365&&ds.has(d);d=addDays(d,-1))n++;return n;}
function scoreClass114(n){return n>=85?'good':n>=55?'watch':'bad';}
function ratingText114(v){return ({1:'very difficult',2:'difficult',3:'okay',4:'good',5:'great'})[Number(v)]||null;}
function challenge114(c){const ch=c.eveningChallenges||[];return Array.isArray(ch)?ch:[];}
function summary114(ctx){const {r,c,n,h,plan,act,banked,goal}=ctx;
 const score=finite114(r.score)||0,feeling=ratingText114(c.eveningRating??r.rating),ch=challenge114(c);
 let headline,opening;
 if(score>=80&&(ch.includes('motivation')||ch.includes('fatigue')||ch.includes('hunger')||(finite114(c.tomorrowConfidence)!=null&&finite114(c.tomorrowConfidence)<=2)||Number(c.eveningRating??r.rating)<=3)){
  headline='You kept going when it felt difficult.';
  opening=`Your habits were strong${feeling?`, even though you rated the day ${feeling}`:''}. Momentum reflects the actions you took — not how easy those actions felt.`;
 }else if(score>=85){headline='You built another day you can trust.';opening='The useful habits were there today. Enjoy that without feeling obliged to make tomorrow harder.';}
 else if(score>=60){headline='You kept important pieces moving.';opening='Not every target was hit, but this day still counts. Tomorrow can be an ordinary continuation, not a restart.';}
 else {headline='You haven’t lost the progress you banked.';opening='A difficult day is information, not a verdict. Getting back to normal at the next meal or next morning matters more than forcing a perfect score.';}
 const wins=[],notes=[],cal=finite114(n.calories??r.calories),target=finite114(plan.calorieTarget??r.calorieTarget??state.profile.calorieTarget);
 if(cal!=null){const delta=target!=null?Math.round(cal-target):null;wins.push({label:'CALORIES',value:fmt114(cal),sub:delta!=null?(delta===0?'On the planned target':`${Math.abs(delta)} kcal ${delta>0?'above':'below'} target${h.nutrition?' · within planned range':''}`):'Logged today'});}
 const protein=finite114(n.protein??r.protein),proteinGoal=finite114(state.profile.proteinTarget);
 if(protein!=null)wins.push({label:'PROTEIN',value:`${fmt114(protein,1)}g`,sub:proteinGoal!=null?(protein>=proteinGoal?'Target achieved':`${fmt114(proteinGoal-protein,1)}g below target`):'Recorded today'});
 const steps=finite114(h.stepsValue),stepGoal=finite114(state.profile.stepTarget);
 if(steps!=null)wins.push({label:'STEPS',value:fmt114(steps),sub:stepGoal!=null?(steps>=stepGoal?'Above your step target':`${fmt114(stepGoal-steps)} below target`):'Recorded today'});
 if(act.length)wins.push({label:'MOVEMENT',value:`${act.length} session${act.length===1?'':'s'}`,sub:act.slice(0,2).map(a=>a.title||a.subtype||a.type||'Activity').join(' + ')});
 else if(h.training)wins.push({label:'MOVEMENT',value:'Adapted',sub:'Movement/recovery target banked'});
 if(banked>=2)notes.push(`You have ${banked} consecutive day${banked===1?'':'s'} banked. One higher-calorie day will not erase those records.`);
 if(h.learning)notes.push('You completed today’s learning. Understanding how to continue after a wobble matters as much as the numbers.');
 if(act.some(a=>a.type==='gym'&&a.subtype==='Strength'))notes.unshift('A strength session is useful progress while running is restricted.');
 const hunger=finite114(c.hunger),sleep=finite114(c.sleepHours),confidence=finite114(c.tomorrowConfidence),toilet=finite114(c.nightToiletTrips);
 let observation='You logged useful data today. Keep building the record before treating any one day as a pattern.';
 if(ch.includes('motivation')||confidence!=null&&confidence<=2)observation='You flagged lower motivation or confidence ahead. Tomorrow needs satisfying meals and room for flexibility, not another test of willpower.';
 else if(ch.includes('fatigue')||sleep!=null&&sleep<7)observation='You mentioned tiredness or short sleep. That may make appetite and decision-making feel harder tomorrow; protect recovery rather than tightening food rules.';
 else if(ch.includes('hunger')||hunger!=null&&hunger>=4)observation='Hunger is relevant feedback. Plan enough food and review whether your current calorie goal is sustainable if high hunger keeps recurring.';
 else if(ch.includes('injury'))observation='You adapted despite an injury. Comfortable movement and patience matter more than forcing a return to running.';
 if(toilet!=null&&toilet>=3)observation+=' You also recorded frequent night-time toilet trips: try distributing drinks earlier; seek medical advice if they continue.';
 const focus=(support114[goal?.anchor]?.label)||((ch.includes('hunger')||hunger!=null&&hunger>=4)?support114.meals.label:(ch.includes('fatigue')||sleep!=null&&sleep<7)?support114.sleep.label:support114.ordinary.label);
 return {headline,opening,wins:wins.slice(0,4),notes:notes.slice(0,2),observation,focus};
}

// This is a presentation upgrade. It can display an existing v1.1.2 report
// alongside its already-saved check-in, nutrition and habits, but never writes
// to dailyReports unless the user explicitly reopens via the existing control.
async function v114Report(date=today114()){
 const r=await HealthDB.get('dailyReports',date);if(!r)return window.HealthV11?.openCloseDay(date)||openCloseDayModal(date);
 const [n0,h0,c0,plan0,activities,reports]=await Promise.all([
  HealthDB.get('nutrition',date),HealthDB.get('habits',date),HealthDB.get('checkins',`daily_${date}`),HealthDB.get('plans',date),HealthDB.getAll('activities'),HealthDB.getAll('dailyReports')
 ]);
 const n=n0||{},h=h0||{},c=c0||{},plan=plan0||{},act=activities.filter(x=>x.date===date),banked=streak114(reports.filter(x=>x.date>=state.profile.startDate&&x.date<=date),date),
 next=addDays(date,1),saved=await HealthDB.get('settings',`support_${next}`),data=summary114({r,c,n,h,plan,act,banked,goal:saved});
 const feelings=ratingText114(c.eveningRating??r.rating),target=time114(state.profile.bedtimeTarget||'22:30');
 const legacy=Array.isArray(r.missDetails)?r.missDetails:[],closedDate=r.closedAt&&Number.isFinite(Date.parse(r.closedAt))?new Date(r.closedAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'Earlier';
 const score=finite114(r.score)||0;
 modal(`<div class="modal-head"><div><h2>🌙 ${esc(date114(date))} banked</h2><p>${esc(closedDate)} · Day ${Math.max(1,daysBetween(state.profile.startDate,date)+1)} · Your day is saved</p></div><button class="close-btn" data-close-modal>×</button></div>
 <section class="v114-report-hero"><div class="v114-report-eyebrow">YOUR PERSONAL DAY REVIEW</div><h2>${esc(data.headline)}</h2><p>${esc(data.opening)}</p><div class="v114-report-score"><strong>${score}/100</strong><span>Momentum · actions banked${feelings?`<br>How you felt: ${esc(feelings)}`:''}</span></div></section>
 ${data.wins.length?`<section class="v114-report-section"><div class="v114-section-title"><span>🏆 What you actually did</span></div><div class="v114-results">${data.wins.map(w=>`<div><small>${esc(w.label)}</small><strong>${esc(w.value)}</strong><span>${esc(w.sub)}</span></div>`).join('')}</div></section>`:''}
 ${data.notes.length?`<section class="v114-win-notes">${data.notes.map(t=>`<p>✓ ${esc(t)}</p>`).join('')}</section>`:''}
 <section class="v114-report-section"><div class="v114-section-title"><span>💡 What your coach noticed</span></div><p>${esc(data.observation)}</p></section>
 <section class="v114-next-focus"><small>NEXT UP · ${esc(date114(next))}</small><h3>${esc(data.focus)}</h3><p>${saved?.anchor&&support114[saved.anchor]?esc(support114[saved.anchor].why):'Pick one realistic action now. It will appear in your morning coaching rather than becoming a forgotten preparation note.'}</p>${saved?.note?`<p><b>Your reminder:</b> ${esc(saved.note)}</p>`:''}<button class="primary-btn wide" id="v114ReportPlan" type="button">${saved?.anchor?'Review tomorrow’s plan':'Choose tomorrow’s plan'}</button></section>
 <details class="v114-report-details"><summary>More day details</summary><p>Bedtime target: <strong>${esc(target)}</strong>. ${r.bedtimeConfirmed?'Actual bedtime confirmed.':'The actual bedtime is checked the following morning; do not guess it tonight.'}</p>${c.lastMealTime?`<p>Last meal noted at ${esc(c.lastMealTime)}. Timing alone does not determine fat gain.</p>`:''}${legacy.length?`<p>Other opportunities: ${esc(legacy.slice(0,3).map(x=>x.title||x.key||'').filter(Boolean).join(' · '))}</p>`:''}<p>Momentum records what you did. Your evening rating records how you felt. Both matter.</p></details>
 <div class="button-row"><button class="secondary-btn" id="v114Reopen" type="button">Reopen day</button><button class="primary-btn" data-close-modal>Done</button></div>`);
 document.getElementById('v114ReportPlan').onclick=()=>openTomorrowPlanModal();
 document.getElementById('v114Reopen').onclick=async()=>{if(!confirm('Reopen this day for corrections? The saved report is removed and must be generated again.'))return;await HealthDB.remove('dailyReports',date);closeModal();toast('Day reopened for editing');render();};
}
if(window.HealthV11)window.HealthV11.openReport=v114Report;
// v1features already delegates its scoped report function to HealthV11.openReport.

// All event wiring happens after the previous handlers to catch the relevant
// Today row AND the next-easy-win button; don't let a tap prematurely bank sleep.
const priorBind114=bindViewEvents;
bindViewEvents=function(){
 priorBind114();
 const btn=document.getElementById('v114TomorrowButton');if(btn)btn.onclick=()=>openTomorrowPlanModal();
 const next=document.getElementById('v114BedtimeNext');if(next)next.onclick=()=>bedtimeHelp114();
 const row=document.querySelector('.action-row[data-habit="bedtime"]');if(row){
  row.onclick=e=>{e.preventDefault();e.stopPropagation();bedtimeHelp114();};
  const check=row.querySelector('[data-habit-toggle="bedtime"]');if(check){check.setAttribute('aria-label','View bedtime target and confirmation instructions');check.onclick=e=>{e.preventDefault();e.stopPropagation();bedtimeHelp114();};}
 }
 // Catch old standalone bedtime toggle buttons, if a screen renders one.
 document.querySelectorAll('[data-next-habit="bedtime"]').forEach(el=>el.onclick=e=>{e.preventDefault();e.stopPropagation();bedtimeHelp114();});
};
window.HealthV114Diagnostics={summary114,support114,streak114};
})();
