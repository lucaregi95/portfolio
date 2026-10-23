// Injecte l'en-tête et le pied de page sur chaque page
(function(){
  const pages=[['index.html','Accueil'],['competences.html','Compétences'],['projets.html','Projets'],['veille.html','Veille'],['certifications.html','Certifications'],['cv.html','CV'],['contact.html','Contact']];
  const current=location.pathname.split('/').pop()||'index.html';
  const active=current==='projet.html'?'projets.html':current;
  const links=pages.map(([h,l])=>`<li><a href="${h}"${h===active?' aria-current="page"':''}>${l}</a></li>`).join('');
  document.getElementById('site-header').outerHTML=`<header class="site-header"><nav class="nav" aria-label="Navigation principale"><a class="brand" href="index.html" id="brand">Portfolio</a><button class="menu-btn" aria-expanded="false" aria-controls="menu">Menu</button><ul id="menu">${links}</ul></nav></header>`;
  document.getElementById('site-footer').outerHTML=`<footer class="site-footer"><div><span id="foot-nom"></span><span>BTS SIO option SLAM</span></div></footer>`;
  const btn=document.querySelector('.menu-btn'),menu=document.getElementById('menu');
  btn.addEventListener('click',()=>{const o=menu.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
})();
