const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=f=>fetch(`data/${f}.json`).then(r=>{if(!r.ok)throw new Error(f);return r.json()});
const fail=(el,m='Impossible de charger les données. Ouvrez le site via un serveur (Live Server ou GitHub Pages).')=>{if(el)el.textContent=m};

(async function(){
  const page=document.body.dataset.page;
  let cfg={};
  try{cfg=await load('config')}catch(e){}
  const set=(s,fn)=>{const el=$(s);if(el)fn(el)};
  set('#brand',e=>e.textContent=cfg.nom||'Portfolio');
  set('#foot-nom',e=>e.textContent=`© ${new Date().getFullYear()} ${cfg.nom||''}`);
  set('#hero-name',e=>e.textContent=cfg.nom||'');
  set('#dispo',e=>e.textContent=cfg.dispo||'');
  set('#ecole',e=>e.textContent=cfg.ecole||'');
  set('#lnk-linkedin',e=>e.href=cfg.linkedin||'#');
  set('#lnk-github',e=>e.href=cfg.github||'#');
  set('#lnk-mail',e=>e.href='mailto:'+(cfg.email||''));
  if(cfg.nom) document.title=document.title.replace('Portfolio',`Portfolio de ${cfg.nom}`);

  try{
    if(page==='projets')await pageProjets();
    if(page==='projet')await pageProjet();
    if(page==='competences')await pageCompetences();
    if(page==='veille')await pageVeille();
  }catch(e){
    fail($('#projets-liste')||$('#fiche')||$('#competences-tableaux')||$('#veille-contenu'));
  }
  if(page==='contact')initContact();
})();

const badges=l=>`<ul class="badges">${l.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`;
const img=(p,alt)=>p?`<img src="${esc(p.image)}" alt="${esc(alt)}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph'}))">`:'';

async function pageProjets(){
  const projets=await load('projets');
  $('#projets-liste').innerHTML=projets.map(p=>`
    <a class="card" href="projet.html?slug=${encodeURIComponent(p.slug)}">
      ${img(p,'Capture d’écran du projet '+p.titre)}
      <div class="card-body"><h3>${esc(p.titre)}</h3><p>${esc(p.resume)}</p>${badges(p.technologies)}</div>
    </a>`).join('');
}

async function pageProjet(){
  const [projets,blocs]=await Promise.all([load('projets'),load('competences')]);
  const slug=new URLSearchParams(location.search).get('slug');
  const p=projets.find(x=>x.slug===slug);
  const el=$('#fiche');
  if(!p){el.innerHTML='<h1>Projet introuvable</h1><a class="btn" href="projets.html">Retour aux projets</a>';return}
  document.title=`${p.titre} | Portfolio`;
  const comps=blocs.flatMap(b=>b.competences.filter(c=>c.projets.includes(slug)).map(c=>c.nom));
  const sec=(t,c)=>c?`<section><h2>${t}</h2><p>${esc(c)}</p></section>`:'';
  el.className='wrap narrow fiche';
  el.innerHTML=`
    <a class="back" href="projets.html">← Tous les projets</a>
    <h1>${esc(p.titre)}</h1>
    <p class="lead">${esc(p.resume)}</p>
    ${badges(p.technologies)}
    ${img(p,'Capture d’écran du projet '+p.titre)}
    ${sec('Contexte',p.contexte)}${sec('Besoin',p.besoin)}${sec('Organisation de l’équipe',p.organisation)}
    ${sec('Ma réalisation',p.role)}${sec('Difficultés et solutions',p.difficultes)}
    <section><h2>Compétences mobilisées</h2>${comps.length?`<ul>${comps.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:'<p class="empty">Aucune compétence associée pour le moment.</p>'}</section>
    <div class="actions">
      ${p.github?`<a class="btn primary" href="${esc(p.github)}" target="_blank" rel="noopener">Code sur GitHub</a>`:''}
      ${p.demo?`<a class="btn" href="${esc(p.demo)}" target="_blank" rel="noopener">Voir la démo</a>`:''}
    </div>`;
}

async function pageCompetences(){
  const [blocs,projets]=await Promise.all([load('competences'),load('projets')]);
  const titre=Object.fromEntries(projets.map(p=>[p.slug,p.titre]));
  $('#competences-tableaux').innerHTML=blocs.map(b=>`
    <h2>${esc(b.bloc)} : ${esc(b.titre)}</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Compétence</th><th scope="col">Réalisations</th></tr></thead>
      <tbody>${b.competences.map(c=>`<tr><td>${esc(c.nom)}</td><td>${c.projets.length?c.projets.map(s=>`<a class="tag" href="projet.html?slug=${encodeURIComponent(s)}">${esc(titre[s]||s)}</a>`).join(''):'<span class="empty">À compléter</span>'}</td></tr>`).join('')}</tbody>
    </table></div>`).join('');
}

async function pageVeille(){
  const v=await load('veille');
  const fmt=d=>new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
  $('#veille-contenu').innerHTML=`
    <h2>Méthode</h2><p>${esc(v.methode)}</p>
    <h2>Sujets suivis</h2>
    <div class="grid">${v.sujets.map(s=>`<div class="card"><div class="card-body"><h3>${esc(s.titre)}</h3><p>${esc(s.description)}</p>${badges(s.sources)}</div></div>`).join('')}</div>
    <h2>Journal de veille</h2>
    ${v.articles.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(a=>`
      <div class="article"><time datetime="${esc(a.date)}">${fmt(a.date)} · ${esc(a.source)}</time>
      <h3><a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.titre)}</a></h3><p>${esc(a.resume)}</p></div>`).join('')}`;
}

function initContact(){
  const f=$('#form-contact'),st=$('#form-status');
  const check=()=>{
    const v={nom:f.nom.value.trim(),email:f.email.value.trim(),message:f.message.value.trim()};
    const e={
      nom:v.nom.length<2?'Indiquez votre nom.':'',
      email:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)?'':'Saisissez une adresse e-mail valide.',
      message:v.message.length<10?'Votre message doit contenir au moins 10 caractères.':''
    };
    for(const k in e)$('#err-'+k).textContent=e[k];
    return !Object.values(e).some(Boolean);
  };
  f.addEventListener('submit',async ev=>{
    ev.preventDefault();
    if(!check())return;
    st.textContent='Envoi en cours…';
    try{
      const r=await fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}});
      if(!r.ok)throw 0;
      f.reset();st.textContent='Message envoyé. Je vous réponds rapidement.';
    }catch{st.textContent='L’envoi a échoué. Réessayez ou écrivez-moi directement par e-mail.'}
  });
}
