/* Team — sms-terms scripts */
<script>
(function(){
  const nav = document.getElementById('nav');
  if(!nav) return;
  function check(){
    if(window.scrollY > 40) nav.classList.add('nav--solid');
    else nav.classList.remove('nav--solid');
  }
  window.addEventListener('scroll', check, {passive:true});
  check();
})();

<script>
(function(){
  const tocLinks = document.querySelectorAll('.legal-toc a');
  const sections = Array.from(tocLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if(!sections.length) return;
  function update(){
    const offset = 120;
    let current = sections[0];
    for(const s of sections){
      if(s.getBoundingClientRect().top - offset <= 0) current = s;
    }
    tocLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current.id));
  }
  window.addEventListener('scroll', update, {passive:true});
  update();
})();

