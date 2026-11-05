(async()=>{
  const B=window.Bunny,featured=new Set(['apple','amazon','roche','microsoft','nvidia','sap','schneider-electric','bosch','johnson-johnson','ikea','loreal']);
  const data=await B.data(),all=data.jobs.filter(B.visible),form=document.querySelector('#filters'),cards=document.querySelector('#cards'),empty=document.querySelector('#empty');
  const unique=values=>[...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'zh-CN'));
  document.querySelector('#total-jobs').textContent=all.length;
  document.querySelector('#total-companies').textContent=data.stats?.collected_companies??data.companies.length;
  document.querySelector('#total-current-companies').textContent=data.stats?.current_job_companies??new Set(all.map(j=>j.company_id)).size;
  document.querySelector('#total-internships').textContent=all.filter(j=>B.categories(j).includes('INTERNSHIP')).length;
  const updated=new Date(data.generatedAt);document.querySelector('#last-updated').textContent=Number.isNaN(updated.getTime())?'—':updated.toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'});
  const definitions=[
    ['city','地区',unique(all.flatMap(B.cities)).map(v=>[v,v])],
    ['segment','企业性质',[['FOREIGN_ENTERPRISE','外企'],['CENTRAL_SOE','央企']]],
    ['category','岗位类型',[['FULL_TIME','正式岗位'],['INTERNSHIP','实习'],['CAMPUS','校园招聘']]],
    ['company','公司',data.companies.map(c=>[c.company_id,`${featured.has(c.company_id)?'★ ':''}${c.company_name_cn}`])],
    ['experience','经验',[['0','应届 / 无经验'],['1','1–3 年'],['4','4 年及以上']]]
  ];
  const params=new URLSearchParams(location.search);
  document.querySelector('#selects').innerHTML=definitions.map(([key,label,options])=>`<div class="filter-field"><label for="filter-${B.e(key)}">${B.e(label)}</label><select id="filter-${B.e(key)}" aria-label="${B.e(label)}" name="${B.e(key)}"><option value="any">不限</option>${options.map(([value,text])=>`<option value="${B.e(value)}">${B.e(text)}</option>`).join('')}</select></div>`).join('');
  for(const element of form.elements)if(element.name&&params.has(element.name))element.value=params.get(element.name);
  const matches=(job,p)=>{
    const specific=key=>p.get(key)&&p.get(key)!=='any';
    if(specific('company')&&job.company_id!==p.get('company'))return false;
    if(specific('function')&&job.job_function!==p.get('function'))return false;
    if(specific('education')&&job.education!==p.get('education'))return false;
    if(specific('language')&&job.language_requirement!==p.get('language'))return false;
    if(specific('city')&&!B.cities(job).includes(p.get('city')))return false;
    if(specific('segment')&&job.segment!==p.get('segment'))return false;
    if(specific('category')&&!B.categories(job).includes(p.get('category')))return false;
    if(specific('experience')){const n=job.experience_min,k=p.get('experience');if(k==='0'&&n!==0)return false;if(k==='1'&&!(n>=1&&n<=3))return false;if(k==='4'&&!(n>=4))return false}
    const q=String(p.get('q')||'').trim().toLocaleLowerCase('zh-CN');
    return !q||[job.raw_title,job.normalized_title,job.normalized_title_en,job.company_name_cn,job.company_name_en].filter(Boolean).join(' ').toLocaleLowerCase('zh-CN').includes(q)
  };
  const card=job=>{const title=job.normalized_title||job.raw_title,categories=B.categories(job);return `<article><div class="cardtop"><span class="companyicon">${B.e(String(job.company_name_en||job.company_name_cn||'?')[0])}<i>●</i></span><div><strong>${B.e(job.company_name_cn)}</strong><div class="muted">${B.e(job.company_name_en)}</div></div><span class="badge">${B.segment(job.segment)} · 官网核验 · ${B.e(job.status)}</span></div><a href="./job.html?id=${encodeURIComponent(job.job_id)}"><h3>${B.e(title)}</h3>${job.normalized_title_en&&job.normalized_title_en!==title?`<p class="english">${B.e(job.normalized_title_en)}</p>`:''}</a><div class="tags"><span>⌖ ${B.e(job.cities)}</span><span>${B.e(job.education||'学历未要求')}</span><span>${job.experience_min==null?'经验未要求':job.experience_min===0?'应届可投':`${B.e(job.experience_min)} 年起`}</span><span>${B.e(job.language_requirement||'语言未要求')}</span>${categories.includes('INTERNSHIP')?'<span class="intern">实习</span>':''}</div><div class="dates">官网发布时间：${B.e(job.posting_date||'未提供')}<br>最近核验：${B.e(job.last_checked)}</div><div class="cardfooter"><a href="./job.html?id=${encodeURIComponent(job.job_id)}">查看详情 →</a><a href="${B.e(job.apply_url)}" target="_blank" rel="noopener noreferrer">去官网申请 ↗</a></div></article>`};
  const render=()=>{const p=new URLSearchParams(new FormData(form));for(const [key,value] of [...p])if(!value||value==='any')p.delete(key);history.replaceState(null,'',p.size?`?${p}`:'./index.html');const list=all.filter(job=>matches(job,p));document.querySelector('#result-count').textContent=`${list.length} 个岗位`;cards.innerHTML=list.map(card).join('');empty.hidden=list.length!==0};
  form.addEventListener('submit',event=>{event.preventDefault();render()});form.addEventListener('change',render);
  const clear=()=>{form.reset();history.replaceState(null,'','./index.html');render()};document.querySelector('#clear-filters').addEventListener('click',clear);document.querySelector('#empty-clear').addEventListener('click',clear);
  render();
})().catch(error=>{document.querySelector('#cards').innerHTML=`<div class="notice">${window.Bunny.e(error.message)}，请刷新页面重试。</div>`});
