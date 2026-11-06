/* Health Dashboard 1.2.0 — cohesive daily experience.
   Uses the existing IndexedDB stores, never clears data or rewrites banked days.
   A recalculation of the *current open day* is deliberate and reversible by later input edits. */
(()=>{
'use strict';
const V='1.2.0';
const today=()=>isoDate();
const safeNum=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
const fmt=(v,d=0)=>Number(v).toLocaleString('en-GB',{maximumFractionDigits:d});
const dayDate=d=>fmtDate(d,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const unique=a=>[...new Set(a)];
const sameType=(a,s)=>{const t=a.type==='strength'?'gym':a.type;return t===s.type;};
const sameSubtype=(a,s)=>String(a.subtype||'').trim().toLowerCase()===String(s.subtype||'').trim().toLowerCase();
const allAct=async d=>(await HealthDB.getAll('activities')).filter(a=>a.date===d);
const banked=async d=>!!await HealthDB.get('dailyReports',d);
const clamp120=(x,a,b)=>Math.max(a,Math.min(b,x));
const activeInjury=async()=>latestActiveInjury();

function burnCalories(a,weightLb){
 const raw=safeNum(a.activeCalories??a.caloriesBurned??a.calories);
 if(!(raw>0))return {amount:0,flag:'missing'};
 const basis=a.calorieBasis||'unspecified';
 if(basis==='total'){
  // A 1-MET approximation only; makes the total-vs-active distinction explicit.
  const seconds=safeNum(a.durationSeconds)??((safeNum(a.durationMinutes)||0)*60);
  const kg=(safeNum(a.weightAtActivity)||safeNum(weightLb)||0)*0.453592;
  const resting=kg>0&&seconds>0?kg*seconds/3600:0;
  return {amount:Math.max(0,raw-resting),flag:resting>0?'total-adjusted':'total-unknown',resting:Math.round(resting)};
 }
 return {amount:raw,flag:basis==='active'?'active':'unconfirmed'};
}
function matchPlans(activities,sessions){
 const matched=new Map(),used=new Set();
 // Explicit links always win. An activity can fulfil only one planned session.
 for(const [i,s] of sessions.entries()){
  const j=activities.findIndex((a,k)=>!used.has(k)&&((s.id&&a.plannedSessionId===s.id)||(s.actualActivityId&&a.id===s.actualActivityId)));
  if(j>=0){matched.set(i,j);used.add(j);}
 }
 // Conservative implicit match: a completed session of the same activity subtype,
 // then the same activity type. Never count that activity as extra training too.
 for(const strict of [true,false])for(const [i,s] of sessions.entries()){
  if(matched.has(i))continue;
  const options=activities.map((a,j)=>({a,j})).filter(({a,j})=>!used.has(j)&&sameType(a,s)&&(strict?sameSubtype(a,s):true));
  if(options.length){matched.set(i,options[0].j);used.add(options[0].j);}
 }
 return {matched,used};
}
async function budget(date=today(),options={}){
 const [plan,acts,report]=await Promise.all([HealthDB.get('plans',date),allAct(date),HealthDB.get('dailyReports',date)]);
 const base=safeNum(plan?.baseCalorieTarget)??safeNum(state.profile?.calorieTarget)??1750;
 const sessions=(plan?.sessions||[]).filter(s=>s.type!=='rest');
 const {matched,used}=matchPlans(acts,sessions);
 let estimate=0,actual=0,flags=new Set(),recorded=0;
 const details=[];
 for(const [i,s] of sessions.entries()){
  const j=matched.get(i),a=j===undefined?null:acts[j];
  const calc=a?burnCalories(a,state.profile.startWeight):null;
  const credit=calc?.amount>0?calc.amount*0.5:(safeNum(s.estimatedCalories)!=null?s.estimatedCalories*0.5:(safeNum(s.fuelAdjustment)||0));
  if(calc?.amount>0){actual+=calc.amount;recorded++;flags.add(calc.flag);}
  else estimate+=credit;
  details.push({name:s.subtype||s.type,completed:!!a,actual:calc?.amount||0,credit,estimated:!(calc?.amount>0),plannedId:s.id||null});
 }
 for(const [j,a] of acts.entries())if(!used.has(j)){
  const calc=burnCalories(a,state.profile.startWeight);
  if(calc.amount>0){actual+=calc.amount;recorded++;flags.add(calc.flag);details.push({name:a.title||a.type,completed:true,actual:calc.amount,credit:calc.amount*0.5,estimated:false,extra:true});}
 }
 const actualCredit=actual*0.5;
 const credit=Math.round(estimate+actualCredit);
 const liveTarget=base+credit;
 const locked=!!report&&!options.liveClosed;
 return {date,base,plan,acts,sessions,details,recorded,actual:Math.round(actual),actualCredit:Math.round(actualCredit),estimatedCredit:Math.round(estimate),credit,target:locked?(safeNum(report.calorieTarget)??liveTarget):liveTarget,liveTarget,locked,flags:[...flags],matched:matched.size,unmatched:acts.length-used.size};
}
function calorieStatus(cal,target){
 if(cal===null||target===null)return {key:'unlogged',label:'Not logged yet',delta:null,kind:'neutral'};
 const delta=Math.round(cal-target);
 if(delta<=0)return {key:'within',label:'Within target',delta,kind:'good'};
 return {key:delta<=100?'small':delta<=300?'moderate':'higher',label:`${fmt(delta)} kcal over`,delta,kind:delta<=100?'watch':'neutral'};
}
async function reconcile(date=today()){
 // Never mutate banked history. Only the *current open day* may be reconciled.
 if(date!==today()||await banked(date))return budget(date);
 const b=await budget(date);
 const p=b.plan;
 if(p&&b.target!==p.calorieTarget){
  await HealthDB.put('plans',{...p,plannedTrainingAdjustment:p.plannedTrainingAdjustment??p.trainingAdjustment,plannedCalorieTarget:p.plannedCalorieTarget??p.calorieTarget,trainingAdjustment:b.credit,calorieTarget:b.target,actualExerciseCalories:b.actual,exerciseCredit:b.actualCredit,updatedAt:nowIso()});
 }
 const n=await HealthDB.get('nutrition',date),h=await habitFor(date);
 const met=n?.calories!=null&&b.target>0?Number(n.calories)<=b.target:false;
 const logged=n?.calories!=null;
 if(h.nutrition!==met||h.nutritionLogged!==logged){h.nutrition=met;h.nutritionLogged=logged;await saveHabit(h);}
 return {...b,target:b.target};
}
// Keep the original 100-point total; 5 points reward logging and 15 reward
// meeting the budget. Old banked scores are never recalculated or mutated.
const nutritionDef=HABIT_DEFS.find(d=>d.key==='nutrition');
if(nutritionDef){nutritionDef.points=15;nutritionDef.label='Within calorie target';nutritionDef.detail='Accurate feedback, without punishment for higher days';}
if(!HABIT_DEFS.some(d=>d.key==='nutritionLogged')){const idx=HABIT_DEFS.findIndex(d=>d.key==='nutrition');HABIT_DEFS.splice(idx,0,{key:'nutritionLogged',label:'Nutrition logged honestly',icon:'📝',points:5,detail:'Recording a high day is still useful progress'});}

async function dayContext(date=today()){
 const [b,n,h,c,inj,weight,reports,planForTomorrow]=await Promise.all([budget(date),HealthDB.get('nutrition',date),habitFor(date),dailyCheckin(date),activeInjury(),weightRows(),HealthDB.getAll('dailyReports'),HealthDB.get('settings',`support_${date}`)]);
 const last=weight.filter(w=>w.date<=date).at(-1),prev=weight.filter(w=>w.date<date).at(-1),yesterday=reports.find(r=>r.date===addDays(date,-1)),lastCheck=await dailyCheckin(addDays(date,-1));
 return {b,n:n||{},h,c:c||{},inj,last,prev,yesterday,lastCheck,planForTomorrow,reports,day:journeyDay(),date};
}
const rotating=(list,day)=>list[(Math.max(day,1)-1)%list.length];
function motivation(c){
 const {day,h,c:check,yesterday,last,prev,inj,lastCheck,planForTomorrow,b}=c;
 const ready=!!check.morningCompletedAt,confidence=safeNum(lastCheck?.tomorrowConfidence),hunger=safeNum(check.hunger),sleep=safeNum(check.sleepHours),waking=safeNum(check.nightWakings),oldNights=safeNum(check.nightToiletTrips);
 const support=planForTomorrow?.anchor;
 const phase=day<=5?'early':day<15?'building':'steady';
 const bankedCount=c.reports.filter(x=>x.date>=state.profile.startDate&&x.date<c.date).length;
 const active=!!inj;
 let title,lead;
 if(!ready){title=rotating(['A useful day starts with a realistic plan.','Set the day up, then get on with living it.','One honest check-in makes tomorrow smarter.'],day);lead='Record how you slept, your appetite and the movement you actually intend to do. The plan can change later.';}
 else if(day>=3&&day<=5){title=rotating(['The day you keep going counts more than a perfect start.','You have already passed the starting line.','No Monday restart required.'],day-2);lead=`${bankedCount} day${bankedCount===1?'':'s'} banked already. If food feels difficult today, make your next meal an ordinary, satisfying one — you do not need to write off the weekend.`;}
 else if((confidence!=null&&confidence<=2)||(hunger!=null&&hunger>=4)){title='Make today easier, not stricter.';lead='Your hunger or confidence is a reason to plan satisfying meals and protect recovery, not an instruction to cut calories further.';}
 else if(yesterday?.score>=85&&safeNum(lastCheck?.eveningRating)<=3){title='You showed up even though it did not feel easy.';lead=`Yesterday's ${yesterday.score}/100 Momentum measures your actions, not your mood. That effort counts; today does not need to match it.`;}
 else if(b.actual>0){title='Training changed today. Your food plan should keep up.';lead=`You've recorded ${b.actual} exercise kcal. Your food allowance now includes a conservative 50% credit, so you can support recovery without trying to eat back every estimate.`;}
 else{title=rotating(['Progress is built on ordinary days.','A better plan beats a harder promise.','Your next useful decision is enough.','Keep what works. Change what does not.'],day);lead=`${bankedCount} completed days behind you. Today is about doing the basics you can sustain, not chasing another perfect score.`;}
 let signals=[];
 if(last?.date===c.date&&prev&&Number(last.value)<Number(prev.value))signals.push({emoji:'⚖️',title:'Another lower weigh-in',detail:`${fmt(last.value,1)} lb today, ${fmt(Number(prev.value)-Number(last.value),1)} lb below your previous weigh-in. Early changes include water; focus on the trend.`});
 if(waking!=null&&lastCheck?.nightWakings!=null&&waking<Number(lastCheck.nightWakings))signals.push({emoji:'🌙',title:'Fewer sleep interruptions',detail:`${waking} awakenings versus ${lastCheck.nightWakings} previously. One night is encouraging, not proof of what caused it.`});
 else if(oldNights===0&&lastCheck?.nightToiletTrips>=2)signals.push({emoji:'🌙',title:'A less interrupted night',detail:'No bathroom trips reported after a more disrupted night. If fluid timing changed, keep observing the pattern.'});
 if(sleep!=null&&sleep<7)signals.push({emoji:'😴',title:'Sleep deserves attention',detail:`${fmt(sleep,1)} hours recorded. Fatigue can make sticking to meals harder; prioritise rest over unnecessary extra exercise.`});
 if(hunger!=null&&hunger>=4)signals.push({emoji:'🍽️',title:'Hunger is useful feedback',detail:'Plan enough food and enjoyable meals. Persistent hunger means the calorie target deserves review.'});
 if(b.actual>0)signals.push({emoji:'💪',title:`${b.acts.length} session${b.acts.length===1?'':'s'} logged`,detail:`${fmt(b.actual)} kcal recorded for exercise; +${fmt(b.actualCredit)} kcal included in your current food budget. Estimates are approximate.`});
 if(active&&inj.restriction==='recovery')signals.push({emoji:'🩹',title:'Recovery counts as progress',detail:'Follow your recorded recovery plan rather than forcing extra exercise.'});
 if(!signals.length&&yesterday)signals.push({emoji:'✅',title:'Another day recorded',detail:`Yesterday you banked ${yesterday.score}/100 Momentum. The record matters more than one difficult moment.`});
 if(support){const labels={meals:'three satisfying meals',treat:'an enjoyable food',sleep:'earlier fluids and sleep',ordinary:'returning to normal after a wobble'};signals.unshift({emoji:'🎯',title:'Your chosen support plan',detail:`You selected ${labels[support]||'a practical action'} for today.${planForTomorrow.note?' '+planForTomorrow.note:''}`});}
 return {title,lead,signals:signals.slice(0,2),activeInjury:active,ready};
}
function coachingOver(status,inj){
 if(status.key==='unlogged')return 'Log your food totals when convenient. No need to guess your calories before you know them.';
 if(status.key==='within')return 'Within your current allowance. Fuel your day properly; the goal is repeatable habits, not finishing as far under target as possible.';
 if(status.key==='small'){
  const canWalk=!inj||(inj.allowed||[]).includes('walk');
  return `A small difference. ${canWalk?'If you fancy a comfortable walk for enjoyment, that is an option.':'Only choose movement permitted by your current recovery plan.'} There is no need to exercise to cancel out food.`;
 }
 if(status.key==='moderate')return 'This does not erase your progress. Tomorrow, return to normal satisfying meals — no skipping meals, punishment workouts or waiting until Monday.';
 return 'A higher-calorie day is one point in a longer journey. Notice hunger, stress or tiredness if relevant, and return to your ordinary routine at the next opportunity.';
}
function taskItem({done,icon,title,detail,action,points}){
 return `<button class="v12-task ${done?'done':''}" type="button" data-v12-action="${esc(action)}"><span class="v12-check">${done?'✓':'○'}</span><span class="v12-task-main"><b>${icon} ${esc(title)}</b>${detail?`<small>${esc(detail)}</small>`:''}</span>${points?`<span class="v12-points">+${points}</span>`:''}</button>`;
}
async function todayHTML(){
 const c=await dayContext(),{b,h,n,inj,date,day,yesterday}=c;const launch=await launchState();
 if(!isJourneyStarted(state.profile)||!launch?.launchedAt)return oldToday120();
 if(!await banked(date))await reconcile(date);
 const fresh=await dayContext(),ctx=fresh,budgetNow=ctx.b,nut=ctx.n,habit=ctx.h,coach=motivation(ctx),status=calorieStatus(safeNum(nut.calories),budgetNow.target),closed=await HealthDB.get('dailyReports',date),next=addDays(date,1);
 const totalFluids=habit.totalFluidsLitres!=null?safeNum(habit.totalFluidsLitres):(habit.waterLitres!=null&&habit.otherFluidsLitres!=null?Number(habit.waterLitres)+Number(habit.otherFluidsLitres):safeNum(habit.waterLitres));
 const recentReports=ctx.reports.filter(r=>r.date>=state.profile.startDate&&r.date<date).length;
 const urgent=!closed&&!habit.checkin;
 const tasks=[
  {done:!!habit.checkin,icon:'☀️',title:'Morning check-in',detail:habit.checkin?'Recorded':'Set your day and calorie plan',action:'checkin',points:5},
  {done:!!habit.nutritionLogged,icon:'📝',title:'Record nutrition',detail:nut.calories!=null?`${fmt(nut.calories)} kcal recorded`:'Nutracheck totals',action:'nutrition',points:5},
  {done:!!habit.nutrition,icon:'🥗',title:'Within calorie target',detail:status.key==='unlogged'?'Log nutrition first':status.label,action:'nutrition',points:15},
  {done:!!habit.training,icon:'💪',title:'Movement / recovery',detail:budgetNow.acts.length?`${budgetNow.acts.length} session${budgetNow.acts.length===1?'':'s'} logged`:'Follow the day’s plan',action:'activity',points:20},
  {done:!!habit.learning,icon:'🧠',title:'Today’s lesson',detail:'Build understanding, then bank it',action:'lesson',points:5},
  {done:!!habit.steps,icon:'👟',title:'Step goal',detail:habit.stepsValue!=null?`${fmt(habit.stepsValue)} steps`:'Add today’s total',action:'steps',points:10},
  {done:!!habit.water,icon:'💧',title:'Hydration',detail:totalFluids!=null?`${fmt(totalFluids,2)} L recorded`:'Water + other drinks',action:'water',points:7},
  {done:!!habit.protein,icon:'◉',title:'Protein goal',detail:nut.protein!=null?`${fmt(nut.protein,1)} g`:'Enter protein',action:'nutrition',points:10},
  {done:!!habit.vitamins,icon:'💊',title:'Supplements',detail:'As individually configured',action:'vitamins',points:5},
  {done:!!habit.fibre,icon:'🥦',title:'Fibre / fruit & veg',detail:'Food quality matters too',action:'nutrition',points:8},
  {done:!!habit.weighIn,icon:'⚖️',title:'Weigh-in',detail:'Optional normal daily routine',action:'weight',points:5},
  {done:!!habit.bedtime,icon:'🌙',title:`Bedtime · ${state.profile.bedtimeTarget||'22:30'}`,detail:'Confirmed tomorrow morning',action:'bedtime',points:5}
 ];
 const todo=tasks.filter(t=>!t.done),done=tasks.filter(t=>t.done);
 const calorieText=status.key==='unlogged'?'Log food to see your status':status.key==='within'?`${fmt(-status.delta)} kcal remaining`:status.label;
 const phase=new Date().getHours();
 const notice=await HealthDB.get('settings',`support_${next}`);
 return `<div class="v12-home">
 <header class="v12-date"><div><div class="v12-small">${esc(dayDate(date).toUpperCase())}</div><h2>Day ${day} <span>· ${recentReports} banked</span></h2></div><span class="v12-day-pill">${closed?'✓ Banked':phase<12?'Morning':phase<18?'In progress':'Evening'}</span></header>
 ${closed?`<section class="v12-bank-banner"><div><b>✓ Today is banked</b><p>${esc(closed.summary||'Your day is safely saved.')}</p></div><button class="secondary-btn" type="button" id="v12ViewReport">View report</button></section>`:''}
 <section class="card v12-coach"><div class="v12-card-eyebrow">✦ YOUR COACH</div><h2>${esc(coach.title)}</h2><p>${esc(coach.lead)}</p>${coach.signals.length?`<div class="v12-signals">${coach.signals.map(s=>`<div><strong>${s.emoji} ${esc(s.title)}</strong><p>${esc(s.detail)}</p></div>`).join('')}</div>`:''}<div class="v12-coach-actions"><button class="secondary-btn" type="button" id="v12Struggling">I'm struggling</button><button class="link-btn" type="button" id="v12BriefWhy">Why this advice?</button></div></section>
 ${urgent?`<section class="v12-urgent"><span>☀️</span><div><b>Set your day up</b><p>A short check-in shapes today’s plan and coaching.</p></div><button class="primary-btn" id="v12MorningCTA">Check in</button></section>`:''}
 <section class="card v12-food"><div class="v12-card-top"><div><div class="v12-card-eyebrow">TODAY’S FOOD BUDGET</div><h3>Fuel the day you actually had</h3></div><span class="v12-status ${status.kind}">${esc(status.label)}</span></div><div class="v12-food-numbers"><div><span>EATEN</span><strong>${nut.calories!=null?fmt(nut.calories):'—'}</strong><small>kcal</small></div><div><span>LIVE TARGET</span><strong>${fmt(budgetNow.target)}</strong><small>kcal</small></div></div><p class="v12-food-feedback">${esc(coachingOver(status,ctx.inj))}</p><div class="v12-budget-line">${fmt(budgetNow.base)} base + ${fmt(budgetNow.actualCredit)} completed exercise + ${fmt(budgetNow.estimatedCredit)} uncompleted plans = <b>${fmt(budgetNow.target)} kcal</b></div>${budgetNow.flags.includes('unconfirmed')||budgetNow.flags.includes('total-unknown')?'<small class="v12-caution">Some Garmin figures are not labelled active/total; check activity details for more accurate credit.</small>':''}<div class="v12-inline-actions"><button class="primary-btn" data-v12-action="nutrition">Log food</button><button class="secondary-btn" id="v12BudgetWhy">Why this target?</button></div></section>
 <section class="v12-todo-section"><div class="v12-heading"><div><h3>What matters now</h3><small>${todo.length} remaining · ${done.length} done</small></div></div><div class="v12-task-list">${todo.slice(0,5).map(taskItem).join('')||'<div class="v12-complete">✓ All today’s actions recorded. You can finish the day when you are ready.</div>'}</div>${todo.length>5||done.length?`<details class="v12-fold"><summary>${todo.length>5?`${todo.length-5} more to do · `:''}${done.length} completed</summary><div class="v12-task-list">${[...todo.slice(5),...done].map(taskItem).join('')}</div></details>`:''}</section>
 <details class="v12-fold v12-details"><summary>Quick numbers and training details</summary><div class="v12-grid"><div><span>Protein</span><b>${nut.protein!=null?`${fmt(nut.protein,1)}g`:'—'}</b></div><div><span>Steps</span><b>${habit.stepsValue!=null?fmt(habit.stepsValue):'—'}</b></div><div><span>${habit.totalFluidsLitres!=null?'Total fluids':'Water recorded'}</span><b>${totalFluids!=null?`${fmt(totalFluids,2)}L`:'—'}</b></div><div><span>Completed burn</span><b>${fmt(budgetNow.actual)} kcal</b></div></div><div class="v12-inline-actions"><button class="secondary-btn" data-v12-action="activity">Log activity</button><button class="secondary-btn" data-v12-action="water">Record drinks</button></div></details>
 ${!closed?`<section class="card v12-evening"><div class="v12-card-eyebrow">${phase>=18?'🌙 TONIGHT':'LATER TODAY'}</div><h3>Finish today and keep tomorrow simple</h3><p>Reflect on what actually happened, bank the day, then pick one useful action for tomorrow.</p><button class="primary-btn wide" id="v12CloseToday">Close Today</button>${notice?.anchor?`<small>Tomorrow’s support plan: ${esc(notice.anchor)}</small>`:''}</section>`:''}
 </div>`;
}
const oldToday120=renderToday;
renderToday=todayHTML;

// The old Training page contained another full injury summary. Retire it so
// the recovery-journey card below is the only detailed active-injury module.
const oldInjuryCard120=injuryCard;
injuryCard=function(injury,context='today'){
 if(context==='running'&&isJourneyStarted())return '';
 return oldInjuryCard120(injury,context);
};
// Put active recovery in Training, with a single source of truth for all advice.
const oldTraining120=renderRunning;
renderRunning=async function(){
 let html=await oldTraining120();if(!isJourneyStarted())return html;
 const inj=await activeInjury();
 const recovery=inj?await window.HealthV11.injuryJourneyCard():`<section class="card v12-no-injury"><b>✓ No active injuries</b><p>Training advice returns to normal. Previous injury records remain available below.</p><button class="secondary-btn" type="button" id="v12ManageInjury">Manage injuries</button></section>`;
 const [h,b]=await Promise.all([habitFor(),budget()]);
 const wstart=mondayOf(),plans=(await HealthDB.getAll('plans')).filter(p=>p.date>=wstart&&p.date<=today());
 const activities=(await HealthDB.getAll('activities')).filter(a=>a.date>=wstart&&a.date<=today());
 let plannedN=0,explicitN=0,likelyN=0,extraN=0;
 for(const pl of plans){const sessions=(pl.sessions||[]).filter(x=>x.type!=='rest'),onDate=activities.filter(a=>a.date===pl.date),matched=matchPlans(onDate,sessions);
  plannedN+=sessions.length;extraN+=onDate.length-matched.used.size;
  for(const [idx,j] of matched.matched){const ss=sessions[idx],aa=onDate[j];if((ss.id&&aa.plannedSessionId===ss.id)||(ss.actualActivityId&&aa.id===ss.actualActivityId))explicitN++;else likelyN++;}}
 // Activities on days without a morning plan are still logged achievements.
 extraN+=activities.filter(a=>!plans.some(pl=>pl.date===a.date)).length;
 const summaryText=plannedN?`${explicitN} explicitly linked, ${likelyN} likely matched, ${Math.max(0,plannedN-explicitN-likelyN)} still unlinked`:'No scheduled sessions to compare';
 const matchCard=`<section class="card v12-match-card"><div class="goal-head"><div><strong>Planned vs completed</strong><small>${esc(summaryText)}</small></div><span class="pill">${plannedN?`${Math.min(plannedN,explicitN+likelyN)}/${plannedN} COVERED`:'NO PLAN'}</span></div><p class="metric-sub">${extraN} extra logged session${extraN===1?'':'s'} this week. Same-type matches are suggestions, not confirmed plan links; edit a session to link it precisely. Extra movement is never marked as a failure.</p></section>`;
 const matchBegin=html.indexOf('<section class="card"><div class="goal-head"><div><strong>Planned vs actual</strong>');
 if(matchBegin>=0){const matchEnd=html.indexOf('</section>',matchBegin);if(matchEnd>matchBegin)html=html.slice(0,matchBegin)+matchCard+html.slice(matchEnd+10);}
 const banner=`<section class="card v12-training-summary"><div class="v12-card-eyebrow">TODAY’S TRAINING & FUELLING</div><div class="v12-training-kpis"><div><b>${fmt(b.actual)}</b><span>recorded exercise kcal</span></div><div><b>+${fmt(b.actualCredit)}</b><span>food budget credit</span></div></div><p>Only 50% of completed exercise calories is credited. Planned sessions are replaced by actual sessions where matched, including same-type logs that were not explicitly linked.</p><button class="secondary-btn" id="v12BudgetWhy">How this works</button></section>`;
 return banner+recovery+html;
};

// Show the journey game in Progress without rehoming any records.
// The existing Progress screen already renders the Road to Madrid game.
// Today's replacement removes the duplicate without changing Progress.

// Show a live nutrition form; its save and the quick-entry save share one rule.
openNutritionModal=async function(){
 const date=today(),n=await HealthDB.get('nutrition',date)||{},b=await budget(date),s=calorieStatus(safeNum(n.calories),b.target);
 modal(`<div class="modal-head"><div><h2>Nutrition totals</h2><p>Copy your Nutracheck totals. Exact decimals are welcome.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="v12-form-target"><b>${fmt(b.target)} kcal live target</b><small>${fmt(b.base)} base + ${fmt(b.actualCredit)} completed exercise + ${fmt(b.estimatedCredit)} planned exercise</small>${s.delta!=null?`<small>${esc(s.label)}</small>`:''}</div><form id="v12Nutrition" class="form-grid"><div class="form-grid cols-2"><div class="field"><label>Calories</label><input type="number" inputmode="numeric" min="0" step="1" name="calories" value="${n.calories??''}"></div><div class="field"><label>Protein (g)</label><input type="number" inputmode="decimal" min="0" step="any" name="protein" value="${n.protein??''}"></div><div class="field"><label>Fibre (g)</label><input type="number" inputmode="decimal" min="0" step="any" name="fibre" value="${n.fibre??''}"></div><div class="field"><label>Fruit & veg portions</label><input type="number" inputmode="decimal" min="0" step="any" name="fruitVeg" value="${n.fruitVeg??''}"></div></div><div class="field"><label>How did eating feel?</label><select name="eatingFeel"><option value="">Not rated</option>${['Easy','Hungry','Snacky','Overate','Very full'].map(x=>`<option ${n.eatingFeel===x?'selected':''}>${x}</option>`).join('')}</select></div><button class="primary-btn wide" type="submit">Save nutrition</button></form>`);
 const form=document.getElementById('v12Nutrition');form.onsubmit=async e=>{e.preventDefault();const f=new FormData(form),number=k=>safeNum(f.get(k));const old=await HealthDB.get('nutrition',date)||{};
 await HealthDB.put('nutrition',{...old,id:date,date,calories:number('calories'),protein:number('protein'),fibre:number('fibre'),fruitVeg:number('fruitVeg'),eatingFeel:f.get('eatingFeel'),source:'manual/nutracheck',updatedAt:nowIso()});
 const h=await habitFor(date);const p=state.profile;h.protein=number('protein')!=null&&safeNum(p.proteinTarget)!=null&&number('protein')>=Number(p.proteinTarget);h.fibre=(number('fibre')!=null&&safeNum(p.fibreTarget)!=null&&number('fibre')>=Number(p.fibreTarget))||(number('fruitVeg')!=null&&number('fruitVeg')>=5);await saveHabit(h);
 await reconcile(date);closeModal();toast('Nutrition recorded — totals saved exactly');await render();};
};
openTodayNumbersModal=async function(){
 // Retire the duplicate legacy quick numbers form. One source for nutrition and drinks.
 modal(`<div class="modal-head"><div><h2>Update today</h2><p>Each button updates the same saved records used by Today, Training and your report.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="v12-quick-grid"><button class="secondary-btn" data-v12-action="nutrition">🥗 Nutrition totals</button><button class="secondary-btn" data-v12-action="steps">👟 Steps</button><button class="secondary-btn" data-v12-action="water">💧 Water & drinks</button><button class="secondary-btn" data-v12-action="activity">💪 Activity</button></div>`);
 document.querySelectorAll('#modalRoot [data-v12-action]').forEach(el=>el.onclick=()=>doAction(el.dataset.v12Action));
};

// Exact entry form (v1.1.4) plus an explicit label for Garmin burn units.
const originalActivity120=window.HealthV11?.openActivity||openActivityModal;
async function activityEditor120(existing=null){
 await originalActivity120(existing);const form=document.getElementById('v11Activity');if(!form)return;
 const calories=form.querySelector('[name="caloriesBurned"]');if(calories){const box=document.createElement('div');box.className='field';box.innerHTML=`<label>Garmin calorie type</label><select name="calorieBasis"><option value="active">Active calories (best)</option><option value="total">Total calories (includes resting energy)</option><option value="unspecified">Not sure / older entry</option></select><small>If Garmin shows total calories, we subtract a rough resting estimate before applying the 50% credit. Avoid claiming an exact energy burn.</small>`;calories.closest('.field')?.after(box);form.elements.calorieBasis.value=existing?.calorieBasis||'unspecified';}
 const oldSubmit=form.onsubmit;
 form.onsubmit=async e=>{e.preventDefault();if(!form.reportValidity())return;const dt=form.elements.date.value;if(dt!==today()&&await banked(dt)){
  // Original editor already asks before reopening, but no automatic historical target rewrites.
 }
 const pre=await HealthDB.getAll('activities'),ids=new Set(pre.map(a=>a.id)),basis=form.elements.calorieBasis?.value||'unspecified';
 await oldSubmit(e);
 const next=await HealthDB.getAll('activities');const row=existing?next.find(a=>a.id===existing.id):next.find(a=>!ids.has(a.id));
 if(row){row.calorieBasis=basis;row.updatedAt=nowIso();await HealthDB.put('activities',row);}
 await reconcile(dt);await render();
 };
}
openActivityModal=()=>activityEditor120();if(window.HealthV11)window.HealthV11.openActivity=activityEditor120;

// Forward-compatible sleep data: old nightToiletTrips remains untouched;
// new nights use a separate nightWakings property. No silent reinterpretation.
const oldCheckin120=openDailyCheckinModal;
openDailyCheckinModal=async function(){await oldCheckin120();const form=document.getElementById('morningForm');if(!form)return;
 const old=form.querySelector('[name="nightToiletTrips"]');if(!old)return;
 const existing=await dailyCheckin(today())||{};old.closest('.field').querySelector('label').textContent='Times you woke during the night (optional)';old.closest('.field').querySelector('small').textContent='Any noticeable waking — bathroom, children, pets or noise. Earlier bathroom-only records keep their original meaning.';
 old.name='nightWakings';old.value=existing.nightWakings??'';const legacy=document.createElement('input');legacy.type='hidden';legacy.name='nightToiletTrips';legacy.value=existing.nightToiletTrips??'';form.appendChild(legacy);
 const submit=form.onsubmit;form.onsubmit=async e=>{e.preventDefault();if(!form.reportValidity())return;const waking=safeNum(form.elements.nightWakings.value);await submit(e);const record=await dailyCheckin(today());if(record){record.nightWakings=waking;record.updatedAt=nowIso();await HealthDB.put('checkins',record);}await reconcile(today());await render();};
};

// Shared calorie status in next closeout: reconcile *before* the original form
// takes its snapshot; never touch already banked reports.
if(window.HealthV11?.openCloseDay){const originalClose120=window.HealthV11.openCloseDay;window.HealthV11.openCloseDay=async function(date=today()){await reconcile(date);return originalClose120(date);};}

// Unified action router ensures quick add and Today buttons use the same editors.
async function doAction(key){
 switch(key){
  case 'nutrition':return openNutritionModal();
  case 'activity':return openActivityModal();
  case 'water':return openWaterModal();
  case 'steps':return openStepsModal();
  case 'checkin':return openDailyCheckinModal();
  case 'weight':return openWeightModal();
  case 'vitamins':return openSupplementsModal();
  case 'lesson':{const l=await currentLesson();return l?openLesson(l.id):toast('Lesson not available yet');}
  case 'bedtime':return window.HealthV114BedtimeHelp?.();
 }
}
const previousBind120=bindViewEvents;
bindViewEvents=function(){
 previousBind120();
 document.querySelectorAll('[data-v12-action]').forEach(el=>el.onclick=()=>doAction(el.dataset.v12Action));
 const on=(id,callback)=>{const el=document.getElementById(id);if(el)el.onclick=callback;};
 on('v12Struggling',()=>window.HealthV112SupportModal?.(false));
 on('v12BriefWhy',()=>whyModal('brief'));
 on('v12BudgetWhy',()=>budgetExplanation());
 on('v12MorningCTA',()=>openDailyCheckinModal());
 on('v12CloseToday',()=>window.HealthV11?.openCloseDay?.(today()));
 on('v12ViewReport',()=>window.HealthV11?.openReport?.(today()));
 on('v12ManageInjury',()=>openInjuryModal());
};
async function budgetExplanation(){const b=await budget();modal(`<div class="modal-head"><div><h2>How your calorie budget works</h2><p>Today's number is live, not a fixed morning promise.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="v12-form-target"><b>${fmt(b.target)} kcal</b><small>${fmt(b.base)} rest-day anchor + ${fmt(b.actualCredit)} completed exercise credit + ${fmt(b.estimatedCredit)} still-planned credit.</small></div><p>We provisionally return 50% of recorded exercise energy. Planned sessions are replaced with their actual burn when matched, including a same-type match if you did not explicitly link them. Additional sessions count once.</p><p>Wearable calorie numbers and planned estimates are imprecise. Garmin active calories are preferred. If you select total calories, the app estimates the resting component before applying the credit.</p><p>Do not use a higher target as a challenge to eat more, or a lower one as a reason to ignore hunger. As mileage rises, training quality and recovery take priority over rapid weight loss.</p>${b.details.length?`<div class="v12-budget-breakdown">${b.details.map(d=>`<div><span>${esc(d.name)}${d.estimated?' · estimated':d.extra?' · extra':''}</span><b>+${fmt(Math.round(d.credit))} kcal</b></div>`).join('')}</div>`:''}<button class="primary-btn wide" data-close-modal>Got it</button>`);document.querySelectorAll('#modalRoot [data-close-modal]').forEach(b=>b.onclick=closeModal);}

async function openMorningBriefing(plan){
 const c=await dayContext(),coach=motivation(c),b=await budget();
 modal(`<div class="modal-head"><div><h2>☀️ Day ${c.day} — your morning</h2><p>One useful message, not a summary of every field.</p></div><button class="close-btn" data-close-modal>×</button></div><section class="v12-brief-modal"><div class="v12-card-eyebrow">YOUR COACH</div><h2>${esc(coach.title)}</h2><p>${esc(coach.lead)}</p>${coach.signals.map(t=>`<div class="v12-brief-signal"><strong>${t.emoji} ${esc(t.title)}</strong><p>${esc(t.detail)}</p></div>`).join('')}<div class="v12-form-target"><b>${fmt(b.target)} kcal starting allowance</b><small>${fmt(b.base)} rest-day + ${fmt(b.credit)} provisional training credit. It updates when you log completed sessions.</small></div></section><button class="primary-btn wide" data-close-modal>Start my day</button>`);
 document.querySelectorAll('#modalRoot [data-close-modal]').forEach(x=>x.onclick=closeModal);
}
window.HealthV12={version:V,budget,calorieStatus,matchPlans,burnCalories,reconcile,dayContext,motivation,coachingOver,doAction,openMorningBriefing};
})();
