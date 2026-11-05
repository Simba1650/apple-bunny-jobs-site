window.Bunny={
  async data(){const files=["site-data-meta.json","site-data-jobs-0.json","site-data-jobs-1.json","site-data-jobs-2.json","site-data-jobs-3.json","site-data-jobs-4.json"];const responses=await Promise.all(files.map(file=>fetch('./'+file,{cache:'no-cache'})));if(responses.some(response=>!response.ok))throw new Error('招聘数据读取失败');const [meta,...chunks]=await Promise.all(responses.map(response=>response.json()));return {...meta,jobs:chunks.flat()}},
  e(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))},
  cities(job){return String(job.cities||'').split(' / ').filter(Boolean)},
  categories(job){return String(job.categories||'').split(' / ').filter(Boolean)},
  visible(job){return ['NEW','ACTIVE','UPDATED'].includes(job.status)},
  segment(value){return value==='CENTRAL_SOE'?'央企':'外企'},
  category(value){return ({INTERNSHIP:'实习',FULL_TIME:'全职',CAMPUS:'校园招聘',SOCIAL:'社会招聘'})[value]||value}
};
