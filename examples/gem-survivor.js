// @title GEM SURVIVOR
let x=76,y=68,ex=160,ey=50;
let gems=[],held=[0,0,0],score=0;
let bullets=[],enemyBullets=[],shotWait=0;
let fireWait=0,inv=0,over=false;
let et=0,hp=1,es=10,ec=3;
let hit=0,hx=0,hy=0,blink=0;
let intro=0,goWait=0;
let mag=100;

// パレットデータ
const playerPal="0000C000700E38073F00780060000000000000001E06FF1FFF1F0E0600000000";

// パーツ定義
const playerParts=[
 {x:0,y:0,w:8,h:8,dx:0,dy:0,color:7},
 {x:8,y:0,w:8,h:8,dx:0,dy:0,color:4}
];

// パレットからパーツを切り出して登録
function loadPalette(data,pw,ph,parts){
 const rows=[];
 for(let y=0;y<ph;y++)
  rows.push(data.slice(y*pw/4,(y+1)*pw/4)
   .split("").map(c=>parseInt(c,16).toString(2).padStart(4,"0")).join(""));

 let id=0;
 for(const p of parts){
  p.chars=[];
  for(let ty=0;ty<p.h;ty+=8){
   for(let tx=0;tx<p.w;tx+=8){
    let pat="";
    for(let yy=0;yy<8;yy++){
     let row="";
     for(let xx=0;xx<8;xx++){
      const px=p.x+tx+xx,py=p.y+ty+yy;
      row+=px<pw&&py<ph&&xx+tx<p.w&&yy+ty<p.h
       ?rows[py][px]:"0";
     }
     pat+=parseInt(row,2).toString(16).padStart(2,"0");
    }
    const ch=String.fromCharCode(0xE000+id++);
    pcg[ch].pat=pat;
    p.chars.push([ch,tx,ty]);
   }
  }
 }
}

// パーツを画面に描画
function drawParts(parts,x,y){
 for(const p of parts)
  for(const c of p.chars)
   spr(x+p.dx+c[1],y+p.dy+c[2],c[0],p.color);
   
}

// 自機パレット登録
loadPalette(playerPal,16,16,playerParts);

function gem(w=false,t=-1){
 const a=w?(Math.random()*20|0):20;
 const b=2+(Math.random()*14|0);
 if(t<0){const r=Math.random();t=r<0.7?0:r<0.9?1:2;}
 gems.push([a,b,t,w?60:0]);
}

function enemy(){
 const r=Math.random();
 et=r<0.7?0:r<0.9?1:2;
 hp=et===1?20:3;
 es=et===1?50:et===2?20:10;
 ec=et===0?3:et===1?2:6;
 ex=160;ey=24+Math.random()*88;
 fireWait=30+Math.random()*30;
}

function putGameOver(){
 over=true;
 put(6,7,'GAME OVER',3,1);
 put(5,8,'TAP A RETRY ',7,1);
}

function dropGem(){
 const d=held.slice();
 held=[0,0,0];
 const n=d[0]+d[1]+d[2];
 let k=0;
 const r=10+Math.sqrt(n)*8;
 for(let t=0;t<3;t++)for(let i=0;i<d[t];i++){
  const a=k++*6.283/n+(Math.random()-0.5)*0.5;
  const z=4+Math.random()*r*1.3;
  gems.push([(x+Math.cos(a)*z)/8,(y+Math.sin(a)*z)/8,t,36]);
 }
}

function putMyChr(){
 if(inv===0||inv%10<5){
  drawParts(playerParts,x,y);
  blink=(blink+1)%10;
  if(blink<8)spr(x-7,y+4,'°',4);
 }
}

function start(){
 cls(1);
 put(1,0,'SCORE ',7,1);
 put(1,16,'💎',4,1);
 put(5,16,'💎',3,1);
 put(9,16,'💎',5,1);
 put(15,16,'🧲',6,1);
 gems=[];held=[0,0,0];
 bullets=[];enemyBullets=[];
 score=shotWait=fireWait=0;
 mag=100;
 x=46;y=68;inv=0;over=false;
 hit=blink=intro=0;
 enemy();
 for(let i=0;i<3;i++)gem();
}

function beginning(){
 if(intro===1){
  x+=4;
  if(x>=76){x=76;intro=2;}
 }else if(intro===2){
  x-=0.5;
  if(x<=46){x=46;intro=3;goWait=30;}
 }else if(intro===3&&--goWait<=0)start();
}

cls(1);x=-12;y=68;intro=1;

function tick(){
 if(intro){
  beginning();
  putMyChr();
  if(intro===3)put(8,8,blink<2?'GO!!':'    ',7,1);
  blink=(blink+1)%10;
  return;
 }
 if(over){if(btnp(4))start();return;}
 if(inv>0)inv--;
 if(shotWait>0)shotWait--;

 const pull=btn(4)&&mag>0;
 if(pull)mag=Math.max(0,mag-1);
 else if(!btn(4))mag=Math.min(100,mag+0.1);

 const speed=0.6+Math.min(held[2],3)*0.2;
 x=Math.max(0,Math.min(152,x+(btn(3)-btn(2))*speed));
 y=Math.max(16,Math.min(120,y+(btn(1)-btn(0))*speed));

 ex-=et===1?0.8:et===2?2:1.2;
 if(ex< -8)enemy();

 if(et===2&&ex>=0&&ex<=160&&--fireWait<=0){
  const dx=x-ex,dy=y-ey,d=Math.sqrt(dx*dx+dy*dy);
  enemyBullets.push([ex,ey,dx/d*1.5,dy/d*1.5]);
  fireWait=60;
 }

 for(let i=gems.length-1;i>=0;i--){
  const g=gems[i];
  g[0]-=0.05;
  if(g[3]>0)g[3]--;
  if(pull){
   const dx=x/8-g[0],dy=y/8-g[1];
   const d=Math.sqrt(dx*dx+dy*dy);
   if(d>0){g[0]+=dx/d*0.18;g[1]+=dy/d*0.18;}
  }
  if(g[0]<-1)gems.splice(i,1);
 }

 for(let i=gems.length-1;i>=0;i--){
  const g=gems[i];
  if(g[3]===0&&Math.abs(x-g[0]*8)<7&&Math.abs(y-g[1]*8)<7){
   gems.splice(i,1);held[g[2]]++;score++;
  }
 }
 if(!gems.length)gem();

 if(!pull&&btn(5)&&bullets.length<Math.min(1+held[1],10)&&!shotWait){
  bullets.push([x+8,y]);
  shotWait=Math.max(2,12-Math.sqrt(held[0]*4)|0);
 }

 for(let i=bullets.length-1;i>=0;i--){
  const b=bullets[i];b[0]+=2;
  if(b[0]>168){bullets.splice(i,1);continue;}
  if(Math.abs(b[0]-ex)<8&&Math.abs(b[1]-ey)<8){
   bullets.splice(i,1);hit=5;hx=ex;hy=ey;hp--;
   if(hp<=0){score+=es;enemy();}
  }
 }

 for(let i=enemyBullets.length-1;i>=0;i--){
  const b=enemyBullets[i];
  b[0]+=b[2];b[1]+=b[3];
  if(b[0]<-8||b[0]>168||b[1]<-8||b[1]>136){
   enemyBullets.splice(i,1);continue;
  }
  if(!inv&&Math.abs(x-b[0])<5&&Math.abs(y-b[1])<5){
   enemyBullets.splice(i,1);
   if(held[0]+held[1]+held[2]===0){putGameOver();return;}
   dropGem();inv=60;
  }
 }

 if(!inv&&Math.abs(x-ex)<9&&Math.abs(y-ey)<9){
  if(held[0]+held[1]+held[2]===0){putGameOver();return;}
  dropGem();inv=60;
 }

 put(7,0,String(score).padStart(4,'0'),7,1);
 put(2,16,String(held[0]).padStart(2,'0'),7,1);
 put(6,16,String(held[1]).padStart(2,'0'),7,1);
 put(10,16,String(held[2]).padStart(2,'0'),7,1);
 put(16,16,String(Math.ceil(mag)).padStart(3,'0'),7,1);

 for(const g of gems)spr(g[0]*8,g[1]*8,'💎',g[2]===2?5:g[2]===1?3:4);
 for(const b of enemyBullets)spr(b[0],b[1],'•',3);
 for(const b of bullets)spr(b[0],b[1],'•',7);

 if(hit>0){spr(hx,hy,'✴️',7);hit--;}
 spr(ex,ey,et===1?'🮿':et===2?'🮼':'🮽',ec);
 putMyChr();
}