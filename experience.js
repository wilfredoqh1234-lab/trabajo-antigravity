(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const viewport=document.getElementById('knowledgeCarousel');
  const cards=[...viewport.querySelectorAll('[data-knowledge]')];
  const track=document.createElement('div');track.className='river-track';
  const clones=cards.map(c=>{const n=c.cloneNode(true);n.setAttribute('aria-hidden','true');n.tabIndex=-1;return n;});
  track.append(...clones,...cards);viewport.append(track);
  const pause=document.createElement('button');pause.type='button';pause.className='river-pause';pause.textContent='Pausar flujo';pause.setAttribute('aria-pressed','false');
  document.querySelector('.knowledge-heading-row').insertBefore(pause,document.querySelector('.knowledge-controls'));
  let selected=0,offset=0,cycle=1,visible=false,manual=false,hover=false,focus=false,last=0,raf=0;
  function measure(){cycle=cards[0].offsetLeft-clones[0].offsetLeft;offset=-cycle;paint();}
  function paint(){offset=((offset%cycle)+cycle)%cycle-cycle;track.style.transform=`translate3d(${offset}px,0,0)`;}
  function choose(i){selected=(i+4)%4;const c=cards[selected];document.getElementById('sobre-heading').replaceChildren(...c.dataset.title.split('|').flatMap((s,i)=>i?[document.createElement('br'),document.createTextNode(s)]:[document.createTextNode(s)]));document.getElementById('knowledgeDescription').textContent=c.dataset.copy;document.getElementById('knowledgeCurrent').textContent=c.dataset.index;[...clones,...cards].forEach(n=>{const active=n.dataset.index===c.dataset.index;n.classList.toggle('is-active',active);n.setAttribute('aria-pressed',String(active));});}
  function allowed(){return visible&&!manual&&!hover&&!focus&&!document.hidden&&!reduce.matches;}
  function tick(t){raf=0;if(!allowed())return;if(last)offset+=Math.min(t-last,40)*.022;last=t;paint();raf=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(raf);raf=0;last=0;if(allowed())raf=requestAnimationFrame(tick);}
  pause.onclick=()=>{manual=!manual;pause.textContent=manual?'Reanudar flujo':'Pausar flujo';pause.setAttribute('aria-pressed',String(manual));sync();};
  viewport.addEventListener('mouseenter',()=>{hover=true;sync();});viewport.addEventListener('mouseleave',()=>{hover=false;sync();});
  viewport.addEventListener('focusin',()=>{focus=true;sync();});viewport.addEventListener('focusout',()=>{queueMicrotask(()=>{focus=viewport.contains(document.activeElement);sync();});});
  track.addEventListener('click',e=>{const c=e.target.closest('[data-knowledge]');if(c)choose(Number(c.dataset.index)-1);});
  document.getElementById('knowledgePrev').onclick=()=>{choose(selected-1);offset+=cards[0].offsetWidth+14;paint();};document.getElementById('knowledgeNext').onclick=()=>{choose(selected+1);offset-=cards[0].offsetWidth+14;paint();};
  new ResizeObserver(measure).observe(viewport);new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();}).observe(viewport);document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);measure();

  const stage=document.querySelector('.programs-grid');stage.classList.add('course-stage');stage.setAttribute('aria-label','Carrusel de programas académicos');stage.tabIndex=0;
  const programs=[...stage.children];const colors=['#963d32','#195c53','#254875','#6d3654','#b65737','#765c2e'];
  const controls=document.createElement('div');controls.className='course-controls';controls.innerHTML='<button type="button" aria-label="Programa anterior">‹</button><span class="course-count" aria-live="polite"></span><button type="button" aria-label="Programa siguiente">›</button>';stage.after(controls);
  const caption=document.createElement('p');caption.className='course-caption';caption.textContent='Arrastra para explorar · Selecciona una carta para descubrir su programa';controls.after(caption);
  let current=0,start=null,moved=false;
  programs.forEach((c,i)=>{c.style.setProperty('--course-bg',colors[i]);c.classList.remove('reveal');c.style.transitionDelay='0ms';const icon=c.querySelector('.program-card__icon');if(icon)icon.textContent=['◇','⌁','≋','✧','◈'][i];});
  function render(){const small=innerWidth<700;const gap=small?innerWidth*.45:225;programs.forEach((c,i)=>{let d=(i-current+programs.length)%programs.length;if(d>programs.length/2)d-=programs.length;const a=Math.abs(d);c.style.transform=`translateX(calc(-50% + ${d*gap}px)) translateZ(${-a*100}px) rotateY(${d===0?0:d>0?-17:17}deg) scale(${1-a*.08})`;c.style.opacity=a>2?'0':d===0?'1':'.55';c.style.zIndex=String(10-a);c.style.pointerEvents=a>2?'none':'auto';c.setAttribute('aria-current',String(d===0));c.tabIndex=d===0?0:-1;c.querySelectorAll('a').forEach(link=>link.tabIndex=d===0?0:-1);});controls.querySelector('span').textContent=`${String(current+1).padStart(2,'0')} / ${String(programs.length).padStart(2,'0')}`;}
  function go(delta){current=(current+delta+programs.length)%programs.length;render();}
  controls.children[0].onclick=()=>go(-1);controls.children[2].onclick=()=>go(1);
  stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(e.key==='ArrowRight'?1:-1);}});
  stage.addEventListener('pointerdown',e=>{if(e.button===0){start=e.clientX;moved=false;}});
  stage.addEventListener('pointermove',e=>{if(start!==null&&Math.abs(e.clientX-start)>10){moved=true;stage.setPointerCapture(e.pointerId);}});
  stage.addEventListener('pointerup',e=>{if(start!==null&&Math.abs(e.clientX-start)>40)go(e.clientX<start?1:-1);start=null;if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);setTimeout(()=>moved=false,0);});stage.addEventListener('pointercancel',()=>{start=null;moved=false;});
  stage.addEventListener('click',e=>{const c=e.target.closest('.program-card');if(moved){e.preventDefault();return;}if(c&&programs.indexOf(c)!==current){e.preventDefault();e.stopPropagation();current=programs.indexOf(c);render();}},true);
  new ResizeObserver(render).observe(stage);render();
})();
