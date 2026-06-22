/**
 * battle.js — 宠物战斗系统
 * 1v1 回合制战斗，属性克制，技能触发
 * 队伍：玩家选择3只宠物，AI随机生成3只
 */

const BATTLE_SYSTEM = (function() {
  const KEY = 'hxbnx_game_v2';

  // 属性克制关系 (攻击者 -> 被克制者)
  const TYPE_ADVANTAGE = {
    metal: ['nonmetal', 'salt'],
    nonmetal: ['oxide', 'organic'],
    oxide: ['acid', 'metal'],
    acid: ['base', 'metal'],
    base: ['acid', 'salt'],
    salt: ['base', 'organic'],
    organic: ['noble', 'metal'],
    noble: ['special', 'oxide'],
    special: ['organic', 'nonmetal']
  };

  // 品级加成系数
  const RARITY_BONUS = { 1: 1.0, 2: 1.15, 3: 1.3, 4: 1.5, 5: 1.8 };

  // 难度配置（含学习等级门槛和积分消耗）
  const DIFFICULTY_CONFIG = {
    easy:   { name: '简单', minLevel: 1, cost: 0,  reward: 20,  aiMinRarity: 1, aiMaxRarity: 3 },
    normal: { name: '普通', minLevel: 2, cost: 10, reward: 40,  aiMinRarity: 2, aiMaxRarity: 4 },
    hard:   { name: '困难', minLevel: 4, cost: 20, reward: 80,  aiMinRarity: 3, aiMaxRarity: 5 },
    expert: { name: '专家', minLevel: 6, cost: 50, reward: 150, aiMinRarity: 4, aiMaxRarity: 5 }
  };

  // 战斗记录
  var battleLog = [];
  var currentBattle = null;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function getPetDef(petId) {
    if (typeof ALCHEMY_SYSTEM !== 'undefined') {
      return ALCHEMY_SYSTEM.getPetById(petId);
    }
    return null;
  }

  function getAllPets() {
    if (typeof ALCHEMY_SYSTEM !== 'undefined') {
      return ALCHEMY_SYSTEM.getPetDB();
    }
    return [];
  }

  // ===== 计算属性克制倍率 =====
  function getTypeMultiplier(attackerType, defenderType) {
    if (attackerType === defenderType) return 1.0;
    var advantages = TYPE_ADVANTAGE[attackerType] || [];
    if (advantages.indexOf(defenderType) >= 0) return 1.5; // 克制
    // 检查是否被克制
    for (var type in TYPE_ADVANTAGE) {
      if (TYPE_ADVANTAGE[type].indexOf(attackerType) >= 0 && type === defenderType) {
        return 0.67; // 被克制
      }
    }
    return 1.0;
  }

  // ===== 计算实际伤害 =====
  function calcDamage(attacker, defender, isSkill) {
    var baseAtk = attacker.atk * (RARITY_BONUS[attacker.rarity] || 1.0);
    var baseDef = defender.def * (RARITY_BONUS[defender.rarity] || 1.0);
    var typeMultiplier = getTypeMultiplier(attacker.type, defender.type);

    // 技能伤害加成
    var skillMultiplier = isSkill ? 1.5 : 1.0;

    // 随机波动 0.85 ~ 1.15
    var randomFactor = 0.85 + Math.random() * 0.3;

    // 暴击率 10%
    var isCrit = Math.random() < 0.1;
    var critMultiplier = isCrit ? 1.8 : 1.0;

    var damage = Math.max(1, Math.floor(
      (baseAtk * 2 - baseDef) * typeMultiplier * skillMultiplier * randomFactor * critMultiplier
    ));

    return { damage: damage, isCrit: isCrit, typeMultiplier: typeMultiplier, isSkill: isSkill };
  }

  // ===== 应用技能效果 =====
  function applySkillEffect(pet, target, battleState) {
    var effects = [];
    var skillName = pet.skill || '';

    switch (skillName) {
      case '遇水爆炸':
        if (target.type === 'base' || target.type === 'oxide') {
          effects.push({ type: 'bonus_damage', value: 2.0, desc: '遇水爆炸！伤害翻倍' });
        }
        break;
      case '铁壁防御':
        effects.push({ type: 'buff_def', value: 0.5, duration: 2, desc: '防御提升50%' });
        break;
      case '氧化膜':
        effects.push({ type: 'shield', value: 1, desc: '免疫首次攻击' });
        break;
      case '导电之怒':
        if (Math.random() < 0.3) {
          effects.push({ type: 'stun', duration: 1, desc: '麻痹！敌人跳过1回合' });
        }
        break;
      case '金光护体':
        if (target.type === 'acid' || target.type === 'base') {
          effects.push({ type: 'immune', desc: '免疫酸碱伤害' });
        }
        break;
      case '银镜反射':
        effects.push({ type: 'reflect', value: 0.3, desc: '反弹30%伤害' });
        break;
      case '骨骼强化':
        effects.push({ type: 'low_hp_buff', threshold: 0.3, value: 2.0, desc: '低血量时防御翻倍' });
        break;
      case '耀眼白光':
        if (Math.random() < 0.4) {
          effects.push({ type: 'blind', duration: 1, desc: '致盲！敌人命中率下降' });
        }
        break;
      case '剧烈燃烧':
        if (Math.random() < 0.5) {
          effects.push({ type: 'crit_bonus', value: 2.0, desc: '暴击！伤害翻倍' });
        }
        break;
      case '温室效应':
        effects.push({ type: 'dot', value: 3, duration: 3, desc: '温室效应！持续伤害' });
        break;
      case '强酸腐蚀':
        effects.push({ type: 'ignore_def', value: 0.3, desc: '无视30%防御' });
        break;
      case '脱水碳化':
        if (Math.random() < 0.35) {
          effects.push({ type: 'weaken', duration: 2, desc: '虚弱！攻击力下降' });
        }
        break;
      case '爆炸分解':
        if (pet.currentHp / pet.hp < 0.2) {
          effects.push({ type: 'suicide_bomb', value: 3.0, desc: '自爆！造成巨额伤害' });
        }
        break;
      case '强碱灼伤':
        effects.push({ type: 'dot', value: 4, duration: 2, desc: '灼伤！持续伤害' });
        break;
      case '砌墙硬化':
        effects.push({ type: 'buff_team_def', value: 0.2, desc: '全队防御提升' });
        break;
      case '波尔多液':
        effects.push({ type: 'poison', value: 3, duration: 3, desc: '中毒！持续掉血' });
        break;
      case '强氧化':
        effects.push({ type: 'dispel', desc: '净化敌人增益' });
        break;
      case '芳香迷醉':
        if (Math.random() < 0.3) {
          effects.push({ type: 'sleep', duration: 1, desc: '沉睡！无法行动' });
        }
        break;
      case '醉酒狂暴':
        var hpRatio = pet.currentHp / pet.hp;
        effects.push({ type: 'berserk', value: 1.0 + (1.0 - hpRatio) * 2, desc: '狂暴！血量越低攻击越高' });
        break;
      case '能量补给':
        effects.push({ type: 'heal_team', value: 5, desc: '恢复队友生命' });
        break;
      case '遗传密码':
        effects.push({ type: 'copy_skill', desc: '复制队友技能' });
        break;
      case '黄绿毒雾':
        effects.push({ type: 'poison', value: 3, duration: 3, desc: '中毒！' });
        break;
      case '最强氧化':
        effects.push({ type: 'ignore_def', value: 0.5, desc: '无视50%防御' });
        break;
      case '紫外线盾':
        effects.push({ type: 'immune_light', desc: '免疫光系伤害' });
        break;
      case '消毒杀菌':
        effects.push({ type: 'cleanse', desc: '净化异常状态' });
        break;
      case '足球结构':
        effects.push({ type: 'reduce_phys', value: 0.5, desc: '物理伤害减半' });
        break;
      case '漂浮不定':
        effects.push({ type: 'dodge', value: 0.4, desc: '闪避率提升' });
        break;
      case '霓虹闪烁':
        effects.push({ type: 'buff_team_atk', value: 0.15, desc: '全队攻击提升' });
        break;
      case '惰性守护':
        effects.push({ type: 'regen', value: 0.05, desc: '每回合恢复生命' });
        break;
      case '生命之源':
        effects.push({ type: 'heal_team', value: 8, desc: '恢复队友生命' });
        break;
      case '遇水放热':
        if (target.type === 'base' || target.type === 'oxide') {
          effects.push({ type: 'bonus_damage', value: 1.5, desc: '遇水放热！额外伤害' });
        }
        break;
      case '刺激性气味':
        effects.push({ type: 'reduce_acc', value: 0.2, desc: '降低敌人命中' });
        break;
      case '咸味护盾':
        effects.push({ type: 'reflect', value: 0.15, desc: '反弹少量伤害' });
        break;
      case '遇酸起泡':
        if (target.type === 'acid') {
          effects.push({ type: 'heal_on_hit', value: 10, desc: '遇酸恢复生命' });
        }
        break;
      case '沼气爆炸':
        if (target.type === 'oxide' || target.type === 'special') {
          effects.push({ type: 'bonus_damage', value: 2.0, desc: '沼气爆炸！伤害翻倍' });
        }
        break;
      case '催熟果实':
        effects.push({ type: 'bonus_reward', desc: '战斗后额外奖励' });
        break;
      case '醋酸腐蚀':
        effects.push({ type: 'reduce_def', value: 0.2, desc: '降低敌人防御' });
        break;
      case '同素异构':
        effects.push({ type: 'transform', desc: '形态切换' });
        break;
      case '臭气熏天':
        effects.push({ type: 'reduce_atk', value: 0.15, desc: '降低敌人攻击' });
        break;
      case '鬼火闪烁':
        effects.push({ type: 'night_boost', value: 1.5, desc: '夜间战斗加成' });
        break;
      case '半导体':
        effects.push({ type: 'reduce_magic', value: 0.5, desc: '魔法伤害减半' });
        break;
      case '牺牲阳极':
        effects.push({ type: 'protect', desc: '替队友承受伤害' });
        break;
    }

    return effects;
  }

  // ===== 生成AI对手队伍 =====
  function generateAITeam(difficulty) {
    var allPets = getAllPets();
    var team = [];
    var count = 3;
    var minRarity = 1, maxRarity = 3;

    if (difficulty === 'hard') { minRarity = 2; maxRarity = 4; }
    if (difficulty === 'expert') { minRarity = 3; maxRarity = 5; }

    for (var i = 0; i < count; i++) {
      var pool = allPets.filter(function(p) {
        return p.rarity >= minRarity && p.rarity <= maxRarity;
      });
      if (pool.length === 0) pool = allPets;
      var pet = pool[Math.floor(Math.random() * pool.length)];
      team.push({
        id: pet.id,
        name: pet.name,
        icon: pet.icon,
        formula: pet.formula,
        type: pet.type,
        rarity: pet.rarity,
        atk: pet.atk,
        hp: pet.hp,
        def: pet.def,
        skill: pet.skill,
        skillDesc: pet.skillDesc,
        voice: pet.voice,
        currentHp: pet.hp,
        maxHp: pet.hp,
        effects: [],
        isAI: true
      });
    }
    return team;
  }

  // ===== 创建战斗实例 =====
  function createBattle(playerTeam, difficulty) {
    var config = DIFFICULTY_CONFIG[difficulty];
    if (!config) return { ok: false, msg: '无效难度' };

    // 检查学习等级
    var playerLevel = 1;
    if (typeof HXBNX_GAME !== 'undefined' && HXBNX_GAME.getLearnLevel) {
      playerLevel = HXBNX_GAME.getLearnLevel().lv;
    }
    if (playerLevel < config.minLevel) {
      return {
        ok: false,
        msg: '需要学习等级 ' + config.minLevel + ' 级才能挑战此难度！当前等级: ' + playerLevel + ' 级，快去学习获取积分升级吧！',
        requiredLevel: config.minLevel,
        currentLevel: playerLevel
      };
    }

    // 扣除积分
    if (config.cost > 0) {
      var s = load();
      if (!s || (s.score || 0) < config.cost) {
        return { ok: false, msg: '积分不足！挑战' + config.name + '难度需要 ' + config.cost + ' 积分，快去练功房学习赚取积分吧！' };
      }
      s.score -= config.cost;
      save(s);
    }

    var aiTeam = generateAITeam(difficulty);

    currentBattle = {
      playerTeam: playerTeam.map(function(p) {
        var def = getPetDef(p.id);
        if (!def) return null;
        return {
          id: p.id,
          name: def.name || '未知',
          icon: def.icon || '🧪',
          formula: def.formula || '?',
          type: def.type || 'special',
          rarity: def.rarity || 1,
          atk: def.atk || 20,
          hp: def.hp || 40,
          def: def.def || 10,
          skill: def.skill || '普通攻击',
          skillDesc: def.skillDesc || '',
          voice: def.voice || '',
          currentHp: def.hp || 40,
          maxHp: def.hp || 40,
          effects: [],
          isAI: false
        };
      }).filter(function(p) { return p !== null; }),
      aiTeam: aiTeam,
      playerActive: 0,
      aiActive: 0,
      turn: 1,
      difficulty: difficulty,
      logs: [],
      status: 'active',
      bonusReward: false
    };

    if (currentBattle.playerTeam.length === 0) {
      return { ok: false, msg: '没有有效的宠物！请重新选择。' };
    }

    battleLog = [];
    return { ok: true, battle: currentBattle };
  }

  // ===== 执行一回合 =====
  function executeTurn(playerAction, playerTargetIndex) {
    if (!currentBattle || currentBattle.status !== 'active') {
      return { ok: false, msg: '战斗已结束' };
    }

    var logs = [];
    var playerPet = currentBattle.playerTeam[currentBattle.playerActive];
    var aiPet = currentBattle.aiTeam[currentBattle.aiActive];

    if (!playerPet || playerPet.currentHp <= 0) {
      // 切换到下一只存活的宠物
      switchPlayerPet();
      playerPet = currentBattle.playerTeam[currentBattle.playerActive];
    }
    if (!aiPet || aiPet.currentHp <= 0) {
      switchAIPet();
      aiPet = currentBattle.aiTeam[currentBattle.aiActive];
    }

    if (!playerPet) {
      currentBattle.status = 'ai_win';
      return { ok: true, battle: currentBattle, logs: logs, result: 'lose' };
    }
    if (!aiPet) {
      currentBattle.status = 'player_win';
      return { ok: true, battle: currentBattle, logs: logs, result: 'win' };
    }

    // 玩家回合
    var playerResult = doAttack(playerPet, aiPet, playerAction === 'skill');
    logs.push({
      actor: 'player',
      pet: playerPet,
      target: aiPet,
      action: playerAction,
      result: playerResult
    });

    if (aiPet.currentHp <= 0) {
      logs.push({ type: 'ko', pet: aiPet, msg: aiPet.name + ' 倒下了！' });
      // 检查AI是否还有存活宠物
      var aiAlive = false;
      for (var i = 0; i < currentBattle.aiTeam.length; i++) {
        if (currentBattle.aiTeam[i].currentHp > 0) { aiAlive = true; break; }
      }
      if (!aiAlive) {
        currentBattle.status = 'player_win';
        return { ok: true, battle: currentBattle, logs: logs, result: 'win' };
      }
      switchAIPet();
    }

    // AI回合
    if (currentBattle.status === 'active') {
      aiPet = currentBattle.aiTeam[currentBattle.aiActive];
      if (aiPet && aiPet.currentHp > 0) {
        var aiAction = Math.random() < 0.3 ? 'skill' : 'attack';
        var aiResult = doAttack(aiPet, playerPet, aiAction === 'skill');
        logs.push({
          actor: 'ai',
          pet: aiPet,
          target: playerPet,
          action: aiAction,
          result: aiResult
        });

        if (playerPet.currentHp <= 0) {
          logs.push({ type: 'ko', pet: playerPet, msg: playerPet.name + ' 倒下了！' });
          var playerAlive = false;
          for (var j = 0; j < currentBattle.playerTeam.length; j++) {
            if (currentBattle.playerTeam[j].currentHp > 0) { playerAlive = true; break; }
          }
          if (!playerAlive) {
            currentBattle.status = 'ai_win';
            return { ok: true, battle: currentBattle, logs: logs, result: 'lose' };
          }
          switchPlayerPet();
        }
      }
    }

    currentBattle.turn++;
    currentBattle.logs = currentBattle.logs.concat(logs);

    return { ok: true, battle: currentBattle, logs: logs, result: 'ongoing' };
  }

  // ===== 执行攻击 =====
  function doAttack(attacker, defender, useSkill) {
    var damageResult = calcDamage(attacker, defender, useSkill);
    var effects = applySkillEffect(attacker, defender, currentBattle);

    // 应用技能额外效果
    var finalDamage = damageResult.damage;
    var effectDescs = [];

    for (var i = 0; i < effects.length; i++) {
      var eff = effects[i];
      if (eff.type === 'bonus_damage') {
        finalDamage = Math.floor(finalDamage * eff.value);
        effectDescs.push(eff.desc);
      }
      if (eff.type === 'ignore_def') {
        finalDamage = Math.floor(finalDamage * (1 + eff.value));
        effectDescs.push(eff.desc);
      }
      if (eff.type === 'crit_bonus' && damageResult.isCrit) {
        finalDamage = Math.floor(finalDamage * eff.value);
        effectDescs.push(eff.desc);
      }
      if (eff.type === 'berserk') {
        finalDamage = Math.floor(finalDamage * eff.value);
        effectDescs.push(eff.desc);
      }
      if (eff.type === 'suicide_bomb') {
        finalDamage = Math.floor(finalDamage * eff.value);
        effectDescs.push(eff.desc);
      }
      if (eff.type === 'dot') {
        defender.effects.push({ type: 'dot', value: eff.value, duration: eff.duration });
        effectDescs.push(eff.desc);
      }
      if (eff.type === 'poison') {
        defender.effects.push({ type: 'poison', value: eff.value, duration: eff.duration });
        effectDescs.push(eff.desc);
      }
      if (eff.type === 'stun') {
        defender.effects.push({ type: 'stun', duration: eff.duration });
        effectDescs.push(eff.desc);
      }
      if (eff.type === 'sleep') {
        defender.effects.push({ type: 'sleep', duration: eff.duration });
        effectDescs.push(eff.desc);
      }
      if (eff.type === 'weaken') {
        defender.effects.push({ type: 'weaken', duration: eff.duration });
        effectDescs.push(eff.desc);
      }
      if (eff.type === 'bonus_reward') {
        currentBattle.bonusReward = true;
      }
    }

    // 应用持续伤害
    applyDoT(attacker);
    applyDoT(defender);

    defender.currentHp = Math.max(0, defender.currentHp - finalDamage);

    return {
      damage: finalDamage,
      isCrit: damageResult.isCrit,
      typeMultiplier: damageResult.typeMultiplier,
      isSkill: useSkill,
      effects: effectDescs,
      remainingHp: defender.currentHp
    };
  }

  // ===== 应用持续伤害 =====
  function applyDoT(pet) {
    for (var i = pet.effects.length - 1; i >= 0; i--) {
      var eff = pet.effects[i];
      if (eff.type === 'dot' || eff.type === 'poison') {
        pet.currentHp = Math.max(0, pet.currentHp - eff.value);
        eff.duration--;
        if (eff.duration <= 0) {
          pet.effects.splice(i, 1);
        }
      }
    }
  }

  // ===== 切换宠物 =====
  function switchPlayerPet() {
    for (var i = 0; i < currentBattle.playerTeam.length; i++) {
      if (currentBattle.playerTeam[i].currentHp > 0) {
        currentBattle.playerActive = i;
        return true;
      }
    }
    return false;
  }

  function switchAIPet() {
    for (var i = 0; i < currentBattle.aiTeam.length; i++) {
      if (currentBattle.aiTeam[i].currentHp > 0) {
        currentBattle.aiActive = i;
        return true;
      }
    }
    return false;
  }

  // ===== 手动切换玩家宠物 =====
  function switchPlayerActive(index) {
    if (!currentBattle || currentBattle.status !== 'active') return { ok: false, msg: '战斗已结束' };
    if (index < 0 || index >= currentBattle.playerTeam.length) return { ok: false, msg: '无效索引' };
    if (currentBattle.playerTeam[index].currentHp <= 0) return { ok: false, msg: '该宠物已倒下' };
    currentBattle.playerActive = index;
    return { ok: true, battle: currentBattle };
  }

  // ===== 计算战斗奖励 =====
  function calcRewards() {
    if (!currentBattle) return null;

    var baseScore = 0;
    var difficulty = currentBattle.difficulty;

    if (currentBattle.status === 'player_win') {
      var config = DIFFICULTY_CONFIG[currentBattle.difficulty] || DIFFICULTY_CONFIG.easy;
      baseScore = config.reward;

      // 额外奖励
      if (currentBattle.bonusReward) baseScore += 10;

      // 存活宠物加成
      var aliveCount = 0;
      for (var i = 0; i < currentBattle.playerTeam.length; i++) {
        if (currentBattle.playerTeam[i].currentHp > 0) aliveCount++;
      }
      baseScore += aliveCount * 5;

      // 记录胜场
      var s = load();
      if (s) {
        if (!s.battleWins) s.battleWins = 0;
        s.battleWins++;
        if (!s.battleTotalScore) s.battleTotalScore = 0;
        s.battleTotalScore += baseScore;
        save(s);
      }
    }

    return {
      status: currentBattle.status,
      score: baseScore,
      difficulty: difficulty,
      turns: currentBattle.turn,
      bonus: currentBattle.bonusReward
    };
  }

  // ===== 获取战斗统计 =====
  function getBattleStats() {
    var s = load();
    if (!s) return { wins: 0, totalScore: 0 };
    return {
      wins: s.battleWins || 0,
      totalScore: s.battleTotalScore || 0
    };
  }

  // ===== API =====
  var api = {
    // 属性克制
    getTypeAdvantage: function() { return TYPE_ADVANTAGE; },
    getTypeMultiplier: getTypeMultiplier,

    // 队伍管理
    createBattle: createBattle,
    getCurrentBattle: function() { return currentBattle; },

    // 战斗操作
    executeTurn: executeTurn,
    switchPlayerActive: switchPlayerActive,

    // 奖励
    calcRewards: calcRewards,
    getBattleStats: getBattleStats,

    // 工具
    getPetDef: getPetDef,
    getAllPets: getAllPets,
    getDifficultyConfig: function() { return DIFFICULTY_CONFIG; }
  };

  return api;
})();
