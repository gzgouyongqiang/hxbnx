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
    renderDailyQuests();
    renderBank();
    renderLeaderboard();

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
      G.registerCardConfig(data);
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
    renderCards();
    renderDailyQuests();
    renderBank();
    renderLeaderboard();
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

  // ===== 抽卡系统 (v2) =====
  var _currentCollectionFilter = 'all';

  function renderCards(){
    var gachaStatus = G.getGachaStatus();
    var collection = gachaStatus.collection;
    var gachaCards = state.gachaCards || [];

    // 收集进度
    document.getElementById("cardCountText").textContent = gachaStatus.collected + " / " + gachaStatus.totalCards;

    // 精华 & 保底信息
    var infoHtml = "";
    infoHtml += "<div class=\"gacha-info-item\"><span class=\"gacha-info-icon\">💎</span><span class=\"gacha-info-label\">化学精华</span><span class=\"gacha-info-num\">" + gachaStatus.essence + "</span></div>";
    infoHtml += "<div class=\"gacha-info-item\"><span class=\"gacha-info-icon\">🎯</span><span class=\"gacha-info-label\">保底计数</span><span class=\"gacha-info-num\">" + gachaStatus.pity + " / 10</span></div>";
    infoHtml += "<div class=\"gacha-info-item\"><span class=\"gacha-info-icon\">🎫</span><span class=\"gacha-info-label\">今日已抽</span><span class=\"gacha-info-num\">" + gachaStatus.drawsToday + " / " + gachaStatus.maxDrawsPerDay + "</span></div>";
    document.getElementById("gachaInfo").innerHTML = infoHtml;

    // 各稀有度统计
    var counts = {common:0, rare:0, epic:0, legend:0};
    for(var cid in collection){
      if(collection[cid]) counts[collection[cid].rarity || 'common']++;
    }

    var statsHtml = "";
    statsHtml += "<div class=\"profile-card-stat\"><div class=\"profile-card-stat-num common\">" + counts.common + "</div><div class=\"profile-card-stat-label\">普通</div></div>";
    statsHtml += "<div class=\"profile-card-stat\"><div class=\"profile-card-stat-num rare\">" + counts.rare + "</div><div class=\"profile-card-stat-label\">稀有</div></div>";
    statsHtml += "<div class=\"profile-card-stat\"><div class=\"profile-card-stat-num epic\">" + counts.epic + "</div><div class=\"profile-card-stat-label\">史诗</div></div>";
    statsHtml += "<div class=\"profile-card-stat\"><div class=\"profile-card-stat-num legend\">" + counts.legend + "</div><div class=\"profile-card-stat-label\">传说</div></div>";
    document.getElementById("cardStats").innerHTML = statsHtml;

    // 按钮状态
    var freeBtn = document.getElementById("freeDrawBtn");
    var paidBtn = document.getElementById("paidDrawBtn");
    var paidSub = document.getElementById("paidDrawSub");

    if(gachaStatus.canDrawFree){
      freeBtn.classList.remove("disabled");
      freeBtn.classList.add("available");
    } else {
      freeBtn.classList.remove("available");
      freeBtn.classList.add("disabled");
      freeBtn.querySelector(".profile-draw-btn-sub").textContent = "今日已使用";
    }

    if(gachaStatus.canDrawPaid){
      paidBtn.classList.remove("disabled");
      paidBtn.classList.add("available");
      paidSub.textContent = "消耗 100 学分 (" + gachaStatus.drawsToday + "/3)";
    } else {
      paidBtn.classList.remove("available");
      paidBtn.classList.add("disabled");
      if(gachaStatus.drawsToday >= 3){
        paidSub.textContent = "今日次数已用完 (3/3)";
      } else {
        paidSub.textContent = "学分不足 (需要100)";
      }
    }

    // 卡牌图鉴
    renderCardCollection(collection);
  }

  function renderCardCollection(collection){
    var container = document.getElementById("cardCollection");
    if(!cardsData || !cardsData.cards) return;

    var cards = cardsData.cards;
    var html = "";
    var filter = _currentCollectionFilter;

    for(var i=0;i<cards.length;i++){
      var c = cards[i];
      if(filter !== 'all' && c.rarity !== filter) continue;

      var info = collection[c.id];
      var owned = !!info;
      var stars = info ? info.stars : 0;
      var count = info ? info.count : 0;

      var cls = "profile-card-item " + c.rarity;
      if(owned) cls += " owned";
      else cls += " unowned";

      html += "<div class=\"" + cls + "\" data-card-id=\"" + c.id + "\" onclick=\"showCardDetail('" + c.id + "')\">";
      html += "<div class=\"card-rarity\">" + (c.rarity === "common" ? "普通" : c.rarity === "rare" ? "稀有" : c.rarity === "epic" ? "史诗" : "传说") + "</div>";
      html += "<div class=\"card-symbol\">" + (owned ? c.symbol : "?") + "</div>";
      html += "<div class=\"card-item-name\">" + (owned ? c.name : "???") + "</div>";
      if(owned && stars > 0){
        html += "<div class=\"card-stars\">";
        for(var s=0;s<5;s++){
          html += s < stars ? "★" : "☆";
        }
        html += "</div>";
      }
      if(owned && count > 1){
        html += "<div class=\"card-count\">×" + count + "</div>";
      }
      html += "</div>";
    }

    container.innerHTML = html;

    // 筛选事件
    var filters = document.querySelectorAll(".coll-filter-btn");
    for(var j=0;j<filters.length;j++){
      filters[j].onclick = function(){
        for(var k=0;k<filters.length;k++) filters[k].classList.remove("active");
        this.classList.add("active");
        _currentCollectionFilter = this.dataset.filter;
        var gs = G.getGachaStatus();
        renderCardCollection(gs.collection);
      };
    }
  }

  window.showCardDetail = function(cardId){
    if(!cardsData || !cardsData.cards) return;
    var card = null;
    for(var i=0;i<cardsData.cards.length;i++){
      if(cardsData.cards[i].id === cardId){ card = cardsData.cards[i]; break; }
    }
    if(!card) return;

    var gs = G.getGachaStatus();
    var info = gs.collection[cardId];
    var owned = !!info;
    var stars = info ? info.stars : 0;
    var count = info ? info.count : 0;
    var essence = gs.essence;
    var costs = cardsData.upgradeCosts || [0, 3, 8, 20, 50];

    var rarityColors = {common:"#94a3b8", rare:"#67e8f9", epic:"#a78bfa", legend:"#f0c040"};
    var rarityLabels = {common:"普通", rare:"稀有", epic:"史诗", legend:"传说"};

    var html = "";
    html += "<div class=\"card-detail-header " + card.rarity + "\">";
    html += "<div class=\"card-detail-symbol\">" + (owned ? card.symbol : "?") + "</div>";
    html += "<div class=\"card-detail-title\">" + (owned ? card.name : "???") + "</div>";
    html += "<div class=\"card-detail-rarity\" style=\"color:" + rarityColors[card.rarity] + "\">[" + rarityLabels[card.rarity] + "]</div>";
    if(owned){
      html += "<div class=\"card-detail-stars\">";
      for(var s=0;s<5;s++) html += s < stars ? "★" : "☆";
      html += "</div>";
      if(count > 1) html += "<div class=\"card-detail-count\">已获得 " + count + " 张</div>";
    }
    html += "</div>";

    if(owned){
      html += "<div class=\"card-detail-section\">";
      html += "<div class=\"card-detail-section-title\">📖 基础知识</div>";
      html += "<p>" + card.knowledge + "</p>";
      html += "</div>";

      // 星级解锁的知识
      if(card.starUp && card.starUp.length > 0){
        html += "<div class=\"card-detail-section\">";
        html += "<div class=\"card-detail-section-title\">⭐ 星级知识</div>";
        for(var j=0;j<card.starUp.length;j++){
          var unlocked = j < stars;
          html += "<div class=\"star-knowledge " + (unlocked ? "unlocked" : "locked") + "\">";
          html += "<span class=\"star-knowledge-star\">" + (j+2) + "★</span>";
          html += "<span class=\"star-knowledge-text\">" + (unlocked ? card.starUp[j] : "升级至" + (j+2) + "星解锁") + "</span>";
          html += "</div>";
        }
        html += "</div>";
      }

      // 升级按钮
      if(stars < 5){
        var nextCost = costs[stars] || 999;
        var canUpgrade = essence >= nextCost;
        html += "<div class=\"card-detail-upgrade\">";
        html += "<button class=\"upgrade-btn " + (canUpgrade ? "available" : "disabled") + "\" onclick=\"doUpgradeCard('" + cardId + "')\">";
        html += "升级至 " + (stars+1) + "★";
        html += "<span class=\"upgrade-cost\">需要 " + nextCost + " 精华 (当前 " + essence + ")</span>";
        html += "</button>";
        html += "</div>";
      } else {
        html += "<div class=\"card-detail-upgrade\"><div class=\"upgrade-max\">已达最高星级 ★★★★★</div></div>";
      }
    } else {
      html += "<div class=\"card-detail-section locked-section\">";
      html += "<p>尚未获得此卡牌，快去抽卡吧！</p>";
      html += "</div>";
    }

    document.getElementById("cardDetailBody").innerHTML = html;
    document.getElementById("cardDetailModal").classList.add("active");
  };

  window.doUpgradeCard = function(cardId){
    var result = G.upgradeCard(cardId);
    if(result.error){
      G.toaster(result.error, "error");
      return;
    }
    G.toaster("⬆️ 卡牌升级成功！当前 " + result.stars + "★", "success");
    state = G.getStatus().state;
    renderCards();
    // 刷新详情
    showCardDetail(cardId);
  };

  window.closeCardDetail = function(){
    document.getElementById("cardDetailModal").classList.remove("active");
  };

  window.doDrawCard = function(mode){
    var result = G.drawCard(mode);
    if(!result) return;
    if(result.error){
      G.toaster(result.error, "error");
      return;
    }

    var card = result.card;
    state = G.getStatus().state;

    // 显示抽卡动画
    document.getElementById("drawModal").classList.add("active");
    var flip = document.getElementById("drawCardFlip");
    flip.classList.remove("flipped");
    document.getElementById("drawResult").innerHTML = "";
    document.getElementById("drawPityInfo").innerHTML = "";

    // 延迟翻转
    setTimeout(function(){
      flip.classList.add("flipped");

      var rarityColors = {common:"#94a3b8", rare:"#67e8f9", epic:"#a78bfa", legend:"#f0c040"};
      var rarityLabels = {common:"普通", rare:"稀有", epic:"史诗", legend:"传说"};
      var back = document.getElementById("drawCardBack");
      back.innerHTML = "<div style=\"font-size:14px;color:" + rarityColors[card.rarity] + ";margin-bottom:8px\">[" + rarityLabels[card.rarity] + "]</div><div style=\"font-size:20px;font-weight:800;color:var(--gold);margin-bottom:8px\">" + card.symbol + " " + card.name + "</div><div style=\"font-size:11px;color:var(--text-dim)\">" + card.message + "</div>";

      setTimeout(function(){
        var resultHtml = "";
        if(result.isNew){
          resultHtml += "<div class=\"draw-new-tag\">✨ 新卡牌！</div>";
        } else {
          resultHtml += "<div class=\"draw-dup-tag\">重复卡牌 → +" + result.essenceGained + " 精华</div>";
        }
        resultHtml += "<div class=\"draw-name\">" + card.name + "</div>";
        resultHtml += "<div class=\"draw-rarity\" style=\"color:" + rarityColors[card.rarity] + "\">[" + rarityLabels[card.rarity] + "]</div>";
        resultHtml += "<div class=\"draw-msg\">" + card.message + "</div>";
        document.getElementById("drawResult").innerHTML = resultHtml;

        // 保底计数
        var pityHtml = "<span class=\"pity-counter\">保底计数: " + result.pity + "/10</span>";
        if(result.pity >= 5) pityHtml += " <span class=\"pity-boost\">已触发软保底加成！</span>";
        document.getElementById("drawPityInfo").innerHTML = pityHtml;

        // 更新显示
        renderAll();
      }, 600);
    }, 1200);
  };

  window.closeDrawModal = function(){
    document.getElementById("drawModal").classList.remove("active");
  };

  // ===== v3: 每日任务 =====
  function renderDailyQuests(){
    var quests = G.getDailyQuestStatus();
    var list = document.getElementById("dailyQuestList");
    if(!list || !quests) return;
    var html = "";
    for(var i=0;i<quests.length;i++){
      var q = quests[i];
      var cls = "daily-quest-item" + (q.claimed ? " claimed" : "");
      html += "<div class=\"" + cls + "\">";
      html += "<div class=\"daily-quest-icon\">" + q.icon + "</div>";
      html += "<div class=\"daily-quest-info\">";
      html += "<div class=\"daily-quest-name\">" + q.name + "</div>";
      html += "<div class=\"daily-quest-desc\">" + q.desc + "</div>";
      html += "<div class=\"daily-quest-reward\">🎫 +" + q.reward + " 学分</div>";
      html += "</div>";
      if(q.claimed){
        html += "<button class=\"daily-quest-btn done\" disabled>✓ 已领</button>";
      } else {
        html += "<button class=\"daily-quest-btn claim\" onclick=\"claimQuest('" + q.id + "')\">领取</button>";
      }
      html += "</div>";
    }
    list.innerHTML = html;
  }

  window.claimQuest = function(questId){
    var result = G.claimDailyQuest(questId);
    if(result.error){
      G.toaster(result.error, "error");
      return;
    }
    G.toaster("🎁 <strong>完成任务！</strong> +" + result.reward + " 学分", "success");
    state = G.getStatus().state;
    renderAll();
  };

  // ===== v3: 学分银行 =====
  function renderBank(){
    var info = G.bankGetInfo();
    var debtInfo = G.debtGetInfo();
    document.getElementById("bankInfoRow").innerHTML =
      '<div class="bank-info-card"><div class="bank-info-num">' + info.score + '</div><div class="bank-info-label">可用学分</div></div>' +
      '<div class="bank-info-card"><div class="bank-info-num" style="color:#4ade80">' + info.bank + '</div><div class="bank-info-label">银行存款</div></div>' +
      '<div class="bank-info-card"><div class="bank-info-num" style="color:' + (debtInfo.debt > 0 ? '#f87171' : '#64748b') + '">' + debtInfo.debt + '</div><div class="bank-info-label">欠款</div></div>';

    var actionsHtml = "";
    if(debtInfo.debt > 0){
      actionsHtml += '<button class="bank-btn debt" onclick="debtRepay()">💳 答题还债中... 已还清请刷新</button>';
    } else {
      actionsHtml += '<button class="bank-btn deposit" onclick="bankDeposit()">💰 存入 100</button>';
      actionsHtml += '<button class="bank-btn withdraw" onclick="bankWithdraw()">🏧 取出 100</button>';
      actionsHtml += '<button class="bank-btn debt" onclick="debtBorrow()">💳 赊账</button>';
    }
    document.getElementById("bankActions").innerHTML = actionsHtml;
  }

  window.bankDeposit = function(){
    var r = G.bankDeposit(100);
    if(r.error){ G.toaster(r.error, "error"); return; }
    G.toaster("🏦 <strong>存入 100 学分</strong>", "success");
    renderAll();
  };

  window.bankWithdraw = function(){
    var r = G.bankWithdraw(100);
    if(r.error){ G.toaster(r.error, "error"); return; }
    G.toaster("🏦 <strong>取出 100 学分</strong>", "info");
    renderAll();
  };

  window.debtBorrow = function(){
    var r = G.debtBorrow(200);
    if(r.error){ G.toaster(r.error, "error"); return; }
    G.toaster("💳 <strong>赊账 200 学分</strong> 24小时内答题还清", "warning");
    renderAll();
  };

  // ===== v3: 本地排行榜 =====
  function renderLeaderboard(){
    var lb = G.getLeaderboard();
    document.getElementById("leaderboardGrid").innerHTML =
      '<div class="leaderboard-item"><div class="leaderboard-stat-num gold">' + lb.weeklyScore + '</div><div class="leaderboard-stat-label">本周学分</div></div>' +
      '<div class="leaderboard-item"><div class="leaderboard-stat-num purple">' + lb.maxCombo + '</div><div class="leaderboard-stat-label">最高连对</div></div>' +
      '<div class="leaderboard-item"><div class="leaderboard-stat-num green">' + lb.score + '</div><div class="leaderboard-stat-label">当前学分</div></div>' +
      '<div class="leaderboard-item"><div class="leaderboard-stat-num blue">LV.' + lb.level.lv + ' ' + lb.level.name + '</div><div class="leaderboard-stat-label">修为境界</div></div>';
  }

  // ===== 启动 =====
  init();

})();

