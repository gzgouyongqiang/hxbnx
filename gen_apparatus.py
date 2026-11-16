import json, os

with open(r'C:\Users\Administrator\hxbnx_repo\apparatus_imgs\quiz_images.json', 'r', encoding='utf-8') as f:
    imgs = json.load(f)

normal_qs = [
    ('蒸馏烧瓶', '蒸馏烧瓶', ['圆底烧瓶', '蒸馏烧瓶', '锥形瓶', '三颈烧瓶'], '有支管用于连接冷凝管，常用于蒸馏实验。注意和圆底烧瓶的区别——圆底烧瓶没有支管。'),
    ('圆底烧瓶', '圆底烧瓶', ['蒸馏烧瓶', '圆底烧瓶', '平底烧瓶', '锥形瓶'], '底部呈球形，无支管。常用于加热反应或作为反应容器。加热时需垫石棉网。'),
    ('酸式滴定管', '酸式滴定管', ['酸式滴定管', '碱式滴定管', '移液管', '量筒'], '下端有玻璃活塞控制液滴流出。用于盛装酸性溶液或氧化性溶液（如KMnO₄）。不能装碱性溶液！'),
    ('碱式滴定管', '碱式滴定管', ['酸式滴定管', '碱式滴定管', '移液管', '量筒'], '下端用橡胶管+玻璃珠控制液体流出。用于盛装碱性溶液。不能装酸性或氧化性溶液（会腐蚀橡胶）。'),
    ('三颈烧瓶', '三颈烧瓶', ['三颈烧瓶', '蒸馏烧瓶', '圆底烧瓶', '锥形瓶'], '有三个瓶口，可同时进行搅拌、加料、测温等操作。常用于有机合成中的多步反应。'),
    ('分液漏斗', '分液漏斗', ['长颈漏斗', '分液漏斗', '普通漏斗', '容量瓶'], '有活塞和玻璃塞，用于分离互不相溶的两种液体（萃取分液）。使用前必须检查是否漏水！'),
    ('干燥管', '干燥管', ['冷凝管', '干燥管', 'U形管', '洗气瓶'], '内装固体干燥剂（如CaCl₂、碱石灰），用于干燥气体。气体从粗口进、细口出。'),
    ('冷凝管', '冷凝管', ['干燥管', '冷凝管', '洗气管', '温度计'], '用于将蒸汽冷却为液体。常见三种：直形（蒸馏）、球形（回流）、蛇形（高效）。冷却水从下口进上口出！'),
    ('容量瓶', '容量瓶', ['量筒', '容量瓶', '锥形瓶', '烧杯'], '细长颈，有刻度线，带磨口玻璃塞。用于精确配制一定物质的量浓度的溶液。不能加热，不能长期储存溶液！'),
    ('量筒', '量筒', ['容量瓶', '量筒', '移液管', '滴定管'], '用于量取一定体积的液体，精度较低（0.1mL级）。不能用作反应容器，不能加热！'),
    ('长颈漏斗', '长颈漏斗', ['分液漏斗', '长颈漏斗', '布氏漏斗', '普通漏斗'], '颈部较长，用于向反应容器中添加液体。使用时下端必须插入液面以下形成液封，防止气体逸出！'),
]

hard_qs = [
    ('过滤装置', '该装置的名称是？', ['过滤装置', '萃取装置', '蒸馏装置', '启普发生器'], '一贴二低三靠！这是过滤操作的标准装置。玻璃棒引流、漏斗颈紧贴烧杯内壁、滤纸边缘低于漏斗边缘。'),
    ('蒸馏装置', '该装置的名称是？', ['蒸馏装置', '过滤装置', '萃取装置', '制气装置'], '蒸馏装置的关键部件：蒸馏烧瓶(B)、温度计(i)、冷凝管(A)、牛角管(f)、锥形瓶(j)。温度计水银球位于支管口处，冷凝水从下进上出(c→d)。'),
    ('萃取装置', '该装置的名称是？', ['萃取装置', '过滤装置', '蒸馏装置', '分液操作'], '萃取分液三步骤：①检漏 → ②振荡放气 → ③静置分层 → ④上层从上口倒出，下层从下口放出。右手压住瓶塞，左手握住活塞！'),
    ('启普发生器', '该仪器的名称是？', ['启普发生器', '制气装置', '洗气瓶', '储气瓶'], '启普发生器的三大优点：随开随用、随关随停。适用于块状固体与液体不加热反应制气（如Zn+稀H₂SO₄制H₂）。A=漏斗，B=容器，C=导气管。'),
    ('固体加热装置', '该装置适用于制备什么气体？', ['O₂(固体加热制取)', 'H₂(Zn+H₂SO₄)', 'CO₂(CaCO₃+HCl)', 'Cl₂(MnO₂+浓HCl)'], '固体加热型：试管口略向下倾斜（防止冷凝水倒流炸裂试管），导管刚露出橡皮塞即可。可用于制O₂、NH₃、CH₄等。'),
    ('液体加热制气装置', '该装置适用于制备什么气体？', ['Cl₂(MnO₂+浓H₂SO₄)', 'H₂(Zn+稀H₂SO₄)', 'CO₂(CaCO₃+HCl)', 'SO₂(Na₂SO₃+H₂SO₄)'], '液体+液体加热型：需垫石棉网加热，用分液漏斗逐滴滴加液体以控制反应速率。可制Cl₂、C₂H₄等。'),
    ('液体不加热制气装置', '该装置适用于制备什么气体？', ['CO₂(CaCO₃+HCl)', 'O₂(H₂O₂+MnO₂)', 'SO₂(Na₂SO₃+H₂SO₄)', '以上均可'], '固液不加热型：长颈漏斗下端必须插入液面以下形成液封！可制H₂、CO₂、NO₂、SO₂、O₂等多种气体。最常用的气体制备装置类型！'),
    ('坩埚', '该仪器的用途是？', ['高温灼烧固体', '配制溶液', '称量固体', '蒸发结晶'], '坩埚用于高温灼烧固体（如加热分解Cu₂(OH)₂CO₃）。可直接用酒精喷灯加热，不需要垫石棉网！用坩埚钳夹取，放在泥三角上加热。'),
    ('坩埚钳', '该仪器的用途是？', ['夹持坩埚/蒸发皿', '夹持试管', '夹持烧瓶', '夹持滤纸'], '坩埚钳专门用来夹取高温的坩埚和蒸发皿。使用时从侧面夹入，不可从正上方垂直插入。'),
]

out_path = r'C:\Users\Administrator\hxbnx_repo\apparatus-master.html'
lines = []

# HTML header
lines.append('<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">')
lines.append('<title>实验装置识别大师 - 化学不难学</title>')
lines.append('<style>')
lines.append('*{margin:0;padding:0;box-sizing:border-box}body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;background:linear-gradient(135deg,#f5f7fa,#c3cfe2);min-height:100vh;color:#333}')
lines.append('.container{max-width:700px;margin:0 auto;padding:20px 15px}.header{text-align:center;padding:25px 0 20px}.header h1{font-size:26px;color:#1a5276;display:flex;align-items:center;justify-content:center;gap:10px}')
lines.append('.header p{color:#5d6d7e;font-size:14px}.modes{display:flex;gap:12px;justify-content:center;flex-wrap-wrap;margin-bottom:24px}')
lines.append('.mode-btn{padding:12px 28px;border:none;border-radius:14px;font-size:16px;font-weight:bold;cursor:pointer;transition:all .3s}.mode-btn.primary{background:#e74c3c;color:#fff;box-shadow:0 4px 15px rgba(231,76,60,.35)}')
lines.append('.mode-btn.hard{background:#8e44ad;color:#fff;box-shadow:0 4px 15px rgba(142,68,173,.35)}.mode-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}')
lines.append('.game-area{background:#fff;border-radius:18px;box-shadow:0 8px 32px rgba(0,0,0,.1);padding:30px 24px;display:none}.game-area.active{display:block}')
lines.append('.progress-bar{height:8px;background:#ecf0f1;border-radius:4px;margin-bottom:22px;overflow:hidden}.progress-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#e74c3c,#f39c12);transition:width .4s;width:0%}')
lines.append('.progress-info{display:flex;justify-content:space-between;font-size:13px;color:#7f8c8d;margin-bottom:6px}')
lines.append('.img-container{text-align:center;margin-bottom:22px;padding:18px;background:#f8f9fa;border-radius:14px;border:2px dashed #bdc3c7;min-height:200px;display:flex;align-items:center;justify-content:center}')
lines.append('.img-container img{max-width:100%;max-height:260px;object-fit:contain;border-radius:8px}')
lines.append('.timer-wrapper{text-align:center;margin-bottom:18px}.timer-circle{display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;border:4px solid #ecf0f1;font-size:24px;font-weight:bold;transition:border-color .3s,color .3s}')
lines.append('.timer-circle.warning{border-color:#f39c12;color:#f39c12}.timer-circle.danger{border-color:#e74c3c;color:#e74c3c;animation:pulse .5s infinite}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}')
lines.append('.question-text{text-align:center;font-size:17px;font-weight:bold;color:#2c3e50;margin-bottom:18px;line-height:1.5}')
lines.append('.options{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}')
lines.append('.option-btn{padding:14px 16px;border:2px solid #dfe6e9;border-radius:12px;background:#fff;font-size:15px;cursor:pointer;transition:all .2s;text-align:center;font-weight:500}')
lines.append('.option-btn:hover:not(:disabled){border-color:#3498db;background:#ebf5fb;transform:translateY(-1px)}')
lines.append('.option-btn.correct{border-color:#27ae60;background:#d5f5e3;color:#1e8449;animation:correctPop .4s}.option-btn.wrong{border-color:#e74c3c;background:#fadbd8;color:#c0392b;animation:shake .4s}')
lines.append('.option-btn:disabled{cursor:not-allowed;opacity:.7}@keyframes correctPop{0%{transform:scale(1)}50%{transform:scale(1.06)}100%{transform:scale(1)}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}')
lines.append('.score-display{display:flex;justify-content:center;gap:28px;margin-bottom:18px;font-size:14px}.score-item{display:flex;align-items:center;gap:6px}.score-num{font-size:22px;font-weight:bold;color:#e74c3c}')
lines.append('.combo-badge{background:linear-gradient(135deg,#f39c12,#e74c3c);color:#fff;padding:3px 10px;border-radius:10px;font-size:13px;font-weight:bold;display:none}.combo-badge.show{display:inline-block;animation:comboIn .3s}@keyframes comboIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}')
lines.append('.analysis-box{background:#fef9e7;border-left:4px solid #f39c12;padding:14px 18px;border-radius:0 10px 10px 0;margin-top:16px;display:none;font-size:14px;line-height:1.7;animation:fadeIn .3s}.analysis-box.show{display:block}@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}')
lines.append('.analysis-box .tag{display:inline-block;background:#f39c12;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;margin-right:6px}')
lines.append('.next-btn{display:block;width:100%;padding:14px;border:none;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer;transition:all .3s;margin-top:14px}.next-btn.normal{background:#3498db;color:#fff}.next-btn:hover{filter:brightness(1.1);transform:translateY(-1px)}')
lines.append('.result-screen{text-align:center;padding:30px 0;display:none}.result-screen.active{display:block}.result-score{font-size:56px;font-weight:bold;color:#e74c3c;margin:10px 0}.result-label{font-size:16px;color:#7f8c8d;margin-bottom:20px}')
lines.append('.result-stats{display:flex;justify-content:center;gap:30px;margin:20px 0}.stat-item{text-align:center}.stat-num{font-size:28px;font-weight:bold;color:#2c3e50}.stat-label{font-size:13px;color:#95a5a6}')
lines.append('.result-actions{margin-top:24px;display:flex;gap:12px;justify-content:center}.btn{padding:12px 28px;border:none;border-radius:12px;font-size:15px;font-weight:bold;cursor:pointer;transition:all .3s}')
lines.append('.btn-retry{background:#e74c3c;color:#fff}.btn-home{background:#95a5a6;color:#fff}.btn:hover{filter:brightness(1.1)}')
lines.append('.timeout-notice{background:#fdedec;color:#c0392b;padding:10px 16px;border-radius:10px;text-align:center;font-size:14px;margin-bottom:14px;display:none;animation:fadeIn .3s}.timeout-notice.show{display:block}</style></head><body>')

# Body HTML
lines.append('<div class="container"><div class="header"><h1>\U0001F52C 实验装置识别大师</h1><p>看图识仪器 \u00B7 辨装置 \u00B7 玩转化学实验</p></div>')
lines.append('<div class="modes" id="modes">')
lines.append('<button class="mode-btn primary" onclick="startGame(\'normal\')">\U0001F4DA 认仪器模式<br><small style="font-size:11px;opacity:.8">11题 \u00B7 20秒/题</small></button>')
lines.append('<button class="mode-btn hard" onclick="startGame(\'hard\')">\u26A1 装置达人模式<br><small style="font-size:11px;opacity:.8">9题 \u00B7 15秒/题</small></button>')
lines.append('</div>')
lines.append('<div class="game-area" id="gameArea">')
lines.append('<div class="progress-info"><span id="qProgress">第 1 题</span><span id="scoreDisplay">得分: <b>0</b></span></div>')
lines.append('<div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>')
lines.append('<div class="timeout-notice" id="timeoutNotice">\u23F0 时间到！继续作答可得5分（半分）</div>')
lines.append('<div class="timer-wrapper"><div class="timer-circle" id="timerCircle">20</div></div>')
lines.append('<div class="img-container" id="imgContainer"></div>')
lines.append('<div class="question-text" id="questionText"></div>')
lines.append('<div class="score-display"><span class="score-item">连击 \U0001F525<span class="score-num" id="comboNum">0</span></span><span class="combo-badge" id="comboBadge">\u00D72 加成!</span></div>')
lines.append('<div class="options" id="optionsArea"></div>')
lines.append('<div class="analysis-box" id="analysisBox"></div>')
lines.append('<button class="next-btn normal" id="nextBtn" onclick="nextQuestion()" style="display:none">下一题 \u2192</button>')
lines.append('</div>')
lines.append('<div class="result-screen" id="resultScreen"><div style="font-size:48px">\U0001F3C6</div><div class="result-score" id="finalScore">0</div><div class="result-label">最终得分</div>')
lines.append('<div class="result-stats"><div class="stat-item"><div class="stat-num" id="statCorrect">0</div><div class="stat-label">答对</div></div><div class="stat-item"><div class="stat-num" id="statWrong">0</div><div class="stat-label">答错</div></div><div class="stat-item"><div class="stat-num" id="statLate">0</div><div class="stat-label">超时后答对</div></div></div>')
lines.append('<div class="result-actions"><button class="btn btn-retry" onclick="document.getElementById(\'resultScreen\').classList.remove(\'active\');document.getElementById(\'modes\').style.display=\'flex\';">再来一局</button><a href="index.html" class="btn btn-home">返回首页</a></div></div></div>')

# Script start
lines.append('<script>')
lines.append('const IMG_DATA={')

for name, b64 in imgs.items():
    ext = 'jpeg' if name in ['坩埚','坩埚钳'] else 'png'
    lines.append('"'+name+'":"data:image/'+ext+';base64,'+b64+'",')

lines.append('};')

# Normal quiz data
lines.append('const QUIZ_NORMAL=[')
for img_name, answer, options, analysis in normal_qs:
    ans_idx = options.index(answer)
    opts_str = ','.join(['"'+o+'"' for o in options])
    lines.append('{img:"'+img_name+'",q:"请识别图中仪器的名称：",ans:'+str(ans_idx)+',opts:['+opts_str+'],analysis:"'+analysis.replace('"','&quot;').replace('\n','\\n')+'"},')
lines.append('];')

# Hard quiz data
lines.append('const QUIZ_HARD=[')
for img_name, question, options, analysis in hard_qs:
    opts_str = ','.join(['"'+o+'"' for o in options])
    lines.append('{img:"'+img_name+'",q:"'+question+'",ans:0,opts:['+opts_str+'],analysis:"'+analysis.replace('"','&quot;').replace('\n','\\n')+'"},')
lines.append('];')

# Game logic
js_logic = r'''
let CQ=[],CI=0,S=0,CB=0,T=null,TL=20,tLim=20;
let CC=0,WC=0,LC=0,ansed=false,toed=false;

function startGame(md){
CQ=md==='normal'?QUIZ_NORMAL:QUIZ_HARD;tLim=md==='normal'?20:15;CI=0;S=0;CB=0;CC=0;WC=0;LC=0;
$('modes').style.display='none';$('gameArea').classList.add('active');$('resultScreen').classList.remove('active');showQ();
}
function $(id){return document.getElementById(id);}
function showQ(){
ansed=false;toed=false;var q=CQ[CI],tot=CQ.length;
$('qProgress').innerText='第 '+(CI+1)+' / '+tot+' 题';
$('progressFill').style.width=(CI/tot*100)+'%';
$('scoreDisplay').innerHTML='得分: <b>'+S+'</b>';
$('comboNum').textContent=CB;$('comboBadge').className='combo-badge';
$('nextBtn').style.display='none';
$('analysisBox').className='analysis-box';
$('timeoutNotice').className='timeout-notice';
$('imgContainer').innerHTML='<img src="'+IMG_DATA[q.img]+'" alt="">';
$('questionText').textContent=q.q;
var oh=q.opts.map(function(o,i){return '<button class="option-btn" onclick="selA('+i+')">'+o+'</button>';}).join('');
$('optionsArea').innerHTML=oh;startT(tLim);
}
function startT(sec){
clearInterval(T);TL=sec;var el=$('timerCircle');
el.textContent=TL;el.className='timer-circle';
T=setInterval(function(){TL--;el.textContent=TL;if(TL<=5&&TL>0)el.className='timer-circle warning';if(TL<=3&&TL>0)el.className='timer-circle danger';
if(TL<=0){clearInterval(T);toed=true;el.textContent='\u23F0';el.className='timer-circle danger';$('timeoutNotice').className='timeout-notice show';}},1000);
}
function selA(idx){
if(ansed)return;ansed=true;clearInterval(T);var q=CQ[CI];var btns=document.querySelectorAll('.option-btn');
var ok=(idx===q.ans),pts=ok?!toed?10:5:0;
btns.forEach(function(b){b.disabled=true;});
if(ok){
btns[idx].className+=' correct';S+=pts;CB++;
if(toed)LC++;else CC++;
if(CB>=3){var mul=CB>=5?3:2;S+=pts*(mul-1);$('comboBadge').textContent='\u00D7'+mul+' 连击加成!';$('comboBadge').className='combo-badge show';}
}else{
btns[idx].className+=' wrong';btns[q.ans].className+=' correct';CB=0;WC++;
}
$('scoreDisplay').innerHTML='得分: <b>'+S+'</b>';$('comboNum').textContent=CB;
var ae=$('analysisBox'),tg=ok?'\u2705 正确':'\u274C 错误',pi=ok?!toed?'(+10分)':'(+5分)':'(0分)';
ae.innerHTML='<span class="tag">'+tg+'</span> '+pi+'<br><br>'+q.analysis;
ae.className='analysis-box show';
var nb=$('nextBtn');nb.style.display='block';
nb.textContent=CI<CQ.length-1?'下一题 \u2192':'查看结果 \uD83C\uDFC6';
}
function nextQ(){CI++;if(CI<CQ.length)showQ();else showR();}
function showR(){
clearInterval(T);$('gameArea').classList.remove('active');$('resultScreen').classList.add('active');
$('finalScore').textContent=S;$('statCorrect').textContent=CC;$('statWrong').textContent=WC;$('statLate').textContent=LC;
}
'''

lines.append(js_logic)
lines.append('</script></body></html>')

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Done:', out_path, os.path.getsize(out_path)//1024, 'KB')
