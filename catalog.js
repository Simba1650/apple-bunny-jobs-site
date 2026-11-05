(async()=>{
  const B=window.Bunny,data=await B.data(),jobs=data.jobs.filter(B.visible),sources=data.sources||[],currentCompanies=new Set(jobs.map(j=>j.company_id)),internships=jobs.filter(j=>B.categories(j).includes('INTERNSHIP')).length;
  const collected=data.stats?.collected_companies??data.companies.length;
  const withJobs=data.stats?.current_job_companies??currentCompanies.size;
  document.querySelector('#catalog-stats').innerHTML=[[jobs.length,'当前岗位'],[collected,'收录企业'],[withJobs,'有岗位企业'],[internships,'实习岗位']].map(([value,label])=>`<div><strong>${B.e(value)}</strong><span>${label}</span></div>`).join('');
  const segments=[...new Set(sources.map(source=>source.segment).filter(Boolean))].sort();
  document.querySelector('#segment-cards').innerHTML=segments.map(segment=>{const matches=jobs.filter(j=>j.segment===segment),companyCount=sources.filter(source=>source.segment===segment).length,activeCompanies=new Set(matches.map(j=>j.company_id)).size,label=B.segment(segment);return `<article><span class="eyebrow">${label}</span><h2>${companyCount} 家企业招聘入口</h2><p>${activeCompanies} 家有当前岗位 · ${matches.length} 个可见岗位</p><a href="./index.html?segment=${encodeURIComponent(segment)}">查看${label}岗位 →</a></article>`}).join('');
  const directoryCount=data.stats?.directory_entries??sources.length;
  const reviewCount=data.stats?.directory_review_required??sources.filter(source=>source.source_status==='REVIEW_REQUIRED').length;
  document.querySelector('#source-summary').textContent=`表格提供 ${directoryCount} 条招聘入口，合并后收录 ${collected} 家企业；其中 ${reviewCount} 条记录需进一步核验。岗位搜索只展示已核验的具体岗位。`;
  const statusLabel=source=>{
    if(source.source_kind!=='DIRECTORY')return source.source_status==='AUTOMATED_VERIFIED'?'岗位自动核验':'招聘入口已核验';
    if(source.source_status!=='REVIEW_REQUIRED')return '目录收录，岗位待核验';
    const flags=String(source.directory_flags||'');
    if(flags.includes('COMPANY_MISMATCH')||flags.includes('DUPLICATE_URL'))return '链接归属待核验';
    if(flags.includes('CLASSIFICATION_REVIEW'))return '企业性质待核验';
    if(flags.includes('THIRD_PARTY_ATS'))return '第三方招聘链接待核验';
    return '来源待核验';
  };
  const queryInput=document.querySelector('#source-query'),sourceRows=document.querySelector('#source-rows');
  const renderSources=()=>{
    const query=queryInput.value.trim().toLocaleLowerCase('zh-CN');
    const matches=sources.filter(source=>!query||[source.company_name_cn,source.company_name_en,source.career_home_url,source.segment?B.segment(source.segment):'',statusLabel(source)].filter(Boolean).join(' ').toLocaleLowerCase('zh-CN').includes(query));
    document.querySelector('#source-match-count').textContent=`显示 ${matches.length} / ${sources.length} 家企业`;
    sourceRows.innerHTML=matches.map(source=>{
      const url=String(source.career_home_url||'');
      const link=/^https?:\/\//i.test(url)?`<a href="${B.e(url)}" target="_blank" rel="noopener noreferrer">${source.source_kind==='DIRECTORY'?'查看收录链接 ↗':'查看招聘入口 ↗'}</a>`:'链接待核验';
      return `<tr><td>${source.segment?B.segment(source.segment):'待分类'}</td><td>${B.e(source.company_name_cn)}<div class="muted">${B.e(source.company_name_en)}</div></td><td>${B.e(statusLabel(source))}</td><td>${B.e(source.last_checked||'尚未检查')}</td><td>${link}</td></tr>`;
    }).join('')||'<tr><td colspan="5">没有找到匹配的企业，请换个关键词。</td></tr>';
  };
  queryInput.addEventListener('input',renderSources);
  document.querySelector('#source-clear').addEventListener('click',()=>{queryInput.value='';queryInput.focus();renderSources()});
  renderSources();
})().catch(error=>{document.querySelector('#source-rows').innerHTML=`<tr><td colspan="5">${window.Bunny.e(error.message)}</td></tr>`});
