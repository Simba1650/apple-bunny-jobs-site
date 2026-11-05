window.Bunny={
  async data(){const response=await fetch('./data/site-data.json',{cache:'no-cache'});if(!response.ok)throw new Error('招聘数据读取失败');return response.json()},
  e(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))},
  cities(job){return String(job.cities||'').split(' / ').filter(Boolean)},
  categories(job){return String(job.categories||'').split(' / ').filter(Boolean)},
  visible(job){return ['NEW','ACTIVE','UPDATED'].includes(job.status)},
  segment(value){return value==='CENTRAL_SOE'?'央企':'外企'},
  category(value){return ({INTERNSHIP:'实习',FULL_TIME:'全职',CAMPUS:'校园招聘',SOCIAL:'社会招聘'})[value]||value}
};
