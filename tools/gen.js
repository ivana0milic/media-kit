const fs=require('fs');const d=require('./data.json');const T=d.TEXT.en;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const txt=v=>v&&typeof v==='object'?(v.en||''):(v||'');
const mix=a=>'#'+[62,99,137].map(c=>Math.round(255-a*(255-c)).toString(16).padStart(2,'0')).join('').toUpperCase();
const INK='#13234B',BODY='#3E6389',MUTED='#6B7D93',WARM='#C87226',LINE='#DDE3EA',ALT='#F2F6FA';
const GLOBAL='Global & Commodities';
const P=d.ECONOMISTS.map((e,i)=>{const aw=Array.isArray(e[6])?e[6]:[];let extra=0;const list=[];
  aw.forEach(a=>{const m=typeof a==='string'&&/^\+\s*(\d+)\s+more$/i.exec(a.trim());if(m)extra+=+m[1];else list.push(txt(a));});
  return{name:e[0],firm:e[1],region:e[2],pan:!!e[3],ret:!!e[4],blurb:txt(e[5]),awards:list,extra,links:e[7]||{},pick:d.EDITORS_PICKS.includes(e[0])};});
const regN={};P.forEach(p=>regN[p.region]=(regN[p.region]||0)+1);
const order=Object.keys(regN).sort((a,b)=>a===GLOBAL?1:b===GLOBAL?-1:regN[b]-regN[a]||a.localeCompare(b));
const stats=[[P.length,T.stEcon],[new Set(P.map(p=>p.firm)).size,T.stInst],[order.filter(r=>r!==GLOBAL).length,T.stReg],[P.filter(p=>p.pan).length,T.stPan],[P.filter(p=>p.awards.length||p.extra).length,T.stAw],[P.filter(p=>p.ret).length,T.stRet]];
const badge=(t,bg,fg,bd)=>`<span style="display:inline-block;margin:0 6px 6px 0;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:600;line-height:18px;background-color:${bg};color:${fg};border:1px solid ${bd||bg}">${esc(t)}</span>`;
function badges(p){let h='';
  if(p.pick)h+=badge('★ '+T.bPick,'#F7E9DC',INK);
  if(p.pan)h+=badge(T.bPan,BODY,'#FFFFFF');
  p.awards.forEach(a=>h+=badge('🏆 '+a,'#FCEDBA',INK));
  if(p.extra)h+=badge(T.more.replace('{n}',p.extra),'#FCEDBA',INK);
  if(p.ret)h+=badge('↻ '+T.bRet,'#FFFFFF',BODY,LINE);
  return h?`<p style="margin:10px 0 0;padding:0">${h}</p>`:'';}
function follow(p){const li=p.links.linkedin;const url=li||'https://www.linkedin.com/search/results/people/?keywords='+encodeURIComponent(p.name+' '+p.firm);
  let h=`<a href="${esc(url)}" target="_blank" rel="noopener" style="display:inline-block;margin:0 8px 0 0;padding:5px 12px;border-radius:999px;background-color:${BODY};color:#FFFFFF;font-size:13px;font-weight:600;line-height:18px;text-decoration:none">in · ${esc(li?T.follow:T.find)}</a>`;
  if(p.links.x)h+=`<a href="${esc(p.links.x)}" target="_blank" rel="noopener" style="display:inline-block;padding:5px 12px;border-radius:999px;border:1px solid ${LINE};color:${BODY};font-size:13px;font-weight:600;line-height:18px;text-decoration:none">X · ${esc(T.followX)}</a>`;
  return`<p style="margin:12px 0 0;padding:0">${h}</p>`;}
const card=(p,pick)=>`<div style="flex:1 1 300px;max-width:100%;box-sizing:border-box;margin:0;padding:18px 20px;background-color:#FFFFFF;border:1px solid ${LINE};border-radius:10px;${pick?'border-top:3px solid '+WARM+';':''}">
<p style="margin:0;padding:0;font-size:17px;font-weight:700;line-height:1.3;color:${INK}">${esc(p.name)}</p>
<p style="margin:2px 0 0;padding:0;font-size:14px;line-height:1.4;color:${BODY}">${esc(p.firm)}${pick?' · '+esc(p.region):''}</p>
${badges(p)}${p.blurb?`<p style="margin:10px 0 0;padding:0;font-size:14px;line-height:1.55;color:${BODY}">${esc(p.blurb)}</p>`:''}
${follow(p)}
</div>`;
const H=s=>s.replace(/\n/g,'');
let o=`<div id="fe-economists-static" style="max-width:1080px;margin:0 auto;padding:32px 20px 24px;box-sizing:border-box;color:${INK};text-align:left">`;
o+=`<p style="margin:0;padding:0;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${WARM}">${esc(T.kicker)}</p>`;
o+=`<h2 style="margin:8px 0 0;padding:0;font-size:38px;font-weight:800;line-height:1.1;color:${INK}">${esc(T.title)}</h2>`;
o+=`<p style="margin:12px 0 0;padding:0;max-width:44em;font-size:17px;line-height:1.55;color:${BODY}">Each country is shaded by how many economists on our list cover it. Find them by region in the directory below. <span style="font-size:12px;font-weight:700;color:${MUTED};border:1px dashed ${MUTED};border-radius:4px;padding:1px 6px">${esc(T.demoData)}</span></p>`;
o+=`<div style="display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 0;padding:0">`+stats.map(([n,l])=>`<div style="flex:1 1 130px;box-sizing:border-box;margin:0;padding:14px 16px;background-color:${ALT};border-radius:10px"><p style="margin:0;padding:0;font-size:28px;font-weight:800;line-height:1.1;color:${INK}">${n}</p><p style="margin:4px 0 0;padding:0;font-size:13px;line-height:1.35;color:${BODY}">${esc(l)}</p></div>`).join('')+`</div>`;
const legend=[['1–2',mix(.28)],['3–5',mix(.45)],['6–10',mix(.63)],['11–19',mix(.85)],['20+',INK]];
o+=`<p style="margin:28px 0 8px;padding:0;font-size:13px;font-weight:600;color:${BODY}">${esc(T.legendT)}: `+[['None','#E9EDF2'],...legend].map(([l,c])=>`<span style="display:inline-block;margin:0 10px 4px 0;white-space:nowrap"><span style="display:inline-block;width:14px;height:14px;vertical-align:-2px;margin-right:5px;border-radius:3px;background-color:${c}"></span>${esc(l)}</span>`).join('')+`</p>`;
o+=`<img src="MAP-IMAGE-URL" alt="${esc(T.mapAria)}" width="1032" height="509" style="display:block;width:100%;height:auto;margin:0;border:0">`;
o+=`<p style="margin:8px 0 0;padding:0;font-size:13px;color:${MUTED}">+ ${regN[GLOBAL]} Global &amp; Commodities economists (not on the map)</p>`;
const picks=d.EDITORS_PICKS.map(n=>P.find(p=>p.name===n)).filter(Boolean);
if(picks.length){o+=`<h3 style="margin:40px 0 4px;padding:0;font-size:24px;font-weight:800;color:${INK}">★ ${esc(T.picksT)}</h3><p style="margin:0 0 16px;padding:0;font-size:15px;color:${BODY}">${esc(T.picksD)} <span style="font-size:12px;font-weight:700;color:${MUTED};border:1px dashed ${MUTED};border-radius:4px;padding:1px 6px">${esc(T.demoSel)}</span></p>`;
  o+=`<div style="display:flex;flex-wrap:wrap;gap:16px;margin:0;padding:0">`+picks.map(p=>card(p,true)).join('')+`</div>`;}
o+=`<h3 style="margin:40px 0 4px;padding:0;font-size:24px;font-weight:800;color:${INK}">${esc(T.dirT)}</h3><p style="margin:0 0 16px;padding:0;font-size:15px;color:${BODY}">Click a region to see its economists.</p>`;
order.forEach(r=>{const ps=P.filter(p=>p.region===r);const cs=d.REGIONS[r];
  o+=`<details style="margin:0 0 10px;padding:0;border:1px solid ${LINE};border-radius:10px;background-color:#FFFFFF"><summary style="cursor:pointer;margin:0;padding:14px 18px;font-size:17px;font-weight:700;color:${INK}">${esc(r)} <span style="font-weight:600;font-size:14px;color:${BODY}">· ${ps.length} economist${ps.length>1?'s':''}</span></summary><div style="margin:0;padding:0 18px 18px">`;
  o+=cs?`<p style="margin:0 0 14px;padding:0;font-size:13px;line-height:1.5;color:${MUTED}">Covers: ${esc(cs.join(', '))}</p>`:`<p style="margin:0 0 14px;padding:0;font-size:13px;color:${MUTED}">Not tied to a country.</p>`;
  o+=`<div style="display:flex;flex-wrap:wrap;gap:12px;margin:0;padding:0">`+ps.map(p=>card(p,false)).join('')+`</div></div></details>`;});
o+=`<p style="margin:28px 0 0;padding:16px 0 0;border-top:1px solid ${LINE};font-size:12px;line-height:1.55;color:${MUTED}">${esc(T.note.replace('“Find on LinkedIn” opens a LinkedIn search until a profile link is added. ',''))}</p>`;
o+=`<p style="margin:8px 0 0;padding:0;font-size:12px;color:${MUTED}"><strong>Source:</strong> FocusEconomics</p></div>`;
fs.writeFileSync(process.argv[2],H(o).replace(/(<\/(?:p|div|details|h2|h3|summary)>|<img[^>]*>)(?=<(?:p|div|details|h2|h3|img)\b)/g,'$1\n')+'\n');
