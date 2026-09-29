(() => {
  'use strict';
  const section = document.querySelector('#cultura.culture-journey');
  if (!section) return;
  const tiles = [...section.querySelectorAll('.culture-tile')];
  const scenes = [...section.querySelectorAll('.culture-scene')];
  const rail = section.querySelector('.culture-rail');
  const gallery = section.querySelector('.culture-gallery');
  const copy = section.querySelector('.culture-copy');
  const pause = section.querySelector('.culture-pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer, visible = false, paused = false, hovered = false, focused = false;
  let busy = false, pending = null, drag = null, suppress = false;
  const duration = 800;
  const ease = 'cubic-bezier(.77,0,.175,1)';
  function layout() {
    const step = tiles[0].offsetWidth + 18;
    tiles.forEach((tile,i) => {
      const slot = (i-current-1+tiles.length)%tiles.length;
      tile.style.transform = `translate3d(${slot*step}px,0,0)`;
      tile.style.zIndex = String(5-slot);
      tile.setAttribute('aria-pressed', String(i===current));
    });
    section.querySelector('.culture-counter strong').textContent = String(current+1).padStart(2,'0');
    section.querySelector('.culture-progress span').style.transform = `scaleX(${(current+1)/4})`;
  }
  function updateCopy() {
    const d=tiles[current].dataset;
    section.querySelector('.culture-topic').textContent=d.topic;
    section.querySelector('h2').textContent=d.short;
    section.querySelector('.culture-longtitle').textContent=d.title;
    section.querySelector('.culture-description').textContent=d.description;
  }
  function schedule() {
    clearTimeout(timer);
    if (visible && !paused && !hovered && !focused && !document.hidden && !reduced.matches && !busy)
      timer=setTimeout(()=>go(current+1,false),6200);
  }
  async function go(index,manual=true) {
    index=(index+4)%4;
    if(busy){pending={index,manual};return;}
    if(index===current){schedule();return;}
    busy=true;clearTimeout(timer);
    const previous=current, scene=scenes[index];
    await scene.decode().catch(()=>{});
    const full=section.getBoundingClientRect(), card=tiles[index].getBoundingClientRect();
    scenes.forEach((s,i)=>{s.style.zIndex=i===index?'2':i===previous?'1':'0';});
    scene.style.opacity='1';
    current=index;
    if(reduced.matches){updateCopy();layout();}
    else {
      // Expand the chosen card into the full background without animating layout.
      const x=card.left-full.left,y=card.top-full.top;
      const reveal=scene.animate([
        {clipPath:`inset(${y}px ${Math.max(0,full.width-x-card.width)}px ${Math.max(0,full.height-y-card.height)}px ${Math.max(0,x)}px round 13px)`,transform:'scale(1.025)'},
        {clipPath:'inset(0px 0px 0px 0px round 0px)',transform:'scale(1)'}
      ],{duration,easing:ease});
      const exit=copy.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-16px)'}],{duration:180,easing:'ease-out',fill:'forwards'});
      layout();
      await exit.finished.catch(()=>{});updateCopy();exit.cancel();
      const entrance=copy.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,easing:'cubic-bezier(.23,1,.32,1)'});
      await Promise.all([reveal.finished.catch(()=>{}),entrance.finished.catch(()=>{})]);
    }
    scenes.forEach((s,i)=>{s.style.opacity=i===current?'1':'0';});
    if(manual)section.querySelector('.culture-status').textContent=`${current+1} de 4: ${tiles[current].dataset.topic}`;
    busy=false;
    if(pending){const next=pending;pending=null;go(next.index,next.manual);}else schedule();
  }
  tiles.forEach((t,i)=>t.addEventListener('click',()=>{if(!suppress)go(i);}));
  section.querySelector('.culture-prev').onclick=()=>go(current-1);
  section.querySelector('.culture-next').onclick=()=>go(current+1);
  pause.onclick=()=>{paused=!paused;pause.textContent=paused?'▷':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Reanudar reproducción automática':'Pausar reproducción automática');schedule();};
  gallery.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(current+(e.key==='ArrowRight'?1:-1));}});
  rail.addEventListener('pointerdown',e=>{if(e.button===0){drag={x:e.clientX,y:e.clientY};suppress=false;clearTimeout(timer);}});
  rail.addEventListener('pointermove',e=>{if(drag&&Math.abs(e.clientX-drag.x)>12&&Math.abs(e.clientX-drag.x)>Math.abs(e.clientY-drag.y)){suppress=true;rail.setPointerCapture(e.pointerId);}});
  rail.addEventListener('pointerup',e=>{if(drag&&suppress&&Math.abs(e.clientX-drag.x)>40)go(current+(e.clientX<drag.x?1:-1));drag=null;if(rail.hasPointerCapture(e.pointerId))rail.releasePointerCapture(e.pointerId);setTimeout(()=>suppress=false,0);schedule();});
  rail.addEventListener('pointercancel',()=>{drag=null;suppress=false;schedule();});
  section.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;schedule();}});
  section.addEventListener('pointerleave',()=>{hovered=false;schedule();});
  section.addEventListener('focusin',()=>{focused=true;schedule();});
  section.addEventListener('focusout',()=>{queueMicrotask(()=>{focused=section.contains(document.activeElement);schedule();});});
  new IntersectionObserver(es=>{visible=es[0].isIntersecting;schedule();},{threshold:.25}).observe(section);
  new ResizeObserver(layout).observe(rail);
  document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);
  layout();
})();
