/* Sakura Al Arab — real-time 3D world (Three.js).
   Exterior plaza + facade, a continuous interior hall, pickable tables, empty plates that fill with dish photography.
   Photo-derived textures (paving, Fuji mural) come from the client's reference images. */
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const V=(x,y,z)=>new THREE.Vector3(x,y,z),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function ctex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}return t}

export async function createWorld(canvas,opts={}){
 const mobile=matchMedia('(max-width:700px)').matches||/Android|iPhone|iPad/i.test(navigator.userAgent);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.6:2));
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(50,1,.1,1100);
 try{const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.35}catch(e){}
 scene.fog=new THREE.Fog(0xe3b0b6,95,420);scene.background=new THREE.Color(0x2a2236);
 const TL=new THREE.TextureLoader();
 const tex=(u,rep,srgb=true)=>{const t=TL.load(u);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}return t};
 const S=o=>new THREE.MeshStandardMaterial(o);
 const add=(g,m,x,y,z,p,rx,ry,rz)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;if(rz)o.rotation.z=rz;(p||scene).add(o);return o};
 const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d),cyl=(a,b,h,n=24,o,ts,tl)=>new THREE.CylinderGeometry(a,b,h,n,1,o,ts,tl);

 /* ---------- materials ---------- */
 const woodTex=ctex(256,256,(g,w,h)=>{g.fillStyle='#5a3a24';g.fillRect(0,0,w,h);const r=rng(5);for(let i=0;i<90;i++){g.strokeStyle=`rgba(${30+r()*40|0},${15+r()*20|0},8,${.1+r()*.3})`;g.lineWidth=1+r()*2.5;g.beginPath();const y=r()*h;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+r()*8-4,w*.6,y+r()*8-4,w,y+r()*6-3);g.stroke()}},[2,2]);
 const M={
  wood:S({map:woodTex,color:0xd7b690,roughness:.55,metalness:0}),
  woodDark:S({map:woodTex,color:0x8a6648,roughness:.5}),
  facade:S({color:0x15231e,roughness:.5,metalness:.15}),
  stone:S({color:0xcfc2ae,roughness:.7}),
  gold:S({color:0xc9a66b,roughness:.28,metalness:.9}),
  paper:new THREE.MeshStandardMaterial({color:0xffe6bf,emissive:0xffb25e,emissiveIntensity:1.6,roughness:.9}),
  velvet:S({color:0x153d31,roughness:.95}),
  velvet2:S({color:0x1a4a3a,roughness:.95}),
  marbleG:S({color:0x1d3a2f,roughness:.2,metalness:.1}),
  ceramic:S({color:0xf4ede0,roughness:.18}),
  ceramicRim:S({color:0xe5b9a8,roughness:.2}),
  napkin:S({color:0x173b30,roughness:.9}),
  glass:new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.28,roughness:.05,metalness:.1,depthWrite:false}),
  burg:S({color:0x6a1a30,roughness:.9}),
  bark:S({color:0x3e2b20,roughness:1}),
  ink:S({color:0x15100d,roughness:.6})};
 const paving=tex('assets/tex/paving.jpg',[16,8]);
 M.floor=S({map:paving,color:0xe8d6c0,roughness:.3,metalness:.08});

 /* ---------- lights ---------- */
 scene.add(new THREE.HemisphereLight(0x9a86b0,0x3a2428,.55));
 const warm=(x,y,z,i,d=16)=>{const l=new THREE.PointLight(0xffb870,i,d,2);l.position.set(x,y,z);scene.add(l);return l};
 const halo=(()=>{const t=ctex(128,128,(g)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,220,160,1)');gr.addColorStop(.25,'rgba(255,170,90,.55)');gr.addColorStop(1,'rgba(255,140,60,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)});return new THREE.SpriteMaterial({map:t,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})})();
 const glow=(x,y,z,s=1.6,p)=>{const sp=new THREE.Sprite(halo);sp.position.set(x,y,z);sp.scale.set(s,s,s);(p||scene).add(sp);return sp};
 const blob=(()=>{const t=ctex(128,128,(g)=>{const gr=g.createRadialGradient(64,64,6,64,64,64);gr.addColorStop(0,'rgba(0,0,0,.6)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)});return new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})})();
 const shadow=(x,z,r,p,y=.012)=>add(new THREE.CircleGeometry(r,20),blob,x,y,z,p,-Math.PI/2);

 /* ---------- misty dusk sky dome, lake and a stone plaza platform ---------- */
 const skyT=ctex(8,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);[[0,'#0b2923'],[.2,'#17483b'],[.36,'#4f7f6c'],[.45,'#c99aa0'],[.5,'#f4cdc0'],[.56,'#e7a1b2'],[1,'#e7a1b2']].forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,w,h)});
 const skyD=add(new THREE.SphereGeometry(520,40,20),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,toneMapped:false}),0,0,0);
 const cloudT=ctex(512,128,(g,w,h)=>{const r=rng(3);for(let i=0;i<26;i++){const gr=g.createRadialGradient(0,0,2,0,0,90);gr.addColorStop(0,'rgba(255,225,220,.5)');gr.addColorStop(1,'rgba(255,225,220,0)');g.save();g.translate(r()*w,20+r()*88);g.scale(1.7+r()*1.6,.22+r()*.18);g.fillStyle=gr;g.beginPath();g.arc(0,0,90,0,7);g.fill();g.restore()}});
 [[-1,0],[0,1],[1,0],[0,-1]].forEach(([cx,cz],i)=>{const m=add(new THREE.PlaneGeometry(700,110),new THREE.MeshBasicMaterial({map:cloudT,transparent:true,fog:false,toneMapped:false,depthWrite:false}),cx*420,150,cz*420);m.rotation.y=Math.atan2(-cx,-cz)})
 add(new THREE.PlaneGeometry(1400,1400),S({color:0x1f5249,emissive:0x2a2f3c,roughness:.1,metalness:.6}),0,-.3,0,null,-Math.PI/2);
 const pav=ctex(256,256,(g,w,h)=>{g.fillStyle='#8f7d68';g.fillRect(0,0,w,h);const r=rng(9);for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=`rgb(${168+r()*24|0},${150+r()*20|0},${124+r()*18|0})`;g.fillRect(x*64+2,y*64+2,60,60)}g.strokeStyle='rgba(50,36,26,.55)';g.lineWidth=3;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,h);g.moveTo(0,i*64);g.lineTo(w,i*64);g.stroke()}},[16,16]);
 add(new THREE.PlaneGeometry(64,64),S({map:pav,roughness:.5,metalness:.05}),0,0,14,null,-Math.PI/2);
 add(box(66,1.4,66),S({color:0x4a4038,roughness:.9}),0,-.72,14);
 [[0,46.2,66,.5]].forEach(([x,z,w,d])=>add(box(w,.35,d),M.stone,x,.05,z));[-1,1].forEach(sd=>add(box(.5,.35,64),M.stone,sd*32.2,.05,14));
 add(new THREE.PlaneGeometry(190,96),S({color:0x2f5a3a,roughness:1}),0,-.04,-62,null,-Math.PI/2);   // the garden the landmarks stand on
 /* ---------- building shell ---------- */
 const W=30,D=18,H=7.2,DW=6.6;                                    // width, depth, height, door width
 const front=new THREE.Group();scene.add(front);
 add(box((W-DW)/2,H,.6),M.facade,-(W+DW)/4,H/2,0,front);add(box((W-DW)/2,H,.6),M.facade,(W+DW)/4,H/2,0,front);add(box(DW,H-4.6,.6),M.facade,0,4.6+(H-4.6)/2,0,front);
 add(box(W,.35,1),M.woodDark,0,H+.1,.1,front);                                                       // roof edge
 add(box(W,.4,D+1),S({color:0x0e1814,roughness:.8}),0,H+.3,-D/2,front);                              // roof
 [-1,1].forEach(s=>{add(box(.6,H,D),M.facade,s*W/2,H/2,-D/2);});add(box(W,H,.6),M.facade,0,H/2,-D);
// Najdi parapet (stepped merlons), corner towers and a timber pavilion roof: Saudi mud-brick meets Japanese timber
 const mud=S({color:0xb98a62,roughness:.95}),mudD=S({color:0x8f5f40,roughness:.95});
 {const mer=new THREE.InstancedMesh(box(.9,.8,.5),mud,260),mm=new THREE.Matrix4();let mk=0;
  for(let i=0;i<=30;i++){const x=-W/2+i*(W/30);mm.makeTranslation(x,H+.75,.05);mer.setMatrixAt(mk++,mm);mm.makeTranslation(x,H+.75,-D);mer.setMatrixAt(mk++,mm)}
  for(let i=1;i<18;i++){const z=-i*(D/18);[-W/2,W/2].forEach(a=>{mm.makeTranslation(a,H+.75,z);mer.setMatrixAt(mk++,mm)})}
  mer.count=mk;scene.add(mer);
  add(box(W+.8,.5,.7),mudD,0,H+.45,.05);add(box(W+.8,.5,.7),mudD,0,H+.45,-D);[-1,1].forEach(a=>add(box(.7,.5,D+.5),mudD,a*W/2,H+.45,-D/2))}
 [-1,1].forEach(sd=>{const x=sd*(W/2+.1);add(cyl(1.8,2.15,H+3.6,28),mud,x,(H+3.6)/2,.4);add(cyl(2.1,2.1,.3,28),mudD,x,H+3.7,.4);
  for(let k=0;k<12;k++){const a=k/12*6.283;add(box(.7,.8,.5),mud,x+Math.cos(a)*1.9,H+4.25,.4+Math.sin(a)*1.9,null,0,-a)}
  [3.2,5.8,8.4].forEach(y=>add(new THREE.PlaneGeometry(.5,1.0),M.paper,x,y,.4+2.12-(y>8?.1:0),null,0,0));
  for(let k=0;k<7;k++){const tx=x+(k-3)*.42;add(new THREE.ConeGeometry(.16,.3,3),mudD,tx,H+2.3,.4+1.98,null,Math.PI,0,0)}});
 add(new THREE.ConeGeometry(10.5,3.4,4),S({color:0x20120e,roughness:.7}),0,H+2.3,-D/2,null,0,Math.PI/4);add(box(21,.3,.3),M.gold,0,H+.75,-D/2+7.4);
 add(new THREE.SphereGeometry(.28,12,10),M.gold,0,H+4.2,-D/2);
 const sunL=new THREE.DirectionalLight(0xffc4b0,0);sunL.position.set(-30,45,40);scene.add(sunL);
 // sign
 const signT=ctex(1024,200,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#ffe3c0';g.textAlign='center';g.textBaseline='middle';g.shadowColor='rgba(255,160,80,.9)';g.shadowBlur=18;g.font='bold 82px Georgia,serif';g.fillText('SAKURA AL ARAB',330,100);g.fillStyle='rgba(255,227,192,.6)';g.fillRect(655,40,3,120);g.shadowBlur=14;g.font='bold 86px "Noto Naskh Arabic",Tahoma,serif';g.fillText('ساكورا العرب',830,106);
  g.shadowBlur=10;g.fillStyle='#f4a9c1';for(let i=0;i<5;i++){g.save();g.translate(960,52);g.rotate(i*1.2566);g.beginPath();g.ellipse(0,-14,8,15,0,0,7);g.fill();g.restore()}});
 const sign=add(new THREE.PlaneGeometry(11,2.15),new THREE.MeshBasicMaterial({map:signT,transparent:true,toneMapped:false}),0,5.85,.34);
 glow(0,5.85,.8,9);
 // glass bays with a warm interior glow
 const bay=ctex(256,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2b1f18');gr.addColorStop(.5,'#c88a4a');gr.addColorStop(1,'#7a4a28');g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='rgba(20,12,8,.85)';g.lineWidth=6;for(let i=1;i<4;i++){g.beginPath();g.moveTo(i*w/4,0);g.lineTo(i*w/4,h);g.stroke()}g.beginPath();g.moveTo(0,h*.35);g.lineTo(w,h*.35);g.stroke()});
 [-1,1].forEach(s=>[0,1].forEach(k=>{const x=s*(5.8+k*4.6);add(new THREE.PlaneGeometry(3.8,4.4),new THREE.MeshBasicMaterial({map:bay,toneMapped:false}),x,2.6,.33);add(box(.18,4.7,.2),M.gold,x-1.95,2.6,.38);add(box(.18,4.7,.2),M.gold,x+1.95,2.6,.38)}));
 // wooden canopy, posts, slatted underside
 add(box(10.5,.28,4.2),M.wood,0,3.9,2.3);
 for(let i=0;i<26;i++)add(box(.14,.2,4.2),M.woodDark,-5.1+i*.4,3.72,2.3);
 [-4.8,4.8].forEach(x=>[1.2,4.1].forEach(z=>add(box(.3,3.8,.3),M.wood,x,1.9,z)));
 [-1,1].forEach(s=>{add(box(1.2,3.9,.12),M.burg,s*4.2,1.95,.45)});
 // door light + floor-lantern line
 const L=[];
 const lantern=(x,y,z,s=1,p)=>{const g=new THREE.Group();g.position.set(x,y,z);(p||scene).add(g);add(box(.32*s,.5*s,.32*s),M.paper,0,0,0,g);add(box(.4*s,.06*s,.4*s),M.ink,0,.28*s,0,g);add(box(.4*s,.06*s,.4*s),M.ink,0,-.28*s,0,g);glow(0,0,0,1.5*s,g);return g};
 [[-3.6,3.1,3.3],[3.6,3.1,3.3],[-1.4,3.1,3.3],[1.4,3.1,3.3]].forEach(p=>lantern(...p,1.1));
 [-1,1].forEach(s=>{for(let i=0;i<5;i++){const x=s*(7+i*3.1),z=9-i*.2;add(box(.28,.7,.28),M.stone,x,.35,z);lantern(x,.95,z,.75)}});
 for(let i=0;i<6;i++){const z=8+i*3.4;[-1,1].forEach(s=>{add(box(.2,.55,.2),M.stone,s*3.9,.27,z);lantern(s*3.9,.7,z,.6)})}
 warm(0,3,4,70,18);warm(-8,2.5,6,35,14);warm(8,2.5,6,35,14);warm(0,1.5,14,22,16);
 // pavers' runner to the door
 add(new THREE.PlaneGeometry(6.4,40),S({color:0x2a1d16,roughness:.25,metalness:.15,transparent:true,opacity:.35}),0,.012,20,null,-Math.PI/2);

 /* ---------- cherry blossom (procedural limbs + dense flower cards) ---------- */
 function flower(g,x,y,sz,col,rot){g.save();g.translate(x,y);g.rotate(rot);for(let i=0;i<5;i++){g.save();g.rotate(i*Math.PI*2/5);g.fillStyle=col;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-sz*.62,-sz*.25,-sz*.5,-sz*1.02,-sz*.1,-sz);g.lineTo(0,-sz*.84);g.lineTo(sz*.1,-sz);g.bezierCurveTo(sz*.5,-sz*1.02,sz*.62,-sz*.25,0,0);g.fill();g.restore()}g.fillStyle='#d9608a';g.beginPath();g.arc(0,0,sz*.16,0,7);g.fill();g.restore()}
 const blossomT=ctex(512,512,(g)=>{const r=rng(42);g.strokeStyle='#4a2f23';g.lineCap='round';for(let i=0;i<7;i++){g.lineWidth=2.5+r()*2;g.beginPath();g.moveTo(256+r()*60-30,512);g.quadraticCurveTo(256+r()*200-100,300,256+r()*420-210,60+r()*160);g.stroke()}
  const cols=['#fff4f6','#fde0e8','#f9c6d6','#f4a9c1','#fbd3df','#ffffff'];for(let i=0;i<130;i++)flower(g,24+r()*464,18+r()*470,13+r()*16,cols[(r()*6)|0],r()*6.28)});
 const blossomM=new THREE.MeshStandardMaterial({map:blossomT,alphaTest:.4,side:THREE.DoubleSide,roughness:1,emissive:0x8a3050,emissiveMap:blossomT,emissiveIntensity:.35});
 const CAN=[];
 function tube(pts,r0,r1,seg=6,rad=6){const cv=new THREE.CatmullRomCurve3(pts),P=cv.getPoints(seg),fr=cv.computeFrenetFrames(seg,false),pos=[],idx=[];
  for(let i=0;i<=seg;i++){const rr=lerp(r0,r1,i/seg),n=fr.normals[i],b=fr.binormals[i];for(let j=0;j<=rad;j++){const a=j/rad*6.2832,c=Math.cos(a),s=Math.sin(a);pos.push(P[i].x+(n.x*c+b.x*s)*rr,P[i].y+(n.y*c+b.y*s)*rr,P[i].z+(n.z*c+b.z*s)*rr)}}
  for(let i=0;i<seg;i++)for(let j=0;j<rad;j++){const a=i*(rad+1)+j,b=a+rad+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}
 function sakura(parent,x,z,s,seed,y=0){const r=rng(seed*977|0),g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);g.rotation.y=seed;parent.add(g);const geos=[],tips=[];
  geos.push(tube([V(0,0,0),V(.18,1.1,.05),V(-.12,2.3,.12),V(.08,3.1,0)],.5,.28,10,8));
  const limb=(a,dir,len,rad,dep)=>{const pts=[a.clone()];let p=a.clone(),d=dir.clone();for(let i=1;i<=4;i++){d.add(V(r()*.7-.35,r()*.18-.02,r()*.7-.35)).normalize();p=p.clone().add(d.clone().multiplyScalar(len/4));pts.push(p)}
   geos.push(tube(pts,rad,rad*.5,6,5));tips.push(pts[3].clone());if(dep<2){const n=dep?3:4;for(let i=0;i<n;i++){const an=r()*6.283,out=V(Math.cos(an),.35+r()*.7,Math.sin(an)).add(d).normalize();limb(pts[2+(i&1)].clone(),out,len*.72,rad*.55,dep+1)}}else tips.push(pts[4].clone())};
  for(let i=0;i<5;i++){const an=i/5*6.283+r()*.6;limb(V(0,2.2+r()*.9,0),V(Math.cos(an),.7+r()*.5,Math.sin(an)).normalize(),2.1+r()*.8,.2,0)}
  const merged=geos.reduce((acc,gg)=>{const ng=gg.toNonIndexed();acc.push(ng);return acc},[]);
  let total=0;merged.forEach(m=>total+=m.attributes.position.count);const pos=new Float32Array(total*3);let o=0;merged.forEach(m=>{pos.set(m.attributes.position.array,o);o+=m.attributes.position.array.length});
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(pos,3));bg.computeVertexNormals();g.add(new THREE.Mesh(bg,M.bark));
  const per=mobile?3:6,inst=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),blossomM,tips.length*per),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();let k=0;
  tips.forEach(t=>{for(let i=0;i<per;i++){const sc=1.5+r()*1.3;e.set(r()*3.14,r()*6.28,r()*3.14);q.setFromEuler(e);m4.compose(V(t.x+(r()-.5)*1.7,t.y+(r()-.35)*1.4,t.z+(r()-.5)*1.7),q,V(sc,sc,sc));inst.setMatrixAt(k++,m4)}});inst.frustumCulled=false;g.add(inst);
  CAN.push({g,s,x,z,y});return g}
 const pot=(x,z,s)=>{add(cyl(.7*s,.5*s,.9*s,20),S({color:0x2a2420,roughness:.6}),x,.45*s,z);add(cyl(.62*s,.62*s,.06*s,20),S({color:0x2a1d14,roughness:1}),x,.9*s,z)};
 pot(-7.6,5.2,1.2);sakura(scene,-7.6,5.2,.8,.4,1.0);pot(7.6,5.2,1.2);sakura(scene,7.6,5.2,.85,2.7,1.0);
 sakura(scene,-19,6,1.5,.9);sakura(scene,20,7,1.6,1.7);sakura(scene,-26,-4,1.5,3.1);sakura(scene,27,-5,1.4,4.2);
 // palms (Najd)
 function palm(x,z,h,seed){const r=rng(seed),g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const bend=V((r()-.5)*1.2,0,(r()-.5)*1.2);
  const tr=tube([V(0,0,0),V(bend.x*.3,h*.35,bend.z*.3),V(bend.x*.7,h*.7,bend.z*.7),V(bend.x,h,bend.z)],.28,.17,8,7);g.add(new THREE.Mesh(tr,S({color:0x6a5238,roughness:1})));
  for(let i=0;i<12;i++){const a=i/12*6.283,len=2.8+r()*.8;const fr=tube([V(bend.x,h,bend.z),V(bend.x+Math.cos(a)*len*.5,h+.9,bend.z+Math.sin(a)*len*.5),V(bend.x+Math.cos(a)*len,h-.2,bend.z+Math.sin(a)*len)],.07,.01,5,4);g.add(new THREE.Mesh(fr,S({color:0x2c6a3a,roughness:.9})));
   const leaf=new THREE.Mesh(new THREE.PlaneGeometry(.5,len),S({color:0x2f7a3e,roughness:.8,side:THREE.DoubleSide}));leaf.position.set(bend.x+Math.cos(a)*len*.5,h+.35,bend.z+Math.sin(a)*len*.5);leaf.rotation.set(-Math.PI/2+.3,0,-a+Math.PI/2);g.add(leaf)}}
 [[-28,20,1.4,7.1],[29,22,1.4,8.3],[-27,38,1.3,9.2],[28,40,1.3,10.4]].forEach(([x,z,sc,sd])=>sakura(scene,x,z,sc,sd));[[-24,30,6.5,41],[25,32,7,42],[-30,12,7,43],[31,13,7,44],[-22,42,6,45],[23,43,6,46]].forEach(([x,z,h,sd])=>palm(x,z,h,sd));
 palm(-13,8,6,1);palm(13.5,9,6.5,2);palm(-17,-2,7,3);palm(18,-2,7.5,4);

 /* ---------- cinematic backdrop: sakura hill + pagoda (left), Najdi castle + Riyadh towers (right) ---------- */
 const winT=ctex(64,128,(g)=>{g.fillStyle='#1a2030';g.fillRect(0,0,64,128);const r=rng(21);for(let y=4;y<124;y+=8)for(let x=3;x<62;x+=7)if(r()<.3){g.fillStyle=r()<.5?'#ffd7a0':'#ffeccc';g.fillRect(x,y,3,4)}},[2,5]);
 const towerM=[0x39425c,0x4a4a66,0x2e3a52].map(c=>S({map:winT,emissiveMap:winT,emissive:0xffffff,emissiveIntensity:.9,color:c,roughness:.5,metalness:.2}));
 {const rr=rng(77);for(let i=0;i<30;i++){const w=6+rr()*8,h=20+rr()*46,x=-190+i*13+rr()*6,z=-150-rr()*30;add(box(w,h,w*.9),towerM[i%3],x,h/2,z)}}
 {const sh=new THREE.Shape();sh.moveTo(-6.5,0);sh.lineTo(6.5,0);sh.lineTo(6.5,78);sh.lineTo(3.8,78);sh.lineTo(3.8,62);sh.quadraticCurveTo(0,52,-3.8,62);sh.lineTo(-3.8,78);sh.lineTo(-6.5,78);sh.closePath();
  const kg=new THREE.ExtrudeGeometry(sh,{depth:9,bevelEnabled:false});kg.translate(0,0,-4.5);
  const km=add(kg,S({map:winT,emissiveMap:winT,emissive:0xffffff,emissiveIntensity:.8,color:0x5d6a86,roughness:.35,metalness:.4}),56,0,-100);add(box(8.2,.9,9.4),M.paper,56,61,-100);
  // Faisaliah: tapering shaft, glass sphere and spire
  add(cyl(1.4,3.4,64,20),towerM[1],30,32,-96);add(new THREE.SphereGeometry(4.2,20,14),M.paper,30,52,-96);add(cyl(.12,.3,14,6),M.gold,30,70,-96)}
 const mudL=S({color:0xcb9a72,roughness:.95});
 function castle(x,z,sc){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(sc);scene.add(g);
  add(box(30,9,11),mud,0,4.5,0,g);add(box(16,6,9),mud,0,12,0,g);add(box(9,4.5,7),mudL,0,17.2,0,g);
  const ring=(tx,tz,r,h)=>{add(cyl(r,r*1.18,h,22),mud,tx,h/2,tz,g);add(cyl(r*1.12,r*1.12,.4,22),mudD,tx,h+.1,tz,g);for(let k=0;k<12;k++){const a=k/12*6.283;add(box(.9,1.0,.7),mud,tx+Math.cos(a)*r*1.05,h+.8,tz+Math.sin(a)*r*1.05,g,0,-a)}add(new THREE.PlaneGeometry(.7,1.5),M.paper,tx,h*.62,tz+r*1.19,g)};
  ring(-16,-3,3,16);ring(16,-3,3,16);ring(-16,5,3,15);ring(16,5,3,15);ring(0,-4,3.1,26);
  for(let k=-14;k<=14;k++)add(box(.9,1.0,.6),mud,k*1.05,9.5,5.6,g);
  for(let k=0;k<8;k++)add(new THREE.ConeGeometry(.35,.7,3),mudD,-12+k*3.4,7.8,5.62,g,Math.PI)}
 castle(50,-58,1.2);
 const hillM=S({color:0x2c5a3c,roughness:1});const hill=add(new THREE.SphereGeometry(30,40,18,0,6.283,0,1.5708),hillM,-38,-.4,-62);hill.scale.y=.52;
 const hy=(x,z)=>{const r=Math.hypot(x+38,z+62);return .52*Math.sqrt(Math.max(0,900-r*r))-.4};
 function pagoda(x,y,z,sc){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(sc);scene.add(g);
  const wood=S({color:0x8a1f2e,roughness:.7}),roofM=S({color:0x1d1613,roughness:.55}),stoneD=S({color:0x6d6a64,roughness:.9});
  add(box(15,1.4,15),stoneD,0,.7,0,g);let yy=1.4;
  for(let i=0;i<5;i++){const w=10.4-i*1.55;add(box(w,3.4,w),wood,0,yy+1.7,0,g);add(box(w*.72,1.5,w+.06),M.paper,0,yy+1.9,0,g);add(new THREE.ConeGeometry(w*.98,1.7,4),roofM,0,yy+3.4+.85,0,g,0,Math.PI/4);yy+=4.1}
  add(cyl(.18,.2,7,8),M.gold,0,yy+2.4,0,g);for(let k=0;k<5;k++)add(cyl(.7-k*.1,.7-k*.1,.1,12),M.gold,0,yy+.4+k*.8,0,g)}
 pagoda(-38,hy(-38,-62)-.2,-62,1.9);
 [[-18,-52,1.6,1.1],[-56,-54,1.8,2.3],[-28,-46,1.3,3.4],[-48,-78,1.5,4.6],[-22,-70,1.3,5.7],[-60,-70,1.4,6.8]].forEach(([x,z,sc,sd])=>sakura(scene,x,z,sc,sd,Math.max(0,hy(x,z))));
 [[68,-44,8,31],[32,-46,7,32],[78,-62,8.5,33],[26,-70,6.5,34]].forEach(([x,z,h,sd])=>palm(x,z,h,sd));
 // red torii gate on the approach: the entrance becomes a cinematic threshold
 {const red=S({color:0xb3202f,roughness:.5});[-1,1].forEach(sd=>{add(cyl(.3,.36,6.4,16),red,sd*3.9,3.2,24);add(cyl(.42,.42,.3,16),M.ink,sd*3.9,.15,24)});add(box(10.8,.55,.8),M.ink,0,6.75,24);add(box(11.6,.45,.9),red,0,6.45,24);add(box(8.6,.4,.4),red,0,5.4,24);add(box(.9,1.1,.2),M.gold,0,5.85,24.0);
  [-1,1].forEach(sd=>lantern(sd*2.2,4.6,24.2,.8))}

 /* ---------- interior ---------- */
 const IN=new THREE.Group();scene.add(IN);
 add(new THREE.PlaneGeometry(W-1.2,D),M.floor,0,.005,-D/2,IN,-Math.PI/2);
 add(new THREE.PlaneGeometry(W,D),S({color:0x24160f,roughness:.8}),0,H,-D/2,IN,Math.PI/2);
 [[0,-D+.31,0],[-W/2+.31,0,Math.PI/2],[W/2-.31,0,-Math.PI/2]].forEach(([x,z,ry],i)=>{});
 const wallM=S({color:0x2a1b12,roughness:.8});
 add(new THREE.PlaneGeometry(W,H),wallM,0,H/2,-D+.32,IN);
 add(new THREE.PlaneGeometry(D,H),wallM,-W/2+.32,H/2,-D/2,IN,0,Math.PI/2);add(new THREE.PlaneGeometry(D,H),wallM,W/2-.32,H/2,-D/2,IN,0,-Math.PI/2);
 // vertical timber slat screens
 const slat=new THREE.InstancedMesh(box(.08,H-.4,.14),M.wood,300),m4=new THREE.Matrix4();let sk=0;
 for(let i=0;i<110;i++){m4.makeTranslation(-W/2+1+i*(W-2)/110,H/2,-D+.45);slat.setMatrixAt(sk++,m4)}
 for(let i=0;i<40;i++){m4.makeTranslation(-W/2+.45,H/2,-1.5-i*(D-2.5)/40);slat.setMatrixAt(sk++,m4);m4.makeTranslation(W/2-.45,H/2,-1.5-i*(D-2.5)/40);slat.setMatrixAt(sk++,m4)}
 slat.count=sk;IN.add(slat);
 // warm light behind slats
 [[0,2.4,-D+.2,W-3,5],[-W/2+.2,2.4,-D/2,D-3,5],[W/2-.2,2.4,-D/2,D-3,5]].forEach(([x,y,z,w,h],i)=>add(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0xb4742e,toneMapped:false,fog:false}),x,y,z+(i?0:.05),IN,0,i===1?Math.PI/2:i===2?-Math.PI/2:0).visible=false);
 // Fuji mural in a timber frame
 const fuji=tex('assets/tex/fuji.jpg');add(new THREE.PlaneGeometry(10,5),new THREE.MeshStandardMaterial({map:fuji,emissive:0xffffff,emissiveMap:fuji,emissiveIntensity:.55,roughness:.8}),0,3.35,-D+.52,IN);
 add(box(10.5,.25,.2),M.woodDark,0,5.95,-D+.55,IN);add(box(10.5,.25,.2),M.woodDark,0,.75,-D+.55,IN);[-1,1].forEach(s=>add(box(.25,5.2,.2),M.woodDark,s*5.1,3.35,-D+.55,IN));
 // coffered ceiling rings + pendant drums
 [4.6,3.0].forEach((r,i)=>add(new THREE.TorusGeometry(r,.07,8,64),new THREE.MeshBasicMaterial({color:0xffc27a,toneMapped:false}),0,H-.1-i*.05,-8.5,IN,Math.PI/2));
 const pend=(x,y,z,r,h)=>{const g=new THREE.Group();g.position.set(x,y,z);IN.add(g);add(cyl(r,r,h,40,true),new THREE.MeshStandardMaterial({color:0xfff0d8,emissive:0xffcf94,emissiveIntensity:1.5,side:THREE.DoubleSide,roughness:.9}),0,0,0,g);add(cyl(r,r,.06,40),M.gold,0,h/2,0,g);add(cyl(r,r,.06,40),M.gold,0,-h/2,0,g);add(cyl(.02,.02,H-y-.4,6),M.ink,0,(H-y)/2+h/2-.2,0,g);add(new THREE.CircleGeometry(r*.96,32),new THREE.MeshBasicMaterial({color:0xffe2b0,toneMapped:false}),0,-h/2-.001,0,g,Math.PI/2);glow(0,-h/2-.2,0,r*3.2,g);return g};
 pend(0,5.1,-6.2,1.5,1.2);pend(-7.6,5.4,-9,.9,.8);pend(7.6,5.4,-9,.9,.8);pend(0,5.4,-12.6,.9,.8);
 warm(0,4.4,-6,55,17);warm(-7,4,-9,40,13);warm(7,4,-9,40,13);warm(0,4,-13,35,12);
 // curved emerald booth behind the rear table
 {const arc=add(cyl(4.2,4.2,1.15,48,true,Math.PI*1.18,Math.PI*.64),M.velvet,0,.78,-14.2,IN);arc.material=S({color:0x153d31,roughness:.95,side:THREE.DoubleSide});add(cyl(3.7,3.7,.45,48,false,Math.PI*1.18,Math.PI*.64),M.velvet2,0,.28,-14.2,IN);arc.rotation.y=Math.PI;}
 // furniture
 const TABLES=[],plates=[];
 function chair(x,z,ang,p){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ang;p.add(g);add(cyl(.28,.26,.09,20),M.velvet2,0,.47,0,g);add(cyl(.3,.3,.5,18,true,-1.1,2.2),S({color:0x153d31,roughness:.95,side:THREE.DoubleSide}),0,.78,.0,g,0,Math.PI);[[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]].forEach(([a,b])=>add(cyl(.018,.014,.45,6),M.gold,a,.22,b,g));shadow(0,0,.45,g);return g}
 function plateAt(x,z,y,r,p,m){const pl=new THREE.Group();pl.position.set(x,y,z);p.add(pl);add(cyl(r,r*.62,.03,32),m||M.ceramic,0,.015,0,pl);add(cyl(r*.64,r*.64,.004,32),S({color:0xfffaf0,roughness:.15}),0,.032,0,pl);return pl}
 function table(x,z,pick){const g=new THREE.Group();g.position.set(x,0,z);IN.add(g);const R=1.05;
  add(cyl(.13,.17,.76,16),M.woodDark,0,.38,0,g);add(cyl(.55,.6,.05,24),M.woodDark,0,.025,0,g);add(cyl(R,R,.05,48),M.marbleG,0,.78,0,g);add(new THREE.TorusGeometry(R,.03,8,56),M.gold,0,.8,0,g,Math.PI/2);add(cyl(R+.03,R+.03,.05,48),M.wood,0,.745,0,g);
  shadow(0,0,1.9,g);
  for(let i=0;i<4;i++){const a=i/4*6.283+.4;const cx=Math.sin(a)*1.5,cz=Math.cos(a)*1.5;chair(cx,cz,a,g);
   if(!pick){plateAt(Math.sin(a)*.62,Math.cos(a)*.62,.805,.19,g);add(box(.17,.02,.12),M.napkin,Math.sin(a)*.62,.84,Math.cos(a)*.62,g,0,a);add(cyl(.032,.028,.15,10),M.glass,Math.sin(a)*.62+Math.cos(a)*.22,.9,Math.cos(a)*.62-Math.sin(a)*.22,g)}}
  // vase with blossom + candle lantern
  add(cyl(.07,.09,.26,16),M.ceramic,0,.93,0,g);for(let i=0;i<5;i++){const t=add(cyl(.006,.01,.5,5),M.bark,Math.sin(i)*.05,1.2,Math.cos(i)*.05,g);t.rotation.set(Math.cos(i*2)*.4,0,Math.sin(i*2)*.4);add(new THREE.PlaneGeometry(.22,.22),blossomM,Math.sin(i*2)*.15,1.36+Math.cos(i)*.06,Math.cos(i*2)*.15,g,.2,i)}
  const cd=add(box(.12,.16,.12),M.paper,.3,.88,-.2,g);glow(.3,.9,-.2,.5,g);
  return g}
 const POS=[[-6,-9.2],[6.6,-9.4],[0,-14.8]];
 POS.forEach((p,i)=>{const g=table(p[0],p[1],true);TABLES.push({g,x:p[0],z:p[1]})});
 [[-9.8,-4.4],[9.8,-4.6],[-10.6,-13.8],[10.6,-14],[-3.4,-3.8],[3.4,-3.6]].forEach(p=>table(p[0],p[1],false));
 // the three pickable tables: empty plates ready for the guests' orders
 const SLOT=[{x:0,z:.42,r:.3,key:'takoyaki'},{x:-.55,z:-.02,r:.21,key:'matcha'},{x:.55,z:-.02,r:.21,key:'rose'}];
 const slotPos=[];
 TABLES.forEach((T,ti)=>{SLOT.forEach((s,si)=>{plateAt(s.x,s.z,.805,s.r,T.g);slotPos[ti]=slotPos[ti]||[];slotPos[ti][si]=V(T.x+s.x,.9,T.z+s.z)});
  for(let i=0;i<4;i++){const a=i/4*6.283+.4;if(Math.abs(Math.sin(a))>.9||true){/* settings at the chairs, skipping the serving side */}}
  // marker ring so the table reads as selectable
  const ring=add(new THREE.TorusGeometry(1.75,.025,8,64),new THREE.MeshBasicMaterial({color:0xffe2b0,transparent:true,opacity:.0,toneMapped:false}),T.x,.03,T.z,IN,Math.PI/2);T.ring=ring;
  for(let i=0;i<4;i++){const a=i/4*6.283+.4;if(i!==0){const px=Math.sin(a)*.62,pz=Math.cos(a)*.62;if(Math.hypot(px-0,pz-.42)>.5){plateAt(px,pz,.805,.19,T.g);add(box(.17,.02,.12),M.napkin,px,.84,pz,T.g,0,a)}}}});
 // central blossom tree and rail planters
 pot(-3.6,-6.8,1.1);sakura(IN,-3.6,-6.8,.72,5.5,.99);pot(9.6,-9,.9);
 // the v5 dishes: procedural plates and food under a glass dome (replaces the flat photo discs)
 const rnd=(a,b)=>a+Math.random()*(b-a),mesh=(g,m,x,y,z,p)=>add(g,m,x,y,z,p),Y=0;
 const bambooTex=ctex(128,128,(g,w,h)=>{g.fillStyle='#c9a86a';g.fillRect(0,0,w,h);for(let i=0;i<16;i++){g.fillStyle=`rgba(${100+rnd(0,40)|0},${80+rnd(0,30)|0},40,.35)`;g.fillRect(i*8,0,3,h)}g.fillStyle='rgba(70,50,20,.5)';g.fillRect(0,60,w,4)});
 const D5={blue:S({color:0xc7d0d6,roughness:.4}),rose:S({color:0xa9b6c9,roughness:.4}),cer:S({color:0xf1ece0,roughness:.35}),lac:S({color:0x9b2547,roughness:.35,metalness:.05})};
 const lathe5=(pts,mat,seg=36)=>{const m=new THREE.Mesh(new THREE.LatheGeometry(pts.map(q=>new THREE.Vector2(q[0],q[1])),seg),mat);mat.side=THREE.DoubleSide;return m};
 const plateProfile=r=>[[0,0],[.5*r,0],[.58*r,.012],[.9*r,.05],[r,.085],[r*.965,.09],[.88*r,.06],[.56*r,.03],[0,.03]];
 const glassMat=(c,o=.35)=>new THREE.MeshStandardMaterial({color:c,transparent:true,opacity:o,roughness:.08,metalness:.1,depthWrite:false});
 const iceCube=(g,x,y,z,sz=.11)=>{const c=mesh(new THREE.BoxGeometry(sz,sz,sz),glassMat(0xffffff,.55),x,y,z,g);c.rotation.set(rnd(0,1),rnd(0,1),rnd(0,1))};
 function buildDish(kind){const g=new THREE.Group();
  if(kind==='takoyaki'){
   const p=lathe5(plateProfile(.78),D5.blue);p.position.y=Y;g.add(p);
   mesh(new THREE.TorusGeometry(.66,.012,6,48),D5.lac,0,Y+.075,0,g).rotation.x=Math.PI/2;
   const gold=S({color:0xd6a04c,roughness:.7}),glaze=S({color:0x3a1810,roughness:.25,metalness:.05});
   for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.3,x=Math.cos(a)*.31,z=Math.sin(a)*.31,r=.2;
    mesh(new THREE.SphereGeometry(r,20,14),gold,x,Y+.1+r*.9,z,g);
    const cap=mesh(new THREE.SphereGeometry(r*1.025,20,10,0,Math.PI*2,0,.95),glaze,x,Y+.1+r*.9,z,g);cap.rotation.set(rnd(-.3,.3),0,rnd(-.3,.3));
    mesh(new THREE.SphereGeometry(.035,6,5),S({color:0x4f9a3a}),x+rnd(-.05,.05),Y+.1+r*1.8,z+rnd(-.05,.05),g)}
   mesh(new THREE.SphereGeometry(.17,16,12),gold,0,Y+.34,0,g);mesh(new THREE.SphereGeometry(.175,16,10,0,Math.PI*2,0,.9),glaze,0,Y+.34,0,g);
   [[.82,.35],[.78,-.5]].forEach(([x,z])=>{const dt=mesh(new THREE.SphereGeometry(.12,10,8),S({color:0x4a2218,roughness:.6}),x,Y+.1,z,g);dt.scale.set(1.5,.8,.9)})
  }else if(kind==='matcha'){
   const p=lathe5(plateProfile(.55),D5.cer);p.position.y=Y;g.add(p);
   mesh(new THREE.CylinderGeometry(.3,.26,.66,28,1,true),glassMat(0xeef7f0,.3),0,Y+.42,0,g);
   mesh(new THREE.CylinderGeometry(.285,.25,.5,28),S({color:0x8fb94a,roughness:.35}),0,Y+.34,0,g);
   mesh(new THREE.CylinderGeometry(.335,.335,.5,28,1,true),S({map:bambooTex,roughness:.7,side:THREE.DoubleSide}),0,Y+.34,0,g);
   mesh(new THREE.CylinderGeometry(.33,.33,.04,28),S({map:bambooTex,roughness:.7}),0,Y+.1,0,g);
   iceCube(g,-.07,Y+.6,.03);iceCube(g,.09,Y+.62,-.05);iceCube(g,0,Y+.64,.1);
   for(let i=0;i<4;i++){const c=mesh(new THREE.SphereGeometry(.05,8,6),S({color:0x7a8a45,roughness:.8}),Math.cos(i*1.6)*.12,Y+.68,Math.sin(i*1.6)*.12,g);c.scale.set(1.5,.8,.8)}
   for(let i=0;i<5;i++)mesh(new THREE.CylinderGeometry(.006,.006,.12,3),S({color:0xe28a20}),Math.cos(i*2)*.09,Y+.7,Math.sin(i*2)*.09,g).rotation.z=rnd(-1,1)
  }else{
   const p=lathe5(plateProfile(.72),D5.rose);p.position.y=Y;g.add(p);
   for(let i=0;i<10;i++){const a=i/10*Math.PI*2,pt=mesh(new THREE.CircleGeometry(.04,8),S({color:0xffd0dc,roughness:.8,side:THREE.DoubleSide}),Math.cos(a)*.6,Y+.092,Math.sin(a)*.6,g);pt.rotation.x=-Math.PI/2}
   const bowl=lathe5([[0,.02],[.18,0],[.34,.08],[.43,.3],[.45,.42],[.43,.42],[.41,.3],[.32,.1],[.17,.035],[0,.04]],glassMat(0xf6f0f2,.4));bowl.position.y=Y+.1;g.add(bowl);
   mesh(new THREE.CylinderGeometry(.4,.31,.3,28),S({color:0xf3a0b8,roughness:.2,transparent:true,opacity:.92}),0,Y+.27,0,g);
   for(let i=0;i<6;i++){const a=i*1.1,pt=mesh(new THREE.CircleGeometry(.05,8),S({color:0xffc4d4,roughness:.8,side:THREE.DoubleSide}),Math.cos(a)*.2,Y+.425,Math.sin(a)*.2,g);pt.rotation.x=-Math.PI/2+rnd(-.3,.3)}
   iceCube(g,-.1,Y+.43,.05);iceCube(g,.12,Y+.43,-.08)}
  const dm=new THREE.Group();g.add(dm);
  const dmat=new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:0,roughness:.04,metalness:.15,emissive:0x203038,emissiveIntensity:.25,depthWrite:false,side:THREE.DoubleSide});
  const shell=new THREE.Mesh(new THREE.SphereGeometry(1.02,32,18,0,Math.PI*2,0,Math.PI/2),dmat);shell.scale.y=.95;dm.add(shell);
  const rg=new THREE.Mesh(new THREE.TorusGeometry(1.02,.035,8,40),M.gold);rg.rotation.x=Math.PI/2;dm.add(rg);
  const kn=new THREE.Mesh(new THREE.SphereGeometry(.07,12,10),M.gold);kn.position.y=.98;dm.add(kn);
  g.userData={dm,dmat,t:0,lift:0,liftT:0};return g}
 const discs={};
 function dishFor(ti,si){const T=TABLES[ti],g=buildDish(SLOT[si].key);g.position.set(T.x+SLOT[si].x,.842,T.z+SLOT[si].z);g.scale.setScalar(.3);g.visible=false;IN.add(g);return g}

 /* ---------- falling petals ---------- */
 const petalT=ctex(64,64,(g)=>{const gr=g.createRadialGradient(32,40,2,32,32,32);gr.addColorStop(0,'#ffe4ec');gr.addColorStop(1,'#f19ab5');g.fillStyle=gr;g.beginPath();g.moveTo(32,60);g.bezierCurveTo(60,40,52,10,34,4);g.lineTo(32,14);g.lineTo(30,4);g.bezierCurveTo(12,10,4,40,32,60);g.fill()});
 const NP=mobile?70:130,pet=new THREE.InstancedMesh(new THREE.PlaneGeometry(.16,.16),new THREE.MeshBasicMaterial({map:petalT,alphaTest:.3,side:THREE.DoubleSide,fog:false,toneMapped:false}),NP);pet.frustumCulled=false;scene.add(pet);
 const PT=Array.from({length:NP},()=>({}));const sp=(p,first)=>{const c=CAN[(Math.random()*CAN.length)|0];p.x=c.x+(Math.random()-.5)*6;p.z=c.z+(Math.random()-.5)*6;p.y=first?Math.random()*8:c.y+3+Math.random()*3;p.vy=.35+Math.random()*.5;p.ph=Math.random()*6.28;p.sc=.7+Math.random()*.9;p.r=Math.random()*6};
 PT.forEach(p=>sp(p,true));const pq=new THREE.Quaternion(),pe=new THREE.Euler(),pm=new THREE.Matrix4();

 /* ---------- camera rig ---------- */
 const portrait=()=>innerWidth/innerHeight<.8;
 const VIEWS={
  hero:()=>{const asp=innerWidth/innerHeight,fov=asp<1?56:46,half=Math.tan(THREE.MathUtils.degToRad(fov/2)),d=Math.min(125,Math.max(54,22/(half*Math.min(asp,1.5))));return{pos:V(-.34*d,8+.36*d,-22+.87*d),look:V(0,8,-22),fov,off:0}},
  front:()=>{const asp=innerWidth/innerHeight,fov=asp<1?56:44,half=Math.tan(THREE.MathUtils.degToRad(fov/2)),d=Math.min(110,Math.max(46,21/(half*Math.min(asp,1.4))));return{pos:V(0,9+d*.03,d),look:V(0,1.2,0),fov,off:0}},
  approach:()=>({pos:V(-3,7.5,44),look:V(0,3.2,0),fov:54,off:0}),
  door:()=>({pos:V(0,1.7,6.5),look:V(0,1.9,-8),fov:60,off:0}),
  hall:()=>({pos:V(0,1.65,-2.2),look:V(0,1.9,-12),fov:portrait()?72:62,off:0}),
  table:i=>{const T=TABLES[i],p=portrait();return{pos:V(T.x*.85,2.1+(p?.5:0),T.z+(p?4.4:3.3)),look:V(T.x,.7,T.z),fov:p?58:46,off:p?.23:0}}};
 const cam={pos:V(0,3,40),look:V(0,3,0),fov:50,off:0,yaw:0};let view='hero',tw=null,vNow=VIEWS.hero();Object.assign(cam,{pos:vNow.pos.clone(),look:vNow.look.clone(),fov:vNow.fov,off:vNow.off});
 function fly(name,dur=2,arg){return new Promise(res=>{const to=VIEWS[name](arg),p0=cam.pos.clone(),l0=cam.look.clone(),f0=cam.fov,o0=cam.off,t0=performance.now();view=name;tw={step:()=>{const k=Math.min(1,(performance.now()-t0)/(dur*1000)),e=ease(k);cam.pos.lerpVectors(p0,to.pos,e);cam.look.lerpVectors(l0,to.look,e);cam.fov=lerp(f0,to.fov,e);cam.off=lerp(o0,to.off,e);if(k>=1){tw=null;res()}}}})}
 let drag=null,yaw=0,yawT=0,px=0,py=0;
 canvas.addEventListener('pointerdown',e=>{if(view==='hall')drag={x:e.clientX,y:yawT}});addEventListener('pointerup',()=>drag=null);
 addEventListener('pointermove',e=>{px=e.clientX/innerWidth*2-1;py=e.clientY/innerHeight*2-1;if(drag)yawT=Math.max(-.9,Math.min(.9,drag.y+(e.clientX-drag.x)/innerWidth*1.8))});
 function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 resize();addEventListener('resize',()=>{resize()});

 /* ---------- public API ---------- */
 const tmp=V(0,0,0);let sel=-1,t=0,last=performance.now(),activeTable=0;
 const api={
  fly,get view(){return view},tables:TABLES,
  project(v){tmp.copy(v).project(camera);return{x:(tmp.x*.5+.5)*innerWidth,y:(-tmp.y*.5+.5)*innerHeight-cam.off*innerHeight*(innerHeight/innerHeight)*0,vis:tmp.z<1&&tmp.z>-1}},
  tablePoint(i){return V(TABLES[i].x,1.15,TABLES[i].z)},slotPoint(ti,si){return slotPos[ti][si]},
  highlight(on){TABLES.forEach(T=>T.ring.material.opacity=on?.7:0)},
  setDish(ti,si,url,qty){const k=ti+'_'+si;let d=discs[k];if(!d)d=discs[k]=dishFor(ti,si);if(qty>0&&!d.visible){d.visible=true;d.userData.t=0}if(qty<=0)d.visible=false},
  liftDome(ti,si,up){const d=discs[ti+'_'+si];if(d)d.userData.liftT=up?1:0},
  sit(i){activeTable=i;return fly('table',2.2,i)},
  frame(){const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
   if(tw)tw.step();yaw+=(yawT-yaw)*.08;
   const sway=view==='hero'?Math.sin(t*.25)*7:view==='hall'?Math.sin(t*.3)*.05:0;
   camera.position.copy(cam.pos);if(view==='hero'){camera.position.x+=sway+px*2;camera.position.y+=Math.sin(t*.2)*1.2}
   sunL.intensity+=((view==='hero'||view==='approach'||view==='door'?1.15:0)-sunL.intensity)*.05;
   camera.fov=cam.fov;camera.updateProjectionMatrix();
   const lk=cam.look.clone();if(view==='hall'){const dx=lk.x-cam.pos.x,dz=lk.z-cam.pos.z,c=Math.cos(yaw+sway),s=Math.sin(yaw+sway);lk.x=cam.pos.x+dx*c-dz*s;lk.z=cam.pos.z+dx*s+dz*c}
   camera.lookAt(lk);
   if(cam.off){camera.setViewOffset(innerWidth,innerHeight,0,cam.off*innerHeight,innerWidth,innerHeight)}else camera.clearViewOffset();
   Object.values(discs).forEach(d=>{if(!d.visible)return;const u=d.userData;u.t=Math.min(1,u.t+dt*.9);u.lift+=(u.liftT-u.lift)*Math.min(1,dt*4);const e=1-Math.pow(1-u.t,3),dropY=(1-e)*3.4+u.lift*3.2;u.dm.position.y=dropY;u.dmat.opacity=Math.max(0,.2*Math.min(1,e*1.4)*(1-u.lift))});
   PT.forEach((p,i)=>{p.y-=p.vy*dt;p.ph+=dt*1.7;p.x+=Math.sin(p.ph)*.25*dt+.12*dt;p.z+=Math.cos(p.ph*.8)*.2*dt;p.r+=dt;if(p.y<.05)sp(p,false);pe.set(p.r,p.r*.7,p.ph);pq.setFromEuler(pe);pm.compose(V(p.x,p.y,p.z),pq,V(p.sc,p.sc,p.sc));pet.setMatrixAt(i,pm)});pet.instanceMatrix.needsUpdate=true;
   renderer.render(scene,camera)}};
 return api}
