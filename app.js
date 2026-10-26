const APP_VERSION='0.1.0';
const RELEASE_NAME='Setup Edition';
const DEFAULT_START='2026-11-03';
const MADRID_DATE='2027-04-25';
const DEFAULTS={
  name:'Matt',startDate:DEFAULT_START,madridDate:MADRID_DATE,madridWeight:190,ultimateWeight:180,
  stepTarget:null,calorieTarget:null,proteinTarget:null,fibreTarget:null,waterTarget:null,
  strengthTarget:2,weeklyRunTarget:null,waistUnit:'in',weightUnit:'lb'
};
const HABIT_DEFS=[
  {key:'weighIn',label:'Morning weigh-in',icon:'⚖',points:5,detail:'Log your weight'},
  {key:'vitamins',label:'Take vitamins',icon:'💊',points:5,detail:'Daily supplement check'},
  {key:'nutrition',label:'Hit nutrition target',icon:'🥗',points:20,detail:'Stay within your calorie range'},
  {key:'protein',label:'Protein target',icon:'◉',points:10,detail:'Support fullness and recovery'},
  {key:'fibre',label:'Fibre / fruit & veg',icon:'🥦',points:8,detail:'Build a filling day'},
  {key:'water',label:'Water target',icon:'💧',points:7,detail:'Hit your hydration target'},
  {key:'training',label:'Planned training / movement',icon:'🏃',points:20,detail:'Run, strength, swim, football or intentional rest'},
  {key:'steps',label:'Step target',icon:'👟',points:10,detail:'Especially useful on rest days'},
  {key:'learning',label:'3-minute lesson',icon:'🧠',points:5,detail:'Build the skill, not just the streak'},
  {key:'bedtime',label:'Bedtime target',icon:'🌙',points:5,detail:'Protect tomorrow’s energy'},
  {key:'checkin',label:'Daily check-in',icon:'✓',points:5,detail:'One quick reflection'}
];
const STARTER_LESSONS=[
  {id:'lesson_001',day:1,title:'Why the scale lies',theme:'Understand',minutes:3,body:'Body weight can move quickly because of water, glycogen, salt, food volume and training. One weigh-in is information; the trend is the signal.',question:'What matters most after one unexpectedly high weigh-in?',answer:'Keep the plan and watch the trend',action:'Do not change today’s plan because of one weigh-in.'},
  {id:'lesson_002',day:2,title:'Fat loss is not weight loss',theme:'Understand',minutes:3,body:'Fat changes slowly. Scale weight can change overnight. Separating the two prevents normal fluctuation from becoming a motivation crisis.',question:'Can scale weight rise while fat loss is still happening?',answer:'Yes',action:'Look at your 7-day average before reacting.'},
  {id:'lesson_003',day:3,title:'Build an average, not a perfect day',theme:'Understand',minutes:3,body:'Long-term progress is built from repeatable averages. A slightly imperfect day inside a good week beats an unsustainable perfect day followed by a rebound.',question:'Which is more useful?',answer:'A repeatable good week',action:'Choose one habit today that feels easy enough to repeat.'},
  {id:'lesson_004',day:4,title:'Protein buys you options',theme:'Build',minutes:3,body:'Protein can support fullness and recovery, which makes a calorie target easier to live with while you are running and building strength consistency.',question:'Why track protein?',answer:'Fullness and recovery',action:'Plan the protein source in your next meal first.'},
  {id:'lesson_005',day:5,title:'The bounce-back skill',theme:'Build',minutes:3,body:'The most useful skill is not avoiding every off-plan day. It is shortening the gap between drifting and returning to your normal behaviour.',question:'What should follow an off-plan day?',answer:'A normal planned day',action:'If yesterday drifted, make today boringly normal.'},
  {id:'lesson_006',day:6,title:'Rest days still move the goal',theme:'Build',minutes:3,body:'Running can disguise how inactive the rest of a day becomes. Steps give you a simple way to protect everyday movement without adding another workout.',question:'When do steps matter most?',answer:'Especially on low-training days',action:'Take one short walk that you would normally skip.'},
  {id:'lesson_007',day:7,title:'Your first weekly review',theme:'Review',minutes:4,body:'Review the pattern, not the emotion. Weight trend, calorie adherence, training and habits tell a more useful story together than any one metric.',question:'What is a weekly review for?',answer:'Finding the next useful adjustment',action:'Pick only one thing to improve next week.'},
  {id:'lesson_008',day:8,title:'Hunger has patterns',theme:'Build',minutes:3,body:'Hunger is not identical every hour or every day. Training, habit, meal timing and food choice all influence it. Noticing the pattern makes planning easier.',question:'What is the first response to repeated hunger?',answer:'Notice when and why it happens',action:'Note the time you feel most hungry today.'},
  {id:'lesson_009',day:9,title:'Fibre makes calories work harder',theme:'Build',minutes:3,body:'Higher-fibre foods can add volume and help meals feel more substantial. The goal is not perfection; it is making the calorie budget easier to live inside.',question:'Why does fibre matter here?',answer:'Fullness and food quality',action:'Add one fruit, vegetable, pulse or wholegrain serving.'},
  {id:'lesson_010',day:10,title:'Minimum viable days',theme:'Adapt',minutes:3,body:'Travel, illness and difficult workdays need a smaller plan, not no plan. A minimum viable day protects continuity when a normal day is unrealistic.',question:'What is the aim on a difficult day?',answer:'Reduce the plan, do not abandon it',action:'Decide the three behaviours you would keep on your hardest day.'}
];
const CURRICULUM=[
  ['1. Understand','Weight fluctuation, energy balance, averages and realistic expectations'],
  ['2. Build','Protein, fibre, hydration, steps, routines and food environment'],
  ['3. Train','Running hunger, strength consistency, recovery and fuelling'],
  ['4. Adapt','Eating out, weekends, travel, Christmas, setbacks and plateaus'],
  ['5. Perform','Marathon build, long-run fuelling, fatigue and race-week priorities'],
  ['6. Maintain','Identity, maintenance calories, relapse prevention and life after the target']
];
const state={view:'today',profile:null};

function uid(prefix='id'){return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;}
function esc(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function isoDate(date=new Date()){const y=date.getFullYear();const m=String(date.getMonth()+1).padStart(2,'0');const d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;}
function parseLocal(dateString){const [y,m,d]=dateString.split('-').map(Number);return new Date(y,m-1,d,12,0,0,0);}
function daysBetween(a,b){return Math.round((parseLocal(b)-parseLocal(a))/86400000);}
function addDays(dateString,n){const d=parseLocal(dateString);d.setDate(d.getDate()+n);return isoDate(d);}
function fmtDate(dateString,opts={day:'numeric',month:'short',year:'numeric'}){return parseLocal(dateString).toLocaleDateString('en-GB',opts);}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function round(n,dp=1){const p=10**dp;return Math.round(n*p)/p;}
function nowIso(){return new Date().toISOString();}
function isJourneyStarted(profile=state.profile){return isoDate()>=profile.startDate;}
function journeyDay(profile=state.profile){return Math.max(0,daysBetween(profile.startDate,isoDate())+1);}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2300);}
function setView(view){state.view=view;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));render();window.scrollTo({top:0,behavior:'smooth'});}
function modal(html){document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" id="modalBackdrop"><div class="modal">${html}</div></div>`;document.getElementById('modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal();});document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal);}
function closeModal(){document.getElementById('modalRoot').innerHTML='';}
function greeting(){const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening';}
function mondayOf(dateString=isoDate()){const d=parseLocal(dateString);const day=d.getDay()||7;d.setDate(d.getDate()-day+1);return isoDate(d);}
function sum(arr,fn=x=>x){return arr.reduce((a,b)=>a+(Number(fn(b))||0),0);}
function avg(arr){return arr.length?sum(arr)/arr.length:null;}
function lbsToStone(lb){if(lb==null)return '';const stone=Math.floor(lb/14),rem=round(lb-stone*14,1);return `${stone}st ${rem}lb`;}

async function ensureDefaults(){
  let p=await HealthDB.get('profile','main');
  if(!p){p={id:'main',...DEFAULTS,createdAt:nowIso(),updatedAt:nowIso(),startWeight:null,currentWeight:null,waist:null,vo2max:null,weeklyRunBaseline:null,bedtimeTarget:'22:30'};await HealthDB.put('profile',p);}
  state.profile=p;
  const meta=await HealthDB.get('settings','schemaMeta');if(!meta)await HealthDB.put('settings',{id:'schemaMeta',version:HealthDB.DB_VERSION,appVersion:APP_VERSION,createdAt:nowIso()});
  const seeded=await HealthDB.get('settings','lessonSeed');if(!seeded){for(const lesson of STARTER_LESSONS)await HealthDB.put('lessons',{...lesson,completedAt:null});await HealthDB.put('settings',{id:'lessonSeed',version:1,seededAt:nowIso()});}
  const goals=await HealthDB.getAll('goals');
  if(!goals.length){
    await HealthDB.put('goals',{id:'goal_madrid_weight',type:'weight',title:'Madrid weight',target:p.madridWeight,targetDate:p.madridDate,unit:'lb',active:true});
    await HealthDB.put('goals',{id:'goal_ultimate_weight',type:'weight',title:'Ultimate weight',target:p.ultimateWeight,targetDate:null,unit:'lb',active:true});
    await HealthDB.put('goals',{id:'goal_strength',type:'behaviour',title:'Strength sessions',target:p.strengthTarget,period:'week',unit:'sessions',active:true});
  }
}

async function latestMeasurement(type){const rows=(await HealthDB.getAll('measurements')).filter(x=>x.type===type).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));return rows[0]||null;}
async function weightRows(){return (await HealthDB.getAll('measurements')).filter(x=>x.type==='weight').sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt.localeCompare(b.createdAt));}
async function habitFor(date=isoDate()){return await HealthDB.get('habits',date)||{id:date,date};}
async function saveHabit(h){h.updatedAt=nowIso();await HealthDB.put('habits',h);}
function momentum(h){const earned=sum(HABIT_DEFS,d=>h[d.key]?d.points:0);return {earned,total:sum(HABIT_DEFS,d=>d.points),complete:HABIT_DEFS.filter(d=>h[d.key]).length};}
function scoreStatus(score){if(score>=85)return ['Excellent','good'];if(score>=70)return ['Good','good'];if(score>=55)return ['Needs a push','watch'];return ['Off track','bad'];}
async function sevenDayWeightAverage(endDate=isoDate()){const rows=await weightRows();const start=addDays(endDate,-6);const vals=rows.filter(r=>r.date>=start&&r.date<=endDate).map(r=>Number(r.value)).filter(Number.isFinite);return avg(vals);}
async function priorSevenDayAverage(endDate=isoDate()){const rows=await weightRows();const end=addDays(endDate,-7),start=addDays(endDate,-13);const vals=rows.filter(r=>r.date>=start&&r.date<=end).map(r=>Number(r.value)).filter(Number.isFinite);return avg(vals);}
function daysTo(date){return Math.max(0,daysBetween(isoDate(),date));}
function weightTrajectory(profile,currentDate=isoDate()){
  if(!profile.startWeight)return null;
  const total=Math.max(1,daysBetween(profile.startDate,profile.madridDate));
  const elapsed=clamp(daysBetween(profile.startDate,currentDate),0,total);
  return profile.startWeight+(profile.madridWeight-profile.startWeight)*(elapsed/total);
}
async function setupReadiness(){
  const p=state.profile;const w=await latestMeasurement('weight');
  return [
    {label:'Journey dates',detail:`Starts ${fmtDate(p.startDate,{weekday:'short',day:'numeric',month:'short'})}`,done:!!p.startDate&&!!p.madridDate,action:'profile'},
    {label:'Weight goals',detail:`${p.madridWeight} lb Madrid • ${p.ultimateWeight} lb ultimate`,done:!!p.madridWeight&&!!p.ultimateWeight,action:'profile'},
    {label:'Starting weight',detail:p.startWeight?`${p.startWeight} lb baseline saved`:(w?`${w.value} lb available — choose baseline`:'Add on 3 November morning'),done:!!p.startWeight,action:'baseline'},
    {label:'Daily targets',detail:(p.stepTarget&&p.proteinTarget&&p.waterTarget)?`${p.stepTarget.toLocaleString()} steps • ${p.proteinTarget}g protein • ${p.waterTarget}L water`:'Set from your real routine / Nutracheck',done:!!p.stepTarget&&!!p.proteinTarget&&!!p.waterTarget,action:'profile'},
    {label:'Garmin',detail:'Forerunner 945 • integration planned',done:false,action:'sources'},
    {label:'Withings',detail:'Body+ • integration planned',done:false,action:'sources'},
    {label:'Nutracheck',detail:'Import workflow planned',done:false,action:'sources'}
  ];
}

async function render(){
  state.profile=await HealthDB.get('profile','main')||state.profile;
  const titles={today:'Today',progress:'Progress',running:'Running',learn:'Learn',more:'More',settings:'Settings'};
  document.getElementById('pageTitle').textContent=titles[state.view]||'Health';
  const app=document.getElementById('app');
  if(state.view==='today')app.innerHTML=await renderToday();
  if(state.view==='progress')app.innerHTML=await renderProgress();
  if(state.view==='running')app.innerHTML=await renderRunning();
  if(state.view==='learn')app.innerHTML=await renderLearn();
  if(state.view==='more')app.innerHTML=await renderMore();
  if(state.view==='settings')app.innerHTML=await renderSettings();
  bindViewEvents();
}

async function renderToday(){
  const p=state.profile;const started=isJourneyStarted(p);const today=isoDate();const h=await habitFor(today);const m=momentum(h);const [status,statusClass]=scoreStatus(m.earned);
  const latest=await latestMeasurement('weight');const avg7=await sevenDayWeightAverage();const prior7=await priorSevenDayAverage();const change=(avg7!=null&&prior7!=null)?round(avg7-prior7,1):null;
  const trajectory=weightTrajectory(p);const madridDays=daysTo(p.madridDate);const readiness=await setupReadiness();const readyCount=readiness.filter(x=>x.done).length;
  if(!started){
    const days=Math.max(0,daysBetween(today,p.startDate));
    return `
      <section class="hero preseason">
        <div class="hero-row"><div><div class="kicker">SETUP MODE</div><h2>${esc(greeting())}, ${esc(p.name)}</h2><p>Your health journey starts <strong>${fmtDate(p.startDate,{weekday:'long',day:'numeric',month:'long'})}</strong>. Nothing scores red before then.</p></div><div class="score-ring preseason" style="--score:${Math.round(readyCount/readiness.length*100)}%"><div>${days}<small>DAYS TO GO</small></div></div></div>
      </section>
      <section class="card"><div class="goal-head"><div><strong>Road to Madrid</strong><small>${madridDays} days to ${fmtDate(p.madridDate,{day:'numeric',month:'short',year:'numeric'})}</small></div><span class="pill">PRE-SEASON</span></div><div class="progress-track" style="margin-top:12px"><div class="progress-fill" style="width:0%"></div></div><div class="goal-scale"><span>Start ${fmtDate(p.startDate,{day:'numeric',month:'short'})}</span><span>${p.madridWeight} lb Madrid</span><span>${p.ultimateWeight} lb ultimate</span></div></section>
      <div class="section-title"><h2>Get ready to start</h2><span>${readyCount}/${readiness.length} ready</span></div>
      <section class="card"><div class="setup-list">${readiness.map(r=>`<div class="setup-item ${r.done?'done':''}"><div class="setup-dot">${r.done?'✓':'○'}</div><div><strong>${esc(r.label)}</strong><small>${esc(r.detail)}</small></div><button class="link-btn setup-action" data-action="${r.action}">${r.done?'Edit':'Set up'}</button></div>`).join('')}</div></section>
      <section class="card coach"><h3>Why we're waiting</h3><p>Holiday is part of life, not a failed start. V0.1 is deliberately using the next few days to get the system ready. Your scores, streaks and six-month learning journey begin on 3 November.</p></section>
      <div class="section-title"><h2>Tuesday morning</h2><span>60 seconds</span></div>
      <section class="card"><div class="setup-list"><div class="setup-item"><div class="setup-dot">1</div><div><strong>Weigh in on Withings</strong><small>Enter the real starting weight</small></div></div><div class="setup-item"><div class="setup-dot">2</div><div><strong>Measure waist</strong><small>Optional baseline for non-scale progress</small></div></div><div class="setup-item"><div class="setup-dot">3</div><div><strong>Check Garmin</strong><small>Add VO₂ max and weekly baseline if useful</small></div></div><div class="setup-item"><div class="setup-dot">4</div><div><strong>Open the dashboard</strong><small>Live mode starts automatically on 3 November</small></div></div></section>
      <button id="openBaseline" class="primary-btn wide">Prepare baseline inputs</button>`;
  }
  const totalLoss=p.startWeight&&latest?round(p.startWeight-Number(latest.value),1):null;
  const toMadrid=latest?round(Number(latest.value)-p.madridWeight,1):null;
  const coach=await coachText(h,latest,avg7,change,trajectory);
  return `
    <section class="hero"><div class="hero-row"><div><div class="kicker">${esc(greeting().toUpperCase())}</div><h2>${esc(p.name)}</h2><p>${m.complete}/${HABIT_DEFS.length} actions complete • ${m.total-m.earned} points still available</p></div><div class="score-ring" style="--score:${m.earned}%"><div>${m.earned}<small>MOMENTUM</small></div></div></div></section>
    <section class="card"><div class="goal-head"><div><strong>🏁 Road to Madrid</strong><small>${madridDays} days • target ${p.madridWeight} lb</small></div>${avg7!=null&&trajectory!=null?`<span class="pill ${avg7<=trajectory?'good':'watch'}">${avg7<=trajectory?'ON TRACK':'WATCH'}</span>`:'<span class="pill">STARTING</span>'}</div><div class="grid-2" style="margin-top:12px"><div class="metric-card"><div class="metric-label">CURRENT</div><div class="metric-value">${latest?`${round(Number(latest.value),1)} lb`:'—'}</div><div class="metric-sub">${avg7!=null?`7-day avg ${round(avg7,1)} lb`:'Log your weight'}</div></div><div class="metric-card"><div class="metric-label">TO MADRID</div><div class="metric-value">${toMadrid!=null?`${Math.max(0,toMadrid)} lb`:'—'}</div><div class="metric-sub">${totalLoss!=null?`${Math.max(0,totalLoss)} lb lost since start`:'Baseline needed'}</div></div></div></section>
    <div class="section-title"><h2>Today</h2><span>${m.earned}/100 points</span></div>
    <section class="card compact"><div class="action-list">${HABIT_DEFS.map(d=>`<div class="action-row ${h[d.key]?'done':''}" data-habit="${d.key}"><button class="action-check" data-habit-toggle="${d.key}" aria-label="Toggle ${esc(d.label)}">${h[d.key]?'✓':'○'}</button><div><strong>${d.icon} ${esc(d.label)}</strong><small>${esc(d.detail)}</small></div><span class="points">+${d.points}</span></div>`).join('')}</div></section>
    <section class="card coach"><h3>💡 Coach</h3><p>${coach}</p></section>
    ${seasonalCoachCard()}
    <div class="section-title"><h2>This week's priorities</h2><span>3 things</span></div>
    <section class="card compact"><div class="setup-list">${(await weeklyPriorities()).map((r,i)=>`<div class="setup-item"><div class="setup-dot">${i+1}</div><div><strong>${r.icon} ${esc(r.title)}</strong><small>${esc(r.detail)}</small></div></div>`).join('')}</div></section>
    <div class="section-title"><h2>Quick numbers</h2><button class="link-btn" id="editTodayNumbers">Update</button></div>
    <section class="grid-2">${await todayMetricCards(h)}</section>
    <div class="section-title"><h2>Streaks</h2><span>Behaviour wins</span></div>
    <div class="streak-row">${await renderStreaks()}</div>
    ${await todayLessonCard()}`;
}

async function todayMetricCards(h){
  const n=await HealthDB.get('nutrition',isoDate())||{};const steps=Number(h.stepsValue)||0;const p=state.profile;
  return `
  <div class="metric-card"><div class="metric-label">CALORIES</div><div class="metric-value">${n.calories??'—'}</div><div class="metric-sub">${n.calories!=null?(p.calorieTarget?`of ${p.calorieTarget.toLocaleString()} kcal`:'target not set'):'Import / enter total'}</div></div>
  <div class="metric-card"><div class="metric-label">PROTEIN</div><div class="metric-value">${n.protein!=null?`${n.protein}g`:'—'}</div><div class="metric-sub">${p.proteinTarget?`Target ${p.proteinTarget}g`:'Target not set'}</div></div>
  <div class="metric-card"><div class="metric-label">STEPS</div><div class="metric-value">${steps?steps.toLocaleString():'—'}</div><div class="metric-sub">${p.stepTarget?`Target ${p.stepTarget.toLocaleString()}`:'Target not set'}</div></div>
  <div class="metric-card"><div class="metric-label">WATER</div><div class="metric-value">${h.waterLitres!=null?`${h.waterLitres}L`:'—'}</div><div class="metric-sub">${p.waterTarget?`Target ${p.waterTarget}L`:'Target not set'}</div></div>`;
}

async function coachText(h,latest,avg7,change,trajectory){
  const m=momentum(h);const p=state.profile;
  if(!latest)return 'Start with one simple win: log today’s weight. The dashboard will become more useful as your trend builds.';
  if(change!=null&&change<-.2&&m.earned>=70)return `Your 7-day weight trend is down ${Math.abs(change).toFixed(1)} lb and today’s Momentum is already ${m.earned}. Keep doing the boring things well.`;
  if(avg7!=null&&trajectory!=null&&avg7<=trajectory)return `Your 7-day average is on or ahead of the trajectory needed for ${p.madridWeight} lb by Madrid. Protect the behaviours rather than chasing a faster drop.`;
  if(m.earned<55&&new Date().getHours()>=18)return `Today needs rescuing. You still have ${100-m.earned} points available. Pick the easiest two unfinished actions and finish the day with momentum.`;
  if(m.earned>=85)return `Excellent day so far. You do not need to make it harder — finish the remaining easy wins and bank the consistency.`;
  return `You are building the evidence. Today’s job is not to force the scale; it is to complete enough controllable actions that the long-term trend becomes hard to avoid.`;
}

async function weeklyPriorities(){
  const p=state.profile;const weekStart=mondayOf();const habits=(await HealthDB.getAll('habits')).filter(h=>h.date>=weekStart&&h.date<=isoDate());const acts=(await HealthDB.getAll('activities')).filter(a=>a.date>=weekStart&&a.date<=isoDate());
  const strength=acts.filter(a=>a.type==='strength').length;const nutrition=habits.filter(h=>h.nutrition).length;const weigh=habits.filter(h=>h.weighIn).length;const priorities=[];
  if(strength<(p.strengthTarget||2))priorities.push({icon:'💪',title:`Complete ${Math.max(1,(p.strengthTarget||2)-strength)} strength session${(p.strengthTarget||2)-strength===1?'':'s'}`,detail:'Strength is the consistency gap we want to close.'});
  if(nutrition<Math.max(1,habits.length-1))priorities.push({icon:'🥗',title:'Protect the nutrition average',detail:'One normal planned day is more useful than a dramatic correction.'});
  if(weigh<habits.length)priorities.push({icon:'⚖',title:'Keep the weigh-in streak alive',detail:'More data makes the trend calmer and more useful.'});
  if(p.weeklyRunTarget){const miles=sum(acts.filter(a=>a.type==='run'),a=>a.distanceMiles);if(miles<p.weeklyRunTarget)priorities.push({icon:'🏃',title:`Build towards ${p.weeklyRunTarget} miles`,detail:`${round(miles,1)} miles logged so far this week.`});}
  priorities.push({icon:'💊',title:'Take the vitamins today',detail:'Small, boring, repeatable win.'},{icon:'🧠',title:'Complete today’s lesson',detail:'The long game is changing the behaviour, not just the number.'});
  return priorities.slice(0,3);
}

function seasonalCoachCard(){
  const today=isoDate();const md=today.slice(5);let title='',body='',emoji='';
  if(md>='12-01'&&md<='12-26'){emoji='🎄';title='Christmas Navigator';body='Enjoy Christmas deliberately. Protect the habits that matter, plan the occasions you care about, and avoid turning one celebration into a month-long write-off.';}
  else if(md>='12-27'||md<='01-07'){emoji='↩';title='New Year without the restart';body='There is no need for punishment or a dramatic reset. Return to your normal plan at the next meal and let the average recover.';}
  else if(daysTo(state.profile.madridDate)<=14&&isoDate()<=state.profile.madridDate){emoji='🏁';title='Race priorities have changed';body='The marathon is close. Performance and fuelling matter more now than forcing the fastest possible weight loss. Protect the work you have done.';}
  return title?`<section class="card coach"><h3>${emoji} ${title}</h3><p>${body}</p></section>`:'';
}

async function healthPerformanceScore(){
  const p=state.profile;const habits=await HealthDB.getAll('habits');const weekStart=addDays(isoDate(),-6);const recent=habits.filter(h=>h.date>=weekStart&&h.date<=isoDate());const metrics=[];
  if(recent.length){metrics.push({label:'Consistency',value:round(avg(recent.map(h=>momentum(h).earned)),0)});}
  const avg7=await sevenDayWeightAverage();const traj=weightTrajectory(p);if(avg7!=null&&traj!=null){const behind=avg7-traj;metrics.push({label:'Weight trajectory',value:clamp(round(100-Math.max(0,behind)*12,0),0,100)});}
  const acts=(await HealthDB.getAll('activities')).filter(a=>a.date>=mondayOf()&&a.date<=isoDate());const strength=acts.filter(a=>a.type==='strength').length;if(p.strengthTarget)metrics.push({label:'Strength',value:clamp(round(strength/p.strengthTarget*100,0),0,100)});
  if(p.weeklyRunTarget){const miles=sum(acts.filter(a=>a.type==='run'),a=>a.distanceMiles);metrics.push({label:'Running',value:clamp(round(miles/p.weeklyRunTarget*100,0),0,100)});}
  if(!metrics.length)return {score:null,metrics:[]};return {score:round(avg(metrics.map(m=>m.value)),0),metrics};
}

async function weeklyReviewCard(){
  const weekStart=mondayOf();const weights=(await weightRows()).filter(w=>w.date>=weekStart&&w.date<=isoDate());const acts=(await HealthDB.getAll('activities')).filter(a=>a.date>=weekStart&&a.date<=isoDate());const habits=(await HealthDB.getAll('habits')).filter(h=>h.date>=weekStart&&h.date<=isoDate());
  const delta=weights.length>=2?round(Number(weights.at(-1).value)-Number(weights[0].value),1):null;const miles=round(sum(acts.filter(a=>a.type==='run'),a=>a.distanceMiles),1);const strength=acts.filter(a=>a.type==='strength').length;const vit=habits.filter(h=>h.vitamins).length;const nutrition=habits.filter(h=>h.nutrition).length;const avgMomentum=habits.length?round(avg(habits.map(h=>momentum(h).earned)),0):null;
  return `<section class="card"><div class="goal-head"><div><strong>This week's review</strong><small>${fmtDate(weekStart,{day:'numeric',month:'short'})} – ${fmtDate(isoDate(),{day:'numeric',month:'short'})}</small></div>${avgMomentum!=null?`<span class="pill ${avgMomentum>=70?'good':avgMomentum>=55?'watch':'bad'}">${avgMomentum}/100</span>`:'<span class="pill">BUILDING</span>'}</div><div class="grid-2" style="margin-top:12px"><div class="metric-card"><div class="metric-label">WEIGHT</div><div class="metric-value">${delta==null?'—':`${delta>0?'+':''}${delta} lb`}</div><div class="metric-sub">first to latest this week</div></div><div class="metric-card"><div class="metric-label">RUNNING</div><div class="metric-value">${miles} mi</div><div class="metric-sub">${acts.filter(a=>a.type==='run').length} runs</div></div><div class="metric-card"><div class="metric-label">STRENGTH</div><div class="metric-value">${strength}</div><div class="metric-sub">sessions</div></div><div class="metric-card"><div class="metric-label">VITAMINS / NUTRITION</div><div class="metric-value">${vit} / ${nutrition}</div><div class="metric-sub">successful days</div></div></div></section>`;
}

async function renderStreaks(){
  const habits=(await HealthDB.getAll('habits')).sort((a,b)=>b.date.localeCompare(a.date));
  const defs=[['weighIn','⚖','Weigh-ins'],['vitamins','💊','Vitamins'],['nutrition','🥗','Nutrition'],['learning','🧠','Learning']];
  return defs.map(([key,emoji,label])=>{let streak=0;let d=isoDate();for(let i=0;i<500;i++){const r=habits.find(x=>x.date===d);if(r?.[key]){streak++;d=addDays(d,-1);}else if(i===0){d=addDays(d,-1);continue;}else break;}return `<div class="streak"><span class="emoji">${emoji}</span><strong>${streak} day${streak===1?'':'s'}</strong><small>${label}</small></div>`;}).join('');
}

async function todayLessonCard(){
  const day=journeyDay();const lessons=(await HealthDB.getAll('lessons')).sort((a,b)=>a.day-b.day);const lesson=lessons.find(l=>l.day===day)||lessons.find(l=>!l.completedAt)||lessons[0];if(!lesson)return '';
  return `<div class="section-title"><h2>Today's lesson</h2><span>${lesson.minutes} min</span></div><section class="card"><div class="lesson-card ${lesson.completedAt?'completed':''}" style="border:0;padding:0"><div class="lesson-number">${lesson.completedAt?'✓':lesson.day}</div><div><strong>${esc(lesson.title)}</strong><small>${esc(lesson.theme)} • Day ${lesson.day} of the programme</small></div><button class="secondary-btn" data-open-lesson="${lesson.id}">${lesson.completedAt?'Review':'Start'}</button></div></section>`;
}

async function renderProgress(){
  const p=state.profile;const weights=await weightRows();const latest=weights.at(-1)||null;const avg7=await sevenDayWeightAverage();const start=p.startWeight;const progress=(start&&latest&&start>p.ultimateWeight)?clamp((start-Number(latest.value))/(start-p.ultimateWeight)*100,0,100):0;
  const chart=weightChart(weights.slice(-45),p);
  const milestones=[];if(start){for(let w=Math.floor(start/5)*5;w>=p.ultimateWeight;w-=5)milestones.push(w);if(!milestones.includes(p.ultimateWeight))milestones.push(p.ultimateWeight);}
  const loss=start&&latest?round(start-Number(latest.value),1):null;const toGoal=latest?round(Number(latest.value)-p.ultimateWeight,1):null;
  const hp=await healthPerformanceScore();
  return `<div class="screen-head"><div><h2>Your transformation</h2><p>Trend over noise. Progress over perfection.</p></div><button class="primary-btn" id="addWeight">+ Weight</button></div>
    <section class="card"><div class="goal-head"><div><strong>Health & Performance score</strong><small>A dashboard motivation score — not a medical assessment.</small></div><span class="pill ${hp.score==null?'':hp.score>=70?'good':hp.score>=55?'watch':'bad'}">${hp.score==null?'BUILDING':`${hp.score}/100`}</span></div>${hp.metrics.length?`<div class="score-breakdown" style="margin-top:12px">${hp.metrics.map(m=>`<div class="score-item"><div><span>${esc(m.label)}</span><div class="mini-bar"><div style="width:${m.value}%"></div></div></div><b>${m.value}</b></div>`).join('')}</div>`:'<div class="metric-sub" style="margin-top:10px">This wakes up as your first week of data builds.</div>'}</section>
    <section class="card"><div class="goal-head"><div><strong>${latest?`${round(Number(latest.value),1)} lb`:'Add your baseline'}</strong><small>${latest?lbsToStone(Number(latest.value)):'Your journey starts here'}</small></div><span class="pill ${loss>0?'good':''}">${loss!=null?(loss>=0?`↓ ${loss} lb`:`↑ ${Math.abs(loss)} lb`):'BASELINE'}</span></div><div class="progress-track" style="margin-top:14px"><div class="progress-fill" style="width:${progress}%"></div></div><div class="goal-scale"><span>${start?`${start} lb start`:'Start'}</span><span>${p.madridWeight} Madrid</span><span>${p.ultimateWeight} goal</span></div></section>
    <section class="grid-2"><div class="metric-card"><div class="metric-label">7-DAY AVERAGE</div><div class="metric-value">${avg7!=null?`${round(avg7,1)} lb`:'—'}</div><div class="metric-sub">Smoothed trend</div></div><div class="metric-card"><div class="metric-label">TO ULTIMATE</div><div class="metric-value">${toGoal!=null?`${Math.max(0,toGoal)} lb`:'—'}</div><div class="metric-sub">Target ${p.ultimateWeight} lb</div></div></section>
    <div class="section-title"><h2>Weight trend</h2><span>Last ${Math.min(weights.length,45)} entries</span></div><section class="card">${chart}</section>
    <div class="section-title"><h2>Milestones</h2><span>Every 5 lb counts</span></div><div class="milestones">${milestones.length?milestones.map(w=>`<div class="milestone ${latest&&Number(latest.value)<=w?'hit':''}"><strong>${w}</strong><small>lb ${latest&&Number(latest.value)<=w?'✓':'target'}</small></div>`).join(''):'<div class="empty">Add your starting weight to create milestones.</div>'}</div>
    <div class="section-title"><h2>Weekly review</h2><span>Accountability</span></div>${await weeklyReviewCard()}
    <div class="section-title"><h2>Beyond the scale</h2><button class="link-btn" id="addWaist">Add waist</button></div>${await bodySecondaryMetrics()}`;
}

function weightChart(rows,p){
  if(rows.length<2)return `<div class="empty"><span class="emoji">📈</span>Two weigh-ins will unlock your first trend line.</div>`;
  const vals=rows.map(r=>Number(r.value));const min=Math.min(...vals,p.madridWeight)-2,max=Math.max(...vals)+2;const W=320,H=160,pad=22;const x=i=>pad+(i/(rows.length-1))*(W-pad*2);const y=v=>pad+(max-v)/(max-min)*(H-pad*2);
  const pts=rows.map((r,i)=>`${x(i)},${y(Number(r.value))}`).join(' ');
  const labels=[max,(max+min)/2,min];
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight trend chart">${labels.map(v=>`<line class="chart-grid" x1="${pad}" x2="${W-pad}" y1="${y(v)}" y2="${y(v)}"></line><text class="chart-label" x="0" y="${y(v)+3}">${round(v,0)}</text>`).join('')}<polyline class="chart-line" points="${pts}"></polyline>${rows.map((r,i)=>`<circle class="chart-dot" cx="${x(i)}" cy="${y(Number(r.value))}" r="3"></circle>`).join('')}<text class="chart-label" x="${pad}" y="${H}">${esc(fmtDate(rows[0].date,{day:'numeric',month:'short'}))}</text><text class="chart-label" text-anchor="end" x="${W-pad}" y="${H}">${esc(fmtDate(rows.at(-1).date,{day:'numeric',month:'short'}))}</text></svg></div>`;
}
async function bodySecondaryMetrics(){const waist=await latestMeasurement('waist');const photos=(await HealthDB.getAll('measurements')).filter(x=>x.type==='photo').length;return `<section class="grid-2"><div class="metric-card"><div class="metric-label">WAIST</div><div class="metric-value">${waist?`${waist.value} ${waist.unit||'in'}`:'—'}</div><div class="metric-sub">Periodic non-scale progress</div></div><div class="metric-card"><div class="metric-label">PROGRESS PHOTOS</div><div class="metric-value">${photos}</div><div class="metric-sub">Planned for a later release</div></div></section>`;}

async function renderRunning(){
  const activities=(await HealthDB.getAll('activities')).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));const weekStart=mondayOf();const thisWeek=activities.filter(a=>a.date>=weekStart&&a.date<=isoDate());
  const miles=sum(thisWeek.filter(a=>a.type==='run'),a=>a.distanceMiles);const strength=thisWeek.filter(a=>a.type==='strength').length;const runs=thisWeek.filter(a=>a.type==='run').length;const p=state.profile;
  return `<div class="screen-head"><div><h2>Running & training</h2><p>Garmin keeps the detail. This dashboard keeps the story.</p></div><button class="primary-btn" id="addActivity">+ Activity</button></div>
    <section class="grid-2"><div class="metric-card"><div class="metric-label">THIS WEEK</div><div class="metric-value">${round(miles,1)} mi</div><div class="metric-sub">${runs} run${runs===1?'':'s'}${p.weeklyRunTarget?` • target ${p.weeklyRunTarget} mi`:''}</div></div><div class="metric-card"><div class="metric-label">STRENGTH</div><div class="metric-value">${strength}/${p.strengthTarget}</div><div class="metric-sub">sessions this week</div></div></section>
    <section class="card"><div class="goal-head"><div><strong>Weekly training mix</strong><small>Start simple: run consistently and make strength happen.</small></div><span class="pill ${strength>=p.strengthTarget?'good':strength? 'watch':''}">${strength>=p.strengthTarget?'DONE':`${Math.max(0,p.strengthTarget-strength)} TO GO`}</span></div><div class="progress-track" style="margin-top:12px"><div class="progress-fill" style="width:${clamp(strength/p.strengthTarget*100,0,100)}%"></div></div></section>
    <div class="section-title"><h2>Recent activity</h2><span>${activities.length} logged</span></div><section class="card compact">${activities.length?activities.slice(0,10).map(activityRow).join(''):'<div class="empty"><span class="emoji">🏃</span>Your first run, strength session, swim or football activity will appear here.</div>'}</section>
    <div class="section-title"><h2>Performance baseline</h2><button class="link-btn" id="editBaseline">Edit</button></div><section class="grid-2"><div class="metric-card"><div class="metric-label">GARMIN VO₂ MAX</div><div class="metric-value">${p.vo2max??'—'}</div><div class="metric-sub">Manual for V0.1</div></div><div class="metric-card"><div class="metric-label">RUN BASELINE</div><div class="metric-value">${p.weeklyRunBaseline!=null?`${p.weeklyRunBaseline} mi`:'—'}</div><div class="metric-sub">Typical week at launch</div></div></section>
    <div class="section-title"><h2>Race goals & PBs</h2><button class="link-btn" id="managePBs">Manage</button></div>${await raceRecords()}`;
}
function activityRow(a){const icons={run:'🏃',strength:'💪',swim:'🏊',football:'⚽',walk:'🚶',cycle:'🚴',other:'●'};return `<div class="activity-row"><div class="activity-icon">${icons[a.type]||'●'}</div><div><strong>${esc(a.title||a.type)}</strong><small>${fmtDate(a.date,{weekday:'short',day:'numeric',month:'short'})}${a.durationMinutes?` • ${a.durationMinutes} min`:''}${a.avgHr?` • ${a.avgHr} bpm`:''}</small></div><div class="activity-value">${a.distanceMiles?`${round(a.distanceMiles,2)} mi`:a.type==='strength'?'✓':''}</div></div>`;}
async function raceRecords(){const rec=await HealthDB.get('settings','raceRecords')||{id:'raceRecords'};const keys=[['5k','5K'],['10k','10K'],['10mile','10 mile'],['half','Half'],['marathon','Marathon']];return `<section class="card compact">${keys.map(([k,l])=>`<div class="source-card"><div class="source-icon">🏁</div><div><strong>${l}</strong><small>Current-era best</small></div><b>${esc(rec[k]||'—')}</b></div>`).join('')}</section>`;}

async function renderLearn(){
  const lessons=(await HealthDB.getAll('lessons')).sort((a,b)=>a.day-b.day);const completed=lessons.filter(l=>l.completedAt).length;const day=journeyDay();
  return `<div class="screen-head"><div><h2>Learn the change</h2><p>Short lessons designed to make the result maintainable.</p></div><span class="pill ${completed?'good':''}">${completed}/${lessons.length}</span></div>
    <section class="hero ${!isJourneyStarted()?'preseason':''}"><div class="kicker">SIX-MONTH JOURNEY</div><h2>${isJourneyStarted()?`Day ${day}`:'Starts 3 November'}</h2><p>Lose weight while learning the behaviours that make maintaining it more likely.</p></section>
    <div class="section-title"><h2>Starter lessons</h2><span>V0.1 curriculum</span></div><section class="card compact">${lessons.map(l=>`<div class="lesson-card ${l.completedAt?'completed':''}"><div class="lesson-number">${l.completedAt?'✓':l.day}</div><div><strong>${esc(l.title)}</strong><small>${esc(l.theme)} • ${l.minutes} min</small></div><button class="secondary-btn" data-open-lesson="${l.id}">${l.completedAt?'Review':'Open'}</button></div>`).join('')}</section>
    <div class="section-title"><h2>Programme map</h2><span>To Madrid & beyond</span></div><section class="card">${CURRICULUM.map(([title,body])=>`<div class="phase"><strong>${esc(title)}</strong><p>${esc(body)}</p></div>`).join('')}</section>
    <section class="notice warning">Seasonal coaching will sit inside this curriculum — including Christmas, New Year, travel and the changing priorities of marathon training and race week.</section>`;
}

async function renderMore(){
  const badges=await derivedBadges();const journal=(await HealthDB.getAll('journal')).sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="screen-head"><div><h2>More</h2><p>Goals, badges, notes and connections.</p></div><button class="secondary-btn" id="openSettings">Settings</button></div>
    <div class="section-title"><h2>Badges</h2><span>${badges.filter(b=>b.hit).length}/${badges.length} unlocked</span></div><section class="badge-grid">${badges.map(b=>`<div class="badge ${b.hit?'':'locked'}"><span class="emoji">${b.emoji}</span><strong>${esc(b.title)}</strong><small>${esc(b.detail)}</small></div>`).join('')}</section>
    <div class="section-title"><h2>Data sources</h2><span>V0.1 status</span></div><section class="card compact">${dataSourceRows()}</section>
    <div class="section-title"><h2>Journal</h2><button class="link-btn" id="addJournal">+ Note</button></div><section class="card compact">${journal.length?journal.slice(0,8).map(j=>`<div class="journal-row"><strong>${esc(j.type||'Note')} • ${fmtDate(j.date,{day:'numeric',month:'short'})}</strong><small>${esc(j.severity||'')}</small><p>${esc(j.note||'')}</p></div>`).join(''):'<div class="empty">Log illness, niggles, a bad night’s sleep or anything that helps explain the data later.</div>'}</section>
    <div class="section-title"><h2>Quick actions</h2></div><section class="quick-grid"><button class="quick-option" id="quickWeight"><span>⚖</span><strong>Weight</strong><small>Daily weigh-in</small></button><button class="quick-option" id="quickNutrition"><span>🥗</span><strong>Nutrition</strong><small>Nutracheck totals</small></button><button class="quick-option" id="quickActivity"><span>🏃</span><strong>Activity</strong><small>Run, gym, swim, football</small></button><button class="quick-option" id="quickJournal"><span>✎</span><strong>Journal</strong><small>Illness, niggle or context</small></button></section>`;
}
function dataSourceRows(){return `
<div class="source-card"><div class="source-icon">G</div><div><strong>Garmin Forerunner 945</strong><small>Official Personal API confirmed. Activities + steps first; key must stay private.</small></div><span class="pill good">API READY</span></div>
<div class="source-card"><div class="source-icon">W</div><div><strong>Withings Body+</strong><small>Weight is the priority; body composition can provide context.</small></div><span class="pill watch">PLANNED</span></div>
<div class="source-card"><div class="source-icon">N</div><div><strong>Nutracheck</strong><small>Daily calories, protein and fibre rather than duplicating food logging.</small></div><span class="pill watch">PLANNED</span></div>`;}

async function derivedBadges(){
  const habits=await HealthDB.getAll('habits');const weights=await weightRows();const acts=await HealthDB.getAll('activities');const lessons=await HealthDB.getAll('lessons');const p=state.profile;const latest=weights.at(-1);const loss=p.startWeight&&latest?p.startWeight-Number(latest.value):0;
  const vitaminDays=habits.filter(h=>h.vitamins).length;const weighDays=habits.filter(h=>h.weighIn).length;const strength=acts.filter(a=>a.type==='strength').length;const completed=lessons.filter(l=>l.completedAt).length;
  return [
    {emoji:'🚀',title:'Journey begun',detail:'First weigh-in',hit:weights.length>0},
    {emoji:'⚖',title:'Scale regular',detail:'7 weigh-ins',hit:weighDays>=7},
    {emoji:'💊',title:'Pill power',detail:'7 vitamin days',hit:vitaminDays>=7},
    {emoji:'🧠',title:'Student',detail:'5 lessons',hit:completed>=5},
    {emoji:'💪',title:'Strength starts',detail:'First strength session',hit:strength>=1},
    {emoji:'🏃',title:'In motion',detail:'First activity',hit:acts.length>=1},
    {emoji:'5',title:'First five',detail:'5 lb lost',hit:loss>=5},
    {emoji:'10',title:'Double digits',detail:'10 lb lost',hit:loss>=10},
    {emoji:'🏁',title:'Madrid weight',detail:`Reach ${p.madridWeight} lb`,hit:latest&&Number(latest.value)<=p.madridWeight}
  ];
}

async function renderSettings(){
  const p=state.profile;const backup=await HealthDB.get('settings','backupMeta');
  return `<div class="screen-head"><div><h2>Settings</h2><p>Local-first controls and setup.</p></div><button class="secondary-btn" id="backMore">Back</button></div>
  <section class="card">
    <div class="settings-row"><h3>Profile & targets</h3><p>Start date, Madrid target, ultimate target and daily behaviour targets.</p><button class="primary-btn" id="editProfile">Edit profile & targets</button></div>
    <div class="settings-row"><h3>Baseline</h3><p>Starting weight, waist, Garmin VO₂ max and typical weekly mileage. These can be entered on 3 November morning.</p><button class="secondary-btn" id="settingsBaseline">Edit baseline</button></div>
    <div class="settings-row"><h3>Data connections</h3><p>Garmin's official Personal API is confirmed; Withings also has an official API. V0.1 remains manual while we wire credentials without exposing them in GitHub.</p><button class="secondary-btn" id="settingsSources">View status</button></div>
    <div class="settings-row"><h3>Encrypted backup</h3><p>${backup?.lastBackupAt?`Last backup ${new Date(backup.lastBackupAt).toLocaleString('en-GB')}`:'No backup yet'}. Export all local Health Dashboard data into one password-encrypted <code>.healthdash</code> file.</p><div class="button-row"><button class="primary-btn" id="exportBackup">Export everything</button><button class="secondary-btn" id="importBackup">Restore backup</button><input id="backupInput" type="file" accept=".healthdash,application/octet-stream" hidden></div></div>
    <div class="settings-row"><h3>App version</h3><p><span class="version-chip">v${APP_VERSION}</span> ${RELEASE_NAME}. Check what GitHub Pages currently has deployed or force the app shell to reload.</p><div class="button-row"><button class="secondary-btn" id="checkVersion">Check deployed version</button><button class="secondary-btn" id="reloadLatest">Reload latest</button></div></div>
    <div class="settings-row"><h3>Privacy</h3><p>Personal health information is stored in IndexedDB in this browser profile. GitHub hosts the application files, not your health records. Clearing browser/site data can remove local records, so encrypted backups matter.</p></div>
  </section>`;
}

function bindViewEvents(){
  document.querySelectorAll('[data-habit-toggle]').forEach(b=>b.onclick=()=>toggleHabit(b.dataset.habitToggle));
  document.querySelectorAll('[data-open-lesson]').forEach(b=>b.onclick=()=>openLesson(b.dataset.openLesson));
  document.querySelectorAll('.setup-action').forEach(b=>b.onclick=()=>handleSetupAction(b.dataset.action));
  const map={openBaseline:openBaselineModal,addWeight:openWeightModal,addWaist:openWaistModal,addActivity:openActivityModal,editBaseline:openBaselineModal,editTodayNumbers:openTodayNumbersModal,openSettings:()=>{state.view='settings';render();},quickWeight:openWeightModal,quickNutrition:openNutritionModal,quickActivity:openActivityModal,quickJournal:openJournalModal,addJournal:openJournalModal,backMore:()=>setView('more'),editProfile:openProfileModal,settingsBaseline:openBaselineModal,settingsSources:openSourcesModal,managePBs:openPBModal};
  for(const [id,fn] of Object.entries(map)){const el=document.getElementById(id);if(el)el.onclick=fn;}
  const exp=document.getElementById('exportBackup');if(exp)exp.onclick=exportEncryptedBackup;
  const imp=document.getElementById('importBackup');if(imp)imp.onclick=()=>document.getElementById('backupInput').click();
  const input=document.getElementById('backupInput');if(input)input.onchange=e=>{if(e.target.files?.[0])restoreEncryptedBackup(e.target.files[0]);};
  const cv=document.getElementById('checkVersion');if(cv)cv.onclick=checkDeployedVersion;
  const rl=document.getElementById('reloadLatest');if(rl)rl.onclick=reloadLatest;
}
async function toggleHabit(key){const h=await habitFor();h[key]=!h[key];await saveHabit(h);render();}
function handleSetupAction(action){if(action==='profile')openProfileModal();else if(action==='baseline')openBaselineModal();else openSourcesModal();}

function openProfileModal(){const p=state.profile;modal(`<div class="modal-head"><div><h2>Profile & targets</h2><p>These drive your scores, trajectory and daily cards.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="profileForm" class="form-grid">
<div class="form-grid cols-2"><div class="field"><label>Name</label><input name="name" value="${esc(p.name)}"></div><div class="field"><label>Journey start</label><input type="date" name="startDate" value="${p.startDate}"></div><div class="field"><label>Madrid Marathon</label><input type="date" name="madridDate" value="${p.madridDate}"></div><div class="field"><label>Madrid weight (lb)</label><input type="number" step="0.1" name="madridWeight" value="${p.madridWeight}"></div><div class="field"><label>Ultimate weight (lb)</label><input type="number" step="0.1" name="ultimateWeight" value="${p.ultimateWeight}"></div><div class="field"><label>Weekly running target (mi)</label><input type="number" step="1" name="weeklyRunTarget" value="${p.weeklyRunTarget??''}"></div></div>
<div class="modal-section-title">Daily targets</div><div class="form-grid cols-2"><div class="field"><label>Calories</label><input type="number" name="calorieTarget" value="${p.calorieTarget??''}"></div><div class="field"><label>Protein (g)</label><input type="number" name="proteinTarget" value="${p.proteinTarget??''}"></div><div class="field"><label>Fibre (g)</label><input type="number" name="fibreTarget" value="${p.fibreTarget??''}"></div><div class="field"><label>Water (L)</label><input type="number" step="0.1" name="waterTarget" value="${p.waterTarget??''}"></div><div class="field"><label>Steps</label><input type="number" step="500" name="stepTarget" value="${p.stepTarget??''}"></div><div class="field"><label>Strength sessions / week</label><input type="number" min="0" max="7" name="strengthTarget" value="${p.strengthTarget}"></div><div class="field"><label>Bedtime target</label><input type="time" name="bedtimeTarget" value="${p.bedtimeTarget||'22:30'}"></div></div>
<button class="primary-btn wide" type="submit">Save targets</button></form>`);
  document.getElementById('profileForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const updated={...p,name:f.get('name').trim()||'Matt',startDate:f.get('startDate'),madridDate:f.get('madridDate'),madridWeight:Number(f.get('madridWeight')),ultimateWeight:Number(f.get('ultimateWeight')),weeklyRunTarget:Number(f.get('weeklyRunTarget')),calorieTarget:Number(f.get('calorieTarget')),proteinTarget:Number(f.get('proteinTarget')),fibreTarget:Number(f.get('fibreTarget')),waterTarget:Number(f.get('waterTarget')),stepTarget:Number(f.get('stepTarget')),strengthTarget:Number(f.get('strengthTarget')),bedtimeTarget:f.get('bedtimeTarget'),updatedAt:nowIso()};await HealthDB.put('profile',updated);state.profile=updated;closeModal();toast('Targets saved');render();};
}
function openBaselineModal(){const p=state.profile;modal(`<div class="modal-head"><div><h2>Baseline</h2><p>You can leave these blank until Tuesday morning.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="baselineForm" class="form-grid"><div class="notice">Recommended: take your Withings weigh-in first thing on 3 November, then use that as the official start weight.</div><div class="form-grid cols-2"><div class="field"><label>Starting weight (lb)</label><input type="number" step="0.1" name="startWeight" value="${p.startWeight??''}" placeholder="Enter on 3 Nov"></div><div class="field"><label>Waist (in)</label><input type="number" step="0.1" name="waist" value="${p.waist??''}"></div><div class="field"><label>Garmin VO₂ max</label><input type="number" step="1" name="vo2max" value="${p.vo2max??''}"></div><div class="field"><label>Typical weekly running (mi)</label><input type="number" step="0.1" name="weeklyRunBaseline" value="${p.weeklyRunBaseline??''}"></div></div><button class="primary-btn wide">Save baseline</button></form>`);
  document.getElementById('baselineForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const val=n=>f.get(n)===''?null:Number(f.get(n));const updated={...p,startWeight:val('startWeight'),waist:val('waist'),vo2max:val('vo2max'),weeklyRunBaseline:val('weeklyRunBaseline'),updatedAt:nowIso()};await HealthDB.put('profile',updated);if(updated.startWeight){const existing=(await HealthDB.getAll('measurements')).find(x=>x.type==='weight'&&x.date===updated.startDate&&x.source==='baseline');if(!existing)await HealthDB.put('measurements',{id:`weight_${updated.startDate}_baseline`,type:'weight',date:updated.startDate,value:updated.startWeight,unit:'lb',source:'baseline',createdAt:nowIso()});}if(updated.waist)await HealthDB.put('measurements',{id:`waist_${updated.startDate}_baseline`,type:'waist',date:updated.startDate,value:updated.waist,unit:'in',source:'baseline',createdAt:nowIso()});state.profile=updated;closeModal();toast('Baseline saved');render();};
}
function openWeightModal(){modal(`<div class="modal-head"><div><h2>Log weight</h2><p>Daily data is useful because the app focuses on the smoothed trend.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="weightForm" class="form-grid"><div class="form-grid cols-2"><div class="field"><label>Date</label><input type="date" name="date" value="${isoDate()}"></div><div class="field"><label>Weight (lb)</label><input type="number" step="0.1" name="weight" required autofocus></div></div><div class="field"><label>Optional note</label><input name="note" placeholder="e.g. after holiday / sore legs"></div><button class="primary-btn wide">Save weigh-in</button></form>`);document.getElementById('weightForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),date=f.get('date'),value=Number(f.get('weight'));await HealthDB.put('measurements',{id:`weight_${date}_${Date.now()}`,type:'weight',date,value,unit:'lb',note:f.get('note'),source:'manual',createdAt:nowIso()});const h=await habitFor(date);h.weighIn=true;await saveHabit(h);if(date===state.profile.startDate&&!state.profile.startWeight){const p={...state.profile,startWeight:value,updatedAt:nowIso()};await HealthDB.put('profile',p);state.profile=p;}closeModal();toast('Weight logged');render();};}
function openWaistModal(){modal(`<div class="modal-head"><div><h2>Log waist</h2><p>A useful non-scale measure every few weeks.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="waistForm" class="form-grid"><div class="form-grid cols-2"><div class="field"><label>Date</label><input type="date" name="date" value="${isoDate()}"></div><div class="field"><label>Waist (in)</label><input type="number" step="0.1" name="waist" required></div></div><button class="primary-btn wide">Save</button></form>`);document.getElementById('waistForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);await HealthDB.put('measurements',{id:uid('waist'),type:'waist',date:f.get('date'),value:Number(f.get('waist')),unit:'in',source:'manual',createdAt:nowIso()});closeModal();toast('Waist logged');render();};}
function openActivityModal(){modal(`<div class="modal-head"><div><h2>Add activity</h2><p>V0.1 manual entry. Garmin import/sync will replace most of this later.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="activityForm" class="form-grid"><div class="form-grid cols-2"><div class="field"><label>Date</label><input type="date" name="date" value="${isoDate()}"></div><div class="field"><label>Type</label><select name="type"><option value="run">Run</option><option value="strength">Strength</option><option value="swim">Swim</option><option value="football">Football</option><option value="walk">Walk</option><option value="cycle">Cycle</option><option value="other">Other</option></select></div><div class="field"><label>Title</label><input name="title" placeholder="Easy run / gym"></div><div class="field"><label>Distance (miles)</label><input type="number" step="0.01" name="distanceMiles"></div><div class="field"><label>Duration (minutes)</label><input type="number" step="1" name="durationMinutes"></div><div class="field"><label>Average HR</label><input type="number" step="1" name="avgHr"></div></div><div class="field"><label>Notes</label><textarea name="notes" placeholder="How it felt, niggles, context..."></textarea></div><button class="primary-btn wide">Save activity</button></form>`);document.getElementById('activityForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),type=f.get('type'),date=f.get('date');await HealthDB.put('activities',{id:uid('activity'),date,type,title:f.get('title')||type,distanceMiles:f.get('distanceMiles')?Number(f.get('distanceMiles')):null,durationMinutes:f.get('durationMinutes')?Number(f.get('durationMinutes')):null,avgHr:f.get('avgHr')?Number(f.get('avgHr')):null,notes:f.get('notes'),source:'manual',createdAt:nowIso()});const h=await habitFor(date);h.training=true;await saveHabit(h);closeModal();toast('Activity saved');render();};}
function openNutritionModal(){const p=state.profile;HealthDB.get('nutrition',isoDate()).then(n=>{n=n||{};modal(`<div class="modal-head"><div><h2>Nutrition totals</h2><p>Use the totals from Nutracheck; don't duplicate food logging here.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="nutritionForm" class="form-grid"><div class="form-grid cols-2"><div class="field"><label>Date</label><input type="date" name="date" value="${isoDate()}"></div><div class="field"><label>Calories</label><input type="number" name="calories" value="${n.calories??''}" placeholder="${p.calorieTarget?`Target ${p.calorieTarget}`:'From Nutracheck'}"></div><div class="field"><label>Protein (g)</label><input type="number" name="protein" value="${n.protein??''}" placeholder="${p.proteinTarget?`Target ${p.proteinTarget}`:'Set your target'}"></div><div class="field"><label>Fibre (g)</label><input type="number" name="fibre" value="${n.fibre??''}" placeholder="${p.fibreTarget?`Target ${p.fibreTarget}`:'Set your target'}"></div><div class="field"><label>Fruit & veg portions</label><input type="number" step="1" name="fruitVeg" value="${n.fruitVeg??''}"></div></div><button class="primary-btn wide">Save totals</button></form>`);document.getElementById('nutritionForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),date=f.get('date'),num=k=>f.get(k)===''?null:Number(f.get(k));const row={id:date,date,calories:num('calories'),protein:num('protein'),fibre:num('fibre'),fruitVeg:num('fruitVeg'),source:'manual/nutracheck',updatedAt:nowIso()};await HealthDB.put('nutrition',row);const h=await habitFor(date);if(row.calories!=null&&state.profile.calorieTarget)h.nutrition=row.calories<=state.profile.calorieTarget;if(row.protein!=null&&state.profile.proteinTarget)h.protein=row.protein>=state.profile.proteinTarget;if((row.fibre!=null||row.fruitVeg!=null)&&state.profile.fibreTarget)h.fibre=(row.fibre||0)>=state.profile.fibreTarget||(row.fruitVeg||0)>=5;await saveHabit(h);closeModal();toast('Nutrition totals saved');render();};});}
function openTodayNumbersModal(){habitFor().then(h=>HealthDB.get('nutrition',isoDate()).then(n=>{n=n||{};modal(`<div class="modal-head"><div><h2>Today's numbers</h2><p>Fast manual entry until the data sources are connected.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="todayNumbersForm" class="form-grid"><div class="form-grid cols-2"><div class="field"><label>Steps</label><input type="number" name="steps" value="${h.stepsValue??''}" placeholder="${state.profile.stepTarget??''}"></div><div class="field"><label>Water (L)</label><input type="number" step="0.1" name="water" value="${h.waterLitres??''}" placeholder="${state.profile.waterTarget??''}"></div><div class="field"><label>Calories</label><input type="number" name="calories" value="${n.calories??''}"></div><div class="field"><label>Protein (g)</label><input type="number" name="protein" value="${n.protein??''}"></div><div class="field"><label>Fibre (g)</label><input type="number" name="fibre" value="${n.fibre??''}"></div><div class="field"><label>Fruit & veg</label><input type="number" name="fruitVeg" value="${n.fruitVeg??''}"></div></div><button class="primary-btn wide">Save today</button></form>`);document.getElementById('todayNumbersForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),num=k=>f.get(k)===''?null:Number(f.get(k));h.stepsValue=num('steps');h.waterLitres=num('water');if(h.stepsValue!=null&&state.profile.stepTarget)h.steps=h.stepsValue>=state.profile.stepTarget;if(h.waterLitres!=null&&state.profile.waterTarget)h.water=h.waterLitres>=state.profile.waterTarget;await saveHabit(h);const row={id:isoDate(),date:isoDate(),calories:num('calories'),protein:num('protein'),fibre:num('fibre'),fruitVeg:num('fruitVeg'),source:'manual/nutracheck',updatedAt:nowIso()};await HealthDB.put('nutrition',row);if(row.calories!=null&&state.profile.calorieTarget)h.nutrition=row.calories<=state.profile.calorieTarget;if(row.protein!=null&&state.profile.proteinTarget)h.protein=row.protein>=state.profile.proteinTarget;if((row.fibre!=null||row.fruitVeg!=null)&&state.profile.fibreTarget)h.fibre=(row.fibre||0)>=state.profile.fibreTarget||(row.fruitVeg||0)>=5;await saveHabit(h);closeModal();toast('Today updated');render();};}));}
function openJournalModal(){modal(`<div class="modal-head"><div><h2>Add context</h2><p>Useful for explaining odd data later.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="journalForm" class="form-grid"><div class="form-grid cols-2"><div class="field"><label>Date</label><input type="date" name="date" value="${isoDate()}"></div><div class="field"><label>Type</label><select name="type"><option>Note</option><option>Illness</option><option>Niggle / injury</option><option>Poor sleep</option><option>Fatigue</option><option>Holiday / travel</option></select></div><div class="field"><label>Severity</label><select name="severity"><option value="">Not rated</option><option>Mild</option><option>Moderate</option><option>Significant</option></select></div></div><div class="field"><label>What happened?</label><textarea name="note" required></textarea></div><button class="primary-btn wide">Save note</button></form>`);document.getElementById('journalForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);await HealthDB.put('journal',{id:uid('journal'),date:f.get('date'),type:f.get('type'),severity:f.get('severity'),note:f.get('note'),createdAt:nowIso()});closeModal();toast('Context saved');render();};}
async function openLesson(id){const l=await HealthDB.get('lessons',id);if(!l)return;modal(`<div class="modal-head"><div><h2>${esc(l.title)}</h2><p>${esc(l.theme)} • ${l.minutes} minute lesson</p></div><button class="close-btn" data-close-modal>×</button></div><div class="notice">Day ${l.day} of the starter curriculum</div><p style="font-size:.84rem;line-height:1.65">${esc(l.body)}</p><div class="card compact" style="box-shadow:none"><div class="metric-label">QUICK CHECK</div><p style="font-size:.78rem;line-height:1.5;margin:7px 0 3px">${esc(l.question)}</p><strong style="font-size:.82rem">${esc(l.answer)}</strong></div><div class="card compact" style="box-shadow:none;margin-top:10px"><div class="metric-label">TODAY'S EXPERIMENT</div><p style="font-size:.78rem;line-height:1.5;margin:7px 0 0">${esc(l.action)}</p></div><button id="completeLesson" class="primary-btn wide" style="margin-top:14px">${l.completedAt?'Completed ✓':'Complete lesson'}</button>`);document.getElementById('completeLesson').onclick=async()=>{if(!l.completedAt){l.completedAt=nowIso();await HealthDB.put('lessons',l);const h=await habitFor();h.learning=true;await saveHabit(h);toast('Lesson complete +5 Momentum');}closeModal();render();};}
function openSourcesModal(){modal(`<div class="modal-head"><div><h2>Data connections</h2><p>Where V0.1 stands.</p></div><button class="close-btn" data-close-modal>×</button></div><div class="notice">The app is fully usable manually. We can add integrations without changing your underlying dashboard data model.</div><div style="margin-top:12px">${dataSourceRows()}</div><div class="separator"></div><p style="font-size:.7rem;color:var(--muted);line-height:1.5">Garmin: the official Personal API is available, with activities and steps as our priority. Withings: weight first. Nutracheck: daily totals rather than individual foods. Secrets will never be hard-coded into the GitHub Pages files.</p>`);}
function openPBModal(){HealthDB.get('settings','raceRecords').then(r=>{r=r||{id:'raceRecords'};modal(`<div class="modal-head"><div><h2>Race records</h2><p>Use current-era PBs rather than comparing every day with teenage-you.</p></div><button class="close-btn" data-close-modal>×</button></div><form id="pbForm" class="form-grid"><div class="form-grid cols-2">${[['5k','5K'],['10k','10K'],['10mile','10 mile'],['half','Half marathon'],['marathon','Marathon']].map(([k,l])=>`<div class="field"><label>${l}</label><input name="${k}" value="${esc(r[k]||'')}" placeholder="e.g. 20:26"></div>`).join('')}</div><button class="primary-btn wide">Save records</button></form>`);document.getElementById('pbForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);for(const k of ['5k','10k','10mile','half','marathon'])r[k]=f.get(k).trim();r.updatedAt=nowIso();await HealthDB.put('settings',r);closeModal();toast('Records saved');render();};});}
function openQuickAdd(){modal(`<div class="modal-head"><div><h2>Quick add</h2><p>What do you want to log?</p></div><button class="close-btn" data-close-modal>×</button></div><div class="quick-grid"><button class="quick-option" data-quick="weight"><span>⚖</span><strong>Weight</strong><small>Daily Withings number</small></button><button class="quick-option" data-quick="nutrition"><span>🥗</span><strong>Nutrition</strong><small>Nutracheck totals</small></button><button class="quick-option" data-quick="activity"><span>🏃</span><strong>Activity</strong><small>Run, gym, swim, football</small></button><button class="quick-option" data-quick="journal"><span>✎</span><strong>Journal</strong><small>Illness, niggle or context</small></button><button class="quick-option" data-quick="waist"><span>↔</span><strong>Waist</strong><small>Periodic body measure</small></button><button class="quick-option" data-quick="today"><span>✓</span><strong>Today's numbers</strong><small>Steps, water, nutrition</small></button></div>`);document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{const k=b.dataset.quick;closeModal();({weight:openWeightModal,nutrition:openNutritionModal,activity:openActivityModal,journal:openJournalModal,waist:openWaistModal,today:openTodayNumbersModal}[k])();});}

function bytesToBase64(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);}
function base64ToBytes(s){const raw=atob(s),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;}
async function deriveKey(password,salt){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function exportEncryptedBackup(){const password=prompt('Choose a password for this Health Dashboard backup. You will need the same password to restore it.');if(!password)return;try{toast('Preparing encrypted backup…');const data=await HealthDB.exportAll();const payload={format:'health-dashboard-backup',formatVersion:1,appVersion:APP_VERSION,createdAt:nowIso(),data};const plain=new TextEncoder().encode(JSON.stringify(payload));const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const key=await deriveKey(password,salt);const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain));const wrapper={format:'health-dashboard-encrypted',version:1,kdf:'PBKDF2-SHA256',iterations:250000,cipher:'AES-256-GCM',salt:bytesToBase64(salt),iv:bytesToBase64(iv),data:bytesToBase64(cipher)};const blob=new Blob([JSON.stringify(wrapper)],{type:'application/octet-stream'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`HealthDashboard-${isoDate()}-v${APP_VERSION}.healthdash`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);await HealthDB.put('settings',{id:'backupMeta',lastBackupAt:nowIso(),lastBackupVersion:APP_VERSION});toast('Encrypted backup created');render();}catch(error){console.error(error);alert(`Backup failed: ${error.message||error}`);}}
async function restoreEncryptedBackup(file){const password=prompt('Enter the password used when this backup was created.');if(!password)return;try{const wrapper=JSON.parse(await file.text());if(wrapper.format!=='health-dashboard-encrypted')throw new Error('Wrong file format');const key=await deriveKey(password,base64ToBytes(wrapper.salt));const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:base64ToBytes(wrapper.iv)},key,base64ToBytes(wrapper.data));const payload=JSON.parse(new TextDecoder().decode(plain));if(payload.format!=='health-dashboard-backup'||!payload.data)throw new Error('Invalid backup payload');if(!confirm(`Restore Health Dashboard backup from ${new Date(payload.createdAt).toLocaleString('en-GB')}? This replaces the local data on this device.`))return;await HealthDB.replaceAll(payload.data);state.profile=await HealthDB.get('profile','main');closeModal();toast('Backup restored');setView('today');}catch(error){console.error(error);alert('Restore failed. Check the backup file and password.');}}
async function checkDeployedVersion(){try{const res=await fetch(`./version.json?t=${Date.now()}`,{cache:'no-store'});const info=await res.json();if(info.version===APP_VERSION)toast(`You are running deployed v${APP_VERSION}`);else alert(`This device is running v${APP_VERSION}, but GitHub has v${info.version}. Tap “Reload latest”.`);}catch{toast('Could not check GitHub right now');}}
async function reloadLatest(){try{if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)await r.update();}const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('health-dashboard-')).map(k=>caches.delete(k)));location.reload();}catch{location.reload();}}

async function init(){await ensureDefaults();document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.getElementById('quickAddButton').onclick=openQuickAdd;document.getElementById('settingsButton').onclick=()=>{state.view='settings';document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));render();};if('serviceWorker'in navigator){try{await navigator.serviceWorker.register('./sw.js');}catch(e){console.warn('Service worker registration failed',e);}}await render();}
init();
