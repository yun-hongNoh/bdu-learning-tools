// TRIZ 40 Inventive Principles Web App
// Data source: ./data/triz-data.json
let icons = {};
let principles = [];
let CAT_LABEL = {};
let matrixParams = [];
let matrixGroups = [];
let matrix = {};
let quizPool = [];

function applyTrizData(data){
  icons = data.icons || {};
  principles = data.principles || [];
  CAT_LABEL = data.CAT_LABEL || {};
  matrixParams = data.matrixParams || [];
  matrixGroups = data.matrixGroups || [];
  matrix = data.matrix || {};
  quizPool = data.quizPool || [];
}

function showLocalJsonLoader(errorMessage){
  return new Promise((resolve, reject)=>{
    const box = document.createElement('div');
    box.id = 'localJsonLoader';
    box.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(242,237,223,.98);display:flex;align-items:center;justify-content:center;padding:24px;font-family:IBM Plex Sans KR, sans-serif;';
    box.innerHTML = `
      <div style="max-width:640px;background:#FBF8EF;border:1px solid #D9CFB7;padding:32px;box-shadow:0 20px 60px rgba(20,17,13,.12)">
        <div style="font-family:Fraunces,serif;font-size:32px;line-height:1.15;margin-bottom:16px;color:#14110D">TRIZ 데이터 파일을 선택하세요</div>
        <p style="font-size:15px;line-height:1.7;color:#57514A;margin-bottom:16px">현재 페이지가 로컬 파일로 직접 열렸거나, 브라우저 보안 정책 때문에 <code>triz-data.json</code>을 자동으로 읽지 못했습니다.</p>
        <p style="font-size:14px;line-height:1.7;color:#57514A;margin-bottom:22px">아래 버튼을 눌러 <strong>triz/data/triz-data.json</strong> 파일을 선택하면 서버 없이도 바로 확인할 수 있습니다. GitHub Pages에 올리면 이 과정 없이 자동으로 데이터가 로딩됩니다.</p>
        <input type="file" id="jsonFileInput" accept="application/json,.json" style="margin-bottom:18px;display:block;width:100%">
        <div style="font-size:12px;line-height:1.6;color:#918878;border-top:1px dashed #D9CFB7;padding-top:14px">자동 로딩 실패 사유: ${String(errorMessage || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</div>
      </div>
    `;
    document.body.appendChild(box);
    box.querySelector('#jsonFileInput').addEventListener('change', e=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        try{
          const data = JSON.parse(reader.result);
          document.body.removeChild(box);
          resolve(data);
        }catch(err){
          alert('JSON 파일을 읽지 못했습니다. triz-data.json 파일이 맞는지 확인하세요.\n' + err.message);
        }
      };
      reader.onerror = ()=>reject(reader.error);
      reader.readAsText(file, 'utf-8');
    });
  });
}

async function loadTrizData(){
  try{
    const res = await fetch('./data/triz-data.json', {cache:'no-cache'});
    if(!res.ok){
      throw new Error('TRIZ data loading failed: ' + res.status + ' ' + res.statusText);
    }
    applyTrizData(await res.json());
  }catch(err){
    // GitHub Pages에서는 fetch가 정상 작동합니다.
    // 로컬에서 index.html을 더블클릭한 경우에는 file:// 보안 정책 때문에 실패할 수 있어 JSON 파일 선택 방식으로 대체합니다.
    const data = await showLocalJsonLoader(err.message);
    applyTrizData(data);
  }
}

loadTrizData().then(() => {
// ============================================================
// CORE UTILITIES
// ============================================================
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function highlight(text,term){
  if(!term) return escapeHTML(text);
  const escaped = escapeHTML(text);
  const re = new RegExp('('+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
  return escaped.replace(re,'<mark>$1</mark>');
}
function getPrinciple(n){return principles.find(p=>p.n===n)}

// ============================================================
// CARDS GRID
// ============================================================
const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');
const countShown = document.getElementById('countShown');
const filterBtns = document.querySelectorAll('.filter-btn');
let activeFilter = 'all';
let searchTerm = '';

function renderCards(){
  const term = searchTerm.trim().toLowerCase();
  let shown = 0;
  const html = principles.map((p,i)=>{
    const matchesCat = activeFilter==='all' || p.cat===activeFilter;
    const haystack = (p.ko+' '+p.en+' '+p.short+' '+p.desc.join(' ')+' '+
      p.classic.map(e=>e.name+' '+e.detail).join(' ')+' '+
      p.modern.map(e=>e.name+' '+e.detail).join(' ')).toLowerCase();
    const matchesSearch = !term || haystack.includes(term);
    const visible = matchesCat && matchesSearch;
    if(visible) shown++;
    const num = String(p.n).padStart(2,'0');
    return `<button class="card${visible?'':' hidden'}" data-cat="${p.cat}" data-num="${p.n}" style="animation-delay:${Math.min(i*15,400)}ms">
      <div class="card-top">
        <div class="card-num">${num}</div>
        <div class="card-icon">${icons[p.n]}</div>
      </div>
      <div class="card-cat">${CAT_LABEL[p.cat]}</div>
      <div class="card-name-ko">${highlight(p.ko,term)}</div>
      <div class="card-name-en">${highlight(p.en,term)}</div>
      <div class="card-short">${highlight(p.short,term)}</div>
      <div class="card-footer">
        <span>${p.classic.length+p.modern.length} 사례</span>
        <span class="open">자세히 보기 →</span>
      </div>
    </button>`;
  }).join('');
  grid.innerHTML = html || `<div class="empty"><div class="empty-num">00</div><div class="empty-text">일치하는 원리가 없습니다</div></div>`;
  countShown.textContent = shown;
  // Attach click handlers
  grid.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('click',()=>openModal(parseInt(card.dataset.num)));
  });
}

searchInput.addEventListener('input',e=>{searchTerm=e.target.value; renderCards()});
filterBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderCards();
  });
});

// ============================================================
// MODAL
// ============================================================
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');

function openModal(n){
  const p = getPrinciple(n);
  if(!p) return;
  const num = String(p.n).padStart(2,'0');
  const relatedCards = p.related.map(rn=>{
    const rp = getPrinciple(rn);
    if(!rp) return '';
    return `<button class="related-chip" data-num="${rn}">
      <span class="related-chip-num">${String(rn).padStart(2,'0')}</span>
      <span class="related-chip-name">${escapeHTML(rp.ko)}</span>
    </button>`;
  }).join('');
  
  modalContent.innerHTML = `
    <div class="modal-header ${p.cat}">
      <div class="modal-num"><span>PRINCIPLE</span><span class="modal-num-big">No. ${num}</span><span>·</span><span>${CAT_LABEL[p.cat]}</span></div>
      <div class="modal-title">
        <div class="modal-icon">${icons[p.n]}</div>
        <div class="modal-title-text">
          <div class="modal-name-ko">${escapeHTML(p.ko)}</div>
          <div class="modal-name-en">${escapeHTML(p.en)}</div>
        </div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-section">
        <div class="modal-section-label">설명 · DESCRIPTION</div>
        <div class="modal-desc">${p.desc.map(d=>'<p>'+escapeHTML(d)+'</p>').join('')}</div>
      </div>
      <div class="modal-section ${p.cat}">
        <div class="modal-section-label">어떤 모순을 해결하는가 · CONTRADICTION</div>
        <div class="modal-contradiction">${escapeHTML(p.contradiction)}</div>
      </div>
      <div class="modal-section">
        <div class="modal-section-label">실제 사례 · EXAMPLES</div>
        <div class="examples-grid">
          <div class="examples-col">
            <h4>고전 사례 <span class="badge">CLASSIC</span></h4>
            ${p.classic.map(e=>`<div class="example-item"><div class="example-name">${escapeHTML(e.name)}</div><div class="example-detail">${escapeHTML(e.detail)}</div></div>`).join('')}
          </div>
          <div class="examples-col">
            <h4>최신 사례 <span class="badge modern">MODERN</span></h4>
            ${p.modern.map(e=>`<div class="example-item"><div class="example-name">${escapeHTML(e.name)}</div><div class="example-detail">${escapeHTML(e.detail)}</div></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-label">관련 원리 · RELATED</div>
        <div class="related-row">${relatedCards}</div>
      </div>
      <div class="modal-section">
        <div class="modal-section-label">생각해볼 질문 · REFLECTION</div>
        <div class="reflection">${escapeHTML(p.reflection)}</div>
      </div>
    </div>
  `;
  
  modalOverlay.classList.add('open');
  document.body.classList.add('modal-open');
  modalOverlay.scrollTop = 0;
  
  // Related chip clicks
  modalContent.querySelectorAll('.related-chip').forEach(chip=>{
    chip.addEventListener('click',()=>openModal(parseInt(chip.dataset.num)));
  });
}

function closeModal(){
  modalOverlay.classList.remove('open');
  document.body.classList.remove('modal-open');
}
modalClose.addEventListener('click',closeModal);
modalOverlay.addEventListener('click',e=>{if(e.target===modalOverlay) closeModal()});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && modalOverlay.classList.contains('open')) closeModal();
});

// ============================================================
// TABS
// ============================================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
tabBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const target = btn.dataset.tab;
    tabBtns.forEach(b=>b.classList.toggle('active',b===btn));
    tabContents.forEach(c=>c.classList.toggle('active',c.dataset.tabContent===target));
    window.scrollTo({top:0,behavior:'smooth'});
  });
});

// ============================================================
// QUIZ
// ============================================================
// Quiz pool: hand-picked questions across all 40 principles for adult learners
// quizPool is loaded from ./data/triz-data.json

let quizState = {
  questions: [],
  currentIdx: 0,
  score: 0,
  answers: [], // {qIdx, selected, correct, isRight}
  answered: false
};

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function buildQuiz(){
  // Pick 10 unique-principle questions (avoid repeats of same principle)
  const shuffled = shuffle(quizPool);
  const usedPrinciples = new Set();
  const picked = [];
  for(const q of shuffled){
    if(picked.length>=10) break;
    if(!usedPrinciples.has(q.pn)){
      usedPrinciples.add(q.pn);
      picked.push(q);
    }
  }
  // Build options for each question
  return picked.map(q=>{
    const correct = q.pn;
    const wrongPool = principles.filter(p=>p.n!==correct).map(p=>p.n);
    const wrongs = shuffle(wrongPool).slice(0,3);
    const options = shuffle([correct,...wrongs]);
    return {...q, options, correct};
  });
}

const quizStartBtn = document.getElementById('quizStartBtn');
const quizScreenIntro = document.getElementById('quiz-screen-intro');
const quizScreenQ = document.getElementById('quiz-screen-question');
const quizScreenR = document.getElementById('quiz-screen-results');
const qNum = document.getElementById('qNum');
const qBar = document.getElementById('qBar');
const qScore = document.getElementById('qScore');
const qExample = document.getElementById('qExample');
const qOptions = document.getElementById('qOptions');
const qFeedback = document.getElementById('qFeedback');
const qFeedbackResult = document.getElementById('qFeedbackResult');
const qFeedbackExplain = document.getElementById('qFeedbackExplain');
const qDetailBtn = document.getElementById('qDetailBtn');
const qNextBtn = document.getElementById('qNextBtn');
const qNextLabel = document.getElementById('qNextLabel');

function startQuiz(){
  quizState.questions = buildQuiz();
  quizState.currentIdx = 0;
  quizState.score = 0;
  quizState.answers = [];
  quizScreenIntro.style.display = 'none';
  quizScreenR.style.display = 'none';
  quizScreenQ.style.display = 'block';
  renderQuestion();
}

function renderQuestion(){
  const idx = quizState.currentIdx;
  const q = quizState.questions[idx];
  quizState.answered = false;
  qNum.textContent = idx+1;
  qBar.style.width = ((idx)/quizState.questions.length*100)+'%';
  qScore.textContent = quizState.score;
  qExample.innerHTML = `${escapeHTML(q.ex)}<span class="detail">${escapeHTML(q.detail)}</span>`;
  qOptions.innerHTML = q.options.map((opt,i)=>{
    const p = getPrinciple(opt);
    return `<button class="quiz-option" data-num="${opt}">
      <span class="quiz-option-num">${String.fromCharCode(65+i)}</span>
      <span class="quiz-option-name">${escapeHTML(p.ko)}</span>
    </button>`;
  }).join('');
  qOptions.querySelectorAll('.quiz-option').forEach(btn=>{
    btn.addEventListener('click',()=>handleAnswer(parseInt(btn.dataset.num),btn));
  });
  qFeedback.classList.remove('show');
  qNextBtn.style.display = 'none';
  qNextLabel.textContent = idx+1<quizState.questions.length ? '다음 문항' : '결과 보기';
}

function handleAnswer(selected, btnEl){
  if(quizState.answered) return;
  quizState.answered = true;
  const q = quizState.questions[quizState.currentIdx];
  const isRight = selected===q.correct;
  if(isRight) quizState.score++;
  quizState.answers.push({qIdx:quizState.currentIdx, selected, correct:q.correct, isRight, ex:q.ex});
  // Mark options
  qOptions.querySelectorAll('.quiz-option').forEach(o=>{
    o.classList.add('disabled');
    const n = parseInt(o.dataset.num);
    if(n===q.correct) o.classList.add('correct');
    else if(n===selected && !isRight) o.classList.add('incorrect');
  });
  // Show feedback
  const correctP = getPrinciple(q.correct);
  qFeedbackResult.textContent = isRight ? '정답입니다 ✓' : '오답입니다 ✗';
  qFeedbackResult.className = 'quiz-feedback-result '+(isRight?'correct':'incorrect');
  qFeedbackExplain.innerHTML = `정답: <strong>원리 ${String(q.correct).padStart(2,'0')} · ${escapeHTML(correctP.ko)} (${escapeHTML(correctP.en)})</strong>. ${escapeHTML(correctP.short)}`;
  qDetailBtn.onclick = ()=>openModal(q.correct);
  qFeedback.classList.add('show');
  qNextBtn.style.display = 'inline-flex';
  qScore.textContent = quizState.score;
}

qNextBtn.addEventListener('click',()=>{
  quizState.currentIdx++;
  if(quizState.currentIdx>=quizState.questions.length){
    showResults();
  }else{
    renderQuestion();
  }
});

function showResults(){
  quizScreenQ.style.display = 'none';
  quizScreenR.style.display = 'block';
  const score = quizState.score;
  document.getElementById('rScore').textContent = score;
  let msg='', sub='';
  if(score>=9){ msg='탁월합니다'; sub='40가지 원리를 거의 완벽하게 이해하고 계십니다. 이제 실제 문제에 적용해볼 차례입니다.'; }
  else if(score>=7){ msg='훌륭합니다'; sub='대부분의 원리를 잘 파악하고 계십니다. 틀린 문항을 한 번 더 살펴보세요.'; }
  else if(score>=5){ msg='괜찮습니다'; sub='기본기는 갖추셨습니다. 카드 상세 페이지를 다시 둘러보며 보강하시면 좋겠습니다.'; }
  else if(score>=3){ msg='좀 더 보강이 필요합니다'; sub='40가지 원리를 한 번 더 차근차근 읽어보세요. 사례 위주로 보시면 더 잘 기억에 남습니다.'; }
  else{ msg='처음부터 다시 시작해보세요'; sub='카드를 천천히 클릭하며 사례를 읽어보세요. 충분히 익숙해진 후 다시 도전하시면 됩니다.'; }
  document.getElementById('rMsg').textContent = msg;
  document.getElementById('rSub').textContent = sub;
  // Review section
  const review = document.getElementById('quizReview');
  review.innerHTML = '<h3>문항별 리뷰</h3>' + quizState.answers.map((a,i)=>{
    const cp = getPrinciple(a.correct);
    const sp = getPrinciple(a.selected);
    return `<div class="review-item ${a.isRight?'correct':'incorrect'}">
      <div class="review-item-head">
        <span class="review-item-result">${a.isRight?'정답':'오답'}</span>
        <span class="review-item-q">Q${i+1}. ${escapeHTML(a.ex)}</span>
      </div>
      <div class="review-item-a">정답: <strong>${String(a.correct).padStart(2,'0')}. ${escapeHTML(cp.ko)}</strong>${a.isRight?'':' (내 선택: '+String(a.selected).padStart(2,'0')+'. '+escapeHTML(sp.ko)+')'}</div>
    </div>`;
  }).join('');
}

quizStartBtn.addEventListener('click',startQuiz);
document.getElementById('quizRetryBtn').addEventListener('click',startQuiz);
document.getElementById('quizBackBtn').addEventListener('click',()=>{
  quizScreenR.style.display = 'none';
  quizScreenIntro.style.display = 'block';
});

// ============================================================
// MATRIX
// ============================================================
const matImproving = document.getElementById('matImproving');
const matWorsening = document.getElementById('matWorsening');
const matrixResult = document.getElementById('matrixResult');

// Populate selects with optgroups for category organization
matrixGroups.forEach(g=>{
  const params = matrixParams.filter(p=>p.g===g.id);
  const og1 = document.createElement('optgroup');
  og1.label = g.name;
  const og2 = document.createElement('optgroup');
  og2.label = g.name;
  params.forEach(p=>{
    const o1 = document.createElement('option');
    o1.value = p.id; o1.textContent = p.name;
    og1.appendChild(o1);
    const o2 = document.createElement('option');
    o2.value = p.id; o2.textContent = p.name;
    og2.appendChild(o2);
  });
  matImproving.appendChild(og1);
  matWorsening.appendChild(og2);
});

function renderMatrixResult(){
  const imp = parseInt(matImproving.value);
  const wor = parseInt(matWorsening.value);
  if(!imp || !wor){
    matrixResult.innerHTML = `<div class="matrix-result-empty"><div class="empty-num">①+②</div><div class="empty-text">두 특성을 선택하면 추천 원리가 표시됩니다</div></div>`;
    return;
  }
  if(imp===wor){
    matrixResult.innerHTML = `<div class="matrix-result-empty"><div class="empty-num">⚠</div><div class="empty-text">서로 다른 두 특성을 선택해주세요. 같은 특성끼리는 모순이 성립하지 않습니다.</div></div>`;
    return;
  }
  const key = imp+'-'+wor;
  const recs = matrix[key];
  const impName = matrixParams.find(p=>p.id===imp).name;
  const worName = matrixParams.find(p=>p.id===wor).name;
  if(!recs || !recs.length){
    matrixResult.innerHTML = `<div class="matrix-result-empty"><div class="empty-num">∅</div><div class="empty-text">알트슐러 매트릭스의 이 조합 셀은 비어 있습니다. 원본에서도 명시적 추천 원리가 없는 경우로, 이런 모순은 표준 조합에서 흔하지 않거나 다른 접근(다른 특성으로 재구성, 물리적 모순으로 재정의 등)이 필요할 수 있습니다.</div></div>`;
    return;
  }
  const head = `<div class="matrix-result-head">
    <span class="matrix-result-label">RECOMMENDED PRINCIPLES</span>
    <span class="matrix-result-title"><em>${escapeHTML(impName)}</em>을(를) 개선하면서 <em>${escapeHTML(worName)}</em>이(가) 악화될 때</span>
  </div>`;
  const cards = recs.map(rn=>{
    const p = getPrinciple(rn);
    if(!p) return '';
    return `<button class="matrix-rec" data-num="${rn}" data-cat="${p.cat}">
      <div class="matrix-rec-num">${String(rn).padStart(2,'0')}</div>
      <div class="matrix-rec-body">
        <div class="matrix-rec-name">${escapeHTML(p.ko)}</div>
        <div class="matrix-rec-en">${escapeHTML(p.en)}</div>
        <div class="matrix-rec-short">${escapeHTML(p.short)}</div>
      </div>
    </button>`;
  }).join('');
  matrixResult.innerHTML = head+'<div class="matrix-recommendations">'+cards+'</div>';
  matrixResult.querySelectorAll('.matrix-rec').forEach(btn=>{
    btn.addEventListener('click',()=>openModal(parseInt(btn.dataset.num)));
  });
}

matImproving.addEventListener('change',renderMatrixResult);
matWorsening.addEventListener('change',renderMatrixResult);

// ============================================================
// MISC
// ============================================================
const toTopBtn = document.getElementById('toTop');
window.addEventListener('scroll',()=>{
  if(window.scrollY>800) toTopBtn.classList.add('show');
  else toTopBtn.classList.remove('show');
});
toTopBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

document.addEventListener('keydown',e=>{
  if(e.key==='/' && document.activeElement!==searchInput && !modalOverlay.classList.contains('open')){
    const cardsTab = document.querySelector('[data-tab-content="cards"]');
    if(cardsTab.classList.contains('active')){
      e.preventDefault();
      searchInput.focus();
    }
  }
});

// INIT
renderCards();

}).catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML('afterbegin',
    `<div style="padding:16px 24px;background:#B23B2D;color:white;font-family:sans-serif;">
      데이터 파일을 불러오지 못했습니다. GitHub Pages 또는 로컬 서버 환경에서 실행하고 있는지 확인하세요.<br>
      <small>${String(err.message || err)}</small>
    </div>`);
});
