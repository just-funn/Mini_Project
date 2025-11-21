import { auth } from './firebase.js';

function simpleUrlScore(url){
  // Basic heuristic checks (client-side placeholder)
  const lower = url.toLowerCase();
  let score = 100;
  const reasons = [];
  try{
    const u = new URL(url);
    if(!['http:','https:'].includes(u.protocol)){
      score -= 50; reasons.push('Unsupported protocol');
    }
    // suspicious patterns
    const suspicious = ['login','signin','secure','update','verify','bank','confirm'];
    suspicious.forEach(token => { if(lower.includes(token)) { score -= 12; reasons.push('Contains suspicious keyword: '+token); } });
    // long hostname
    if(u.hostname.length > 30){ score -= 10; reasons.push('Long hostname'); }
    // IP address host
    if(/\d+\.\d+\.\d+\.\d+/.test(u.hostname)) { score -= 30; reasons.push('Hostname is an IP address'); }
  }catch(err){ score = 0; reasons.push('Invalid URL'); }
  if(score <= 30) return {status:'danger',score, reasons};
  if(score <= 70) return {status:'warning',score, reasons};
  return {status:'safe',score, reasons};
}

export function initDashboard(){
  const input = document.getElementById('url-input');
  const btn = document.getElementById('check-btn');
  const result = document.getElementById('result');
  const statusEl = document.getElementById('result-status');
  const detailsEl = document.getElementById('result-details');
  if(!input || !btn) return;
  btn.addEventListener('click', ()=>{
    const url = input.value.trim();
    detailsEl.innerHTML = ''; statusEl.textContent = '';
    if(!url){
      result.classList.remove('hidden'); statusEl.textContent = 'Please enter a URL'; detailsEl.textContent = '';
      return;
    }
    const out = simpleUrlScore(url);
    result.classList.remove('hidden');
    if(out.status === 'safe'){ 
      statusEl.textContent = `Safe — score: ${out.score}`;
      statusEl.style.color = '#065F46';
    }else if(out.status === 'warning'){
      statusEl.textContent = `Suspicious — score: ${out.score}`;
      statusEl.style.color = '#92400E';
    }else{
      statusEl.textContent = `Danger — score: ${out.score}`;
      statusEl.style.color = '#991B1B';
    }
    if(out.reasons && out.reasons.length){
      const ul = document.createElement('ul'); ul.style.margin='8px 0 0';
      out.reasons.forEach(r=>{ const li=document.createElement('li'); li.textContent=r; ul.appendChild(li); });
      detailsEl.appendChild(ul);
    }else{
      detailsEl.textContent = 'No obvious issues detected.';
    }
  });
}

export default { initDashboard };