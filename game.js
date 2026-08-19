
const SUITS = [
  {s:'♠', color:'black'}, {s:'♥', color:'red'},
  {s:'♦', color:'red'}, {s:'♣', color:'black'}
];

let deck=[], tableau=[], stock=[], waste=[], foundations={};
let selected=null;

const tableauEl=document.getElementById('tableau');
const stockEl=document.getElementById('stock');
const wasteEl=document.getElementById('waste');
const foundationsEl=document.getElementById('foundations');
const statusEl=document.getElementById('status');
const winModal=document.getElementById('winModal');

function makeDeck(){
  const d=[];
  SUITS.forEach(s=>{for(let n=1;n<=13;n++) d.push({suit:s.s,num:n,color:s.color,face:false,id:`${s.s}-${n}`})});
  return d;
}
function shuffle(a){
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function newGame(){
  deck=shuffle(makeDeck());
  tableau=Array.from({length:7},()=>[]);
  foundations={'♠':[],'♥':[],'♦':[],'♣':[]};
  waste=[]; selected=null;
  for(let c=0;c<7;c++){
    for(let r=0;r<=c;r++){
      const card=deck.pop();
      card.face=(r===c);
      tableau[c].push(card);
    }
  }
  stock=deck;
  statusEl.textContent='Move cards in descending order with alternating colors.';
  winModal.classList.add('hidden');
  render();
}
function cardHTML(card, extra=''){
  if(!card) return '';
  const face = card.face !== false;
  if(!face) return `<div class="card back ${extra}" data-id="${card.id}"></div>`;
  return `<div class="card ${card.color} ${extra}" data-id="${card.id}">
    <span class="num">${card.num}</span><span class="suit">${card.suit}</span>
  </div>`;
}
function render(){
  stockEl.className='pile card '+(stock.length?'back':'empty');
  stockEl.innerHTML='';
  wasteEl.className='pile card '+(waste.length?'':'empty');
  wasteEl.innerHTML=waste.length?cardHTML(waste[waste.length-1], isSelected('waste',0)?'selected':''):'';

  foundationsEl.innerHTML='';
  SUITS.forEach(s=>{
    const pile=foundations[s.s];
    const el=document.createElement('div');
    el.className='pile card '+(pile.length?'':'empty');
    el.dataset.foundation=s.s;
    el.innerHTML=pile.length?cardHTML(pile[pile.length-1], isSelected('foundation',s.s)?'selected':''):`<span style="position:absolute;inset:0;display:grid;place-items:center;font-size:30px;opacity:.45">${s.s}</span>`;
    foundationsEl.appendChild(el);
  });

  tableauEl.innerHTML='';
  tableau.forEach((col,ci)=>{
    const el=document.createElement('div');
    el.className='column'; el.dataset.col=ci;
    el.style.height=Math.max(130, col.reduce((h,c)=>h+(c.face?28:18),0)+100)+'px';
    col.forEach((card,ri)=>{
      const wrap=document.createElement('div');
      wrap.innerHTML=cardHTML(card, isSelected('tableau',ci,ri)?'selected':'');
      const ce=wrap.firstElementChild;
      ce.dataset.col=ci; ce.dataset.row=ri;
      ce.style.top=(col.slice(0,ri).reduce((y,c)=>y+(c.face?28:18),0))+'px';
      el.appendChild(ce);
    });
    tableauEl.appendChild(el);
  });
  checkWin();
}
function isSelected(type,a,b){
  return selected && selected.type===type && selected.a===a && (b===undefined || selected.b===b);
}
function selectWaste(){
  if(!waste.length) return;
  selected={type:'waste',a:0};
  statusEl.textContent='Selected waste card.';
  render();
}
function selectFoundation(suit){
  if(!foundations[suit].length) return;
  selected={type:'foundation',a:suit};
  statusEl.textContent='Selected foundation card.';
  render();
}
function selectTableau(ci,ri){
  const col=tableau[ci], card=col[ri];
  if(!card.face){ card.face=true; render(); return; }
  if(ri<col.length-1){
    for(let i=ri;i<col.length-1;i++){
      if(!(col[i].num===col[i+1].num+1 && col[i].color!==col[i+1].color)){
        statusEl.textContent='That stack is not a valid descending sequence.'; return;
      }
    }
  }
  selected={type:'tableau',a:ci,b:ri};
  statusEl.textContent='Selected tableau stack.';
  render();
}
function getSelectedCards(){
  if(!selected) return [];
  if(selected.type==='waste') return [waste[waste.length-1]];
  if(selected.type==='foundation') {
    const p=foundations[selected.a]; return [p[p.length-1]];
  }
  return tableau[selected.a].slice(selected.b);
}
function removeSelected(){
  if(selected.type==='waste') return waste.pop();
  if(selected.type==='foundation') return foundations[selected.a].pop();
  const moved=tableau[selected.a].splice(selected.b);
  const col=tableau[selected.a];
  if(col.length && !col[col.length-1].face) col[col.length-1].face=true;
  return moved;
}
function canPlaceOnTableau(cards, ci){
  if(!cards.length) return false;
  const first=cards[0], dest=tableau[ci];
  if(!dest.length) return first.num===13;
  const top=dest[dest.length-1];
  return top.face && top.num===first.num+1 && top.color!==first.color;
}
function moveToTableau(ci){
  if(!selected) return;
  if(selected.type==='tableau' && selected.a===ci){ selected=null; render(); return; }
  const cards=getSelectedCards();
  if(!canPlaceOnTableau(cards,ci)){statusEl.textContent='Invalid move. Build down by alternating colors.';return;}
  const moved=removeSelected();
  tableau[ci].push(...(Array.isArray(moved)?moved:[moved]));
  selected=null; statusEl.textContent='Good move.'; render();
}
function moveToFoundation(suit){
  if(!selected) return;
  const cards=getSelectedCards();
  if(cards.length!==1){statusEl.textContent='Only one card can move to a foundation.';return;}
  const c=cards[0], pile=foundations[suit];
  if(c.suit!==suit || c.num!==pile.length+1){statusEl.textContent='Foundation must build from 1 to 13 in the same suit.';return;}
  const moved=removeSelected();
  pile.push(Array.isArray(moved)?moved[0]:moved);
  selected=null; statusEl.textContent='Card added to foundation.'; render();
}
function drawStock(){
  selected=null;
  if(stock.length){
    const c=stock.pop(); c.face=true; waste.push(c);
  } else if(waste.length){
    stock=waste.reverse().map(c=>({...c,face:false})); waste=[];
    statusEl.textContent='Stock recycled.';
  }
  render();
}
function hint(){
  if(waste.length){
    const c=waste[waste.length-1], fp=foundations[c.suit];
    if(c.num===fp.length+1){statusEl.textContent=`Hint: Move ${c.num}${c.suit} to its foundation.`;return;}
    for(let i=0;i<7;i++) if(canPlaceOnTableau([c],i)){statusEl.textContent=`Hint: Move ${c.num}${c.suit} to column ${i+1}.`;return;}
  }
  for(let ci=0;ci<7;ci++){
    const col=tableau[ci]; if(!col.length) continue;
    const c=col[col.length-1], fp=foundations[c.suit];
    if(c.face && c.num===fp.length+1){statusEl.textContent=`Hint: Move ${c.num}${c.suit} to its foundation.`;return;}
  }
  statusEl.textContent=stock.length?'Hint: Draw a card from the stock.':'No simple move found. Try rearranging the tableau.';
}
function checkWin(){
  if(Object.values(foundations).every(p=>p.length===13)) winModal.classList.remove('hidden');
}
stockEl.addEventListener('click',drawStock);
wasteEl.addEventListener('click',selectWaste);
tableauEl.addEventListener('click',e=>{
  const card=e.target.closest('.card');
  if(card){
    const ci=+card.dataset.col, ri=+card.dataset.row;
    if(selected) moveToTableau(ci); else selectTableau(ci,ri);
  } else {
    const col=e.target.closest('.column');
    if(col && selected) moveToTableau(+col.dataset.col);
  }
});
foundationsEl.addEventListener('click',e=>{
  const pile=e.target.closest('[data-foundation]');
  if(!pile) return;
  const suit=pile.dataset.foundation;
  if(selected) moveToFoundation(suit); else selectFoundation(suit);
});
document.getElementById('newGame').addEventListener('click',newGame);
document.getElementById('playAgain').addEventListener('click',newGame);
document.getElementById('hintBtn').addEventListener('click',hint);
newGame();
