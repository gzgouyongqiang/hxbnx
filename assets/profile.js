(function(){
  var G = HXBNX_GAME;
  var state = null;
  var levelInfo = null;
  var badgesData = null;
  var cardsData = null;

  // ===== 初始化 =====
  function init(){
    var status = G.getStatus();
    state = status.state;
    levelInfo = status.level;

    // 粒子背景
    spawnParticles();

    // 立即渲染不依赖外部数据的部分
    renderHero();
    renderLevelTimeline();
    renderAchievements();

    // 加载徽章数据
    fetch("data/badges.json").then(function(r){return r.json()}).then(function(data){
      badgesData = data;
      G.registerBadgeData(data);
      renderBadges();
    }).catch(function(e){
      console.log("badges load failed:", e);
      renderBadges();
    });

    // 加载卡牌数据
    fetch("data/cards.json").then(function(r){return r.json()}).then(function(data){
      cardsData = data;
      G.registerCardPool(data.cards);
      renderCards();
    }).catch(function(e){
      console.log("cards load failed:", e);
      renderCards();
    });
  }

  function renderAll(){
    renderHero();
    renderLevelTimeline();
    renderAchievements();
    renderBadges();
  }

  // ===== 粒子背景 =====
  function spawnParticles(){
    var pc = document.getElementById("profileBgParts");
    if(!pc) return;
    for(var i=0;i<30;i++){
      var p = document.createElement("div");
      p.className = "pp";
      p.style.left = Math.random()*100 + "%";
      p.style.animationDelay = Math.random()*8 + "s";
      p.style.animationDuration = (5 + Math.random()*8) + "s";
      pc.appendChild(p);
    }
  }

  // ===== 角色卡片区 =====
  function renderHero(){
    var lv = levelInfo.lv;
    var name = levelInfo.name;
    var progress = levelInfo.progress;
    var currentExp = levelInfo.currentExp;
    var nextExp = levelInfo.nextExp;
    var prevExp = levelInfo.prevExp;
    var remain = Math.max(0, nextExp - currentExp);

    document.getElementById("avatarLv").textContent = lv;
    document.getElementById("avatarLvName").textContent = name;
    document.getElementById("heroTitle").textContent = name;
    document.getElementById("heroTier").textContent = "LV." + lv;
    document.getElementById("expFill").style.width = progress + "%";
    document.getElementById("expCurrent").textContent = currentExp;
    document.getElementById("expNext").textContent = nextExp;
    document.getElementById("expRemain").textContent = remain;

    // 头像框高亮
    var ring = document.getElementById("avatarRing");
    if(ring) ring.classList.add("current-lv");

    // 统计数据
    var totalCorrect = 0, totalWrong = 0;
    for(var k in state.quizResults){
      var q = state.quizResults[k];
      if(q.passed) totalCorrect++;
      else totalWrong++;
    }
    var totalQ = totalCorrect + totalWrong;
    var accuracy = totalQ > 0 ? Math.round(totalCorrect / totalQ * 100) : 0;

    document.getElementById("statScore").textContent = state.score || 0;
    document.getElementById("statStreak").textContent = state.maxStreak || 0;
    document.getElementById("statAccuracy").textContent = accuracy + "%";
    document.getElementById("statCleared").textContent = (state.clearedQuests || []).length;
  }

  // ===== 等级时间轴 =====
  function renderLevelTimeline(){
    var timeline = document.getElementById("levelTimeline");
    if(!timeline) return;

    var LEVELS = [
      {lv:1,name:"初入江湖"},{lv:2,name:"炼气初阶"},{lv:3,name:"炼气中阶"},{lv:4,name:"炼气大成"},
      {lv:5,name:"筑基初阶"},{lv:6,name:"筑基中阶"},{lv:7,name:"筑基大成"},{lv:8,name:"金丹初阶"},
      {lv:9,name:"金丹中阶"},{lv:10,name:"金丹大成"},{lv:11,name:"元婴初阶"},{lv:12,name:"元婴中阶"},
      {lv:13,name:"元婴大成"},{lv:14,name:"化神初阶"},{lv:15,name:"化神中阶"},{lv:16,name:"化神大成"},
      {lv:17,name:"炼虚初阶"},{lv:18,name:"炼虚中阶"},{lv:19,name:"炼虚大成"},{lv:20,name:"合体初阶"},
      {lv:21,name:"合体中阶"},{lv:22,name:"合体大成"},{lv:23,name:"大乘初阶"},{lv:24,name:"大乘中阶"},
      {lv:25,name:"大乘大成"},{lv:26,name:"渡劫初阶"},{lv:27,name:"渡劫中阶"},{lv:28,name:"渡劫大成"},
      {lv:29,name:"飞升境"},{lv:30,name:"元素之主"}
    ];

    var currentLv = levelInfo.lv;
    var html = "";
    for(var i=0;i<LEVELS.length;i++){
      var l = LEVELS[i];
      var cls = "profile-level-node";
      if(l.lv < currentLv) cls += " unlocked";
      else if(l.lv === currentLv) cls += " current";
      html += "<div class=\"" + cls + "\" title=\"" + l.name + "\">";
      html += l.lv;
      html += "<span class=\"lv-name\">" + l.name + "</span>";
      html += "</div>";
    }
    timeline.innerHTML = html;
    document.getElementById("levelProgressText").textContent = currentLv + " / 30";
  }

  // ===== 成就殿堂 =====
  function renderAchievements(){
    var grid = document.getElementById("achGrid");
    if(!grid) return;

    var achievements = G.getStatus().achievements || [];
    var unlocked = state.unlockedAchievements || [];
    var html = "";
    var unlockedCount = 0;

    for(var i=0;i<achievements.length;i++){
      var a = achievements[i];
      var isUnlocked = unlocked.indexOf(a.id) >= 0;
      if(isUnlocked) unlockedCount++;
      var isHidden = a.hidden && !isUnlocked;

      var cls = "profile-ach-card";
      if(isUnlocked) cls += " unlocked " + a.tier + "-a";
      else cls += " locked";

      var icon = isHidden ? "❓" : a.icon;
      var name = isHidden ? "???" : a.name;
      var desc = isHidden ? "隐藏成就，解锁后显示" : a.desc;
      var exp = isHidden ? "" : "+" + a.exp + " EXP";

      html += "<div class=\"" + cls + "\" data-tier=\"" + a.tier + "\">";
      if(a.hidden) html += "<span class=\"profile-ach-hidden\">隐藏</span>";
      html += "<div class=\"profile-ach-icon\">" + icon + "</div>";
      html += "<div class=\"profile-ach-name\">" + name + "</div>";
      html += "<div class=\"profile-ach-desc\">" + desc + "</div>";
      if(exp) html += "<div class=\"profile-ach-exp\">" + exp + "</div>";
      html += "</div>";
    }

    grid.innerHTML = html;
    document.getElementById("achProgressText").textContent = unlockedCount + " / " + achievements.length;

    // 筛选事件
    var filters = document.querySelectorAll(".profile-filter-btn");
    for(var j=0;j<filters.length;j++){
      filters[j].onclick = function(){
        for(var k=0;k<filters.length;k++) filters[k].classList.remove("active");
        this.classList.add("active");
        var f = this.dataset.filter;
        var cards = grid.querySelectorAll(".profile-ach-card");
        for(var c=0;c<cards.length;c++){
          var tier = cards[c].dataset.tier;
          if(f === "all" || tier === f) cards[c].style.display = "";
          else cards[c].style.display = "none";
        }
      };
    }
  }

  // ===== 徽章墙 =====
  function renderBadges(){
    var wall = document.getElementById("badgeWall");
    if(!wall || !badgesData) return;

    var questBadges = state.questBadges || {};
    var badges = badgesData.badges || {};
    var html = "";
    var unlockedCount = 0;

    for(var bid in badges){
      var b = badges[bid];
      var isUnlocked = questBadges[bid] === true;
      if(isUnlocked) unlockedCount++;

      var cls = "profile-badge-slot";
      if(isUnlocked) cls += " unlocked";
      else cls += " locked";

      html += "<div class=\"" + cls + "\" data-bid=\"" + bid + "\">";
      html += "<div class=\"profile-badge-icon\">" + b.icon + "</div>";
      html += "<div class=\"profile-badge-name\">" + b.name + "</div>";
      html += "<div class=\"profile-badge-formula\">" + b.formula + "</div>";
      html += "</div>";
    }

    wall.innerHTML = html;
    document.getElementById("badgeProgressText").textContent = unlockedCount + " / " + Object.keys(badges).length;

    // Add click handlers for badges
    var slots = wall.querySelectorAll(".profile-badge-slot");
    for(var s=0;s<slots.length;s++){
      slots[s].addEventListener("click", function(){
        var bid = this.getAttribute("data-bid");
        if(bid) showBadgeStory(bid);
      });
    }
  }

  // 显示徽章故事
  window.showBadgeStory = function(bid){
    if(!badgesData || !badgesData.badges || !badgesData.badges[bid]) return;
    var questBadges = state.questBadges || {};
    if(questBadges[bid] !== true) return;

    var b = badgesData.badges[bid];
    var story = b.story || {};
    var html = "";
    html += "<h3>" + (story.title || b.name) + "</h3>";
    html += "<p>" + (story.text || "") + "</p>";
    html += "<div class=\"story-source\">" + (story.source || "") + "</div>";

    document.getElementById("badgeModalBody").innerHTML = html;
    document.getElementById("badgeModal").classList.add("active");
  };

  window.closeBadgeModal = function(){
    document.getElementById("badgeModal").classList.remove("active");
  };

  // ===== 抽卡系统 =====
  function renderCards(){
    var gachaCards = state.gachaCards || [];
    document.getElementById("cardCountText").textContent = gachaCards.length + " 张卡牌";

    // 统计各稀有度
    var counts = {common:0, rare:0, epic:0, legend:0};
    for(var i=0;i<gachaCards.length;i++){
      var r = gachaCards[i].rarity;
      if(counts[r] !== undefined) counts[r]++;
    }

    var statsHtml = "";
    statsHtml += "<div class=\"profile-card-stat\"><div class=\"profile-card-stat-num common\">" + counts.common + "</div><div class=\"profile-card-stat-label\">普通</div></div>";
    statsHtml += "<div class=\"profile-card-stat\"><div class=\"profile-card-stat-num rare\">" + counts.rare + "</div><div class=\"profile-card-stat-label\">稀有</div></div>";
    statsHtml += "<div class=\"profile-card-stat\"><div class=\"profile-card-stat-num epic\">" + counts.epic + "</div><div class=\"profile-card-stat-label\">史诗</div></div>";
    statsHtml += "<div class=\"profile-card-stat\"><div class=\"profile-card-stat-num legend\">" + counts.legend + "</div><div class=\"profile-card-stat-label\">传说</div></div>";
    document.getElementById("cardStats").innerHTML = statsHtml;

    // 卡牌收藏展示
    var collection = document.getElementById("cardCollection");
    var colHtml = "";
    for(var j=gachaCards.length-1;j>=Math.max(0,gachaCards.length-12);j--){
      var c = gachaCards[j];
      colHtml += "<div class=\"profile-card-item " + c.rarity + "\">";
      colHtml += "<div class=\"card-rarity\">" + (c.rarity === "common" ? "普通" : c.rarity === "rare" ? "稀有" : c.rarity === "epic" ? "史诗" : "传说") + "</div>";
      colHtml += "<div>" + c.name + "</div>";
      colHtml += "</div>";
    }
    collection.innerHTML = colHtml;
  }

  window.doDrawCard = function(){
    var currentScore = state.score || 0;
    if(currentScore < 100){
      G.toaster("积分不足！需要 100 积分", "error");
      return;
    }

    // 扣除积分
    state.score = currentScore - 100;
    G.toaster("🔥 炼金抽卡中...", "info");

    // 显示抽卡动画
    document.getElementById("drawModal").classList.add("active");
    var flip = document.getElementById("drawCardFlip");
    flip.classList.remove("flipped");
    document.getElementById("drawResult").innerHTML = "";

    // 延迟翻转
    setTimeout(function(){
      var card = G.drawCard();
      if(card){
        flip.classList.add("flipped");

        var rarityColors = {common:"#94a3b8", rare:"#67e8f9", epic:"#a78bfa", legend:"#f0c040"};
        var rarityLabels = {common:"普通", rare:"稀有", epic:"史诗", legend:"传说"};
        var back = document.getElementById("drawCardBack");
        back.innerHTML = "<div style=\"font-size:14px;color:" + rarityColors[card.rarity] + ";margin-bottom:8px\">[" + rarityLabels[card.rarity] + "]</div><div style=\"font-size:20px;font-weight:800;color:var(--gold);margin-bottom:8px\">" + card.name + "</div><div style=\"font-size:11px;color:var(--text-dim)\">" + card.message + "</div>";

        setTimeout(function(){
          document.getElementById("drawResult").innerHTML = "<div class=\"draw-name\">" + card.name + "</div><div class=\"draw-rarity\" style=\"color:" + rarityColors[card.rarity] + "\">[" + rarityLabels[card.rarity] + "]</div><div class=\"draw-msg\">" + card.message + "</div>";

          // 更新显示
          state = G.getStatus().state;
          renderHero();
          renderCards();
        }, 600);
      }
    }, 1200);
  };

  window.closeDrawModal = function(){
    document.getElementById("drawModal").classList.remove("active");
  };

  // ===== 启动 =====
  init();

})();

