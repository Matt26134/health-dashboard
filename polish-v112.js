/* Health Dashboard v1.1.2 — motivation & reliability improvements.
   Additive UI only. Never clears a database or rewrites banked reports. */
(()=>{
'use strict';
const today=()=>isoDate();
const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v):null;
const friendlyDate=v=>{const date=validDate(v);return date?fmtDate(date,{weekday:'short',day:'numeric',month:'short',year:'numeric'}):null;};
const number=v=>v==null||v===''?null:Number.isFinite(Number(v))?Number(v):null;
const supportText={
  hunger:{title:'Hungry, not failing',text:'Eat proper meals. Add satisfying protein, fibre and carbohydrates rather than trying to get through the day on willpower. A 2 lb/week aim is an upper-end target, not an instruction to ignore persistent hunger.'},
  freedom:{title:'Make room for food you enjoy',text:'Choose a treat deliberately and eat it without guilt. Structure can include flexibility. One enjoyable meal does not wipe out three days of work.'},
  tired:{title:'Sleep is part of the plan',text:'Protect tonight’s sleep. Count tea and milk as fluids, spread drinks earlier and avoid chasing a water target before bed. Avoid compensating for tiredness with stricter eating.'},
  motivation:{title:'No need to restart on Monday',text:'Make the next meal normal. Your previous days remain banked. The goal is returning to the routine quickly, not a perfect streak.'},
  over:{title:'A higher day is a single data point',text:'Keep eating normally at your next meal. No compensatory fasting, guilt or punishment exercise. Continue tomorrow as planned.'}
};
const planText={meals:'Three regular satisfying meals',treat:'Plan one food I genuinely enjoy',sleep:'Protect sleep and drink earlier',ordinary:'If I drift, return at the next meal'};
function supportDate(current){return current===3?addDays(today(),1):today();}
async function supportModal(forTomorrow=false){
  const date=forTomorrow?addDays(today(),1):today();
  const saved=await HealthDB.get('settings',`support_${date}`)||{};
  const reason=saved.reason||'freedom',anchor=saved.anchor||'ordinary';
  modal(`<div class="modal-head"><div><h2>🧭 ${forTomorrow?'Plan for tomorrow':'I’m struggling'}</h2><p>The useful choice is the next one — no Monday reset required.</p></div><button class="close-btn" data-close-modal>×</button></div><form class="form-grid" id="v112SupportForm"><div class="field"><label>What's making this difficult?</label><select name="reason">${Object.entries({hunger:'Genuinely hungry',freedom:'Missing food freedom / craving something',tired:'Tired or poorly slept',motivation:'Fed up / low motivation',over:'Already eaten over target'}).map(([k,v])=>`<option value="${k}" ${k===reason?'selected':''}>${esc(v)}</option>`).join('')}</select></div><section class="v112-support-advice" id="v112SupportAdvice"></section><div class="field"><label>Choose one realistic anchor</label><select name="anchor">${Object.entries(planText).map(([k,v])=>`<option value="${k}" ${k===anchor?'selected':''}>${esc(v)}</option>`).join('')}</select></div><div class="field"><label>Optional personal reminder</label><textarea name="note" maxlength="250" rows="2" placeholder="What would help when the urge arrives?">${esc(saved.note||'')}</textarea></div><button class="primary-btn wide">Save my plan</button></form>`);
  const form=document.getElementById('v112SupportForm'),advice=document.getElementById('v112SupportAdvice');
  const paint=()=>{const item=supportText[form.elements.reason.value];advice.innerHTML=`<strong>${esc(item.title)}</strong><p>${esc(item.text)}</p>`;};
  form.elements.reason.onchange=paint;paint();
  form.onsubmit=async e=>{e.preventDefault();const f=new FormData(form);await HealthDB.put('settings',{id:`support_${date}`,date,reason:f.get('reason'),anchor:f.get('anchor'),note:String(f.get('note')||'').trim(),updatedAt:nowIso()});closeModal();toast('Support plan saved on this device');render();};
}
async function motivationCard(){
  if(!isJourneyStarted()||!state.profile?.startDate)return '';
  const day=Math.max(1,daysBetween(state.profile.startDate,today())+1);
  const future=day===3,focusDate=future?addDays(today(),1):today();
  const [reports,check,previous,plan]=await Promise.all([HealthDB.getAll('dailyReports'),HealthDB.get('checkins',`daily_${today()}`),HealthDB.get('checkins',`daily_${addDays(today(),-1)}`),HealthDB.get('settings',`support_${focusDate}`)]);
  const banked=reports.filter(x=>x.date>=state.profile.startDate&&x.date<=today()).length;
  const hunger=number(check?.hunger??previous?.hunger),sleep=number(check?.sleepHours??previous?.sleepHours),confidence=number(previous?.tomorrowConfidence);
  const early=day>=3&&day<=5;
  let title='',intro='';
  if(future){title='Tomorrow does not have to become a Monday restart';intro='Days 4 and 5 can feel harder once the novelty wears off. Plan satisfying meals and room for something you enjoy now — rather than relying on willpower tomorrow.';}
  else if(day===4){title='Day 4 — this is the bit that counts';intro='The urge to say “sod it, I’ll start Monday” can arrive now. You don’t need a perfect day. You need regular meals, a plan for cravings and a normal next decision if things drift.';}
  else if(day===5){title='Day 5 — keep the weekend in the journey';intro='There is no need to wipe the slate clean on Monday. Plan the food you enjoy, keep the basics steady and let an imperfect meal stay just one meal.';}
  else if(day<=7){title=`Day ${day} — consistency, not restriction`;intro='You are building a routine you can keep when your running returns. Eat enough to support recovery and let your actions build the trend.';}
  else if(confidence!=null&&confidence<=2){title='Yesterday you said today might be hard';intro='You spotted the difficulty early. Choose one realistic anchor rather than demanding a perfect day.';}
  else if(hunger!=null&&hunger>=4){title='High hunger deserves a response';intro='Build a satisfying food plan today. A more sustainable target can beat repeated bouts of restriction and overeating.';}
  else {title='Keep the useful routine going';intro='Protect your energy, your training recovery and the habits that move your long-term trend.';}
  const signals=[];
  if(banked>0)signals.push(`${banked} day${banked===1?'':'s'} banked — not erased by a higher day`);
  if(hunger!=null&&hunger>=4)signals.push('Hunger has been high: plan satisfying food');
  if(sleep!=null&&sleep<7)signals.push('Sleep has been short: avoid making the diet tougher today');
  const nightTrips=number(check?.nightToiletTrips??previous?.nightToiletTrips);
  if(nightTrips!=null&&nightTrips>=3)signals.push('Frequent nighttime toilet trips: move drinks earlier; seek a check if this persists');
  if(confidence!=null&&confidence<=2)signals.push('You flagged low confidence for today');
  const chosen=plan?.anchor&&planText[plan.anchor];
  return `<section class="v112-motivation" aria-label="Daily motivation and resilience"><div class="v112-motivation-top"><span>🔥 ${future?'LOOKING AHEAD':`DAY ${day} · YOUR COACH`}</span>${early?'<span class="v112-phase-label">The first real test</span>':''}</div><h2>${esc(title)}</h2><p>${esc(intro)}</p>${signals.length?`<div class="v112-motivation-signals">${signals.slice(0,3).map(t=>`<span>✓ ${esc(t)}</span>`).join('')}</div>`:''}${chosen?`<div class="v112-selected-plan"><b>Your chosen anchor${future?' for tomorrow':''}</b><span>${esc(chosen)}${plan.note?` · ${esc(plan.note)}`:''}</span></div>`:''}<div class="v112-motivation-actions"><button class="primary-btn" type="button" id="v112Struggling">${future?'Plan tomorrow':'I’m struggling today'}</button><button class="secondary-btn" type="button" id="v112WhyMotivation">Why this approach?</button></div><p class="v112-motivation-foot">The 2 lb/week recovery-phase ambition is an upper limit to reassess against hunger, sleep, training and your multi-week trend — not a daily pass/fail test.</p></section>`;
}
async function achievementDate(b){
  if(!b?.hit)return null;
  const [rawHabits,rawWeights,rawActs,rawLessons,rawInjuries,rawPhotos,rawJournal]=await Promise.all(['habits','measurements','activities','lessons','injuries','photos','journal'].map(x=>HealthDB.getAll(x)));
  const habits=rawHabits.filter(x=>validDate(x.date)&&x.date>=state.profile.startDate).sort((a,z)=>a.date.localeCompare(z.date));
  const weights=rawWeights.filter(x=>x.type==='weight'&&validDate(x.date)&&x.date>=state.profile.startDate).sort((a,z)=>a.date.localeCompare(z.date));
  const acts=rawActs.filter(x=>validDate(x.date)&&x.date>=state.profile.startDate).sort((a,z)=>a.date.localeCompare(z.date));
  const lessons=rawLessons.filter(x=>x.completedAt).sort((a,z)=>String(a.completedAt).localeCompare(String(z.completedAt)));
  const injuries=rawInjuries.filter(x=>validDate(x.startDate)).sort((a,z)=>a.startDate.localeCompare(z.startDate));
  const photos=rawPhotos.filter(x=>validDate(x.date)).sort((a,z)=>a.date.localeCompare(z.date));
  const title=b.title,detail=b.detail||'';
  const nth=(rows,n)=>rows[Math.max(0,n-1)]?.date||null;
  if(title==='Journey begun')return nth(weights,1);
  if(title==='First frame')return nth(photos,1);
  if(title==='Picture the change')return nth(photos,6);
  if(title==='Adapt & continue')return injuries[0]?.startDate||null;
  if(title==='Recovery counts'){const first=injuries[0];return first?habits.find(x=>x.training&&x.date>=first.startDate)?.date||null:null;}
  if(title==='Three Adapted Sessions'){const first=injuries[0];return first?nth(habits.filter(x=>x.training&&x.date>=first.startDate),3):null;}
  if(title==='Back in motion')return injuries.filter(x=>validDate(x.endDate)).map(x=>x.endDate).sort()[0]||null;
  if(title==='In motion')return nth(acts.filter(x=>x.type==='run'),1);
  if(title==='Walk it out')return nth(acts.filter(x=>x.type==='walk'),5);
  if(title==='On your bike')return nth(acts.filter(x=>x.type==='cycle'),5);
  if(title==='Not today, temptation')return rawJournal.filter(x=>x.type==='Temptation resisted'&&validDate(x.date)).map(x=>x.date).sort()[0]||null;
  if(title==='Bounce Back')return rawJournal.filter(x=>x.type==='Bounce back'&&validDate(x.date)).map(x=>x.date).sort()[0]||null;
  if(/weigh-ins/.test(detail))return nth(habits.filter(x=>x.weighIn),parseInt(detail,10));
  if(/supplement days/.test(detail))return nth(habits.filter(x=>x.vitamins),parseInt(detail,10));
  if(/strength session/.test(detail))return nth(acts.filter(x=>x.type==='strength'||(x.type==='gym'&&String(x.subtype).toLowerCase()==='strength')),parseInt(detail,10));
  if(/^\d+ lesson/.test(detail))return (lessons[parseInt(detail,10)-1]?.completedAt||'').slice(0,10)||null;
  if(/lb lost/.test(detail)){const n=parseInt(detail,10),start=Number(state.profile.startWeight);return start?weights.find(x=>start-Number(x.value)>=n)?.date||null:null;}
  if(title==='Madrid weight'||title==='Ultimate'){const target=Number(title==='Madrid weight'?state.profile.madridWeight:state.profile.ultimateWeight);return weights.find(x=>Number(x.value)<=target)?.date||null;}
  return null; // Never invent dates for achievements which cannot be reconstructed.
}
async function openTrophy(title){
  const badges=await derivedBadges(),b=badges.find(x=>x.title===title&&x.hit);if(!b)return;
  const earned=await achievementDate(b),date=friendlyDate(earned);
  modal(`<div class="modal-head"><div><h2>${b.emoji} ${esc(b.title)}</h2><p>Achievement unlocked</p></div><button class="close-btn" data-close-modal>×</button></div><section class="v111-trophy-details"><div class="v111-big-emoji">${b.emoji}</div><strong>Why you earned this</strong><p>${esc(b.detail)}</p><div class="v112-earned-date"><span>🗓️ Earned</span><b>${date||'Original unlock date not available'}</b></div><small>${esc((b.group||'Achievement').replaceAll('_',' '))} · Based on locally recorded progress</small></section><button class="primary-btn wide" data-close-modal>Back to achievements</button>`);
  document.querySelectorAll('[data-close-modal]').forEach(x=>x.onclick=closeModal);
}
async function showAllTrophies(){
  const unlocked=(await derivedBadges()).filter(b=>b.hit);
  modal(`<div class="modal-head"><div><h2>🏆 All earned achievements</h2><p>${unlocked.length} unlocked. Tap any one for details and its recorded earned date.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="v111-trophy-grid v112-all-trophies">${unlocked.map(b=>`<button class="v111-trophy" data-trophy-title="${esc(b.title)}"><span class="v111-trophy-icon">${b.emoji}</span><strong>${esc(b.title)}</strong></button>`).join('')}</div>`);
  document.querySelectorAll('[data-trophy-title]').forEach(b=>b.onclick=()=>openTrophy(b.dataset.trophyTitle));
}
// Preserve the existing water-only value and add optional other drinks separately.
// No migration and no retrospective re-scoring; starting today the completion
// status can be based on total recorded drinks if entered and saved intentionally.
openWaterModal=async function(){
  const h=await habitFor(),target=number(state.profile.waterTarget),other=number(h.otherFluidsLitres)||0;
  modal(`<div class="modal-head"><div><h2>💧 Drinks & sleep</h2><p>Count total drinks, not an extra two litres of plain water on top of tea or milk.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="v112DrinksForm" class="form-grid"><div class="form-grid cols-2"><div class="field"><label>Plain water (L)</label><input name="water" type="number" min="0" step="0.01" inputmode="decimal" value="${h.waterLitres??''}" placeholder="e.g. 1.50"></div><div class="field"><label>Other drinks (L)</label><input name="other" type="number" min="0" step="0.01" inputmode="decimal" value="${other||''}" placeholder="Tea, coffee, milk..."></div></div><div class="quick-water"><button type="button" class="secondary-btn" data-add-water="0.25">+250 ml water</button><button type="button" class="secondary-btn" data-add-water="0.5">+500 ml water</button><button type="button" class="secondary-btn" data-add-water="0.75">+750 ml water</button></div><section class="v112-fluid-total"><strong id="v112FluidTotal">—</strong><span>Total daily drinks${target!=null?` · guide ${target.toFixed(2)} L`:''}</span></section><div class="field"><label>Last substantial drink (optional)</label><input type="time" name="lastLargeDrinkTime" value="${esc(h.lastLargeDrinkTime||'')}"></div><p class="metric-sub">Drink according to thirst and exercise needs. Aim for pale-yellow urine; do not force extra fluid just to meet a target before bed. The older history still records plain-water values.</p><button class="primary-btn wide">Save drinks</button></form>`);
  const form=document.getElementById('v112DrinksForm'),refresh=()=>{const w=number(form.elements.water.value)||0,o=number(form.elements.other.value)||0;document.getElementById('v112FluidTotal').textContent=`${(w+o).toFixed(2)} L`;};
  form.elements.water.oninput=form.elements.other.oninput=refresh;
  document.querySelectorAll('[data-add-water]').forEach(b=>b.onclick=()=>{form.elements.water.value=((number(form.elements.water.value)||0)+Number(b.dataset.addWater)).toFixed(2);refresh();});refresh();
  form.onsubmit=async e=>{e.preventDefault();const water=number(form.elements.water.value),other=number(form.elements.other.value);if(water==null&&other==null){alert('Enter at least one drink amount, or Cancel.');return;}h.waterLitres=water||0;h.otherFluidsLitres=other||0;h.totalFluidsLitres=Number((h.waterLitres+h.otherFluidsLitres).toFixed(2));h.lastLargeDrinkTime=form.elements.lastLargeDrinkTime.value||null;h.water=target!=null&&target>0?h.totalFluidsLitres>=target:false;await saveHabit(h);closeModal();toast('Drinks recorded — no bedtime water-chasing needed');render();};
};
const priorRenderToday=renderToday;
renderToday=async function(){const html=await priorRenderToday();if(!isJourneyStarted())return html;return (await motivationCard())+html;};
const priorBind=bindViewEvents;
bindViewEvents=function(){priorBind();
  const assign=(id,fn)=>{const el=document.getElementById(id);if(el)el.onclick=fn;};
  assign('v112Struggling',()=>supportModal(daysBetween(state.profile.startDate,today())+1===3));
  assign('v112WhyMotivation',()=>modal(`<div class="modal-head"><div><h2>Why the extra motivation?</h2></div><button class="close-btn" data-close-modal>×</button></div><p>The first week is about continuing beyond novelty. We use banked days, your check-ins and optional support plans to respond to hunger, sleep and confidence. A high-hunger day is not an instruction to be stricter.</p><p>Your 2 lb/week initial target is ambitious; actual pace is judged using several weeks of data. Eating adequately and protecting sleep and recovery matter.</p><button class="primary-btn wide" data-close-modal>Got it</button>`));
  assign('v112AllTrophies',showAllTrophies);
  document.querySelectorAll('[data-trophy-title]').forEach(b=>b.onclick=()=>openTrophy(b.dataset.trophyTitle));
  // Ensure even late-bound quick actions use the single edited activity form.
  assign('logActualActivity',()=>openActivityModal());
};
window.HealthV112Diagnostics={achievementDate,supportText,planText};
})();
