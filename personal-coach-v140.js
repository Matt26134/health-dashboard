/* Health Dashboard v1.4.0 — Personal Coach
 * Additive in-place interface; HealthDashboardDB remains v5. Never clears, resets,
 * rewrites saved reports, or silently imports/migrates existing records.
 * Personal insights computed locally from existing IndexedDB rows. */
(()=>{
'use strict';
const V='1.4.0', START='2026-11-16';
const all=store=>HealthDB.getAll(store), get=(store,id)=>HealthDB.get(store,id),put=(store,row)=>HealthDB.put(store,row);
const safe=v=>esc(String(v??''));
const val=v=>v==null||v===''||!Number.isFinite(Number(v))?null:Number(v);
const fmt=(v,n=1)=>Number(v).toLocaleString('en-GB',{maximumFractionDigits:n,minimumFractionDigits:n});
const dateLabel=d=>fmtDate(d,{day:'numeric',month:'short',year:'numeric'});
const day=()=>isoDate();
const shortTime=m=>`${Math.floor(m/60)}h ${String(Math.round(m%60)).padStart(2,'0')}m`;
const last=(xs)=>xs[xs.length-1];
const measurementTypes=[['waist','Waist','At the same natural-waist point each time'],['stomach','Stomach','At belly-button level, relaxed'],['hips','Hips','Widest point of hips and bottom'],['chest','Chest','Across chest, at the same level'],['neck','Neck','Just below Adam’s apple'],['thigh','Thigh','Mid-thigh, same leg and landmark'],['upper_arm','Upper arm','Relaxed, same arm and landmark']];
const byDate=(a,b)=>String(a.date||'').localeCompare(String(b.date||''));
const inRange=(d,start,end)=>d>=start&&d<=end;
const weeksSinceStart=(d=day())=>Math.floor(daysBetween(START,d)/7);
const mondayOf=(d=day())=>addDays(START,weeksSinceStart(d)*7);
const diffWord=(n,unit)=>`${fmt(Math.abs(n),1)} ${unit} ${n<0?'down':'up'}`;
async function context(d=day()){
 const [reports,weights,activities,checks,nutrition,habits,injury]=await Promise.all([all('dailyReports'),weightRows(),all('activities'),all('checkins'),all('nutrition'),all('habits'),latestActiveInjury()]);
 const r=reports.filter(x=>x.date<=d).sort(byDate),w=weights.filter(x=>x.date<=d).sort(byDate),a=activities.filter(x=>x.date<=d),c=checks.filter(x=>x.date<=d&&String(x.id||'').startsWith('daily_')).sort(byDate),n=nutrition.filter(x=>x.date<=d),h=habits.filter(x=>x.date<=d);
 return {d,r,w,a,c,n,h,injury,report:r.find(x=>x.date===d)||null,check:c.find(x=>x.date===d)||{},food:n.find(x=>x.date===d)||{},habit:h.find(x=>x.date===d)||{},todayActs:a.filter(x=>x.date===d),weight:last(w),priorWeight:w.length>1?w[w.length-2]:null,banked:r.filter(x=>x.date>=state.profile.startDate).length};
}
function rating(c,r){return Number(c.eveningRating??r?.rating);}
function feeling(c,r){return ({1:'rough',2:'hard',3:'okay',4:'good',5:'great'})[rating(c,r)]||null;}
function cleanChallenges(c){const x=c.eveningChallenges;return Array.isArray(x)?x.filter(t=>!['nothing','none','nothing significant','no_challenge'].includes(String(t).toLowerCase())):[];}
function wins(c){const result=[],p=state.profile;
 if(c.todayActs.length)result.push(c.todayActs.some(x=>x.type==='strength'||x.type==='gym'&&x.subtype==='Strength')?`completed ${c.todayActs.length===1?'a strength session':c.todayActs.length+' activities including strength work'}`:`logged ${c.todayActs.length} ${c.todayActs.length===1?'activity':'activities'}`);
 if(val(c.food.protein)!=null&&val(p.proteinTarget)!=null&&c.food.protein>=p.proteinTarget)result.push(`met your protein target with ${fmt(c.food.protein,1)} g`);
 if(val(c.food.calories)!=null){const target=val(c.report?.calorieTarget??c.food.calorieTarget);if(target!=null&&c.food.calories<=target)result.push('kept nutrition within your calorie budget');else if(target!=null)result.push('logged nutrition accurately, even above budget');else result.push('logged nutrition accurately');}
 if(c.habit.learning)result.push('completed your lesson');
 return result;
}
function leadStory(c,closed=false){
 const p=state.profile,start=val(p.startWeight),loss=start!=null&&val(c.weight?.value)!=null?start-Number(c.weight.value):null,banked=c.banked,feel=feeling(c.check,c.report),win=wins(c),ch=cleanChallenges(c.check);
 const near10=loss!=null&&loss>=8.5&&loss<10,ten=loss!=null&&loss>=10;
 let title,body;
 if(closed){
   if(ten)title=`${fmt(loss,1)} lb down — and another day banked.`;
   else if(feel==='great'||feel==='good')title=`You finished feeling ${feel}. That's worth noticing.`;
   else if(feel==='rough'||feel==='hard')title='You kept the record going on a difficult day.';
   else title=`Day ${Math.max(1,daysBetween(p.startDate,c.d)+1)} is safely in the books.`;
   body=`${win.length?`Today you ${win.slice(0,3).join(', ')}.`:'You recorded another day of your journey.'} ${banked} day${banked===1?'':'s'} banked so far.`;
   if(ch.length)body+=` You identified ${ch.slice(0,2).map(x=>String(x).replace(/_/g,' ')).join(' and ')} as ${ch.length===1?'a challenge':'challenges'} — useful context, not a verdict.`;
   if(near10)body+=` You're ${fmt(10-loss,1)} lb from 10 lb down, but there is no need to rush it.`;
   return {title,body};
 }
 if(ten){title=`You've passed 10 lb down — take the win.`;body=`Your latest recorded weight is ${fmt(c.weight.value,1)} lb. ${banked} days are already in the record. Keep fuelling recovery and training rather than trying to accelerate the loss.`;}
 else if(near10){title=`You're close to your 10 lb milestone.`;body=`${fmt(loss,1)} lb down from the start, with ${banked} days already banked. The early rate can include fluid changes; the habit of turning up matters more than matching it every week.`;}
 else if(banked>=7){title=`${banked} days of evidence, not another fresh start.`;body=`You have ${banked} days in your record${loss!=null?` and a ${fmt(Math.max(0,loss),1)} lb change from your start`:''}. Let's keep what works rather than demanding a more difficult day.`;}
 else {title="Make today's next decision useful.";body='Your plan is a starting point. Record what happens, then adjust calmly rather than chasing a perfect score.';}
 return {title,body};
}
function patterns(c){
 const checkins=c.c,rows=checkins.filter(x=>inRange(x.date,addDays(c.d,-20),c.d)),flags=[];
 const sleep=rows.filter(x=>val(x.sleepDurationMinutes)!=null||val(x.sleepHours)!=null).map(x=>val(x.sleepDurationMinutes)!=null?x.sleepDurationMinutes/60:Number(x.sleepHours));
 const hung=rows.filter(x=>val(x.hunger)!=null);
 const hungry=hung.filter(x=>Number(x.hunger)>=4);
 if(hung.length>=5&&hungry.length>=3&&hungry.length/hung.length>=0.4)flags.push({kind:'hunger',title:'Hunger has been showing up repeatedly',text:`You've marked high hunger on ${hungry.length} of ${hung.length} recent check-ins. Revisit meal satisfaction and the calorie target, especially as training increases; don't respond by cutting food further.`});
 const short=sleep.filter(x=>x<7);
 if(sleep.length>=5&&short.length>=Math.ceil(sleep.length*0.6))flags.push({kind:'sleep',title:'Recovery may deserve priority',text:`${short.length} of ${sleep.length} recorded nights were under seven hours. This is a pattern worth supporting without assuming it explains every difficult day.`});
 const weight=c.w;
 if(weight.length>=8&&val(weight.at(-1)?.value)!=null){const start=val(state.profile.startWeight),loss=start!=null?start-weight.at(-1).value:null;
 if(loss!=null&&loss>=8&&daysBetween(state.profile.startDate,c.d)<22)flags.push({kind:'pace',title:'Fast early weight change — protect your energy',text:`Your recorded change is ${fmt(loss,1)} lb since the start. Early loss can include water and glycogen; there's no need to keep that pace as running builds.`});}
 return flags;
}
function coachCard(c){const story=leadStory(c,false),flags=patterns(c),f=flags.find(x=>x.kind==='hunger')||flags.find(x=>x.kind==='sleep')||flags[0],todayCheck=c.check;
 return `<section class="card v14-coach" id="v14Coach"><div class="v12-card-eyebrow">✦ YOUR PERSONAL COACH</div><h2>${safe(story.title)}</h2><p>${safe(story.body)}</p>${f?`<div class="v14-observation"><strong>🔎 A pattern worth watching</strong><p>${safe(f.text)}</p></div>`:''}${val(todayCheck.hunger)!=null&&Number(todayCheck.hunger)>=4?'<p class="v14-coach-foot">Hunger is information. Fuel and recovery come before a larger deficit.</p>':''}<div class="v12-coach-actions"><button class="secondary-btn" type="button" id="v12Struggling">I'm struggling</button><button class="link-btn" type="button" id="v12BriefWhy">Why this advice?</button></div></section>`;
}
function bankedBanner(c){const story=leadStory(c,true);return `<section class="v12-bank-banner v14-banked"><div><b>✓ Today is banked</b><h3>${safe(story.title)}</h3><p>${safe(story.body)}</p></div><button class="secondary-btn" type="button" id="v12ViewReport">View report</button></section>`;}
function allTips(c){const answers=[],today=c.d;
 const check=c.c.filter(x=>x.date>=addDays(today,-27)),pairs=check.filter(x=>val(x.sleepHours)!=null||val(x.sleepDurationMinutes)!=null).filter(x=>val(x.hunger)!=null);
 if(pairs.length>=8){const short=pairs.filter(x=>(val(x.sleepDurationMinutes)!=null?x.sleepDurationMinutes/60:Number(x.sleepHours))<7),long=pairs.filter(x=>(val(x.sleepDurationMinutes)!=null?x.sleepDurationMinutes/60:Number(x.sleepHours))>=7);
 if(short.length>=3&&long.length>=3){const mean=g=>g.reduce((a,x)=>a+Number(x.hunger),0)/g.length,diff=mean(short)-mean(long);if(Math.abs(diff)>=0.45)answers.push({name:'Sleep and hunger',line:`Average hunger was ${fmt(mean(short),1)}/5 after under-7h nights (${short.length} records), versus ${fmt(mean(long),1)}/5 after longer nights (${long.length}).`,note:'Association only. Other factors could explain the difference.'});}}
 const screen=check.filter(x=>val(x.screenTimeMinutes)!=null&&val(x.bedtimeActual)!=null&&/^\d{2}:\d{2}$/.test(x.bedtimeActual)),screenSorted=[...screen].sort((a,b)=>a.screenTimeMinutes-b.screenTimeMinutes);
 if(screenSorted.length>=10){const cut=Math.floor(screenSorted.length/2),lo=screenSorted.slice(0,cut),hi=screenSorted.slice(-cut);
 const avgBed=g=>g.reduce((a,x)=>{let [h,m]=x.bedtimeActual.split(':').map(Number);return a+((h<12?h+24:h)*60+m);},0)/g.length;
 const d=avgBed(hi)-avgBed(lo);
 answers.push({name:'Screen time and bedtime',line:`On higher-screen-time days, your recorded bedtime averaged ${Math.round(Math.abs(d))} minutes ${d>=0?'later':'earlier'} than on lower-screen-time days (${screen.length} comparable records).`,note:'Observational, self-reported and not a causal finding.'});}
 return answers;
}
async function discoveries(c){const tips=allTips(c),recent=c.r.filter(x=>x.date>=addDays(c.d,-6)&&x.date<=c.d),exercise=c.a.filter(x=>x.date>=addDays(c.d,-6)&&x.date<=c.d),days=recent.length;
 const achievement=days>=4?`${days} of the last 7 days banked${exercise.length?`, with ${exercise.length} activities recorded`:''}.`:c.banked?`${c.banked} completed days in your journey.`:'Your first records will build the foundation for comparisons.';
 const finding=tips[0]||patterns(c)[0];
 const note=finding?.line||finding?.text||'No dependable relationship yet. We need repeated records in both comparison groups rather than forcing a pattern.';
 const next=finding?.name==='Sleep and hunger'?'Try a realistic wind-down routine on two evenings, then check whether hunger or energy feels different.':finding?.name==='Screen time and bedtime'?'Try one earlier phone wind-down and compare your actual bedtime.':'Keep one repeatable habit this week, and add context only when it helps you understand an unusual day.';
 return `<section class="card v14-discoveries"><div class="v14-overline">🔎 YOUR WEEKLY DISCOVERY</div><h3>Three useful things from your records</h3><div class="v14-discovery"><strong>🏆 Something you achieved</strong><p>${safe(achievement)}</p></div><div class="v14-discovery"><strong>🔍 Something we're learning</strong><p>${safe(note)}</p>${finding?.note?`<small>${safe(finding.note)}</small>`:''}</div><div class="v14-discovery"><strong>🎯 One experiment worth trying</strong><p>${safe(next)}</p></div><small>Analysis stays on this device. Small samples reveal possibilities, not causes.</small></section>`;
}

// ---- Non-destructive historical measurements ----
async function weightHistory(){const rows=(await all('measurements')).filter(x=>x.type==='weight').sort((a,b)=>byDate(b,a)||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 modal(`<div class="modal-head"><div><h2>Weight history</h2><p>All individual records, including duplicate dates. Edit a reading without changing its ID or your banked reports.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="v14-history">${rows.map((x,i)=>`<button type="button" class="v14-history-row" data-v14-weight="${safe(x.id)}"><span><b>${safe(dateLabel(x.date))}</b><small>${safe(x.source||'Manual')}${x.note?' · '+safe(x.note):''}</small></span><strong>${fmt(x.value,1)} lb</strong><span>✎</span></button>`).join('')||'<p>No weigh-ins yet.</p>'}</div><button type="button" id="v14NewWeight" class="primary-btn wide">Log a new weigh-in</button>`);
 document.querySelectorAll('[data-v14-weight]').forEach(b=>b.onclick=()=>editWeight(b.dataset.v14Weight));document.getElementById('v14NewWeight').onclick=()=>openWeightModal();
}
async function editWeight(id){const x=await get('measurements',id);if(!x||x.type!=='weight')return;modal(`<div class="modal-head"><div><h2>Correct a weigh-in</h2><p>Edits keep this record's original ID and leave saved daily reports untouched.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="v14EditWeight" class="form-grid"><div class="field"><label>Date</label><input required type="date" name="date" value="${safe(x.date)}" max="${day()}"></div><div class="field"><label>Weight (lb)</label><input required type="number" step="0.1" min="50" max="700" name="weight" value="${safe(x.value)}"></div><div class="field"><label>Note (optional)</label><input name="note" maxlength="240" value="${safe(x.note||'')}"></div><p class="v14-small">Original source: ${safe(x.source||'unknown')}. Editing the first weigh-in does not silently change your starting baseline, and historical reports aren't recalculated.</p><button class="primary-btn wide">Save corrected reading</button><button type="button" class="secondary-btn wide" id="v14BackWeights">Back to history</button></form>`);
 document.getElementById('v14BackWeights').onclick=weightHistory;
 document.getElementById('v14EditWeight').onsubmit=async e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const f=new FormData(e.currentTarget),d=String(f.get('date')),v=Number(f.get('weight'));if(!Number.isFinite(v)||v<50||v>700||d>day())return;
 const dupe=(await all('measurements')).some(y=>y.type==='weight'&&y.date===d&&y.id!==id);
 if(dupe&&!confirm('Another weight record exists on this date. Keep both records?'))return;
 const baseline=d===state.profile.startDate||x.date===state.profile.startDate;
 if(baseline&&!confirm('This may be a baseline weigh-in. Your profile starting weight will stay unchanged. Continue?'))return;
 await put('measurements',{...x,date:d,value:v,note:String(f.get('note')||''),updatedAt:nowIso()});toast('Weight corrected; banked reports unchanged');await weightHistory();};
}
async function photoManager(){const ps=(await all('photos')).sort((a,b)=>byDate(b,a));modal(`<div class="modal-head"><div><h2>Progress photos</h2><p>Edit category, date and note. The actual photographs and their IDs stay unchanged.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="v14-photo-grid">${ps.map(x=>`<button type="button" class="v14-photo-item" data-v14-photo="${safe(x.id)}"><img src="${x.dataUrl}" alt="${safe(x.view)} photo"><span><b>${safe(x.view)}</b><small>${safe(dateLabel(x.date))}</small></span><span>✎</span></button>`).join('')||'<p>No photographs recorded yet.</p>'}</div><div class="button-row"><button class="primary-btn" id="v14PhotoAdd">Add photo</button>${ps.length>=2?'<button class="secondary-btn" id="v14PhotoCompare">Compare two photos</button>':''}</div>`);
 document.querySelectorAll('[data-v14-photo]').forEach(b=>b.onclick=()=>editPhoto(b.dataset.v14Photo));document.getElementById('v14PhotoAdd').onclick=()=>openProgressPhotoModal();const compare=document.getElementById('v14PhotoCompare');if(compare)compare.onclick=()=>window.HealthV11?.photoCompare?.();}
async function editPhoto(id){const x=await get('photos',id);if(!x)return;const views=['Front','Side','Back','Face','Other'];modal(`<div class="modal-head"><div><h2>Edit photograph details</h2><p>Only metadata changes; the original local image is preserved.</p></div><button class="close-btn" data-close-modal>×</button></div><img class="v14-photo-preview" src="${x.dataUrl}" alt="Progress photo"><form class="form-grid" id="v14EditPhoto"><div class="form-grid cols-2"><div class="field"><label>Date</label><input type="date" required name="date" max="${day()}" value="${safe(x.date)}"></div><div class="field"><label>View</label><select name="view">${views.map(v=>`<option ${x.view===v?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="field"><label>Note</label><input name="note" maxlength="240" value="${safe(x.note||'')}"></div><button class="primary-btn wide">Save photo details</button><button class="secondary-btn wide" type="button" id="v14BackPhotos">Back to gallery</button></form>`);
 document.getElementById('v14BackPhotos').onclick=photoManager;document.getElementById('v14EditPhoto').onsubmit=async e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const f=new FormData(e.currentTarget);await put('photos',{...x,date:f.get('date'),view:f.get('view'),note:String(f.get('note')||''),updatedAt:nowIso()});toast('Photo category and details updated');await photoManager();};}

async function selectedTypes(){const x=await get('settings','v14_measurements_preferences');const defaults=['waist','stomach','hips','chest','neck','thigh'];return x?.selected?.length?x.selected.filter(t=>measurementTypes.some(y=>y[0]===t)):defaults;}
async function circumRows(){return (await all('measurements')).filter(x=>x.type==='waist'||String(x.type).startsWith('circumference_')).sort(byDate);}
function measurementName(type){const code=type.replace(/^circumference_/,'');return measurementTypes.find(x=>x[0]===code)?.[1]||type;}
async function measurementsPanel(){const [rows,selected]=await Promise.all([circumRows(),selectedTypes()]);const latest=Object.fromEntries(measurementTypes.map(([key])=>{const t=rows.filter(x=>x.type===`circumference_${key}`||key==='waist'&&x.type==='waist');return [key,last(t)];}));
 const comparison=measurementTypes.map(([k,l])=>{const xs=rows.filter(x=>x.type===`circumference_${k}`||k==='waist'&&x.type==='waist'),recent=last(xs),old=last(xs.filter(x=>x.date<=addDays((recent?.date||day()),-21)));return recent&&old?`${l}: ${diffWord(Number(recent.value)-Number(old.value),'in')} since ${dateLabel(old.date)}`:null;}).filter(Boolean);
 const monday=mondayOf(),week=weeksSinceStart();const due=week>=0&&!rows.some(x=>x.date>=monday&&x.date<=addDays(monday,6)&&x.type.startsWith('circumference_'));
 const meta=due?await get('settings',`v14_measure_prompt_${monday}`):null;
 const prompt=day()<START?`First circumference check-in: Monday ${dateLabel(START)}.`:due&&(!meta?.snoozeUntil||meta.snoozeUntil<=day())&&!meta?.skipped?`It's your measurement week. A relaxed, consistent tape reading will be more useful than chasing a daily change.`:due?'Next measurement check-in can be entered any time this week.':'Measurements recorded for the current week.';
 return `<section class="card v14-measurements" id="v14MeasureCard"><div class="v14-overline">📏 BODY MEASUREMENTS · INCHES</div><h3>See changes beyond the scale</h3><p>${safe(prompt)}</p><div class="v14-mini-grid">${selected.slice(0,4).map(k=>`<div><span>${safe(measurementName(k))}</span><b>${latest[k]?fmt(latest[k].value,1)+' in':'—'}</b></div>`).join('')}</div>${comparison.length?`<div class="v14-observation"><b>Longer-term changes</b><p>${safe(comparison.join(' · '))}</p></div>`:'<p class="v14-small">After at least 3–4 weeks, you’ll see changes by body area. Tape measurements show circumference, not exactly which tissue was lost.</p>'}<div class="button-row"><button class="primary-btn" id="v14MeasureAdd">${day()<START?'Preview measurement form':'Log measurements'}</button><button class="secondary-btn" id="v14MeasureHistory">History & edit</button></div>${day()>=START&&due&&!meta?.skipped&&(!meta?.snoozeUntil||meta.snoozeUntil<=day())?'<button class="link-btn" id="v14MeasureLater">Remind me in 2 days</button>':''}<small>Suggested: Monday mornings, same tape landmarks, relaxed posture and consistent conditions. Optional; no Momentum penalty.</small></section>`;
}
async function openMeasurementsForm(date=day(),editingId=null){const selected=await selectedTypes(),rows=await circumRows(),edit=editingId?rows.find(x=>x.id===editingId):null;
 const available=new Set(selected);if(edit)available.add(edit.type.replace(/^circumference_/,''));
 const current=Object.fromEntries([...available].map(k=>{const x=rows.filter(r=>r.date===date&&(r.type===`circumference_${k}`||k==='waist'&&r.type==='waist')).at(-1);return [k,x?.value??''];}));
 modal(`<div class="modal-head"><div><h2>${edit?'Correct a measurement':'Body measurements'}</h2><p>First scheduled check: Mon 16 Nov. Measure relaxed, with the tape level and snug but not tight.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="v14MeasureForm" class="form-grid"><div class="field"><label>Date</label><input name="date" type="date" min="${START}" max="${day()<START?START:day()}" value="${safe(edit?.date||(date<START?START:date))}" required></div><div class="form-grid cols-2">${measurementTypes.filter(([k])=>available.has(k)).map(([k,l])=>`<div class="field"><label>${safe(l)} (in)</label><input name="m_${k}" type="number" inputmode="decimal" step="0.1" min="5" max="100" value="${safe(current[k])}" placeholder="Optional"></div>`).join('')}</div><p class="v14-small">A blank field leaves any previous value untouched. Correct or remove an individual reading using History & edit. Only enter measurements actually taken.</p><button class="primary-btn wide">Save measurements</button><button class="secondary-btn wide" type="button" id="v14MeasurePref">Choose tracked areas</button></form>`);
 document.getElementById('v14MeasurePref').onclick=()=>measurementPreferences();
 document.getElementById('v14MeasureForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),d=String(f.get('date'));
 if(d<START||d>day()){alert('Measurements begin Monday 16 November. You can preview the form before then, but not record future measurements.');return;}
 const updates=measurementTypes.filter(([k])=>available.has(k)&&f.get(`m_${k}`)!=='').map(([k])=>[k,Number(f.get(`m_${k}`))]);
 if(!updates.length){alert('Enter at least one measurement.');return;}
 if(updates.some(([,v])=>!Number.isFinite(v)||v<5||v>100)){alert('Check the circumference measurements (5–100 inches).');return;}
 // Update existing same-date v1.4 rows in place, never alter legacy waist baselines.
 const existing=await circumRows();for(const [k,v] of updates){const storedId=`v14_circumference_${k}_${d}`,old=existing.find(x=>x.type===`circumference_${k}`&&x.date===d),id=old?.id||storedId;await put('measurements',{...old,id,type:`circumference_${k}`,date:d,value:v,unit:'in',source:'manual',createdAt:old?.createdAt||nowIso(),updatedAt:nowIso()});}
 closeModal();toast(`${updates.length} measurements saved, with history preserved`);await render();};
}
async function measurementPreferences(){const chosen=new Set(await selectedTypes());modal(`<div class="modal-head"><div><h2>Which areas shall we track?</h2><p>You can change the list at any time. Historical readings will remain.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="v14MeasurePrefs" class="form-grid">${measurementTypes.map(([k,l,hint])=>`<label class="v14-pref-line"><input type="checkbox" name="type" value="${k}" ${chosen.has(k)?'checked':''}><span><b>${safe(l)}</b><small>${safe(hint)}</small></span></label>`).join('')}<button class="primary-btn wide">Save tracked areas</button></form>`);document.getElementById('v14MeasurePrefs').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),selected=f.getAll('type');if(!selected.length){alert('Choose at least one area.');return;}await put('settings',{id:'v14_measurements_preferences',selected,updatedAt:nowIso()});await openMeasurementsForm();};}
async function measurementHistory(){const rows=(await circumRows()).sort((a,b)=>byDate(b,a));modal(`<div class="modal-head"><div><h2>Circumference history</h2><p>Tap a reading to correct or remove it. Existing baseline waist entries are preserved unless you explicitly change them.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="v14-history">${rows.map(x=>`<button type="button" class="v14-history-row" data-v14-circ="${safe(x.id)}"><span><b>${safe(measurementName(x.type))}</b><small>${safe(dateLabel(x.date))}</small></span><strong>${fmt(x.value,1)} in</strong><span>✎</span></button>`).join('')||'<p>No circumference readings yet. First scheduled date: 16 November.</p>'}</div><button class="primary-btn wide" id="v14NewMeasurements">Add measurements</button>`);document.querySelectorAll('[data-v14-circ]').forEach(b=>b.onclick=()=>editCircumference(b.dataset.v14Circ));document.getElementById('v14NewMeasurements').onclick=()=>openMeasurementsForm();}
async function editCircumference(id){const x=await get('measurements',id);if(!x||x.type!=='waist'&&!x.type.startsWith('circumference_'))return;modal(`<div class="modal-head"><div><h2>Edit ${safe(measurementName(x.type))}</h2><p>Make a correction without changing other readings.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="v14EditCirc" class="form-grid"><div class="field"><label>Date</label><input type="date" name="date" required max="${day()}" value="${safe(x.date)}"></div><div class="field"><label>Inches</label><input type="number" name="value" required step="0.1" min="5" max="100" value="${safe(x.value)}"></div><button class="primary-btn wide">Save correction</button><button type="button" class="secondary-btn wide" id="v14DeleteCirc">Delete only this reading</button></form>`);document.getElementById('v14EditCirc').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);await put('measurements',{...x,date:String(f.get('date')),value:Number(f.get('value')),updatedAt:nowIso()});toast('Measurement corrected');await measurementHistory();};document.getElementById('v14DeleteCirc').onclick=async()=>{if(!confirm('Permanently remove this one circumference reading? Other records and photos remain unchanged.'))return;await HealthDB.remove('measurements',id);toast('Selected reading deleted');await measurementHistory();};}

// ---- A quicker, more varied, apply-first lesson experience. All 174 stored
// lessons and legacy completion timestamps stay intact; no re-seeding occurs.
const scenarios={
  1:['Tomorrow the scale is up 1 lb after a consistent week. What do you want to learn first?',['Whether the weekly trend moved','Whether I need a much bigger deficit','Whether yesterday was perfect'],['Good: the trend and recent training context provide more information than one morning.','A drastic change after one reading removes the chance to see the actual trend.','Perfection is not needed for a useful weight trend.']],
  3:['You have already exceeded your target at lunch. What should the evening be about?',['A satisfying ordinary dinner','Saving all food until tomorrow','A hard workout to offset lunch'],['Ordinary eating is a valuable bounce-back skill.','Compensatory restriction can make tomorrow harder.','Exercise is training, not punishment.']],
  12:['Your first full week is complete. What would make next week easier?',['Keep the one routine that worked','Change everything to maintain motivation','Increase the deficit because the scale moved'],['Good. A useful weekly review protects working habits.','Changing everything removes your ability to identify what worked.','The initial rate can contain water loss; do not chase it.']],
  13:['Monday is coming. Which tiny Sunday action would remove the most friction?',['Choose one specific meal or training cue','Write an ambitious seven-day pledge','Leave Monday to motivation'],['Specific cues are easier to repeat and review.','Big promises often need ideal conditions.','Motivation varies; make the useful option convenient.']],
  14:['A hard gym session adds activity to a day with a calorie deficit. What deserves attention?',['Fuel and recovery as well as the target','Ignore exercise and eat as little as possible','Eat every calorie the wearable claims without checking'],['Yes: a calorie target is an estimate, especially when training increases.','Under-fuelling can make recovery and later sessions harder.','Wearable energy estimates are imprecise; use them provisionally.']],
  15:['After a poor night of sleep you feel hungrier. Which change would you test?',['A more satisfying lunch and an easier evening','Eliminate snacks indefinitely','Assume sleep is definitely the sole cause'],['A small test is more informative than a rigid rule.','All-or-nothing changes tell you little and can increase hunger.','Sleep and appetite may be linked; one night does not establish causality.']],
  16:["You've lost weight but your gym sessions are getting harder. What matters most?",['Review fuelling and training load','Treat faster weight loss as proof all is well','Add harder exercise to boost momentum'],['Performance and recovery are valuable data alongside the scale.','Weight alone cannot show you are adequately fuelled.','More training is not automatically the best intervention.']],
  17:['A weekend has an unexpectedly indulgent meal. What happens next?',['Enjoy it and return to ordinary eating','Skip the next two meals','Declare the weekend a write-off'],['This is the no-Monday-reset skill in practice.','Punishment can amplify the cycle.','One meal does not decide the weekend.']],
  18:['The step target is missed despite a good strength session. How should the day be judged?',['Look at the wider pattern and capacity','Discard the whole day as poor','Double steps tomorrow regardless of recovery'],['Different training modes contribute useful work.','One missed checkbox need not define the day.','Recovery needs to influence tomorrow, too.']],
  19:['Your waist measurement is lower but weight is unchanged. What is the sensible interpretation?',['Compare consistent measurements over several weeks','Assume exact local fat loss','Treat the tape reading as incorrect'],['Circumference can add context but does not measure precise fat loss.','Tape readings include variation and tissue other than fat.','One reading is not enough to establish error.']],
  20:['You want an insight from your data after twelve days. What evidence is enough?',['Look for repeat observations and uncertainty','Treat every comparison as a proven cause','Choose the biggest number as the main insight'],['Sample size and context help avoid overconfidence.','Association is not proof of cause.','Eye-catching numbers are not automatically useful.']]
};
function scenarioFor(l){if(scenarios[l.day])return scenarios[l.day];
 const t=(l.theme||'').toLowerCase(),base=(l.action||l.summary||'').replace(/^Test one small version of this idea today:\s*/i,'').slice(0,160).replace(/\.$/,'');
 if(/review/i.test(t)||/review/i.test(l.title))return [`For “${l.title}”, which evidence would you trust most in your weekly review?`,['A repeatable pattern across days','The last frustrating moment','A single unusually good reading'],['Repeated evidence makes a steadier review.','The most emotional moment may not represent the week.','One reading is too noisy for a whole-week verdict.']];
 if(/train|run|race|madrid|fuel|perform/i.test(t+' '+l.title))return [`You're applying “${l.title}”. Training and recovery pull in different directions. What will you check?`,['The session demand, recovery and fuel together','Only the weight recorded tomorrow','Whether I can make every session harder'],['That gives you a more complete performance picture.','Tomorrow’s scale alone does not measure fuelling adequacy.','Progress requires recovery, not just harder sessions.']];
 return [`Try this principle: “${base}.” How will you find out whether it helps you?`,['Choose a small observable experiment','Apply it rigidly every day regardless of context','Change five habits simultaneously'],['A small repeatable test makes your own experience useful evidence.','Context and recovery matter; rigid rules can backfire.','Multiple changes make it hard to know which one helped.']];
}
async function interactiveLesson(id){const l=await get('lessons',id);if(!l)return;if(l.day>journeyDay()&&!l.completedAt){alert(`Day ${l.day} unlocks on ${dateLabel(addDays(state.profile.startDate,l.day-1))}.`);return;}
 const [question,choices,feedback]=scenarioFor(l);const sections=l.sections||[],sourceRows=l.sources||[];
 const optionOrder=choices.map((_,i)=>i);for(let i=optionOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[optionOrder[i],optionOrder[j]]=[optionOrder[j],optionOrder[i]];}
 modal(`<div class="modal-head"><div><h2>${safe(l.title)}</h2><p>Day ${l.day} · an applied learning challenge · ~3 min</p></div><button class="close-btn" data-close-modal>×</button></div><section class="v14-lesson-hero"><div class="v14-overline">🧠 THE IDEA IN ONE MINUTE</div><p>${safe(l.summary||'Learn one useful idea and test it in real life.')}</p></section><section class="v14-lesson-challenge"><div class="v14-overline">YOUR DECISION</div><h3>${safe(question)}</h3><div class="v14-lesson-choices">${optionOrder.map((idx,i)=>`<button type="button" class="v14-choice" data-v14-choice="${idx}"><span>${String.fromCharCode(65+i)}</span>${safe(choices[idx])}</button>`).join('')}</div><div id="v14LessonFeedback" aria-live="polite"></div></section><details class="v14-lesson-evidence"><summary>Explore the evidence and original lesson</summary>${sections.slice(0,5).map(x=>`<h4>${safe(x.heading)}</h4><p>${safe(x.text)}</p>`).join('')}${sourceRows.length?`<h4>Sources</h4>${sourceRows.map(s=>{const m=lessonSourceMeta(s);return m.url?`<p><a href="${safe(m.url)}" target="_blank" rel="noopener">${safe(m.label)}</a></p>`:`<p>${safe(m.label)}</p>`;}).join('')}`:''}</details><section class="v14-lesson-apply"><h3>Make it yours</h3><p>${safe(l.action||'Choose one small action you could try in your own routine.')}</p><div class="v14-apply-choices"><label><input type="radio" name="v14Apply" value="try"> I'll try a small experiment</label><label><input type="radio" name="v14Apply" value="already"> I've already applied this</label><label><input type="radio" name="v14Apply" value="later"> Useful to revisit later</label></div><label class="v14-small" for="v14LessonNote">My experiment or takeaway (optional)</label><textarea id="v14LessonNote" maxlength="300" rows="2" placeholder="One sentence for future me..."></textarea></section><button class="primary-btn wide" id="v14LessonComplete" type="button" ${l.completedAt?'':'disabled'}>${l.completedAt?'Completed ✓ · Back':'Choose an option and an application to finish'}</button>`);
 let option=null,apply=null;const btn=document.getElementById('v14LessonComplete');const setButton=()=>{btn.disabled=!l.completedAt&&(option==null||!apply);btn.textContent=l.completedAt?'Completed ✓ · Back':btn.disabled?'Make your choice and pick an application':'Bank what you learned +5';};
 document.querySelectorAll('[data-v14-choice]').forEach(b=>b.onclick=()=>{option=Number(b.dataset.v14Choice);document.querySelectorAll('[data-v14-choice]').forEach(x=>x.classList.toggle('selected',x===b));document.getElementById('v14LessonFeedback').innerHTML=`<div class="v14-lesson-result"><b>${option===0?'Good reasoning':'A useful trade-off to consider'}</b><p>${safe(feedback[option])}</p></div>`;setButton();});
 document.querySelectorAll('input[name="v14Apply"]').forEach(x=>x.onchange=()=>{apply=x.value;setButton();});
 btn.onclick=async()=>{if(l.completedAt){closeModal();return;}if(option==null||!apply)return;
 // A new optional local reflection. Never overwrite an older completion timestamp.
 const note=String(document.getElementById('v14LessonNote').value||'').trim();const now=nowIso();await put('lessons',{...l,completedAt:now,experienceV14:{choice:option,application:apply,note,completedAt:now}});
 const h=await habitFor();h.learning=true;await saveHabit(h);closeModal();toast('Lesson applied and banked +5 Momentum');await render();};
}

// ---- UI integration. Original render/bind functions still operate normally. ----
const prevToday=renderToday;
renderToday=async function(){let html=await prevToday();if(!isJourneyStarted(state.profile))return html;const c=await context(),closed=!!c.report;
 if(closed){html=html.replace(/<section class="v12-bank-banner">[\s\S]*?<\/section>/,bankedBanner(c));
   html=html.replace(/(<h2>Day \d+ <span>· )\d+( banked<\/span><\/h2>)/,`$1${c.banked}$2`);
   const photo=html.match(/<section class="card v13-photo-prompt"[\s\S]*?<\/section>/);
   if(photo){html=html.replace(photo[0],'');html=html.replace(/(<section class="v12-bank-banner v14-banked">[\s\S]*?<\/section>)/,`$1${photo[0]}`);}
   // The morning-planning coach is no longer relevant after the day is banked.
   html=html.replace(/<section class="card v12-coach">[\s\S]*?<\/section>/,'');
 }else if(c.check?.morningCompletedAt){html=html.replace(/<section class="card v12-coach">[\s\S]*?<\/section>/,coachCard(c));}
 return html;
};
const prevProgress=renderProgress;
renderProgress=async function(){let html=await prevProgress();if(!isJourneyStarted(state.profile))return html;const c=await context();const newBlock=`<section class="card v14-history-actions"><div class="v14-overline">YOUR RECORDS · YOU CONTROL THEM</div><h3>Weight and photo history</h3><p>Browse or correct previous entries without resetting progress or rewriting banked reports.</p><div class="button-row"><button class="secondary-btn" id="v14Weights">Weight history & edit</button><button class="secondary-btn" id="v14Photos">Photos & categories</button></div></section>${await measurementsPanel()}${await discoveries(c)}`;
 const weightDays=new Set(c.w.map(x=>x.date));
 if(weightDays.size<21||daysBetween(state.profile.startDate,day())<28){html=html.replace(/(<div class="metric-label">MADRID FORECAST<\/div><div class="metric-value forecast-date">)[\s\S]*?(<\/div><div class="metric-sub">)[\s\S]*?(<\/div>)/, '$1—$2Early trend: no reliable target-date forecast yet$3');}
 const after='</section>';const idx=html.indexOf(after);return idx>=0?html.slice(0,idx+after.length)+newBlock+html.slice(idx+after.length):newBlock+html;
};
const prevBind=bindViewEvents;
bindViewEvents=function(){prevBind();const attach=(id,fn)=>{const x=document.getElementById(id);if(x)x.onclick=fn;};
 attach('v14Weights',weightHistory);attach('v14Photos',photoManager);attach('v14MeasureAdd',()=>openMeasurementsForm());attach('v14MeasureHistory',measurementHistory);
 attach('v14MeasureLater',async()=>{const m=mondayOf();await put('settings',{id:`v14_measure_prompt_${m}`,snoozeUntil:addDays(day(),2),updatedAt:nowIso()});toast('Measurement reminder delayed two days');await render();});
 if(state.view==='today'){
 // Preserve the existing action behaviour after updating the coach's text.
 attach('v12ViewReport',()=>window.HealthV11?.openReport?.(day()));
 }
};
openLesson=interactiveLesson;
openPhotoGalleryModal=photoManager;
// Update the stored presentation of reports only at view time (never mutate an
// already banked dailyReport record). Retain the existing report and reopen controls.
if(window.HealthV11?.openReport){const previousReport=window.HealthV11.openReport;
 window.HealthV11.openReport=async function(d=day()){
  await previousReport(d);const root=document.getElementById('modalRoot');if(!root)return;const c=await context(d),story=leadStory(c,true);
  const card=root.querySelector('.v114-report-hero');if(card){const h=card.querySelector('h2'),p=card.querySelector('p');if(h)h.textContent=story.title;if(p)p.textContent=story.body;}
  const notice=root.querySelector('.v114-win-notes');if(notice){const bad=[...notice.querySelectorAll('p')].filter(x=>/One higher-calorie day will not erase/i.test(x.textContent)&&!(val(c.report?.calories)!=null&&val(c.report?.calorieTarget)!=null&&Number(c.report.calories)>Number(c.report.calorieTarget)));bad.forEach(el=>el.remove());}
  const observation=root.querySelector('.v114-report-section .v114-section-title + p');if(observation){const ch=cleanChallenges(c.check),sleep=val(c.check.sleepDurationMinutes)!=null?c.check.sleepDurationMinutes/60:val(c.check.sleepHours),hunger=val(c.check.hunger);
  if(ch.includes('hunger'))observation.textContent='You marked hunger as difficult. A satisfying meal and a review of the energy target are more useful than stricter rules.';
  else if(ch.includes('fatigue'))observation.textContent='You reported tiredness. Consider an easier recovery plan tomorrow, without compensating through food restriction.';
  else if(sleep!=null&&sleep<7)observation.textContent=`You recorded ${fmt(sleep,1)} hours of sleep. That is worth observing alongside hunger and energy; you did not necessarily report feeling tired.`;
  else if(ch.length===0)observation.textContent='You did not flag any major difficulty. Notice the routines that made today feel manageable; there is no need to invent a problem to solve.';}
 };
}
window.HealthV14={version:V,context,leadStory,patterns,allTips,discoveries,measurementTypes,selectedTypes,measurementsPanel,weightHistory,photoManager,measurementHistory,interactiveLesson};
})();
