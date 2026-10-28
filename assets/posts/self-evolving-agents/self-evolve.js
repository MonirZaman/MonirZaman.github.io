/* Interactive figures for "Interactive Guide to Self-Evolving Agents".
 * All figures are toy models or illustrations written for this post; numbers quoted in the text come from the cited papers.
 * Mounts on the .bench elements inside <div class="sea"> (ids w-why, w-cycle, w-map, w-critic, w-arex, ...). No dependencies.
 * Load once at the end of the post: <script src="{{ A }}/self-evolve.js"></script>
 */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ROOT=document.querySelector('.sea')||document.documentElement;const css=v=>getComputedStyle(ROOT).getPropertyValue(v).trim();
function rng(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function gauss(r){let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
const cw=svg=>Math.round(Math.max(300,Math.min(680,(svg.parentNode.clientWidth||640)-2)));
const setVB=(svg,W,H)=>svg.setAttribute('viewBox',`0 0 ${W} ${H}`);

/* ---------- shared diagram helpers ---------- */
const REDRAW=[];const mid=x=>x.replace(/<text(?![^>]*text-anchor)/g,'<text text-anchor="middle"');const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function arrowDefs(id,col){return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker></defs>`}
function wrapText(t,max){const w=t.split(' ');const out=[];let cur='';w.forEach(x=>{if((cur+' '+x).trim().length>max){if(cur)out.push(cur);cur=x}else cur=(cur+' '+x).trim()});if(cur)out.push(cur);return out}
function tlines(x,y,lines,cls,anchor,lh){return lines.map((l,i)=>`<text x="${x}" y="${y+i*(lh||14)}" text-anchor="${anchor||'middle'}" class="${cls||''}">${l}</text>`).join('')}
function box(x,y,w,h,o){o=o||{};return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r||9}" fill="${o.fill||css('--bg')}" stroke="${o.stroke||css('--line')}" stroke-width="${o.sw||1.5}"${o.dash?` stroke-dasharray="${o.dash}"`:''}/>`}

/* ---------- 0a. why self-evolve (toy) ---------- */
(function(){const el=$('#w-why');if(!el)return;const svg=$('svg.lanes',el),ch=$('svg.trend',el),sl=$('#wD',el),bad=$('.badv',el);
 const TYPES=[{n:'wrong test command',d:0},{n:'time-zone bug',d:0},{n:'edits before reproducing',d:0},{n:'ticket missing repro steps',d:0},{n:'wrong cloud CLI flags',d:15},{n:'no rollback plan',d:15}];
 const N=60,DAYS=30;
 const r0=rng(2026),T=[];
 for(let i=0;i<N;i++){const day=Math.floor(i/2);const pool=TYPES.map((t,k)=>k).filter(k=>TYPES[k].d<=day);
  const typed=r0()<(day>=15?0.6:0.5);let ty=-1;if(typed){if(day>=15&&r0()<0.65)ty=4+(r0()<0.5?0:1);else ty=pool[Math.floor(r0()*Math.min(4,pool.length))]}
  T.push({day,ty,u:r0(),v:r0(),w:r0()})}
 function run(mode,weak){const learned={},badLessons=[];let bl=0;const res=[];const failsSeen={};let repeats=0;const marks=[];
  for(let i=0;i<N;i++){const t=T[i];
   if(mode==='weekly'&&i>0&&T[i-1].day!==t.day&&t.day%7===0){const cnt={};res.forEach(r=>{if(!r.ok&&r.ty>=0&&!learned[r.ty])cnt[r.ty]=(cnt[r.ty]||0)+1});const k=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];if(k!==undefined){learned[k]=1;marks.push({i,txt:'engineer fixes: '+TYPES[k].n})}}
   let pf=t.ty<0?0.1:(learned[t.ty]?0.1:0.85);pf=Math.min(0.95,pf+bl);
   const ok=t.u>=pf;if(!ok&&t.ty>=0){if(failsSeen[t.ty])repeats++;failsSeen[t.ty]=1}
   res.push({ok,ty:t.ty});
   if(mode==='self'&&!ok&&t.ty>=0&&!learned[t.ty]){
    if(weak&&t.v<0.5){bl+=0.1;marks.push({i,txt:'kept a wrong lesson after: '+TYPES[t.ty].n,bad:1})}
    else if(t.w<0.9){learned[t.ty]=1;marks.push({i,txt:'learned: '+TYPES[t.ty].n})}}}
  return{res,marks,repeats}}
 const LANES=[{k:'frozen',n:'Frozen'},{k:'weekly',n:'Engineer tunes weekly'},{k:'self',n:'Self-evolving'}];
 let day=DAYS,timer=null;
 function draw(){const D=+sl.value;day=D;$('output',el).textContent='day '+D;const weak=bad.checked;
  const R=LANES.map(l=>run(l.k,weak)),shown=Math.min(N,D*2);
  const W=cw(svg),narrow=W<520,lw=narrow?0:150,cell=Math.max(3,Math.min(9,(W-lw-12)/N-1.2)),gap=(W-lw-8)/N;
  const laneH=narrow?52:46,H=24+LANES.length*laneH+8;setVB(svg,W,H);
  let s='';const xd=i=>lw+4+i*gap;
  s+=`<line x1="${xd(30)}" x2="${xd(30)}" y1="14" y2="${H-4}" stroke="${css('--muted')}" stroke-dasharray="3 3"/><text x="${xd(30)+4}" y="12" class="sub" text-anchor="start">${narrow?'day 15: new work':'day 15: infrastructure work starts'}</text>`;
  LANES.forEach((l,k)=>{const y0=24+k*laneH,yc=y0+(narrow?30:24);
   if(narrow)s+=`<text x="4" y="${y0+12}" text-anchor="start" class="lab">${l.n}</text>`;else s+=`<text x="${lw-10}" y="${yc+4}" text-anchor="end" class="lab">${l.n}</text>`;
   R[k].res.forEach((r,i)=>{const on=i<shown;const col=!on?css('--line'):r.ok?css('--keep'):css('--reject');
    s+=`<rect x="${xd(i)}" y="${yc-cell/2}" width="${cell}" height="${cell}" rx="1.5" fill="${col}" opacity="${on?1:.35}"><title>Ticket ${i+1} (day ${T[i].day+1})${T[i].ty>=0?': '+TYPES[T[i].ty].n:''}: ${r.ok?'fixed':'failed'}</title></rect>`});
   R[k].marks.filter(m=>m.i<shown).forEach(m=>{const x=xd(m.i)+cell/2,y=yc-cell/2-4;s+=`<path d="M${x-4},${y-7} L${x+4},${y-7} L${x},${y} z" fill="${m.bad?css('--reject'):css('--state')}"><title>${m.txt}</title></path>`});});
  svg.innerHTML=mid(s);
  // trend chart: rolling 14-ticket success
  const W2=cw(ch),H2=Math.round(W2*0.3)+30,pl=40,pr=12,pt=10,pb=30;setVB(ch,W2,H2);
  const xs=i=>pl+i/(N-1)*(W2-pl-pr),ys=v=>pt+(1-v)*(H2-pt-pb);
  let c='';[0,.5,1].forEach(v=>c+=`<line x1="${pl}" x2="${W2-pr}" y1="${ys(v)}" y2="${ys(v)}" stroke="${css('--line')}"/><text x="${pl-6}" y="${ys(v)+3.5}" text-anchor="end">${v*100}%</text>`);
  [0,10,20,30].forEach(d=>c+=`<text x="${xs(Math.min(N-1,d*2))}" y="${H2-14}" text-anchor="${d===0?'start':d===30?'end':'middle'}">day ${d}</text>`);
  c+=`<text x="${(pl+W2-pr)/2}" y="${H2-1}" text-anchor="middle">share of the last 7 days' tickets fixed</text>`;
  const cols=[css('--muted'),css('--prop'),weak?css('--reject'):css('--keep')],roll=[];
  R.forEach((rr,k)=>{const pts=[];let last=0;for(let i=3;i<shown;i++){const a=rr.res.slice(Math.max(0,i-13),i+1);last=a.filter(x=>x.ok).length/a.length;pts.push(xs(i).toFixed(1)+','+ys(last).toFixed(1))}roll.push(last);
   if(pts.length)c+=`<polyline points="${pts.join(' ')}" fill="none" stroke="${cols[k]}" stroke-width="${k===2?3:2}"${k===0?' stroke-dasharray="4 3"':''}/>`});
  ch.innerHTML=mid(c);
  ['.v1','.v2','.v3'].forEach((q,k)=>$(q,el).textContent=shown>3?Math.round(roll[k]*100)+'%':'–');
  $('.v4',el).textContent=R.map(r=>r.res.slice(0,shown).filter((x,i)=>!x.ok&&x.ty>=0).length).join(' · ');
  $('.wc',el).textContent=weak?'With a weak verifier, the loop also keeps wrong lessons (red markers). They pile up and make even ordinary tickets fail'+(shown>3&&roll[2]<roll[0]?', until it does worse than not learning at all':', and its advantage over not learning shrinks or disappears')+'. Self-improvement is only as good as the check that decides what to keep.':
   D<15?'Each new kind of ticket fails at first in every lane. The frozen agent keeps failing on it. The engineer fixes the most common problem once a week. The self-evolving loop learns from each failure as it happens (violet markers).':
   'On day 15 infrastructure work arrives with failures nobody has seen. The frozen agent never recovers and the weekly fixes lag behind; the self-evolving loop learns the new failures within days.';}
 function stop(){if(timer){clearInterval(timer);timer=null}$('.bplay',el).textContent='Play the month'}
 $('.bplay',el).onclick=()=>{if(timer){stop();return}if(+sl.value>=DAYS)sl.value=0;$('.bplay',el).textContent='Pause';timer=setInterval(()=>{sl.value=+sl.value+1;draw();if(+sl.value>=DAYS)stop()},RM?60:220)};
 sl.oninput=()=>{stop();draw()};bad.onchange=draw;REDRAW.push(draw);draw();})();

/* ---------- 0b. the loop, drawn ---------- */
(function(){const el=$('#w-cycle');if(!el)return;const svg=$('svg',el);
 const S=[{h:'1 · Experience',c:'--prop',t:'Ticket 12 failed: Patch ran npm test in a Python repo, so nothing was tested.'},
  {h:'2 · Proposal',c:'--prop',t:'New lesson: "if the repo has a pyproject.toml, run pytest."'},
  {h:'3 · Verifier',c:'--keep',t:'Re-run ticket 12 and three held-out tickets with the lesson: all pass.'},
  {h:'4 · Kept state',c:'--state',t:'Memory v7 now holds the lesson and is read on every later ticket.'}];
 const EL=['suggests','tested by','accepts','shapes the next attempt'];
 function draw(){const W=cw(svg),narrow=W<640;let s=arrowDefs('cyA',css('--muted'))+arrowDefs('cyR',css('--reject')).replace('cyR','cyR');let H;
  if(!narrow){const G=58,bw=(W-20-3*G)/4,bh=124,y=24;H=y+bh+70;
   S.forEach((n,k)=>{const x=10+k*(bw+G);s+=box(x,y,bw,bh,{stroke:css(n.c),fill:css('--surface'),sw:2});
    s+=`<text x="${x+10}" y="${y+18}" text-anchor="start" class="mono" style="fill:${css(n.c)}">${n.h.toUpperCase()}</text>`+tlines(x+10,y+38,wrapText(n.t,Math.floor((bw-16)/7)),'body','start',15);
    if(k<3){const ax=x+bw+4;s+=`<line x1="${ax}" y1="${y+bh/2}" x2="${ax+G-8}" y2="${y+bh/2}" stroke="${css('--muted')}" stroke-width="1.6" marker-end="url(#cyA)"/><text x="${ax+(G-8)/2}" y="${y+bh/2-8}" class="sub">${EL[k]}</text>`}});
   const xl=10+3*(bw+G)+bw/2,xf=10+bw/2,yb=y+bh;
   s+=`<path d="M${xl},${yb} L${xl},${yb+30} L${xf},${yb+30} L${xf},${yb+4}" fill="none" stroke="${css('--state')}" stroke-width="1.8" marker-end="url(#cyA)"/><text x="${(xl+xf)/2}" y="${yb+46}" class="sub">${EL[3]}: the loop repeats on every ticket</text>`;
   const xv=10+2*(bw+G)+bw/2;s+=`<path d="M${xv},${yb} L${xv},${yb+14}" stroke="${css('--reject')}" stroke-width="1.6" stroke-dasharray="3 3" marker-end="url(#cyR)"/><text x="${xv+8}" y="${yb+16}" text-anchor="start" class="sub" style="fill:${css('--reject')}">rejected → discarded</text>`;}
  else{const bw=W-56,bh=84,x=30;H=20;
   S.forEach((n,k)=>{const y=H;s+=box(x,y,bw,bh,{stroke:css(n.c),fill:css('--surface'),sw:2});
    s+=`<text x="${x+10}" y="${y+18}" text-anchor="start" class="mono" style="fill:${css(n.c)}">${n.h.toUpperCase()}</text>`+tlines(x+10,y+38,wrapText(n.t,Math.floor((bw-20)/6.6)),'body','start',15);
    if(k<3)s+=`<line x1="${x+bw/2}" y1="${y+bh}" x2="${x+bw/2}" y2="${y+bh+22}" stroke="${css('--muted')}" stroke-width="1.6" marker-end="url(#cyA)"/><text x="${x+bw/2+8}" y="${y+bh+15}" text-anchor="start" class="sub">${EL[k]}</text>`;
    H+=bh+(k<3?26:0)});
   s+=`<path d="M${x},${H-42} L${x-18},${H-42} L${x-18},${62} L${x-2},${62}" fill="none" stroke="${css('--state')}" stroke-width="1.8" marker-end="url(#cyA)"/>`;
   s+=`<text x="${x+bw/2}" y="${H+18}" class="sub">the kept state shapes the next attempt</text>`;H+=28;}
  setVB(svg,W,H);svg.innerHTML=mid(s);}
 REDRAW.push(draw);draw();})();

/* ---------- 0c. roadmap map (SVG) ---------- */
(function(){const el=$('#w-map'),ch=$('.chips',el),svg=$('svg',el);
 const P=[
  {l:'1 · Self-checks',v:'the test suite, not self-review',c:['out'],k:0,p:'Patch reviews its own fix and still ships bugs.',i:'Judge changes with a signal stronger than the model\'s own opinion: the tests.'},
  {l:'2 · Long tickets',v:'calibrated confidence + audit',c:['out'],k:0,p:'Research tickets with no test either stop too early or wander off.',i:'Audit with a calibrated confidence score; refine what is salvageable, restart what is not.'},
  {l:'3 · Memory',v:'task feedback on lessons',c:['mem'],k:1,p:'Patch repeats yesterday\'s mistakes, and its notes start to contradict each other.',i:'Keep lessons between tickets, and revise the ones you used instead of only adding new ones.'},
  {l:'4 · Whole harness',v:'contrast, then held-out tickets',c:['prompt','tools','mem','flow'],k:1,p:'Some failures come from the workflow or a missing tool, and there is no answer key.',i:'Try several harness edits on the same ticket, keep what the contrast supports, and accept only gains that hold on held-out tickets.'},
  {l:'5 · Trade-offs',v:'tests, security and cost kept apart',c:['prompt','tools','mem','flow'],k:1,p:'A harness that closes more tickets turns out to disable security checks.',i:'Keep objectives apart, and evolve general and local parts of the harness separately.'},
  {l:'6 · Weights',v:'tests on its own attempts',c:['w'],k:2,p:'No harness edit can teach the model a skill it lacks.',i:'Fine-tune on its own test-verified successes.'},
  {l:'7 · Practice tasks',v:'validity + 25–75% calibration',c:['task','w'],k:2,p:'Training stalls on tasks that are always or never solved.',i:'Turn failures into new practice tasks, admitted only if Patch solves them 25–75% of the time.'},
  {l:'8 · Improver',v:'replay, benchmark or held-out grade',c:['imp'],k:3,p:'The hand-written improvement process is now the bottleneck.',i:'Make the improver editable: dream in an evolving world of recorded runs, or let an orchestrator change the search when it stalls.'},
  {l:'9 · The judge',v:'new judge must beat a human-labelled anchor set',c:['ver'],k:3,p:'Patch learns what the reviewer likes instead of writing better code.',i:'Let the judge evolve too, anchored to a trusted reference the loop cannot change.'},
  {l:'10 · In production',v:'code gate, then human review',c:['prompt','tools'],k:1,p:'Kiro, a shipped coding agent, keeps failing in ways its team can see in its run logs.',i:'Models propose one change at a time; deterministic code accepts or rejects it; humans merge.'}];
 const LASTS=['one attempt','across tasks','permanent','all future improvement'];
 let cur=0;
 P.forEach((p,k)=>{const b=document.createElement('button');b.className='chip';b.textContent=p.l;b.onclick=()=>{cur=k;draw()};ch.appendChild(b)});
 function draw(){const p=P[cur];$$('.chip',el).forEach((b,k)=>b.setAttribute('aria-pressed',k===cur));
  const W=cw(svg),narrow=W<600,K=css('--keep'),V=css('--state'),M=css('--muted'),L=css('--line'),S=css('--surface');
  const N={};let H;
  if(!narrow){const sx=W/680;const X=v=>v*sx;
   N.imp={x:X(230),y:12,w:X(220),h:48};N.task={x:X(8),y:150,w:X(98),h:60};N.patch={x:X(134),y:100,w:X(266),h:168};
   N.harn={x:X(146),y:122,w:X(242),h:88};N.prompt={x:X(156),y:142,w:X(108),h:26};N.tools={x:X(272),y:142,w:X(106),h:26};N.mem={x:X(156),y:176,w:X(108),h:26};N.flow={x:X(272),y:176,w:X(106),h:26};
   N.w={x:X(146),y:220,w:X(242),h:36};N.out={x:X(428),y:150,w:X(96),h:60};N.ver={x:X(552),y:128,w:X(120),h:104};H=330;}
  else{const x0=34,w0=W-52;
   N.imp={x:x0,y:10,w:w0,h:44};N.task={x:x0,y:84,w:w0,h:40};N.patch={x:x0,y:150,w:w0,h:166};N.harn={x:x0+10,y:172,w:w0-20,h:88};
   const hw=(w0-40)/2;N.prompt={x:x0+16,y:192,w:hw,h:26};N.tools={x:x0+24+hw,y:192,w:hw,h:26};N.mem={x:x0+16,y:226,w:hw,h:26};N.flow={x:x0+24+hw,y:226,w:hw,h:26};
   N.w={x:x0+10,y:270,w:w0-20,h:36};N.out={x:x0,y:342,w:w0,h:40};N.ver={x:x0,y:408,w:w0,h:70};H=548;}
  setVB(svg,W,H);
  const cx=n=>n.x+n.w/2,cy=n=>n.y+n.h/2;
  const chg=k=>p.c.includes(k),allH=['prompt','tools','mem','flow'].every(chg);
  let s=arrowDefs('mpA',M)+arrowDefs('mpK',K)+arrowDefs('mpV',V);
  const nb=(k,title,sub)=>{const n=N[k],on=chg(k)||(k==='harn'&&allH);const isV=k==='ver';
   s+=box(n.x,n.y,n.w,n.h,{stroke:on?K:isV?V:L,fill:on?`color-mix(in srgb, ${K} 16%, ${S})`:isV?`color-mix(in srgb, ${V} 10%, ${S})`:S,sw:on||isV?2.2:1.4});
   if(sub===undefined)s+=`<text x="${cx(n)}" y="${cy(n)+4}" class="lab">${title}</text>`;
   else{s+=`<text x="${cx(n)}" y="${n.y+20}" class="lab">${title}</text>`+tlines(cx(n),n.y+36,wrapText(sub,Math.max(12,Math.floor(n.w/6.4))),'sub','middle',13)}};
  // containers
  s+=box(N.patch.x,N.patch.y,N.patch.w,N.patch.h,{dash:'4 4',fill:'none'})+`<text x="${N.patch.x+8}" y="${N.patch.y+14}" text-anchor="start" class="mono">PATCH</text>`;
  s+=box(N.harn.x,N.harn.y,N.harn.w,N.harn.h,{fill:allH?`color-mix(in srgb, ${K} 10%, ${css('--tint')})`:css('--tint'),stroke:allH?K:'none',sw:2})+`<text x="${N.harn.x+8}" y="${N.harn.y+13}" text-anchor="start" class="mono">HARNESS</text>`;
  nb('imp','Improver',narrow?undefined:'proposes and keeps changes');nb('task','Tasks',narrow?undefined:'tickets, practice');nb('prompt','Prompt');nb('tools','Tools');nb('mem','Memory');nb('flow','Workflow');nb('w','Model weights');nb('out','Attempt',narrow?undefined:'a fix, an answer');nb('ver','Verifier',p.v);
  // flow arrows
  const ar=(x1,y1,x2,y2,lab,col,mk,lx,ly,anc)=>{s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="1.6" marker-end="url(#${mk})"/>`;if(lab)s+=`<text x="${lx}" y="${ly}" text-anchor="${anc||'middle'}" class="sub">${lab}</text>`};
  if(!narrow){ar(N.task.x+N.task.w,cy(N.task),N.patch.x-2,cy(N.task),'ticket',M,'mpA',(N.task.x+N.task.w+N.patch.x)/2,cy(N.task)-7);
   ar(N.patch.x+N.patch.w,cy(N.out),N.out.x-2,cy(N.out),'writes',M,'mpA',(N.patch.x+N.patch.w+N.out.x)/2,cy(N.out)-7);
   ar(N.out.x+N.out.w,cy(N.out),N.ver.x-2,cy(N.out),'judged',M,'mpA',(N.out.x+N.out.w+N.ver.x)/2,cy(N.out)-7);
   s+=`<path d="M${cx(N.ver)},${N.ver.y} L${cx(N.ver)},${cy(N.imp)} L${N.imp.x+N.imp.w+2},${cy(N.imp)}" fill="none" stroke="${V}" stroke-width="1.8" marker-end="url(#mpV)"/><text x="${(cx(N.ver)+N.imp.x+N.imp.w)/2}" y="${cy(N.imp)-7}" class="sub" style="fill:${V}">verdict</text>`;}
  else{const xc=cx(N.task);ar(xc,N.task.y+N.task.h,xc,N.patch.y-2,'ticket',M,'mpA',xc+8,N.task.y+N.task.h+16,'start');ar(xc,N.patch.y+N.patch.h,xc,N.out.y-2,'writes',M,'mpA',xc+8,N.patch.y+N.patch.h+16,'start');ar(xc,N.out.y+N.out.h,xc,N.ver.y-2,'judged',M,'mpA',xc+8,N.out.y+N.out.h+16,'start');
   const xr=W-8;s+=`<path d="M${N.ver.x+N.ver.w},${cy(N.ver)} L${xr},${cy(N.ver)} L${xr},${cy(N.imp)} L${N.imp.x+N.imp.w+2},${cy(N.imp)}" fill="none" stroke="${V}" stroke-width="1.8" marker-end="url(#mpV)"/><text x="${xr-4}" y="${cy(N.imp)+18}" text-anchor="end" class="sub" style="fill:${V}">verdict</text>`;}
  // edit arrows from improver to what changes
  const targets=p.c.includes('imp')?['imp']:(allH?['harn']:p.c);
  targets.forEach((t,j)=>{const n=N[t];
   if(t==='imp'){const x=N.imp.x+14,y=N.imp.y+N.imp.h;s+=`<path d="M${x+20},${y} C${x+20},${y+26} ${x-26},${y+26} ${N.imp.x-2},${cy(N.imp)+8}" fill="none" stroke="${K}" stroke-width="2" marker-end="url(#mpK)"/><text x="${x+26}" y="${y+22}" text-anchor="start" class="sub" style="fill:${K}">rewrites itself</text>`;return}
   if(!narrow){const sx0=Math.max(N.imp.x+12,Math.min(N.imp.x+N.imp.w-12,cx(n)+(targets.length>1?(j?8:-8):0))),ym=86+j*6;
    s+=`<path d="M${sx0},${N.imp.y+N.imp.h} L${sx0},${ym} L${cx(n)},${ym} L${cx(n)},${n.y-2}" fill="none" stroke="${K}" stroke-width="2" marker-end="url(#mpK)"/>`;
    if(j===0)s+=`<text x="${sx0+6}" y="${N.imp.y+N.imp.h+14}" text-anchor="start" class="sub" style="fill:${K}">edits</text>`;}
   else{const xl=12+j*6;s+=`<path d="M${N.imp.x},${cy(N.imp)} L${xl},${cy(N.imp)} L${xl},${cy(n)} L${n.x-2},${cy(n)}" fill="none" stroke="${K}" stroke-width="2" marker-end="url(#mpK)"/>`;if(j===0)s+=`<text x="${xl+4}" y="${N.imp.y+N.imp.h+14}" text-anchor="start" class="sub" style="fill:${K}">edits</text>`}});
  // lasts scale
  const ly=H-30,lx0=narrow?20:60,lx1=W-(narrow?20:60);s+=`<line x1="${lx0}" x2="${lx1}" y1="${ly}" y2="${ly}" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`;
  LASTS.forEach((t,k)=>{const x=lx0+k*(lx1-lx0)/3,on=k===p.k;s+=`<circle cx="${x}" cy="${ly}" r="${on?7:4}" fill="${on?K:S}" stroke="${on?K:M}" stroke-width="1.5"/>`;
   const lines=narrow?wrapText(t,10):[t],anc=k===0?'start':k===3?'end':'middle',tx=k===0?lx0-6:k===3?lx1+6:x;s+=tlines(tx,ly+20,lines,on?'lab':'sub',anc,12)});
  s+=`<text x="${(lx0+lx1)/2}" y="${ly-12}" class="mono">HOW LONG THE CHANGE LASTS</text>`;
  svg.innerHTML=mid(s);
  $('.m1',el).textContent=p.p;$('.m2',el).textContent=p.i;
  $('.bprev',el).disabled=cur===0;$('.bnext',el).disabled=cur===P.length-1;}
 $('.bprev',el).onclick=()=>{cur--;draw()};$('.bnext',el).onclick=()=>{cur++;draw()};
 REDRAW.push(draw);draw();})();

/* ---------- 1. critic simulator ---------- */
(function(){const el=$('#w-critic'),sl=$('#cA',el),svg=$('svg.avg',el),strip=$('svg.strip',el),R=12,N=400;let seed=11;
 function step(q,r,p){let c=q+0.12*gauss(r)-0.08*q;c=Math.max(0,Math.min(1,c));const better=c>q;const right=r()<p;const keep=better?right:!right;return{c,better,keep}}
 function sim(p){const r=rng(7),mean=new Array(R+1).fill(0);let worse=0;
  for(let n=0;n<N;n++){let q=0.5;mean[0]+=q;for(let t=1;t<=R;t++){const o=step(q,r,p);if(o.keep)q=o.c;mean[t]+=q}if(q<0.5)worse++}
  return{m:mean.map(x=>x/N),worse:worse/N}}
 function one(p){const r=rng(seed);let q=0.5;const out=[{q}];for(let t=1;t<=R;t++){const o=step(q,r,p);if(o.keep)q=o.c;out.push({q,better:o.better,keep:o.keep})}return out}
 let BE=1;for(let q=0.5;q<=1.0001;q+=0.05){if(sim(q).m[R]>=0.5){BE=q;break}}
 function draw(){const p=+sl.value;$('output',el).textContent=Math.round(p*100)+'%';
  // one run strip
  const run=one(p),W=cw(strip),pl=40,pr=12,cellW=(W-pl-pr)/R,H=112;setVB(strip,W,H);
  let s=`<text x="4" y="14" text-anchor="start" class="mono">ONE REVIEW SESSION: 12 PROPOSED EDITS</text>`;
  const yq=v=>30+(1-(v-0.2)/0.8)*34;
  s+=`<line x1="${pl}" x2="${W-pr}" y1="${yq(0.5)}" y2="${yq(0.5)}" stroke="${css('--line')}" stroke-dasharray="3 3"/><text x="${pl-6}" y="${yq(0.5)+3.5}" text-anchor="end" class="sub">start</text>`;
  s+=`<polyline points="${run.map((o,i)=>(pl+i*cellW).toFixed(1)+','+yq(o.q).toFixed(1)).join(' ')}" fill="none" stroke="${css('--ink')}" stroke-width="2.4"/>`;
  run.slice(1).forEach((o,i)=>{const x=pl+(i+0.5)*cellW+1,y=74,w=cellW-3,col=o.keep?(o.better?css('--keep'):css('--reject')):css('--surface');
   s+=`<rect x="${x-cellW/2+1.5}" y="${y}" width="${w}" height="26" rx="5" fill="${col}" stroke="${o.keep?'none':css('--line')}" stroke-width="1.4"><title>Edit ${i+1}: ${o.better?'actually better':'actually worse'}; judge ${o.keep?'kept it':'rejected it'}</title></rect>`;
   s+=`<text x="${x}" y="${y+17}" class="lab" style="fill:${o.keep?'#fff':css('--muted')};font-weight:600">${o.better?'↑':'↓'}</text>`});
  strip.innerHTML=mid(s);
  // averaged chart
  const A=sim(1),Bv=sim(p),C=sim(0.5),W2=cw(svg),H2=Math.round(W2*0.34)+26,pt=12,pb=36;setVB(svg,W2,H2);
  const xs=t=>pl+t/R*(W2-pl-pr),lo=0.2,hi=1,ys=v=>pt+(1-(v-lo)/(hi-lo))*(H2-pt-pb);
  let c='';[0.2,0.4,0.6,0.8,1].forEach(v=>c+=`<line x1="${pl}" x2="${W2-pr}" y1="${ys(v)}" y2="${ys(v)}" stroke="${css('--line')}"/><text x="${pl-6}" y="${ys(v)+3.5}" text-anchor="end">${v.toFixed(1)}</text>`);
  for(let t=0;t<=R;t+=(W2<420?4:2))c+=`<text x="${xs(t)}" y="${H2-pb+15}" text-anchor="middle">${t}</text>`;
  c+=`<text x="${(pl+W2-pr)/2}" y="${H2-2}" text-anchor="middle">average over 400 sessions, after each proposed edit</text>`;
  const band=A.m.map((v,i)=>xs(i).toFixed(1)+','+ys(v).toFixed(1)).join(' ')+' '+C.m.slice().reverse().map((v,i)=>xs(R-i).toFixed(1)+','+ys(v).toFixed(1)).join(' ');
  c+=`<polygon points="${band}" fill="${css('--tint')}"/>`;
  const path=(arr,col,w,d)=>`<path d="${arr.map((v,i)=>(i?'L':'M')+xs(i).toFixed(1)+','+ys(v).toFixed(1)).join('')}" fill="none" stroke="${col}" stroke-width="${w}"${d?' stroke-dasharray="5 4"':''}/>`;
  c+=`<line x1="${pl}" x2="${W2-pr}" y1="${ys(0.5)}" y2="${ys(0.5)}" stroke="${css('--muted')}" stroke-dasharray="3 4"/>`;
  c+=path(A.m,css('--keep'),2,1)+path(C.m,css('--reject'),2,1)+path(Bv.m,css('--ink'),3);
  c+=`<text x="${xs(R)-4}" y="${ys(A.m[R])-6}" text-anchor="end" style="fill:${css('--keep')}">perfect judge</text><text x="${xs(R)-4}" y="${ys(C.m[R])+14}" text-anchor="end" style="fill:${css('--reject')}">coin-flip judge</text>`;
  c+=`<circle cx="${xs(R)}" cy="${ys(Bv.m[R])}" r="5" fill="${css('--ink')}" stroke="${css('--surface')}" stroke-width="2"/>`;
  c+=`<text transform="translate(11 ${(pt+H2-pb)/2}) rotate(-90)" text-anchor="middle">fix quality</text>`;
  svg.innerHTML=mid(c);
  const kb=run.slice(1).filter(o=>o.keep&&!o.better).length,kg=run.slice(1).filter(o=>o.keep&&o.better).length;
  $('.v1',el).textContent=Bv.m[R].toFixed(2);$('.v2',el).textContent=kg+' good · '+kb+' bad';$('.v3',el).textContent='≈ '+Math.round(BE*100)+'%';
  const g=Bv.m[R]-0.5;
  $('.c2',el).textContent=(p>=0.95?'A near-perfect judge keeps almost only real improvements, so quality climbs.':g>0.02?'This judge is good enough that refining helps on average, but it still keeps some bad edits.':g>-0.02?'Near the break-even point, the bad edits it keeps cancel out the good ones.':'Below about '+Math.round(BE*100)+'% accuracy, the judge keeps more harmful edits than helpful ones, and refining makes the fix worse.')+' Most proposed edits to a decent fix are worse (↓), so a weak judge has many chances to say yes to the wrong thing.';}
 $('.bnew',el).onclick=()=>{seed+=7;draw()};sl.oninput=draw;REDRAW.push(draw);draw();})();

/* ---------- 2. AREX flow ---------- */
(function(){const el=$('#w-arex'),svg=$('svg',el);
 const Q='CSV import broke after we upgraded tablib-x. Which release changed how quoted commas are parsed, and what should we change?';
 const L='Library: tablib-x (the package in our lockfile)';
 const S={
  refine:[
   {n:'search',t:'<b>Search.</b> Finds a forum post: "quoting changed in tablib-x 3.0, just pin 2.x".',c:.35,st:{v:[L],u:['Which release changed quoting','What to change'],x:[],n:'Draft an answer.'}},
   {n:'draft',t:'<b>Draft answer:</b> "3.0; pin to 2.x". It rests on one unofficial post, so confidence is low.',c:.48,st:{v:[L],u:['Which release really changed quoting (only a forum post so far)'],x:[],n:'Audit.'}},
   {n:'audit',e:'refine',t:'<b>Audit:</b> 0.48 is below 0.80. Salvageable? Yes: the library is right; only the release and the fix are unverified. <span class="ok">→ Refine.</span>',c:.48,st:{v:[L],u:['Release that changed quoting','Recommended fix'],x:['"3.0" (unofficial forum post, not verified)'],n:'Read the official changelog, nothing else.'}},
   {n:'draft',e:'refine',t:'<b>Targeted search.</b> The changelog: "2.4.0: quoted fields are now parsed per RFC 4180; pass <code>quoting="legacy"</code> for the old behavior." New draft, confidence 0.87.',c:.87,st:{v:[L,'Change: release 2.4.0 (changelog)','Fix: quoting="legacy" now; quote fields properly later'],u:[],x:['"3.0" (unofficial forum post)'],n:'Audit.'}},
   {n:'accept',e:'accept',t:'<b>Audit:</b> 0.87 clears the threshold, and every claim has a source. <span class="ok">→ Accept: 2.4.0; set quoting="legacy" for now.</span>',c:.87,st:{v:[L,'Change: release 2.4.0 (changelog)','Fix: quoting="legacy" now; quote fields properly later'],u:[],x:['"3.0" (unofficial forum post)'],n:'Done.'}}],
  restart:[
   {n:'search',t:'<b>Search.</b> Latches onto <code>tablib</code>, an older library with a similar name, and reads its issue tracker for many steps.',c:.30,st:{v:[],u:['Is this even the right library?'],x:[],n:'Draft an answer.'}},
   {n:'draft',t:'<b>Draft answer:</b> "tablib 1.2 changed quoting", for the wrong library. Evidence is thin and inconsistent.',c:.22,st:{v:[],u:['Which library is meant'],x:[],n:'Audit.'}},
   {n:'audit',e:'restart',t:'<b>Audit:</b> 0.22, and the whole run rests on a wrong premise. Not salvageable. <span class="bad">→ Restart from the original question.</span>',c:.22,st:{v:[],u:['Which library is meant'],x:['tablib (a different library)'],n:'Start over; read the package name from the lockfile first.'}},
   {n:'draft',e:'restart',t:'<b>Fresh start.</b> The lockfile shows tablib-x went from 2.3 to 2.5; its changelog says 2.4.0 changed quoted-field parsing. New draft, confidence 0.85.',c:.85,st:{v:[L,'Change: release 2.4.0 (changelog)','Fix: quoting="legacy" (changelog)'],u:[],x:['tablib (a different library)'],n:'Audit.'}},
   {n:'accept',e:'accept',t:'<b>Audit:</b> 0.85 clears the threshold. <span class="ok">→ Accept: 2.4.0; set quoting="legacy".</span>',c:.85,st:{v:[L,'Change: release 2.4.0 (changelog)','Fix: quoting="legacy" (changelog)'],u:[],x:['tablib (a different library)'],n:'Done.'}}]};
 let sc='refine',i=0;
 function li(a){return a.length?'<ul>'+a.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'<span class="cap">none</span>'}
 function draw(){const st=S[sc][i],W=cw(svg),narrow=W<600,K=css('--keep'),Rj=css('--reject'),M=css('--muted'),Pp=css('--prop'),V=css('--state'),Sf=css('--surface'),Ln=css('--line');
  const N={};let H;
  if(!narrow){const sx=W/680,X=v=>v*sx;N.q={x:X(6),y:40,w:X(104),h:56};N.search={x:X(150),y:40,w:X(112),h:56};N.draft={x:X(300),y:40,w:X(122),h:56};N.audit={x:X(470),y:68,r:34};N.accept={x:X(560),y:40,w:X(114),h:56};H=214;}
  else{const x0=30,w0=W-60;N.q={x:x0,y:10,w:w0,h:42};N.search={x:x0,y:84,w:w0,h:42};N.draft={x:x0,y:158,w:w0,h:52};N.audit={x:W/2,y:262,r:30};N.accept={x:x0,y:326,w:w0,h:42};H=380;}
  setVB(svg,W,H);
  let s=arrowDefs('axA',M)+arrowDefs('axK',K)+arrowDefs('axR',Rj);
  const on=k=>st.n===k;const cx=n=>n.x+n.w/2,cy=n=>n.y+n.h/2;
  const nb=(k,t,sub)=>{const n=N[k],a=on(k);const col=k==='accept'?K:Pp;s+=box(n.x,n.y,n.w,n.h,{stroke:a?col:Ln,fill:a?`color-mix(in srgb, ${col} 18%, ${Sf})`:Sf,sw:a?2.4:1.4});
   s+=`<text x="${cx(n)}" y="${n.y+(sub?20:cy(n)-n.y+4)}" class="lab">${t}</text>`;if(sub)s+=`<text x="${cx(n)}" y="${n.y+36}" class="sub">${sub}</text>`};
  // inner loop bracket
  if(!narrow){const bx=N.search.x-10,bw=N.draft.x+N.draft.w-N.search.x+20;s+=`<rect x="${bx}" y="14" width="${bw}" height="${N.search.h+40}" rx="12" fill="none" stroke="${Pp}" stroke-dasharray="4 4" opacity=".7"/><text x="${bx+10}" y="29" text-anchor="start" class="mono" style="fill:${Pp}">INNER LOOP · RESEARCH</text>`;
   s+=`<text x="${N.audit.x+N.audit.r+6}" y="29" text-anchor="start" class="mono" style="fill:${V}">OUTER LOOP · AUDIT</text>`;}
  nb('q','Question',narrow?undefined:'the ticket');nb('search','Search & read');nb('draft','Draft answer',null);nb('accept','Accept',narrow?undefined:'answer the ticket');
  // confidence gauge in draft
  {const n=N.draft,gx=n.x+10,gw=n.w-20,gy=n.y+n.h-16;s+=`<rect x="${gx}" y="${gy}" width="${gw}" height="7" rx="3.5" fill="${Ln}"/><rect x="${gx}" y="${gy}" width="${gw*st.c}" height="7" rx="3.5" fill="${st.c>=.8?K:Rj}"/><line x1="${gx+gw*.8}" x2="${gx+gw*.8}" y1="${gy-3}" y2="${gy+10}" stroke="${css('--ink')}" stroke-width="2"/>`;
   if(!narrow)s+=`<text x="${cx(n)}" y="${n.y+n.h+15}" class="sub">confidence ${st.c.toFixed(2)} (bar: 0.80 needed)</text>`;else s+=`<text x="${n.x+n.w-6}" y="${n.y+18}" text-anchor="end" class="sub">conf. ${st.c.toFixed(2)}</text>`;}
  // audit diamond
  {const a=N.audit,r=a.r,act=on('audit');s+=`<path d="M${a.x},${a.y-r} L${a.x+r},${a.y} L${a.x},${a.y+r} L${a.x-r},${a.y} z" fill="${act?`color-mix(in srgb, ${V} 18%, ${Sf})`:Sf}" stroke="${act?V:Ln}" stroke-width="${act?2.4:1.4}"/><text x="${a.x}" y="${a.y+4}" class="lab">Audit</text>`;}
  const ed=(d,col,mk,w,dash)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w||1.6}"${dash?` stroke-dasharray="${dash}"`:''} marker-end="url(#${mk})"/>`;
  const E=st.e;
  if(!narrow){const yc=cy(N.q),a=N.audit;
   s+=ed(`M${N.q.x+N.q.w},${yc} L${N.search.x-2},${yc}`,M,'axA');s+=ed(`M${N.search.x+N.search.w},${yc} L${N.draft.x-2},${yc}`,M,'axA');
   s+=ed(`M${N.draft.x+N.draft.w},${yc} L${a.x-a.r-2},${a.y}`,M,'axA');
   s+=ed(`M${a.x+a.r},${a.y} L${N.accept.x-2},${cy(N.accept)}`,E==='accept'?K:M,E==='accept'?'axK':'axA',E==='accept'?2.6:1.6);s+=`<text x="${(a.x+a.r+N.accept.x)/2}" y="${a.y+16}" class="sub">≥ 0.80</text>`;
   const yb=a.y+a.r+42,y2=yb+28;
   s+=ed(`M${a.x},${a.y+a.r} L${a.x},${yb} L${cx(N.search)},${yb} L${cx(N.search)},${N.search.y+N.search.h+2}`,E==='refine'?K:M,E==='refine'?'axK':'axA',E==='refine'?2.6:1.4,E==='refine'?null:'4 3');
   s+=`<text x="${(a.x+cx(N.search))/2}" y="${yb+14}" class="sub" style="${E==='refine'?'fill:'+K+';font-weight:600':''}">refine: keep verified findings, research only the gaps</text>`;
   s+=ed(`M${a.x-6},${a.y+a.r-6} L${a.x-6},${y2} L${cx(N.q)},${y2} L${cx(N.q)},${N.q.y+N.q.h+2}`,E==='restart'?Rj:M,E==='restart'?'axR':'axA',E==='restart'?2.6:1.4,E==='restart'?null:'4 3');
   s+=`<text x="${(a.x+cx(N.q))/2}" y="${y2+14}" class="sub" style="${E==='restart'?'fill:'+Rj+';font-weight:600':''}">restart: the premise was wrong; begin again from the question</text>`;}
  else{const xc=W/2,a=N.audit;
   s+=ed(`M${xc},${N.q.y+N.q.h} L${xc},${N.search.y-2}`,M,'axA');s+=ed(`M${xc},${N.search.y+N.search.h} L${xc},${N.draft.y-2}`,M,'axA');s+=ed(`M${xc},${N.draft.y+N.draft.h} L${xc},${a.y-a.r-2}`,M,'axA');
   s+=ed(`M${xc},${a.y+a.r} L${xc},${N.accept.y-2}`,E==='accept'?K:M,E==='accept'?'axK':'axA',E==='accept'?2.6:1.6);
   s+=ed(`M${a.x+a.r},${a.y} L${W-10},${a.y} L${W-10},${cy(N.search)} L${N.search.x+N.search.w+2},${cy(N.search)}`,E==='refine'?K:M,E==='refine'?'axK':'axA',E==='refine'?2.6:1.4,E==='refine'?null:'4 3');
   s+=`<text x="${W-14}" y="${a.y-8}" text-anchor="end" class="sub" style="${E==='refine'?'fill:'+K+';font-weight:600':''}">refine</text>`;
   s+=ed(`M${a.x-a.r},${a.y} L10,${a.y} L10,${cy(N.q)} L${N.q.x-2},${cy(N.q)}`,E==='restart'?Rj:M,E==='restart'?'axR':'axA',E==='restart'?2.6:1.4,E==='restart'?null:'4 3');
   s+=`<text x="14" y="${a.y-8}" text-anchor="start" class="sub" style="${E==='restart'?'fill:'+Rj+';font-weight:600':''}">restart</text>`;}
  svg.innerHTML=mid(s);
  $('.qtext',el).textContent=Q;
  $('.now',el).innerHTML=`<span class="tag">step ${i+1} of 5</span> ${st.t}`;
  $('.st',el).innerHTML=`<div><b>Verified findings</b> ${li(st.st.v)}</div><div style="margin-top:4px"><b>Still open</b> ${li(st.st.u)}</div><div style="margin-top:4px"><b>Rejected, with reason</b> ${li(st.st.x)}</div><div style="margin-top:4px"><b>Next step:</b> ${st.st.n}</div>`;
  $('.b-back',el).disabled=i===0;$('.b-next',el).disabled=i===4;}
 $$('.seg button',el).forEach(b=>b.onclick=()=>{sc=b.dataset.s;i=0;$$('.seg button',el).forEach(x=>x.setAttribute('aria-pressed',x===b));draw()});
 $('.b-next',el).onclick=()=>{i++;draw()};$('.b-back',el).onclick=()=>{i--;draw()};REDRAW.push(draw);draw();})();

/* ---------- 3. notes ---------- */
(function(){const el=$('#w-notes');
 const T=['web-app · JS','billing · Python','dashboard · JS','etl · Python','api · JS'];
 const N1='Run <code>npm test</code> before opening a PR.',N2='Run <code>pytest</code> before opening a PR.',N3='Sometimes run npm test, sometimes pytest.';
 const R1='Run <code>npm test</code> before opening a PR <b>if the repo has a package.json</b>.',R2='If the repo has a pyproject.toml, run <code>pytest</code> before opening a PR.';
 const A=[
  {m:[],r:'',c:'No tickets yet. Both versions of Patch start with empty memory.'},
  {m:[{t:N1}],r:'<span class="ok">✓ fixed</span> (no notes yet)',c:'Ticket 1, a JavaScript repo: both versions succeed and write the same lesson. It is true here, but stated too broadly.'},
  {m:[{t:N1,u:1},{t:N2}],r:'<span class="bad">✗ PR untested</span> (ran npm test; nothing ran)',c:'Ticket 2, a Python repo: both retrieve the npm lesson and fail. Append-only memory adds a second lesson that contradicts the first. Revised memory adds the missing condition to the lesson it used, then writes a new one.'},
  {m:[{t:N1,u:1},{t:N2,u:1}],r:'<span class="bad">✗ unsure</span> (two lessons disagree)',c:'Ticket 3, JavaScript again: append-only memory retrieves two lessons that contradict each other. Revised memory retrieves one lesson that says exactly when it applies.'},
  {m:[{t:N1,u:1},{t:N2,u:1},{t:N3}],r:'<span class="bad">✗ unsure</span> (lessons still disagree)',c:'Ticket 4, Python: append-only memory keeps adding vaguer lessons. Revised memory is already right.'},
  {m:[{t:N1,u:1},{t:N2},{t:N3,u:1}],r:'<span class="bad">✗ unsure</span>',c:'Ticket 5: append-only memory holds three lessons of mixed quality. Revised memory holds two precise ones, and every change only added a condition the evidence supported.'}];
 const Bm=[
  {m:[],r:''},
  {m:[{t:N1}],r:'<span class="ok">✓ fixed</span> (no notes yet)'},
  {m:[{t:R1,rev:1},{t:R2}],r:'<span class="bad">✗ PR untested</span>, then revised the lesson'},
  {m:[{t:R1,u:1},{t:R2}],r:'<span class="ok">✓ fixed</span>'},
  {m:[{t:R1},{t:R2,u:1}],r:'<span class="ok">✓ fixed</span>'},
  {m:[{t:R1,u:1},{t:R2}],r:'<span class="ok">✓ fixed</span>'}];
 let i=0;
 const notes=m=>m.length?m.map(n=>`<div class="note${n.u?' used':''}${n.rev?' rev':''}">${n.t}</div>`).join(''):'<div class="cap">(empty)</div>';
 function draw(){$('.stream',el).innerHTML=T.map((t,k)=>`<span class="task${k===i-1?' cur':''}">${k+1}. ${t}</span>`).join('');
  $('.ma',el).innerHTML=notes(A[i].m);$('.mb',el).innerHTML=notes(Bm[i].m);
  $('.ra',el).innerHTML=A[i].r;$('.rb',el).innerHTML=Bm[i].r;$('.cn',el).textContent=A[i].c+(i?' Violet border = lesson retrieved for this ticket; teal edge = lesson revised.':'');
  $('.b-back',el).disabled=i===0;$('.b-next',el).disabled=i===T.length;}
 $('.b-next',el).onclick=()=>{i++;draw()};$('.b-back',el).onclick=()=>{i--;draw()};$('.b-reset',el).onclick=()=>{i=0;draw()};draw();})();

/* ---------- 3b. continual learning matrix (illustrative) ---------- */
(function(){const el=$('#w-cl');
 const G=['Web','No repro (ask first)','Infra'];
 const M={g:[[8,-2,-1],[2,12,-3],[1,3,9]],r:[[5,0,0],[3,5,0],[3,2,6]]};
 const CAP={g:['Block 1: one shared strategy is rewritten for web tickets. It already nudges the untrained groups slightly down.','Block 2: the strategy learns "ask the reporter first". Huge gain on no-repro tickets, but Patch now also asks on web tickets that don\'t need it, and infra tickets slip further.','Block 3: the strategy is rewritten again for infra work, and the asking habit mostly disappears. Big gains on each new block; most of them gone by the end.'],
  r:['Block 1: lessons are stored as separate items. Groups without matching lessons are untouched: no interference.','Block 2: new lessons for no-repro tickets. Some web tickets look alike on the surface and retrieve them, so web gains slip a little.','Block 3: infra is clearly different, so its lessons stay separate. But no-repro and web tickets keep retrieving each other\'s lessons: smaller gains, smaller losses.']};
 let m='g',t=0;
 function draw(){const A=M[m];
  $$('.md button',el).forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===m));$$('.st button',el).forEach((b,k)=>b.setAttribute('aria-pressed',k===t));
  const cell=(v,on)=>{const a=Math.min(1,Math.abs(v)/12),col=v>=0?'--keep':'--reject';return `<td class="mono" style="text-align:center;background:color-mix(in srgb,var(${col}) ${Math.round(a*45)}%,var(--surface));${on?'outline:2px solid var(--ink);outline-offset:-2px;':''}">${v>0?'+':''}${v}</td>`};
  let h='<table class="cmp"><thead><tr><th>After block</th>'+G.map(g=>`<th>${g}</th>`).join('')+'</tr></thead><tbody>';
  for(let r=0;r<=t;r++)h+=`<tr><td>${r+1}</td>`+A[r].map((v,c)=>cell(v,c===r&&r===t)).join('')+'</tr>';
  $('.clm',el).innerHTML=h+'</tbody></table>';
  const n=t+1,pl=[...Array(n).keys()].map(k=>A[k][k]);
  let inter=[];for(let r=0;r<n;r++)for(let c=r+1;c<3;c++)inter.push(Math.max(0,-A[r][c]));
  let forg=[];for(let k=0;k<t;k++)forg.push(Math.max(0,A[k][k]-A[t][k]));
  const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  $('.v1',el).textContent='+'+mean(pl).toFixed(1)+' pts';$('.v2',el).textContent=mean(inter).toFixed(1)+' pts';$('.v3',el).textContent=forg.length?mean(forg).toFixed(1)+' pts':'–';
  $('.clc',el).textContent=CAP[m][t];}
 $$('.md button',el).forEach(b=>b.onclick=()=>{m=b.dataset.m;draw()});$$('.st button',el).forEach((b,k)=>b.onclick=()=>{t=k;draw()});draw();})();

/* ---------- 4. probe candidates (Harness²-style, illustrative) ---------- */
(function(){const el=$('#w-probe');
 const C=[
  {h:'A · Workflow',e:'"Before editing, write a test that reproduces the bug."'},
  {h:'B · Tool',e:'Add <code>search_docs</code>: "look up any date/time API before using it."'},
  {h:'C · Prompt',e:'"Keep diffs minimal; stop at the first green test run."'}];
 const B=[
  ['Wrote a test with a +09:00 timestamp. <span class="ev-good">It fails: bug reproduced.</span>','Edited <code>parse_time()</code>.','<span class="ev-good">The new test now passes</span>; old tests pass.'],
  ['Looked up the datetime docs.','<span class="ev-good">Switched to time-zone-aware parsing</span>, which handles every offset.','No test for the bug; old tests pass.'],
  ['Changed one line: <span class="ev-bad">subtract 9 hours.</span>','Old tests pass on the first run.','Stopped.']];
 const STEPS=[
  {n:'Propose',cap:'Ticket: "Order timestamps from Tokyo customers are off by nine hours." No existing test reproduces it. Patch proposes three edits to its own harness.'},
  {n:'Probe',cap:'Each candidate harness runs on the same ticket. All three end with every existing test passing, so the tests alone cannot tell them apart.'},
  {n:'Compare',cap:'With no answer key, the contrast is the evidence. Only A shows the bug existed and is gone. Only B fixes the cause for any time zone, not just Tokyo. C hard-codes one offset: a red flag even though the tests pass.'},
  {n:'Compose',cap:'The output is a better harness, not just a fix: it keeps A and B and drops C. Run on the ticket, it reproduces the bug, fixes it with zone-aware parsing, and the new test passes.'},
  {n:'Keep',cap:'Two things persist: the adopted harness, and a lesson in the improvement harness that will shape which edits Patch proposes on future tickets.'}];
 let i=0;
 function draw(){
  $('.stepper',el).innerHTML=STEPS.map((s,k)=>`<span class="${k===i?'on':k<i?'done':''}">${k+1} ${s.n}</span>`).join('');
  $('.cands',el).innerHTML=C.map((c,k)=>{let cls='cand';if(i>=2)cls+=k<2?' win':' lose';
   const body=i>=1?'<ul>'+B[k].map(x=>'<li>'+x+'</li>').join('')+'</ul>':'<div class="cap">not run yet</div>';
   const verdict=i>=2?`<div style="margin-top:6px" class="${k<2?'ev-good':'ev-bad'}">${['Evidence: reproduced, then fixed','Evidence: fixes the cause','Red flag: hard-coded offset'][k]}</div>`:'';
   return `<div class="${cls}"><h4>${c.h}</h4><div class="edit">${c.e}</div>${body}${verdict}</div>`}).join('');
  const box=$('.composed',el);box.hidden=i<3;
  if(i===3){$('h4',box).textContent='Refined harness';$('.cb',box).innerHTML='<div style="font-family:var(--f-mono);font-size:12.5px;white-space:pre-wrap">workflow  read ticket → <b>write a failing test</b> → edit → run tests → open PR\ntools     shell · read_file · edit_file · run_tests · <b>search_docs</b></div>'}
  if(i===4){$('h4',box).textContent='Improvement harness (kept across tickets)';$('.cb',box).innerHTML='<ul style="margin:0;padding-left:18px"><li>Adopted: harness v2 (A + B).</li><li>Lesson: "When a bug has no failing test, candidates that reproduce it first give the clearest evidence. Propose that edit early."</li><li>Lesson: "Treat fixes that hard-code a constant to match one report as suspect."</li></ul>'}
  $('.pc',el).textContent=STEPS[i].cap;
  $('.b-back',el).disabled=i===0;$('.b-next',el).disabled=i===STEPS.length-1;}
 $('.b-next',el).onclick=()=>{i++;draw()};$('.b-back',el).onclick=()=>{i--;draw()};draw();})();

/* ---------- 5. pareto (illustrative) ---------- */
(function(){const el=$('#w-pareto'),sl=$('#pW',el),svg=$('svg',el);
 const H=[
  {n:'Day-one harness',f:.55,s:.60},{n:'+ reproduce first',f:.66,s:.62},{n:'+ disable certificate checks when HTTPS fails',f:.80,s:.30,bad:1},
  {n:'+ skip flaky auth tests',f:.74,s:.38},{n:'+ security linter on every diff',f:.58,s:.82},{n:'+ reproduce + linter',f:.68,s:.80},
  {n:'+ reproduce + docs lookup',f:.73,s:.66},{n:'+ strict input validation',f:.52,s:.86},{n:'+ reproduce + docs + linter',f:.73,s:.77},
  {n:'+ refuse any risky edit',f:.40,s:.91},{n:'+ larger edit budget',f:.70,s:.50},{n:'+ terse prompt',f:.50,s:.55}];
 const dom=(a,b)=>b.f>=a.f&&b.s>=a.s&&(b.f>a.f||b.s>a.s);
 const front=H.filter(a=>!H.some(b=>dom(a,b)));
 let mode='w';
 function draw(){const w=+sl.value;$('output',el).textContent=Math.round(w*100)+'% / '+Math.round((1-w)*100)+'% security';
  $('.wctl',el).style.display=mode==='w'?'':'none';
  let best=H[0];H.forEach(h=>{if(w*h.f+(1-w)*h.s>w*best.f+(1-w)*best.s+1e-9)best=h});
  const kept=mode==='w'?[best]:front;
  const W=cw(svg),Hh=Math.round(W*0.5)+30,pl=44,pr=14,pt=12,pb=34;setVB(svg,W,Hh);
  const lo=.25,hi=1,xs=v=>pl+(v-lo)/(hi-lo)*(W-pl-pr),ys=v=>pt+(1-(v-lo)/(hi-lo))*(Hh-pt-pb);
  let s='';[.25,.5,.75,1].forEach(v=>{s+=`<line x1="${pl}" x2="${W-pr}" y1="${ys(v)}" y2="${ys(v)}" stroke="${css('--line')}"/><text x="${pl-6}" y="${ys(v)+3.5}" text-anchor="end">${Math.round(v*100)}%</text><line x1="${xs(v)}" x2="${xs(v)}" y1="${pt}" y2="${Hh-pb}" stroke="${css('--line')}"/><text x="${xs(v)}" y="${Hh-pb+14}" text-anchor="middle">${Math.round(v*100)}%</text>`});
  s+=`<text x="${(pl+W-pr)/2}" y="${Hh-2}" text-anchor="middle">functionality: tickets whose tests pass →</text>`;
  s+=`<text transform="translate(11 ${(pt+Hh-pb)/2}) rotate(-90)" text-anchor="middle">security review pass →</text>`;
  if(mode==='w'){const S=w*best.f+(1-w)*best.s;
   if(w<0.999){const y0=(S-w*lo)/(1-w),y1=(S-w*hi)/(1-w);s+=`<line x1="${xs(lo)}" y1="${ys(y0)}" x2="${xs(hi)}" y2="${ys(y1)}" stroke="${css('--muted')}" stroke-dasharray="4 4" clip-path="url(#pc)"/>`;s+=`<text x="${W-pr-4}" y="${pt+12}" text-anchor="end">dashed line: equal weighted score</text>`}
   else s+=`<line x1="${xs(best.f)}" x2="${xs(best.f)}" y1="${pt}" y2="${Hh-pb}" stroke="${css('--muted')}" stroke-dasharray="4 4"/>`;}
  else{const fr=front.slice().sort((a,b)=>a.f-b.f);s+=`<path d="${fr.map((h,k)=>(k?'L':'M')+xs(h.f).toFixed(1)+','+ys(h.s).toFixed(1)).join('')}" fill="none" stroke="${css('--keep')}" stroke-width="1.8"/>`}
  s=`<defs><clipPath id="pc"><rect x="${pl}" y="${pt}" width="${W-pl-pr}" height="${Hh-pt-pb}"/></clipPath></defs>`+s;
  H.forEach(h=>{const k=kept.includes(h);const col=h.bad?css('--reject'):k?css('--keep'):css('--surface');
   s+=`<circle cx="${xs(h.f)}" cy="${ys(h.s)}" r="${k?7:5.5}" fill="${col}" stroke="${h.bad?css('--reject'):k?css('--keep'):css('--muted')}" stroke-width="${k&&h.bad?3:1.5}"><title>${h.n}: ${Math.round(h.f*100)}% · ${Math.round(h.s*100)}%</title></circle>`;
   if(k&&h.bad)s+=`<circle cx="${xs(h.f)}" cy="${ys(h.s)}" r="11" fill="none" stroke="${css('--ink')}" stroke-width="1.5"/>`});
  svg.innerHTML=s;
  if(mode==='w'){$('.v1',el).textContent=best.n;$('.v2',el).textContent=Math.round(best.f*100)+'% · '+Math.round(best.s*100)+'%';
   $('.pcap',el).textContent=best.n==='+ refuse any risky edit'?'With most of the weight on security, the winner refuses risky edits and fixes far fewer tickets: the opposite failure. Drag toward functionality.':best.bad?'With this much weight on functionality, the single best score belongs to the harness that turns off certificate checks. One number hid the security loss.':w>=.75?'Push the weight a little further toward functionality and see what wins.':'This weighting picks a balanced harness. But one number always picks exactly one point, and which point depends on a weight someone had to guess.';}
  else{$('.v1',el).textContent=front.length+' on the frontier';$('.v2',el).textContent='none beaten on both';
   $('.pcap',el).textContent='No kept harness is beaten on both goals at once by any other. The search keeps exploring around all of them, and the security-breaking harness stays visible as an extreme instead of quietly winning on an average. (Even the extreme ends of a frontier still need human limits: no one should ship the certificate-check harness.)';}}
 $$('.md button',el).forEach(b=>b.onclick=()=>{mode=b.dataset.m;$$('.md button',el).forEach(x=>x.setAttribute('aria-pressed',x===b));draw()});
 sl.oninput=draw;draw();})();

/* ---------- 6. bootstrap ---------- */
(function(){const el=$('#w-boot'),sk=$('#bK',el),hint=$('.hint',el),grow=$('.grow',el),svg=$('svg',el),N=60,IT=10;
 const sig=x=>1/(1+Math.exp(-x));
 function run(k,h,g){let s=0.15;const D=Array.from({length:30},(_,i)=>0.05+0.4*i/29).concat(Array.from({length:30},(_,i)=>0.62+0.38*i/29));const out=[];
  const solved=s=>D.filter(d=>sig(14*(s-d))>0.5).length/N;
  out.push(solved(s));
  for(let t=0;t<IT;t++){let gain=0;
   const pool=g?D.concat(Array.from({length:12},(_,j)=>Math.min(1,s+0.02+0.1*j/11))):D;
   pool.forEach(d=>{if(d<s-0.05)return;const p=sig(14*(s-d)),any=1-Math.pow(1-p,k);const w=any+(h?0.35*(1-any)*(d<s+0.35?1:0):0);gain+=w*Math.exp(-(d-s)*3)});
   s=Math.min(1,s+0.006*gain);out.push(solved(s))}
  return out}
 function draw(){const k=+sk.value;$('.ok',el).textContent=k;
  const base=run(1,false,false),cur=run(k,hint.checked,grow.checked);
  const W=cw(svg),H=Math.round(W*0.34)+20,pl=40,pr=12,pt=12,pb=30,xs=t=>pl+t/IT*(W-pl-pr),ys=v=>pt+(1-v)*(H-pt-pb);setVB(svg,W,H);
  let s='';[0,.25,.5,.75,1].forEach(v=>s+=`<line x1="${pl}" x2="${W-pr}" y1="${ys(v)}" y2="${ys(v)}" stroke="${css('--line')}"/><text x="${pl-6}" y="${ys(v)+3.5}" text-anchor="end">${Math.round(v*100)}%</text>`);
  for(let t=0;t<=IT;t+=2)s+=`<text x="${xs(t)}" y="${H-12}" text-anchor="middle">${t}</text>`;
  s+=`<text x="${(pl+W-pr)/2}" y="${H-1}" text-anchor="middle">iteration</text>`;
  const path=(a,c,w,dash)=>`<path d="${a.map((v,i)=>(i?'L':'M')+xs(i).toFixed(1)+','+ys(v).toFixed(1)).join('')}" fill="none" stroke="${c}" stroke-width="${w}"${dash?' stroke-dasharray="4 4"':''}/>`;
  s+=path(base,css('--muted'),1.5,1)+path(cur,css('--keep'),3);
  s+=`<text x="${W-pr}" y="${ys(base[IT])+15}" text-anchor="end">dashed: 1 attempt, no tricks</text>`;
  svg.innerHTML=s;$('.v1',el).textContent=Math.round(cur[IT]*100)+'%';
  const flat=cur[IT]-cur[IT-3]<0.02;$('.v2',el).textContent=cur[IT]>.97?'solves nearly everything':flat?'stalls: hard tasks give no data':'still climbing';
  $('.cb',el).textContent=grow.checked?'New tasks generated just above the model\'s level keep giving it something it can sometimes solve, so it keeps climbing.':hint.checked?'Hints let the model learn from problems it could not solve alone, pushing the wall back.':k>=16?'More attempts per task find rare successes on harder problems, so there is more to learn from.':flat?'With few attempts, the model masters the easy tier, then the hard tier almost never produces a success, so there is nothing to train on and progress flattens.':'Progress is slow: with this few attempts, harder tasks rarely produce a success to learn from.';}
 sk.oninput=draw;hint.onchange=draw;grow.onchange=draw;draw();})();

/* ---------- 7. curriculum signal ---------- */
(function(){const el=$('#w-curr'),sp=$('#uP',el),sn=$('#uN',el),svg=$('svg',el);
 const f=(p,n)=>1-Math.pow(p,n)-Math.pow(1-p,n);
 function draw(){const p=+sp.value,n=+sn.value;$('.op',el).textContent=Math.round(p*100)+'%';$('.on',el).textContent=n;
  const r=rng(Math.round(p*1000)*31+n);$('.dots',el).innerHTML=Array.from({length:n},()=>`<span class="dot" style="background:${r()<p?css('--keep'):css('--reject')}"></span>`).join('');
  const W=cw(svg),H=Math.round(W*0.34)+20,pl=40,pr=12,pt=12,pb=30,xs=v=>pl+v*(W-pl-pr),ys=v=>pt+(1-v)*(H-pt-pb);setVB(svg,W,H);
  let s=`<rect x="${xs(.25)}" y="${pt}" width="${xs(.75)-xs(.25)}" height="${H-pt-pb}" fill="${css('--tint')}"/>`;
  [0,.25,.5,.75,1].forEach(v=>{s+=`<line x1="${pl}" x2="${W-pr}" y1="${ys(v)}" y2="${ys(v)}" stroke="${css('--line')}"/><text x="${pl-6}" y="${ys(v)+3.5}" text-anchor="end">${v}</text><text x="${xs(v)}" y="${H-12}" text-anchor="middle">${Math.round(v*100)}%</text>`});
  s+=`<text x="${(pl+W-pr)/2}" y="${H-1}" text-anchor="middle">success rate on the task</text>`;
  let d='';for(let j=0;j<=200;j++){const x=j/200;d+=(j?'L':'M')+xs(x).toFixed(1)+','+ys(f(x,n)).toFixed(1)}
  s+=`<path d="${d}" fill="none" stroke="${css('--keep')}" stroke-width="2.5"/>`;
  s+=`<line x1="${xs(p)}" x2="${xs(p)}" y1="${pt}" y2="${H-pb}" stroke="${css('--muted')}" stroke-dasharray="3 3"/><circle cx="${xs(p)}" cy="${ys(f(p,n))}" r="6" fill="${css('--ink')}" stroke="${css('--surface')}" stroke-width="2"/>`;
  s+=`<text x="${(xs(.25)+xs(.75))/2}" y="${H-pb-8}" text-anchor="middle" style="fill:${css('--keep')}">${W<420?'admitted band':'AutoEnvScaling admits tasks here'}</text>`;
  svg.innerHTML=s;const v=f(p,n);$('.v1',el).textContent=Math.round(v*100)+'%';
  $('.v2',el).textContent=p<.02?'never solved: no signal':p>.98?'always solved: no signal':(p>=.25&&p<=.75)?'great practice task':v<.5?'mostly wasted rollouts':'useful, outside the band';}
 sp.oninput=draw;sn.oninput=draw;draw();})();

/* ---------- 4b. overfitting (toy) ---------- */
(function(){const el=$('#w-over'),sg=$('#oG',el),rg=$('.reg',el),gt=$('.gate',el),svg=$('svg',el),G=20;
 const E=(g,r)=>r?0.55+0.20*(1-Math.exp(-g/6)):0.55+0.25*(1-Math.exp(-g/5));
 const Hd=(g,r)=>r?0.55+0.13*(1-Math.exp(-g/6)):0.55+0.10*(1-Math.exp(-g/4))-0.0055*g;
 function series(r,gate){const e=[],h=[];let acc=0;
  for(let g=0;g<=G;g++){if(!gate||Hd(g,r)>=Hd(acc,r)-1e-9)acc=g;const a=gate?acc:g;e.push(E(a,r));h.push(Hd(a,r))}return{e,h}}
 function draw(){const n=+sg.value;$('output',el).textContent=n;const r=rg.checked,gate=gt.checked,S=series(r,gate);
  const W=cw(svg),H=Math.round(W*0.36)+20,pl=40,pr=12,pt=12,pb=30;setVB(svg,W,H);
  const xs=g=>pl+g/G*(W-pl-pr),lo=0.5,hi=0.85,ys=v=>pt+(1-(v-lo)/(hi-lo))*(H-pt-pb);
  let s='';[0.5,0.6,0.7,0.8].forEach(v=>s+=`<line x1="${pl}" x2="${W-pr}" y1="${ys(v)}" y2="${ys(v)}" stroke="${css('--line')}"/><text x="${pl-6}" y="${ys(v)+3.5}" text-anchor="end">${Math.round(v*100)}%</text>`);
  for(let g=0;g<=G;g+=(W<420?10:5))s+=`<text x="${xs(g)}" y="${H-12}" text-anchor="middle">${g}</text>`;
  s+=`<text x="${(pl+W-pr)/2}" y="${H-1}" text-anchor="middle">rounds of harness evolution</text>`;
  const path=(a,c,w,dash)=>`<path d="${a.slice(0,n+1).map((v,i)=>(i?'L':'M')+xs(i).toFixed(1)+','+ys(v).toFixed(1)).join('')}" fill="none" stroke="${c}" stroke-width="${w}"${dash?' stroke-dasharray="5 4"':''}/>`;
  s+=path(S.e,css('--ink'),2.2,1)+path(S.h,css('--keep'),3);
  s+=`<circle cx="${xs(n)}" cy="${ys(S.h[n])}" r="5" fill="${css('--keep')}" stroke="${css('--surface')}" stroke-width="2"/>`;
  svg.innerHTML=s;
  const de=S.e[n]-S.e[0],dh=S.h[n]-S.h[0];
  $('.v1',el).textContent='+'+Math.round(de*100)+' pts';$('.v2',el).textContent=(dh>=0?'+':'−')+Math.abs(Math.round(dh*100))+' pts';
  $('.oc',el).textContent=r&&gate?'With regularization, the new-ticket score never falls, so the gate never has to block anything: the two fixes overlap here.':r?'Regularized: proposals that only fit the evolve set are screened out, so the gains it keeps are smaller on paper but carry over to new tickets.':gate?'The held-out gate stops accepting edits once they stop helping on new tickets. Nothing gets worse, but improvement also stops early.':n<7?'Early on, edits help everywhere. Keep going.':'Unregularized: the score on the tickets it evolved on keeps climbing, while the score on new tickets peaks and slides back. The later edits are tricks that only fit the evolve set.';}
 sg.oninput=draw;rg.onchange=draw;gt.onchange=draw;draw();})();

/* ---------- 8. evolving worlds (toy) ---------- */
(function(){const el=$('#w-world'),svg=$('svg',el),BUD=16;
 function tree(seed,inc){const r=rng(seed),nodes=[{id:0,p:-1,d:0,s:1.0}];
  for(let d=1;d<=3;d++){nodes.filter(n=>n.d===d-1).forEach(pa=>{for(let c=0;c<3;c++){const br=d===1?c:pa.br;
   const s=+(pa.s+inc[br][d-1]+0.12*(r()-0.5)).toFixed(2);nodes.push({id:nodes.length,p:pa.id,d,s,br})}})}return nodes}
 const WORLDS=[tree(11,[[.35,.3,.3],[.05,.05,.05],[.15,.1,.1]]),tree(42,[[.35,.05,-.05],[.05,.55,.9],[.15,.1,.15]]),tree(7,[[.3,0,0],[.1,.1,.1],[.05,.6,.7]])];
 const POL={greedy:'Always extend the best',breadth:'Breadth first',bonus:'Best plus exploration bonus'},PK=Object.keys(POL);
 function replay(nodes,pol,B){const kids=id=>nodes.filter(n=>n.p===id);const rev=new Set([0]);
  while(rev.size<Math.min(B+1,nodes.length)){
   const front=nodes.filter(n=>!rev.has(n.id)&&rev.has(n.p));if(!front.length)break;let pick;
   if(pol==='breadth')pick=front.sort((a,b)=>a.d-b.d||a.id-b.id)[0];
   else if(pol==='greedy')pick=front.sort((a,b)=>nodes[b.p].s-nodes[a.p].s||a.id-b.id)[0];
   else{const cnt=id=>kids(id).filter(k=>rev.has(k.id)).length;pick=front.sort((a,b)=>(nodes[b.p].s+0.45/Math.sqrt(1+cnt(b.p))+0.1*b.d)-(nodes[a.p].s+0.45/Math.sqrt(1+cnt(a.p))+0.1*a.d)||a.id-b.id)[0]}
   rev.add(pick.id)}
  let best=0;rev.forEach(id=>{if(nodes[id].s>nodes[best].s)best=id});return{rev,best:nodes[best]}}
 // deployed policy per round: round 1 starts with greedy; winner of round t is deployed for round t+1
 const rounds=[];let inc='greedy';
 for(let t=1;t<=3;t++){const pool=WORLDS.slice(0,t);const sc={};PK.forEach(p=>sc[p]=pool.map(w=>replay(w,p,BUD).best.s));
  const avg=p=>sc[p].reduce((a,b)=>a+b,0)/t;let win=inc;PK.forEach(p=>{if(avg(p)>avg(win)+0.005)win=p});
  rounds.push({deployed:inc,sc,avg:Object.fromEntries(PK.map(p=>[p,avg(p)])),win});inc=win;}
 const CAP=[
  'Round 1: one recorded world, from a run with best-first deployed. On it, best-first already reaches the fast branch and nothing beats it by enough to switch, so the incumbent stays. One world gives no evidence that exploring pays.',
  'Round 2 adds a deceptive world: the branch that looks best early stalls, and the big win sits under a branch that starts slow. Averaged over both worlds, the exploration bonus wins and is deployed.',
  'Round 3 adds another world, and here breadth-first does best: no policy wins every world. The bonus policy still has the best average, so it stays deployed, and the pool keeps growing.'];
 let R=1,wsel=1,pol='bonus';
 function draw(){const rd=rounds[R],t=R+1;if(wsel>R)wsel=R;
  $$('.rd button',el).forEach((b,k)=>b.setAttribute('aria-pressed',k===R));
  $('.wt',el).innerHTML=WORLDS.slice(0,t).map((w,k)=>`<button data-k="${k}" aria-pressed="${k===wsel}">World ${k+1}</button>`).join('');
  $$('.wt button',el).forEach(b=>b.onclick=()=>{wsel=+b.dataset.k;draw()});
  $$('.pol button',el).forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===pol));
  const nodes=WORLDS[wsel],Rp=replay(nodes,pol,BUD);
  const W=cw(svg),top=26,lvl=W<420?54:64,H=top+3*lvl+22;setVB(svg,W,H);const gap=(W-40)/26;const kids=id=>nodes.filter(n=>n.p===id);
  const pos={};nodes.filter(n=>n.d===3).forEach((n,i)=>pos[n.id]=[20+i*(W-40)/26,top+3*lvl]);
  for(let d=2;d>=0;d--)nodes.filter(n=>n.d===d).forEach(n=>{const ks=kids(n.id);pos[n.id]=[ks.reduce((a,k)=>a+pos[k.id][0],0)/ks.length,top+d*lvl]});
  let s='';nodes.forEach(n=>{if(n.p<0)return;const a=pos[n.p],b=pos[n.id],on=Rp.rev.has(n.id);s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${on?css('--keep'):css('--line')}" stroke-width="${on?2:1}"/>`});
  nodes.forEach(n=>{const [x,y]=pos[n.id],on=Rp.rev.has(n.id),best=n.id===Rp.best.id;const rr=n.d===3?Math.min(7,gap/2.6):(W<420?8:11);
   s+=`<circle cx="${x}" cy="${y}" r="${rr}" fill="${best?css('--state'):on?css('--keep'):css('--surface')}" stroke="${on||best?'none':css('--line')}" stroke-width="1.5"><title>${n.s.toFixed(2)}×</title></circle>`;
   if((n.d<3&&W>=420)||n.d===1||best)s+=`<text x="${x}" y="${n.d===3?y+19:y-14}" text-anchor="middle" style="fill:${best?css('--state'):on?css('--ink'):css('--muted')};${best?'font-weight:600':''}">${n.s.toFixed(2)}×</text>`});
  svg.innerHTML=s;
  const th=`<tr><th>Policy</th>${WORLDS.slice(0,t).map((w,k)=>`<th>W${k+1}</th>`).join('')}<th>Average</th></tr>`;
  const rows=PK.map(p=>`<tr${p===rd.win?' class="winrow"':''}><td>${POL[p]}${p===rd.deployed?' <span class="tag">deployed</span>':''}</td>${rd.sc[p].map(v=>`<td class="mono">${v.toFixed(2)}×</td>`).join('')}<td class="mono"><b>${rd.avg[p].toFixed(2)}×</b></td></tr>`).join('');
  $('.board',el).innerHTML=`<table class="cmp"><thead>${th}</thead><tbody>${rows}</tbody></table>`;
  $('.wv',el).textContent=POL[rd.win]+(rd.win===rd.deployed?' (kept)':' (switch)');
  $('.wc',el).textContent=CAP[R];}
 $$('.rd button',el).forEach((b,k)=>b.onclick=()=>{R=k;draw()});
 $$('.pol button',el).forEach(b=>b.onclick=()=>{pol=b.dataset.p;draw()});
 draw();el._draw=draw;})();

/* ---------- 8b. MILO islands (toy) ---------- */
(function(){const el=$('#w-milo');if(!el)return;const sl=$('#mG',el),svg=$('svg',el);let mode='on',timer=null;
 const ex=(g,t)=>1-Math.exp(-g/t);
 const base={A:g=>0.62+0.18*ex(g,5),B:g=>0.58+0.12*ex(g,3),C:g=>0.55+0.21*ex(g,6)};
 const EV=[{g:10,i:'B',stall:'Island B stuck: no improvement for 3 generations',move:'Reassign: island B gets a different mutator'},
  {g:17,i:'C',stall:'Island C stuck',move:'Graft: breed C\'s best harness with B\'s'},
  {g:24,i:'all',stall:'All islands flat',move:'Curriculum: swap in harder tasks that few harnesses solve'}];
 function val(k,g){let v=base[k](g);if(mode==='off')return v;
  if(k==='B'&&g>10)v=base.B(10)+0.12*ex(g-10,4);
  if(k==='C'&&g>17)v=base.C(17)+0.10*ex(g-17,3);
  if(g>24)v+=0.035*ex(g-24,2);return v}
 function draw(){const n=+sl.value;$('output',el).textContent=n;$$('.md button',el).forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===mode));
  const W=cw(svg),H=Math.round(W*(W<420?0.62:0.38))+30,pl=40,pr=12,pt=26,pb=36;setVB(svg,W,H);
  const xs=g=>pl+g/30*(W-pl-pr),lo=0.5,hi=0.95,ys=v=>pt+(1-(v-lo)/(hi-lo))*(H-pt-pb);
  let s='';[0.5,0.6,0.7,0.8,0.9].forEach(v=>s+=`<line x1="${pl}" x2="${W-pr}" y1="${ys(v)}" y2="${ys(v)}" stroke="${css('--line')}"/><text x="${pl-6}" y="${ys(v)+3.5}" text-anchor="end">${Math.round(v*100)}%</text>`);
  for(let g=0;g<=30;g+=(W<420?10:5))s+=`<text x="${xs(g)}" y="${H-pb+15}" text-anchor="middle">${g}</text>`;
  s+=`<text x="${(pl+W-pr)/2}" y="${H-2}" text-anchor="middle">generation</text>`;
  const ev=EV.filter(e=>e.g<=n);
  ev.forEach(e=>{const x=xs(e.g);if(mode==='on'){s+=`<line x1="${x}" x2="${x}" y1="${pt-6}" y2="${H-pb}" stroke="${css('--keep')}" stroke-dasharray="3 3"/><text x="${x}" y="${pt-10}" text-anchor="middle" style="fill:${css('--keep')};font-weight:600">${e.move.split(':')[0].toLowerCase()}</text>`}});
  const cols={A:css('--prop'),B:css('--warn'),C:css('--state')};
  const pts=k=>[...Array(n*2+1).keys()].map(i=>i/2).map(g=>xs(g).toFixed(1)+','+ys(val(k,g)).toFixed(1)).join(' ');
  if(n>0){['A','B','C'].forEach(k=>s+=`<polyline points="${pts(k)}" fill="none" stroke="${cols[k]}" stroke-width="2"/>`);
   s+=`<polyline points="${[...Array(n*2+1).keys()].map(i=>i/2).map(g=>xs(g).toFixed(1)+','+ys(Math.max(val('A',g),val('B',g),val('C',g))+0.004).toFixed(1)).join(' ')}" fill="none" stroke="${css('--ink')}" stroke-width="3" stroke-dasharray="6 3" opacity=".8"/>`;}
  ev.forEach(e=>{const ks=e.i==='all'?['A','B','C']:[e.i];ks.forEach(k=>{s+=`<circle cx="${xs(e.g)}" cy="${ys(val(k,e.g))}" r="5" fill="${css('--reject')}" stroke="${css('--surface')}" stroke-width="1.5"/>`})});
  if(n>0)['A','B','C'].forEach(k=>s+=`<text x="${Math.min(W-pr-2,xs(n)+6)}" y="${ys(val(k,n))+4}" text-anchor="${xs(n)+20>W-pr?'end':'start'}" style="fill:${cols[k]};font-weight:600">${k}</text>`);
  svg.innerHTML=s;
  const best=Math.max(val('A',n),val('B',n),val('C',n));$('.v1',el).textContent=Math.round(best*100)+'%';
  const stuck=mode==='off'?ev.reduce((a,e)=>a+(e.i==='all'?0:1),0)+(n>=21?1:0):0;
  $('.v2',el).textContent=mode==='off'?(n>=24?'all 3':stuck+' of 3'):'0 of 3';
  $('.mlog',el).innerHTML=ev.length?ev.map(e=>`<li><b>Gen ${e.g}.</b> ${e.stall}. ${mode==='on'?'<span class="ok">Orchestrator → '+e.move+'.</span>':'<span class="bad">Nothing changes the search.</span>'}</li>`).join(''):'<li class="cap">No stalls yet: every island is still improving.</li>';
  $('.mcap',el).textContent=mode==='on'?(n<10?'Early on, every island improves with its own mutator. Keep going.':'Each time an island stops improving, the orchestrator changes how that island searches, and the climb resumes. The best harness keeps getting better long after any single island would have stopped.'):(n<10?'Early on, every island improves. Keep going.':'Without an orchestrator, each island stays stuck once its mutator runs out of ideas. More generations buy nothing: the search itself needs to change.');}
 function stop(){if(timer){clearInterval(timer);timer=null}$('.bplay',el).textContent='Play the search'}
 $('.bplay',el).onclick=()=>{if(timer){stop();return}if(+sl.value>=30)sl.value=0;$('.bplay',el).textContent='Pause';timer=setInterval(()=>{sl.value=+sl.value+1;draw();if(+sl.value>=30)stop()},RM?60:260)};
 $$('.md button',el).forEach(b=>b.onclick=()=>{mode=b.dataset.m;draw()});sl.oninput=()=>{stop();draw()};REDRAW.push(draw);draw();})();

/* ---------- 9. goodhart (toy) ---------- */
(function(){const el=$('#w-good'),sl=$('#hT',el),svg=$('svg',el),T=30;let m='f';
 const qf=t=>0.40+0.20*(1-Math.exp(-t/6))-0.004*Math.max(0,t-10), gf=t=>0.35*(1-Math.exp(-Math.max(0,t-4)/8));
 const qe=t=>0.40+0.32*(1-Math.exp(-t/10)), ge=t=>t<=4?0:0.12*(1-Math.exp(-((t-4)%6)/2.5));
 const ups=[10,16,22,28];
 function draw(){const n=+sl.value;$('output',el).textContent=n;$$('.md button',el).forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===m));
  const Q=m==='f'?qf:qe,G=m==='f'?gf:ge;$('.ek',el).style.display=m==='e'?'':'none';
  const W=cw(svg),H=Math.round(W*0.36)+26,pl=40,pr=12,pt=12,pb=36;setVB(svg,W,H);
  const xs=t=>pl+t/T*(W-pl-pr),lo=0.3,hi=1.0,ys=v=>pt+(1-(v-lo)/(hi-lo))*(H-pt-pb);
  let s='';[0.4,0.6,0.8,1].forEach(v=>s+=`<line x1="${pl}" x2="${W-pr}" y1="${ys(v)}" y2="${ys(v)}" stroke="${css('--line')}"/><text x="${pl-6}" y="${ys(v)+3.5}" text-anchor="end">${Math.round(v*100)}</text>`);
  for(let t=0;t<=T;t+=(W<420?10:5))s+=`<text x="${xs(t)}" y="${H-pb+14}" text-anchor="middle">${t}</text>`;
  s+=`<text x="${(pl+W-pr)/2}" y="${H-1}" text-anchor="middle">rounds of optimization against the reviewer</text>`;
  if(m==='e')ups.filter(u=>u<=n).forEach(u=>s+=`<line x1="${xs(u)}" x2="${xs(u)}" y1="${pt}" y2="${H-pb}" stroke="${css('--state')}" stroke-dasharray="2 3"/>`);
  const N=n*4,pts=[...Array(N+1).keys()].map(i=>i/4);
  const sc=t=>Q(t)+G(t);
  let band=pts.map(t=>xs(t).toFixed(1)+','+ys(sc(t)).toFixed(1)).join(' ')+' '+pts.slice().reverse().map(t=>xs(t).toFixed(1)+','+ys(Q(t)).toFixed(1)).join(' ');
  if(n>0)s+=`<polygon points="${band}" fill="${css('--reject')}" opacity=".18"/>`;
  const path=(f,c,w,d)=>`<path d="${pts.map((t,i)=>(i?'L':'M')+xs(t).toFixed(1)+','+ys(f(t)).toFixed(1)).join('')}" fill="none" stroke="${c}" stroke-width="${w}"${d?' stroke-dasharray="5 4"':''}/>`;
  if(n>0)s+=path(sc,css('--ink'),2.2,1)+path(Q,css('--keep'),3);
  svg.innerHTML=s;
  $('.v1',el).textContent=Math.round(sc(n)*100);$('.v2',el).textContent=Math.round(Q(n)*100);$('.v3',el).textContent=Math.round(G(n)*100)+' pts';
  $('.gq',el).textContent=m==='f'?(n<8?'Early on, the score and the quality rise together: the easiest gains are real ones.':'With a fixed reviewer, most new points come from pleasing it, for example tests that only check a function returns something. The score keeps climbing while real quality stalls and starts to slip.'):'Each time the gap opens, an updated reviewer is proposed that stops rewarding the exploit. It is accepted only if it agrees better with a small set of human-labelled reviews that the loop cannot change. The gap keeps reopening but stays small, and real quality keeps rising.';}
 $$('.md button',el).forEach(b=>b.onclick=()=>{m=b.dataset.m;draw()});sl.oninput=draw;draw();})();

/* ---------- 10. kiro gate (real thresholds, illustrative candidates) ---------- */
(function(){const el=$('#w-gate'),sd=$('#gD',el);
 const C=[
  {n:'Delete a misleading sentence from the read tool\'s description',on:10,off:3,reg:true,tgt:6.5,ho:2.1,oth:-0.3},
  {n:'Add a rule: re-read every file before editing it',on:10,off:2,reg:true,tgt:4.0,ho:1.2,oth:-1.8},
  {n:'Special-case the failing task\'s file path',on:10,off:1,reg:true,tgt:9.0,ho:0.0,oth:0.0},
  {n:'Tell the agent to double-check relative paths',on:9,off:4,reg:true,tgt:5.0,ho:2.0,oth:0.2},
  {n:'Shorten every tool description at once',on:10,off:4,reg:false,tgt:3.0,ho:1.0,oth:-0.5}];
 let k=0;
 C.forEach((c,i)=>{const b=document.createElement('button');b.className='chip';b.textContent=c.n;b.onclick=()=>{k=i;draw()};$('.cg',el).appendChild(b)});
 function draw(){const d=+sd.value,c=C[k];$('output',el).textContent=d.toFixed(1)+' pts';
  $$('.cg .chip',el).forEach((b,i)=>b.setAttribute('aria-pressed',i===k));
  const s1=c.on===10&&c.off<=4,s2=s1&&c.reg,sup=c.tgt>0&&c.ho>0,ni=c.oth>=-d,s3=s2&&sup&&ni;
  const st=(ok,ran)=>ran?(ok?'win':'lose'):'';
  const mk=(h,lines,ok,ran)=>`<div class="cand ${st(ok,ran)}"${ran?'':' style="opacity:.45"'}><h4>${h}</h4><ul>${lines.map(x=>'<li>'+x+'</li>').join('')}</ul>${ran?`<div style="margin-top:6px" class="${ok?'ev-good':'ev-bad'}">${ok?'Pass':'Rejected here'}</div>`:'<div class="cap" style="margin-top:6px">not reached</div>'}</div>`;
  $('.gst',el).innerHTML=
   mk('1 · Mechanism screen',[`Fix on: ${c.on}/10 runs succeed (need 10/10)`,`Fix off: ${c.off}/10 succeed (need ≤ 4/10, so the failure is real)`],s1,true)+
   mk('2 · Regression screen',[c.reg?'All past-fix assertions pass':'1 past-fix assertion fails','Need 100%: one failure is a hard stop'],s2,s1)+
   mk('3 · Offline confirmation',[`Target tasks: ${c.tgt>0?'+':''}${c.tgt.toFixed(1)} pts`,`Held-out tasks: ${c.ho>0?'+':''}${c.ho.toFixed(1)} pts (need above 0)`,`Everything else: ${c.oth>0?'+':''}${c.oth.toFixed(1)} pts (need ≥ −δ)`,'89 tasks × 5 runs, with and without the fix'],s3,s2);
  $('.v1',el).textContent=s3?'Opens a pull request for human review':!s1?'Rejected at the mechanism screen':!s2?'Hard stop at the regression screen':!sup?'Rejected: no gain on held-out tasks':'Rejected: too much harm elsewhere';
  $('.gc',el).textContent=s3?'Passing the gate does not ship the change. It becomes an ordinary pull request, a human reviews and merges it, and its target behavior becomes a new permanent regression assertion.':
   !s1?'9 of 10 is not enough: the screen demands that the fix work every time on the failure it targets, and that the failure really occurs without it.':
   !s2?'One broken assertion from an earlier fix stops the candidate outright. This is how the loop avoids forgetting what it already fixed.':
   !sup?'A narrow hack: it fixes the exact failing task and nothing like it. Held-out tasks catch it, the overfitting check from Problem 4. The Kiro team warns that a loop allowed to grade its own fixes drifts toward exactly this kind of narrow hack.':
   'It helps the target, but costs more on other tasks than the margin allows. Widen δ and watch it pass: the margin is a policy decision about how much collateral harm is acceptable.';}
 sd.oninput=draw;draw();})();

/* re-render charts on resize / theme change */
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(rerender,120)});
function rerender(){REDRAW.forEach(f=>f());const ww=document.getElementById('w-world');ww&&ww._draw&&ww._draw();['pW','oG','uP','bK','hT'].forEach(id=>{const e=document.getElementById(id);e&&e.dispatchEvent(new Event('input'))})}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',rerender)}catch(e){}
new MutationObserver(rerender).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();
