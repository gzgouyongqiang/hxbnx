/**
 * alchemy.js — 炼丹炉宠物系统
 * 纯娱乐，与学习系统分离
 * 消耗积分炼丹 → 获得宠物 → 收集/合成/交易
 */

const ALCHEMY_SYSTEM = (function() {
  const KEY = 'hxbnx_game_v2';

  // ===== 宠物数据库 =====
  const PET_DB = [
    // 单质 - 金属
    { id: 'na', name: '钠宝宝', formula: 'Na', type: 'metal', rarity: 1, atk: 28, hp: 45, def: 12, skill: '遇水爆炸', skillDesc: '对水系造成3倍伤害', voice: '别泼水！别泼水！啊啊啊💥', icon: '👶', evolveTo: 'naoh', evolveCond: '投入水中战斗3次' },
    { id: 'fe', name: '铁块头', formula: 'Fe', type: 'metal', rarity: 1, atk: 22, hp: 55, def: 18, skill: '铁壁防御', skillDesc: '防御力提升50%', voice: '我很硬，但我会生锈...', icon: '👷', evolveTo: 'fe2o3', evolveCond: '遇到氧气战斗5次' },
    { id: 'al', name: '铝小弟', formula: 'Al', type: 'metal', rarity: 1, atk: 20, hp: 48, def: 15, skill: '氧化膜', skillDesc: '免疫首次攻击', voice: '我表面有层保护膜，刀枪不入！', icon: '🦸' },
    { id: 'cu', name: '铜将军', formula: 'Cu', type: 'metal', rarity: 2, atk: 25, hp: 50, def: 20, skill: '导电之怒', skillDesc: '攻击附带麻痹效果', voice: '我是电的良导体，小心触电！', icon: '⚔️' },
    { id: 'au', name: '金闪闪', formula: 'Au', type: 'metal', rarity: 4, atk: 35, hp: 60, def: 25, skill: '金光护体', skillDesc: '免疫酸和碱伤害', voice: '我不怕酸不怕碱，就怕王水那个混蛋！', icon: '👑', evolveTo: 'aucl4', evolveCond: '被王水击败1次' },
    { id: 'ag', name: '银月姬', formula: 'Ag', type: 'metal', rarity: 3, atk: 30, hp: 45, def: 18, skill: '银镜反射', skillDesc: '反弹30%伤害', voice: '我的光泽像月光一样美丽~', icon: '🧝‍♀️' },
    { id: 'zn', name: '锌小子', formula: 'Zn', type: 'metal', rarity: 1, atk: 18, hp: 42, def: 14, skill: '牺牲阳极', skillDesc: '替队友承受伤害', voice: '为了保护铁大哥，我愿意牺牲自己！', icon: '🛡️' },
    { id: 'ca', name: '钙骨架', formula: 'Ca', type: 'metal', rarity: 2, atk: 24, hp: 52, def: 22, skill: '骨骼强化', skillDesc: '生命值低于30%时防御翻倍', voice: '我是骨骼的主要成分，坚硬无比！', icon: '🦴' },
    { id: 'mg', name: '镁光灯', formula: 'Mg', type: 'metal', rarity: 2, atk: 26, hp: 44, def: 13, skill: '耀眼白光', skillDesc: '致盲敌人1回合', voice: '燃烧时发出耀眼的白光，别直视我！', icon: '📸' },
    { id: 'k', name: '钾暴徒', formula: 'K', type: 'metal', rarity: 3, atk: 32, hp: 40, def: 10, skill: '剧烈燃烧', skillDesc: '攻击时50%概率暴击', voice: '我比钠还暴躁，遇水直接爆炸！', icon: '💣' },

    // 单质 - 非金属
    { id: 'c', name: '碳弟弟', formula: 'C', type: 'nonmetal', rarity: 1, atk: 15, hp: 40, def: 20, skill: '同素异构', skillDesc: '可在金刚石/石墨形态切换', voice: '我和石墨是亲兄弟，都是碳~', icon: '👦', evolveTo: 'co2', evolveCond: '燃烧战斗3次' },
    { id: 's', name: '硫磺仔', formula: 'S', type: 'nonmetal', rarity: 1, atk: 20, hp: 38, def: 12, skill: '臭气熏天', skillDesc: '降低敌人攻击力', voice: '我燃烧时产生刺鼻的二氧化硫！', icon: '👃' },
    { id: 'p', name: '磷火灵', formula: 'P', type: 'nonmetal', rarity: 2, atk: 24, hp: 35, def: 10, skill: '鬼火闪烁', skillDesc: '夜间战斗攻击力翻倍', voice: '我在空气中自燃，发出幽幽绿光...', icon: '👻' },
    { id: 'si', name: '硅晶人', formula: 'Si', type: 'nonmetal', rarity: 2, atk: 18, hp: 50, def: 24, skill: '半导体', skillDesc: '受到魔法伤害减半', voice: '我是芯片的核心，信息时代的基石！', icon: '🤖' },

    // 稀有气体
    { id: 'he', name: '氦气绅士', formula: 'He', type: 'noble', rarity: 2, atk: 10, hp: 35, def: 30, skill: '漂浮不定', skillDesc: '闪避率提升40%', voice: '我很轻，但我很稳定，什么都不跟我反应~', icon: '🎩' },
    { id: 'ne', name: '氖灯侠', formula: 'Ne', type: 'noble', rarity: 3, atk: 15, hp: 40, def: 22, skill: '霓虹闪烁', skillDesc: '战斗开始时提升全队攻击力', voice: '通电时我发出红光，照亮黑夜！', icon: '💡' },
    { id: 'ar', name: '氩气盾', formula: 'Ar', type: 'noble', rarity: 2, atk: 12, hp: 48, def: 28, skill: '惰性守护', skillDesc: '每回合恢复5%生命值', voice: '我保护着灯丝，让它不被氧化~', icon: '🛡️' },

    // 化合物 - 氧化物
    { id: 'co2', name: '二氧化碳仙子', formula: 'CO₂', type: 'oxide', rarity: 2, atk: 20, hp: 42, def: 16, skill: '温室效应', skillDesc: '每回合对敌人造成持续伤害', voice: '我是温室效应的元凶之一...', icon: '🧚', evolveFrom: 'c' },
    { id: 'fe2o3', name: '铁锈怪', formula: 'Fe₂O₃', type: 'oxide', rarity: 2, atk: 18, hp: 58, def: 20, skill: '氧化侵蚀', skillDesc: '攻击降低敌人防御', voice: '我是铁生锈后的样子，红褐色的~', icon: '🧟', evolveFrom: 'fe' },
    { id: 'h2o', name: '水精灵', formula: 'H₂O', type: 'oxide', rarity: 2, atk: 16, hp: 45, def: 18, skill: '生命之源', skillDesc: '每回合恢复队友生命值', voice: '我是生命之源，万物都离不开我！', icon: '🧜‍♀️' },
    { id: 'cao', name: '生石灰', formula: 'CaO', type: 'oxide', rarity: 2, atk: 22, hp: 48, def: 19, skill: '遇水放热', skillDesc: '水系敌人受到额外伤害', voice: '我遇水会放出大量热，小心烫伤！', icon: '🧱' },

    // 化合物 - 酸
    { id: 'hcl', name: '盐酸精灵', formula: 'HCl', type: 'acid', rarity: 2, atk: 26, hp: 38, def: 12, skill: '强酸腐蚀', skillDesc: '攻击无视敌人30%防御', voice: '我的腐蚀性很强，小心皮肤！', icon: '🧚‍♂️', evolveFrom: 'cl2' },
    { id: 'h2so4', name: '硫酸暴君', formula: 'H₂SO₄', type: 'acid', rarity: 3, atk: 30, hp: 42, def: 15, skill: '脱水碳化', skillDesc: '攻击有概率使敌人虚弱', voice: '我是酸中之王，脱水能力一流！', icon: '👹' },
    { id: 'hno3', name: '硝酸炸弹', formula: 'HNO₃', type: 'acid', rarity: 3, atk: 32, hp: 35, def: 10, skill: '爆炸分解', skillDesc: '生命值低于20%时自爆造成大量伤害', voice: '我不稳定，容易分解产生红棕色气体！', icon: '💥' },

    // 化合物 - 碱
    { id: 'naoh', name: '氢氧化钠魔女', formula: 'NaOH', type: 'base', rarity: 3, atk: 28, hp: 40, def: 14, skill: '强碱灼伤', skillDesc: '攻击附带持续伤害', voice: '我是强碱，皮肤和眼睛都要小心！', icon: '🧙‍♀️', evolveFrom: 'na' },
    { id: 'caoh2', name: '氢氧化钙石匠', formula: 'Ca(OH)₂', type: 'base', rarity: 2, atk: 20, hp: 50, def: 20, skill: '砌墙硬化', skillDesc: '提升全队防御', voice: '我是石灰浆的主要成分，用来砌墙！', icon: '👨‍🔧' },
    { id: 'nh3', name: '氨气仙子', formula: 'NH₃', type: 'base', rarity: 2, atk: 18, hp: 42, def: 16, skill: '刺激性气味', skillDesc: '降低敌人命中率', voice: '我有刺激性气味，但我是重要的氮肥！', icon: '🧚‍♀️' },

    // 化合物 - 盐
    { id: 'nacl', name: '氯化钠双胞胎', formula: 'NaCl', type: 'salt', rarity: 1, atk: 15, hp: 45, def: 18, skill: '咸味护盾', skillDesc: '受到攻击时反弹少量伤害', voice: '我们是食盐，每天必不可少的调味品！', icon: '🧂' },
    { id: 'caco3', name: '碳酸钙石像', formula: 'CaCO₃', type: 'salt', rarity: 2, atk: 18, hp: 55, def: 25, skill: '遇酸起泡', skillDesc: '受到酸攻击时恢复生命', voice: '我是大理石和石灰石的主要成分！', icon: '🗿' },
    { id: 'cuso4', name: '硫酸铜蓝晶', formula: 'CuSO₄', type: 'salt', rarity: 3, atk: 24, hp: 42, def: 16, skill: '波尔多液', skillDesc: '攻击附带中毒效果', voice: '我是蓝色的晶体，可以用来杀菌！', icon: '🔷' },
    { id: 'kmno4', name: '高锰酸钾紫晶', formula: 'KMnO₄', type: 'salt', rarity: 4, atk: 35, hp: 40, def: 14, skill: '强氧化', skillDesc: '攻击净化敌人增益效果', voice: '我是紫色晶体，强氧化剂，可以消毒！', icon: '💜' },

    // 有机物
    { id: 'ch4', name: '甲烷泡泡', formula: 'CH₄', type: 'organic', rarity: 1, atk: 18, hp: 38, def: 10, skill: '沼气爆炸', skillDesc: '火系攻击时伤害翻倍', voice: '我是沼气的主要成分，小心明火！', icon: '🫧' },
    { id: 'c2h4', name: '乙烯舞者', formula: 'C₂H₄', type: 'organic', rarity: 2, atk: 22, hp: 40, def: 12, skill: '催熟果实', skillDesc: '战斗后获得额外奖励', voice: '我可以催熟水果，让果实更快成熟！', icon: '💃' },
    { id: 'c6h6', name: '苯环大师', formula: 'C₆H₆', type: 'organic', rarity: 3, atk: 25, hp: 45, def: 18, skill: '芳香迷醉', skillDesc: '有概率使敌人沉睡', voice: '我是芳香烃的代表，结构很稳定！', icon: '🧘' },
    { id: 'c2h5oh', name: '乙醇醉仙', formula: 'C₂H₅OH', type: 'organic', rarity: 2, atk: 20, hp: 42, def: 14, skill: '醉酒狂暴', skillDesc: '生命值越低攻击力越高', voice: '我是酒精，可以消毒也可以让人醉倒！', icon: '🍺' },
    { id: 'ch3cooh', name: '乙酸醋坛子', formula: 'CH₃COOH', type: 'organic', rarity: 2, atk: 18, hp: 40, def: 16, skill: '醋酸腐蚀', skillDesc: '降低敌人防御', voice: '我是醋的主要成分，酸溜溜的！', icon: '🍶' },
    { id: 'c6h12o6', name: '葡萄糖甜心', formula: 'C₆H₁₂O₆', type: 'organic', rarity: 3, atk: 16, hp: 48, def: 20, skill: '能量补给', skillDesc: '每回合恢复生命值', voice: '我是能量的来源，运动前补充我！', icon: '🍬' },
    { id: 'dna', name: 'DNA螺旋', formula: 'DNA', type: 'organic', rarity: 5, atk: 40, hp: 55, def: 25, skill: '遗传密码', skillDesc: '复制一个队友的技能', voice: '我携带生命的密码，是遗传信息的载体！', icon: '🧬' },

    // 特殊
    { id: 'cl2', name: '氯气怪', formula: 'Cl₂', type: 'special', rarity: 2, atk: 26, hp: 38, def: 12, skill: '黄绿毒雾', skillDesc: '攻击附带中毒效果', voice: '我是黄绿色气体，有毒但可以用来消毒！', icon: '☠️', evolveTo: 'hcl', evolveCond: '溶于水战斗3次' },
    { id: 'f2', name: '氟气女皇', formula: 'F₂', type: 'special', rarity: 4, atk: 38, hp: 35, def: 12, skill: '最强氧化', skillDesc: '攻击无视敌人50%防御', voice: '我是最强的氧化剂，谁都不服！', icon: '👸' },
    { id: 'o3', name: '臭氧卫士', formula: 'O₃', type: 'special', rarity: 3, atk: 24, hp: 42, def: 18, skill: '紫外线盾', skillDesc: '免疫光系伤害', voice: '我在高空保护地球，吸收紫外线！', icon: '🌍' },
    { id: 'h2o2', name: '双氧水医生', formula: 'H₂O₂', type: 'special', rarity: 2, atk: 20, hp: 40, def: 14, skill: '消毒杀菌', skillDesc: '攻击有概率净化队友异常状态', voice: '我分解产生氧气，可以消毒伤口！', icon: '👨‍⚕️' },
    { id: 'c60', name: '富勒烯球', formula: 'C₆₀', type: 'special', rarity: 5, atk: 35, hp: 50, def: 30, skill: '足球结构', skillDesc: '受到物理伤害减半', voice: '我是足球状的碳分子，纳米材料的新星！', icon: '⚽' },

    // ===== 新增宠物（扩充到60+）=====

    // 单质 - 金属（新增5种）
    { id: 'li', name: '锂电车', formula: 'Li', type: 'metal', rarity: 2, atk: 24, hp: 40, def: 12, skill: '电池充能', skillDesc: '战斗开始时攻击力提升30%', voice: '我是锂电池的核心，给手机供电！', icon: '🔋' },
    { id: 'pb', name: '铅球王', formula: 'Pb', type: 'metal', rarity: 2, atk: 20, hp: 60, def: 25, skill: '重金属压制', skillDesc: '降低敌人速度', voice: '我很重，但我很稳定，防辐射！', icon: '🏋️' },
    { id: 'hg', name: '水银刺客', formula: 'Hg', type: 'metal', rarity: 3, atk: 30, hp: 35, def: 10, skill: '液态闪避', skillDesc: '闪避率提升50%', voice: '我是唯一液态金属，来无影去无踪！', icon: '🥷' },
    { id: 'sn', name: '锡纸侠', formula: 'Sn', type: 'metal', rarity: 1, atk: 16, hp: 45, def: 16, skill: '低温脆化', skillDesc: '寒冷环境下攻击力翻倍', voice: '我是锡纸，包烧烤、包糖果都靠我！', icon: '🦸‍♂️' },
    { id: 'pt', name: '铂金贵族', formula: 'Pt', type: 'metal', rarity: 4, atk: 32, hp: 55, def: 22, skill: '催化加速', skillDesc: '全队攻击速度提升', voice: '我是催化剂之王，化学反应因我加速！', icon: '💎' },

    // 单质 - 非金属（新增2种）
    { id: 'n2', name: '氮气忍者', formula: 'N₂', type: 'nonmetal', rarity: 2, atk: 18, hp: 48, def: 20, skill: '氮气护盾', skillDesc: '受到攻击时概率免疫', voice: '空气里78%都是我，但你抓不到我！', icon: '🥷' },
    { id: 'i2', name: '碘酒医师', formula: 'I₂', type: 'nonmetal', rarity: 2, atk: 22, hp: 38, def: 14, skill: '消毒紫晶', skillDesc: '攻击附带减速效果', voice: '我是紫黑色晶体，消毒伤口的好帮手！', icon: '💜' },

    // 稀有气体（新增2种）
    { id: 'kr', name: '氪金战士', formula: 'Kr', type: 'noble', rarity: 3, atk: 20, hp: 45, def: 25, skill: '氪金闪光', skillDesc: '攻击时概率致盲敌人', voice: '氪金使我变强！闪瞎你的眼！', icon: '💰' },
    { id: 'xe', name: '氙气大灯', formula: 'Xe', type: 'noble', rarity: 4, atk: 22, hp: 42, def: 20, skill: '强光照射', skillDesc: '降低敌人命中率并造成持续伤害', voice: '我是汽车大灯的核心，照亮前路！', icon: '🔦' },

    // 氧化物（新增3种）
    { id: 'sio2', name: '石英水晶', formula: 'SiO₂', type: 'oxide', rarity: 3, atk: 20, hp: 58, def: 28, skill: '水晶护盾', skillDesc: '受到物理伤害大幅降低', voice: '我是石英，手表里的振荡器就是我！', icon: '💎' },
    { id: 'so2', name: '二氧化硫怪', formula: 'SO₂', type: 'oxide', rarity: 2, atk: 24, hp: 38, def: 12, skill: '酸雨腐蚀', skillDesc: '攻击降低敌人防御并持续掉血', voice: '我是酸雨的元凶之一，刺鼻的气味！', icon: '🌧️' },
    { id: 'no2', name: '红棕恶魔', formula: 'NO₂', type: 'oxide', rarity: 3, atk: 28, hp: 36, def: 10, skill: '毒气蔓延', skillDesc: '攻击附带中毒和减速', voice: '我是红棕色气体，有毒但可以做肥料！', icon: '👿' },

    // 酸（新增2种）
    { id: 'h3po4', name: '磷酸农夫', formula: 'H₃PO₄', type: 'acid', rarity: 2, atk: 22, hp: 45, def: 16, skill: '肥料滋养', skillDesc: '每回合恢复少量生命', voice: '我是磷肥的主要成分，庄稼离不开我！', icon: '👨‍🌾' },
    { id: 'hf', name: '氢氟酸刺客', formula: 'HF', type: 'acid', rarity: 4, atk: 36, hp: 32, def: 8, skill: '玻璃腐蚀', skillDesc: '攻击无视敌人80%防御', voice: '我能腐蚀玻璃，小心别碰我！', icon: '🗡️' },

    // 碱（新增2种）
    { id: 'koh', name: '氢氧化钾法师', formula: 'KOH', type: 'base', rarity: 3, atk: 26, hp: 42, def: 13, skill: '强碱风暴', skillDesc: '攻击时概率造成范围伤害', voice: '我比氢氧化钠还强，别惹我！', icon: '🧙' },
    { id: 'na2co3', name: '纯碱商人', formula: 'Na₂CO₃', type: 'base', rarity: 2, atk: 18, hp: 48, def: 18, skill: '碱性中和', skillDesc: '受到酸攻击时大幅恢复生命', voice: '我是纯碱，做馒头、洗玻璃都有我！', icon: '🧑‍💼' },

    // 盐（新增3种）
    { id: 'agcl', name: '氯化银摄影师', formula: 'AgCl', type: 'salt', rarity: 3, atk: 20, hp: 40, def: 20, skill: '感光曝光', skillDesc: '攻击时概率使敌人失明', voice: '我遇光变黑，胶卷摄影的核心！', icon: '📷' },
    { id: 'baso4', name: '硫酸钡医生', formula: 'BaSO₄', type: 'salt', rarity: 2, atk: 16, hp: 55, def: 26, skill: 'X光透视', skillDesc: '看穿敌人弱点，提升暴击率', voice: '我是钡餐，做X光检查要喝我！', icon: '🩺' },
    { id: 'feso4', name: '硫酸亚铁绿晶', formula: 'FeSO₄', type: 'salt', rarity: 2, atk: 20, hp: 46, def: 17, skill: '补血补铁', skillDesc: '攻击时概率恢复自身生命', voice: '我是浅绿色晶体，补铁剂的主要成分！', icon: '💚' },

    // 有机物（新增3种）
    { id: 'c3h8', name: '丙烷厨师', formula: 'C₃H₈', type: 'organic', rarity: 2, atk: 24, hp: 36, def: 10, skill: '火焰喷射', skillDesc: '火系攻击时伤害翻倍', voice: '我是液化气的主要成分，烧烤必备！', icon: '👨‍🍳' },
    { id: 'c8h10n4o2', name: '咖啡因精灵', formula: 'C₈H₁₀N₄O₂', type: 'organic', rarity: 3, atk: 26, hp: 38, def: 12, skill: '提神醒脑', skillDesc: '战斗开始时全队速度提升', voice: '我是咖啡因，让你精神百倍！', icon: '☕' },
    { id: 'c27h46o', name: '胆固醇大叔', formula: 'C₂₇H₄₆O', type: 'organic', rarity: 2, atk: 14, hp: 65, def: 28, skill: '脂肪护盾', skillDesc: '生命值上限提升，受到的伤害降低', voice: '我是胆固醇，细胞膜需要我，但别太多！', icon: '🍔' },

    // 特殊（新增3种）
    { id: 'tnt', name: 'TNT爆破手', formula: 'C₇H₅N₃O₆', type: 'special', rarity: 4, atk: 42, hp: 30, def: 8, skill: '大爆炸', skillDesc: '生命值低于25%时自爆造成毁灭伤害', voice: '我一点就炸，威力巨大！', icon: '💣' },
    { id: 'nano', name: '纳米机器人', formula: 'Nano', type: 'special', rarity: 5, atk: 30, hp: 45, def: 35, skill: '纳米修复', skillDesc: '每回合大幅恢复生命并清除异常', voice: '我是纳米科技的未来，微观世界的王者！', icon: '🤖' },
    { id: 'graphene', name: '石墨烯侠', formula: 'Graphene', type: 'special', rarity: 4, atk: 28, hp: 48, def: 30, skill: '二维防御', skillDesc: '受到的所有伤害大幅降低', voice: '我是最薄最强的材料，诺贝尔奖得主！', icon: '🛡️' },
  ];

  // 按稀有度分组
  const PETS_BY_RARITY = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  PET_DB.forEach(function(p) {
    if (PETS_BY_RARITY[p.rarity]) PETS_BY_RARITY[p.rarity].push(p);
  });

  // ===== 炼丹配置 =====
  const ALCHEMY_CONFIG = {
    furnaces: [
      { id: 'mortal', name: '凡火丹炉', cost: 10, color: '#94a3b8', desc: '新手炉，产出普通宠物', weights: [50, 35, 12, 3, 0] },
      { id: 'earth', name: '地火丹炉', cost: 30, color: '#6ee7b7', desc: '中级炉，产出稀有宠物', weights: [30, 40, 22, 7, 1] },
      { id: 'sky', name: '天火丹炉', cost: 60, color: '#67e8f9', desc: '高级炉，产出史诗宠物', weights: [15, 30, 35, 16, 4] },
      { id: 'samadhi', name: '三昧真火', cost: 100, color: '#a78bfa', desc: '顶级炉，产出传说宠物', weights: [5, 20, 35, 30, 10] },
      { id: 'chaos', name: '混沌神火', cost: 200, color: '#f0c040', desc: '至尊炉，产出神话宠物', weights: [0, 10, 25, 40, 25] },
    ],
    dailyLimit: 10,
    cooldownMs: 3000,
    dailyElement: ['fire', 'water', 'metal', 'wood', 'earth', 'light', 'dark'],
    elementBonus: 0.2,
  };

  // ===== 工具函数 =====
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

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function getPetDef(petId) {
    for (var i = 0; i < PET_DB.length; i++) {
      if (PET_DB[i].id === petId) return PET_DB[i];
    }
    return null;
  }

  // ===== 炼丹师等级 =====
  function getAlchemistLevel(exp) {
    var levels = [
      { lv: 1, name: '炼丹学徒', minExp: 0 },
      { lv: 2, name: '炼丹师', minExp: 100 },
      { lv: 3, name: '炼丹大师', minExp: 300 },
      { lv: 4, name: '炼丹宗师', minExp: 600 },
      { lv: 5, name: '丹圣', minExp: 1000 },
      { lv: 6, name: '丹神', minExp: 2000 },
    ];
    var info = levels[0];
    for (var i = levels.length - 1; i >= 0; i--) {
      if (exp >= levels[i].minExp) { info = levels[i]; break; }
    }
    return info;
  }

  // ===== 核心API =====
  var api = {
    getPetDB: function() { return PET_DB; },
    getPetById: getPetDef,
    getPetsByRarity: function(rarity) { return PETS_BY_RARITY[rarity] || []; },
    getAlchemyConfig: function() { return ALCHEMY_CONFIG; },

    getAlchemistInfo: function() {
      var s = load();
      if (!s) return null;
      var exp = s.alchemyExp || 0;
      var lv = getAlchemistLevel(exp);
      return {
        level: lv,
        exp: exp,
        totalCount: s.alchemyTotalCount || 0,
        todayCount: s.alchemyDailyCount || 0,
        dailyLimit: ALCHEMY_CONFIG.dailyLimit,
        lastDate: s.alchemyLastDate || ''
      };
    },

    getDailyElement: function() {
      var today = todayStr();
      var hash = 0;
      for (var i = 0; i < today.length; i++) hash = ((hash << 5) - hash) + today.charCodeAt(i);
      var idx = Math.abs(hash) % ALCHEMY_CONFIG.dailyElement.length;
      return ALCHEMY_CONFIG.dailyElement[idx];
    },

    getElementTypeMap: function() {
      return {
        fire: ['oxide', 'special'],
        water: ['base', 'salt'],
        metal: ['metal'],
        wood: ['organic'],
        earth: ['nonmetal', 'noble'],
        light: ['noble', 'special'],
        dark: ['acid', 'special']
      };
    },

    alchemy: function(furnaceId) {
      var s = load();
      if (!s) return { ok: false, msg: '存档异常' };

      var furnace = null;
      for (var i = 0; i < ALCHEMY_CONFIG.furnaces.length; i++) {
        if (ALCHEMY_CONFIG.furnaces[i].id === furnaceId) { furnace = ALCHEMY_CONFIG.furnaces[i]; break; }
      }
      if (!furnace) return { ok: false, msg: '丹炉不存在' };

      if ((s.score || 0) < furnace.cost) {
        return { ok: false, msg: '积分不足！需要 ' + furnace.cost + ' 积分，当前 ' + (s.score || 0) };
      }

      var today = todayStr();
      if (s.alchemyLastDate !== today) {
        s.alchemyDailyCount = 0;
        s.alchemyLastDate = today;
      }
      if ((s.alchemyDailyCount || 0) >= ALCHEMY_CONFIG.dailyLimit) {
        return { ok: false, msg: '今日炼丹次数已达上限（' + ALCHEMY_CONFIG.dailyLimit + '次），明天再来吧！' };
      }

      s.score -= furnace.cost;

      var weights = furnace.weights.slice();
      var r = Math.random();
      var rarity = 1;
      var cumulative = 0;
      for (var ri = 0; ri < weights.length; ri++) {
        cumulative += weights[ri] / 100;
        if (r < cumulative) { rarity = ri + 1; break; }
      }

      var pool = PETS_BY_RARITY[rarity];
      if (!pool || pool.length === 0) return { ok: false, msg: '该品级无可用宠物' };
      var pet = pool[Math.floor(Math.random() * pool.length)];

      if (!s.petCollection) s.petCollection = {};
      var isNew = !s.petCollection[pet.id];

      if (!s.pets) s.pets = [];
      s.pets.push({
        petId: pet.id,
        rarity: rarity,
        date: today,
        isNew: isNew,
        furnace: furnaceId
      });

      if (!s.petCollection[pet.id]) {
        s.petCollection[pet.id] = { count: 0, firstDate: today };
      }
      s.petCollection[pet.id].count++;

      s.alchemyDailyCount = (s.alchemyDailyCount || 0) + 1;
      s.alchemyTotalCount = (s.alchemyTotalCount || 0) + 1;
      s.alchemyExp = (s.alchemyExp || 0) + furnace.cost;

      save(s);

      var dailyElem = this.getDailyElement();
      var typeMap = this.getElementTypeMap();

      return {
        ok: true,
        pet: pet,
        rarity: rarity,
        isNew: isNew,
        cost: furnace.cost,
        remainingScore: s.score,
        todayCount: s.alchemyDailyCount,
        dailyElement: dailyElem,
        bonusTypes: typeMap[dailyElem] || []
      };
    },

    getMyPets: function() {
      var s = load();
      if (!s) return [];
      var collection = s.petCollection || {};
      var result = [];
      for (var petId in collection) {
        var def = getPetDef(petId);
        if (def) {
          result.push({
            id: petId,
            def: def,
            count: collection[petId].count,
            firstDate: collection[petId].firstDate
          });
        }
      }
      return result.sort(function(a, b) { return b.def.rarity - a.def.rarity; });
    },

    getCollectionStats: function() {
      var s = load();
      if (!s) return { total: 0, unique: 0, byRarity: {} };
      var collection = s.petCollection || {};
      var stats = { total: 0, unique: 0, byRarity: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      for (var id in collection) {
        stats.total += collection[id].count;
        stats.unique++;
        var def = getPetDef(id);
        if (def) stats.byRarity[def.rarity] = (stats.byRarity[def.rarity] || 0) + 1;
      }
      return stats;
    },

    dismantlePet: function(petId, count) {
      count = count || 1;
      var s = load();
      if (!s || !s.petCollection || !s.petCollection[petId]) {
        return { ok: false, msg: '没有该宠物' };
      }
      var def = getPetDef(petId);
      if (!def) return { ok: false, msg: '宠物不存在' };

      var owned = s.petCollection[petId].count;
      if (owned <= 1) return { ok: false, msg: '至少需要保留1只' };
      if (count >= owned) count = owned - 1;

      var points = def.rarity * 10 * count;
      s.petCollection[petId].count -= count;
      if (s.petCollection[petId].count <= 0) delete s.petCollection[petId];
      s.score = (s.score || 0) + points;
      save(s);

      return { ok: true, points: points, remaining: s.petCollection[petId] ? s.petCollection[petId].count : 0 };
    },

    synthesize: function(petIds) {
      var s = load();
      if (!s || !s.petCollection) return { ok: false, msg: '存档异常' };

      var rarity = null;
      for (var i = 0; i < petIds.length; i++) {
        var def = getPetDef(petIds[i]);
        if (!def) return { ok: false, msg: '宠物不存在: ' + petIds[i] };
        if (!s.petCollection[petIds[i]] || s.petCollection[petIds[i]].count < 1) {
          return { ok: false, msg: '没有该宠物: ' + petIds[i] };
        }
        if (rarity === null) rarity = def.rarity;
        else if (rarity !== def.rarity) return { ok: false, msg: '必须是同品级宠物' };
      }

      if (rarity >= 5) return { ok: false, msg: '神话宠物已是最高品级' };

      for (var j = 0; j < petIds.length; j++) {
        s.petCollection[petIds[j]].count--;
        if (s.petCollection[petIds[j]].count <= 0) delete s.petCollection[petIds[j]];
      }

      var targetRarity = rarity + 1;
      var pool = PETS_BY_RARITY[targetRarity];
      if (!pool || pool.length === 0) return { ok: false, msg: '目标品级无可用宠物' };
      var newPet = pool[Math.floor(Math.random() * pool.length)];

      if (!s.petCollection[newPet.id]) s.petCollection[newPet.id] = { count: 0, firstDate: todayStr() };
      s.petCollection[newPet.id].count++;
      save(s);

      return { ok: true, newPet: newPet, rarity: targetRarity };
    },

    getScore: function() {
      var s = load();
      return s ? (s.score || 0) : 0;
    },

    addScore: function(points) {
      var s = load();
      if (!s) return { ok: false };
      s.score = (s.score || 0) + points;
      save(s);
      return { ok: true, score: s.score };
    },

    // ===== 宠物进化系统 =====
    getEvolutionChain: function(petId) {
      var def = getPetDef(petId);
      if (!def) return null;
      var chain = { current: def, prev: null, next: null };
      if (def.evolveFrom) {
        chain.prev = getPetDef(def.evolveFrom);
      }
      if (def.evolveTo) {
        chain.next = getPetDef(def.evolveTo);
      }
      return chain;
    },

    canEvolve: function(petId) {
      var def = getPetDef(petId);
      if (!def || !def.evolveTo) return { can: false, msg: '该宠物无法进化' };
      var s = load();
      if (!s || !s.petCollection || !s.petCollection[petId]) {
        return { can: false, msg: '没有该宠物' };
      }
      var owned = s.petCollection[petId].count;
      if (owned < 3) return { can: false, msg: '需要3只相同的宠物才能进化' };

      var nextDef = getPetDef(def.evolveTo);
      if (!nextDef) return { can: false, msg: '进化目标不存在' };

      var evolveCost = def.rarity * 50;
      if ((s.score || 0) < evolveCost) {
        return { can: false, msg: '积分不足，需要 ' + evolveCost + ' 积分' };
      }

      return {
        can: true,
        from: def,
        to: nextDef,
        cost: evolveCost,
        owned: owned
      };
    },

    evolve: function(petId) {
      var check = this.canEvolve(petId);
      if (!check.can) return { ok: false, msg: check.msg };

      var s = load();
      var def = getPetDef(petId);
      var nextDef = getPetDef(def.evolveTo);

      // 消耗3只宠物
      s.petCollection[petId].count -= 3;
      if (s.petCollection[petId].count <= 0) delete s.petCollection[petId];

      // 消耗积分
      s.score -= check.cost;

      // 获得进化后宠物
      if (!s.petCollection[nextDef.id]) {
        s.petCollection[nextDef.id] = { count: 0, firstDate: todayStr() };
      }
      s.petCollection[nextDef.id].count++;

      // 记录进化次数
      if (!s.evolveCount) s.evolveCount = 0;
      s.evolveCount++;

      save(s);

      return {
        ok: true,
        from: def,
        to: nextDef,
        cost: check.cost,
        remainingScore: s.score
      };
    },

    getEvolveStats: function() {
      var s = load();
      if (!s) return { count: 0 };
      return { count: s.evolveCount || 0 };
    }
  };

  return api;
})();
