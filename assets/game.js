/**
 * game.js — 化学不难学 游戏化引擎 v1.0
 * 纯前端 localStorage 实现，无需后端
 */

const HXBNX_GAME = (function () {

    // ===== 等级配置 =====
    const LEVELS = [
        { lv: 1,  name: '初入江湖',  minExp: 0    },
        { lv: 2,  name: '炼气初阶',  minExp: 50   },
        { lv: 3,  name: '炼气中阶',  minExp: 120  },
        { lv: 4,  name: '炼气大成',  minExp: 210  },
        { lv: 5,  name: '筑基初阶',  minExp: 320  },
        { lv: 6,  name: '筑基中阶',  minExp: 450  },
        { lv: 7,  name: '筑基大成',  minExp: 600  },
        { lv: 8,  name: '金丹初阶',  minExp: 780  },
        { lv: 9,  name: '金丹中阶',  minExp: 980  },
        { lv: 10, name: '金丹大成',  minExp: 1200 },
        { lv: 11, name: '元婴初阶',  minExp: 1450 },
        { lv: 12, name: '元婴中阶',  minExp: 1730 },
        { lv: 13, name: '元婴大成',  minExp: 2040 },
        { lv: 14, name: '化神初阶',  minExp: 2380 },
        { lv: 15, name: '化神中阶',  minExp: 2760 },
        { lv: 16, name: '化神大成',  minExp: 3180 },
        { lv: 17, name: '炼虚初阶',  minExp: 3640 },
        { lv: 18, name: '炼虚中阶',  minExp: 4150 },
        { lv: 19, name: '炼虚大成',  minExp: 4710 },
        { lv: 20, name: '合体初阶',  minExp: 5330 },
        { lv: 21, name: '合体中阶',  minExp: 6010 },
        { lv: 22, name: '合体大成',  minExp: 6760 },
        { lv: 23, name: '大乘初阶',  minExp: 7580 },
        { lv: 24, name: '大乘中阶',  minExp: 8480 },
        { lv: 25, name: '大乘大成',  minExp: 9460 },
        { lv: 26, name: '渡劫初阶',  minExp: 10530},
        { lv: 27, name: '渡劫中阶',  minExp: 11700},
        { lv: 28, name: '渡劫大成',  minExp: 12980},
        { lv: 29, name: '飞升境',    minExp: 14380},
        { lv: 30, name: '元素之主',  minExp: 16000},
    ];

    // ===== 成就配置 =====
    // tier: 'bronze'铜 / 'silver'银 / 'gold'金 / 'diamond'钻 / 'legendary'传说
    // 隐藏成就: hidden=true, 在解锁前只显示???
    const ACHIEVEMENTS = [
        // ===== 铜级：入门引导（10-30 EXP）=====
        { id: 'first_step',   name: '初入江湖',   desc: '完成第一个练功房',                icon: '⚗️',  exp: 10,  tier: 'bronze',   check: s => s.completedTopics.length >= 1 },
        { id: 'first_quiz',   name: '初试锋芒',   desc: '首次答题通关',                    icon: '🗡️',  exp: 10,  tier: 'bronze',   check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].passed)n++;} return n>=1; } },
        { id: 'quiz5',        name: '小试牛刀',   desc: '通关5个练功房答题',               icon: '📝',  exp: 20,  tier: 'bronze',   check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].passed)n++;} return n>=5; } },
        { id: 'quiz10',       name: '勤修苦练',   desc: '通关10个练功房答题',              icon: '💪',  exp: 30,  tier: 'bronze',   check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].passed)n++;} return n>=10; } },
        { id: 'exam_start',   name: '踏入训练场', desc: '在试炼之塔查看第一道真题',        icon: '🏹',  exp: 10,  tier: 'bronze',   check: s => s.viewedExams >= 1 },
        { id: 'combo3',       name: '三昧真火',   desc: '连续打卡3天',                     icon: '🔥',  exp: 15,  tier: 'bronze',   check: s => s.maxStreak >= 3 },
        { id: 'exp100',       name: '聚气初成',   desc: '累计经验值达到100',               icon: '💨',  exp: 15,  tier: 'bronze',   check: s => s.totalExp >= 100 },
        { id: 'wrong_first',  name: '初尝败绩',   desc: '第一次答错收入错题本',            icon: '💧',  exp: 5,   tier: 'bronze',   check: s => (s.wrongQuestions || []).length >= 1 },
        { id: 'export',       name: '传承有序',   desc: '导出过存档',                      icon: '📦',  exp: 5,   tier: 'bronze',   check: s => s.hasExported === true },

        // ===== 银级：稳步提升（30-80 EXP）=====
        { id: 'perfect5',     name: '五连绝杀',   desc: '5次一次答对',                     icon: '🎯',  exp: 30,  tier: 'silver',   check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].attempts===1&&s.quizResults[k].passed)n++;} return n>=5; } },
        { id: 'combo7',       name: '七日炼丹',   desc: '连续打卡7天',                     icon: '🔥',  exp: 50,  tier: 'silver',   check: s => s.maxStreak >= 7 },
        { id: 'quiz20',       name: '百步穿杨',   desc: '通关20个练功房答题',              icon: '🏹',  exp: 50,  tier: 'silver',   check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].passed)n++;} return n>=20; } },
        { id: 'half_way',     name: '半途不废',   desc: '完成34个练功房',                  icon: '⚡',  exp: 60,  tier: 'silver',   check: s => s.completedTopics.length >= 34 },
        { id: 'wrong5',       name: '败而不馁',   desc: '收藏5道错题',                     icon: '📖',  exp: 15,  tier: 'silver',   check: s => (s.wrongQuestions || []).length >= 5 },
        { id: 'wrong_clear5', name: '亡羊补牢',   desc: '从错题本移除5道已掌握的题',       icon: '✨',  exp: 30,  tier: 'silver',   check: s => (s.clearedWrong || 0) >= 5 },
        { id: 'exam10',       name: '百战老兵',   desc: '查看10道以上真题',                icon: '🛡️',  exp: 50,  tier: 'silver',   check: s => s.viewedExams >= 10 },
        { id: 'exp500',       name: '灵气充盈',   desc: '累计经验值达到500',               icon: '🔮',  exp: 40,  tier: 'silver',   check: s => s.totalExp >= 500 },
        { id: 'no_wrong_10',  name: '十面埋伏',   desc: '连续10题一次答对（无错题）',      icon: '🏅',  exp: 60,  tier: 'silver',   check: s => { var c=0,mx=0; var ks=Object.keys(s.quizResults||{}).sort(); for(var i=0;i<ks.length;i++){var q=s.quizResults[ks[i]]; if(q.attempts===1&&q.passed){c++;if(c>mx)mx=c;}else{c=0;}} return mx>=10; } },
        { id: 'wrong_clear10',name: '知耻后勇',   desc: '从错题本移除10道已掌握的题',      icon: '💫',  exp: 50,  tier: 'silver',   check: s => (s.clearedWrong || 0) >= 10 },

        // ===== 金级：实力证明（80-200 EXP）=====
        { id: 'perfect15',    name: '弹无虚发',   desc: '15次一次答对',                    icon: '🎖️',  exp: 80,  tier: 'gold',     check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].attempts===1&&s.quizResults[k].passed)n++;} return n>=15; } },
        { id: 'combo14',      name: '半月修炼',   desc: '连续打卡14天',                    icon: '🌙',  exp: 100, tier: 'gold',     check: s => s.maxStreak >= 14 },
        { id: 'wrong20',      name: '知错能改',   desc: '收藏20道错题',                    icon: '📚',  exp: 40,  tier: 'gold',     check: s => (s.wrongQuestions || []).length >= 20 },
        { id: 'wrong_clear20',name: '浴火重生',   desc: '从错题本移除20道已掌握的题',      icon: '🦅',  exp: 80,  tier: 'gold',     check: s => (s.clearedWrong || 0) >= 20 },
        { id: 'quiz30',       name: '炉火纯青',   desc: '通关30个练功房答题',              icon: '🔥',  exp: 100, tier: 'gold',     check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].passed)n++;} return n>=30; } },
        { id: 'exp2000',      name: '金丹初成',   desc: '累计经验值达到2000',              icon: '💊',  exp: 100, tier: 'gold',     check: s => s.totalExp >= 2000 },
        { id: 'exam30',       name: '沙场老将',   desc: '查看30道以上真题',                icon: '⚔️',  exp: 80,  tier: 'gold',     check: s => s.viewedExams >= 30 },
        { id: 'combo30',      name: '月圆炼金',   desc: '连续打卡30天',                    icon: '🌕',  exp: 200, tier: 'gold',     check: s => s.maxStreak >= 30 },

        // ===== 钻级：高阶挑战（200-500 EXP）=====
        { id: 'perfect30',    name: '百发百中',   desc: '30次一次答对',                    icon: '💎',  exp: 200, tier: 'diamond',  check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].attempts===1&&s.quizResults[k].passed)n++;} return n>=30; } },
        { id: 'all_topics',   name: '通关大师',   desc: '完成全部67个练功房',              icon: '👑',  exp: 500, tier: 'diamond',  check: s => s.completedTopics.length >= 67 },
        { id: 'exp5000',      name: '元婴大成',   desc: '累计经验值达到5000',              icon: '🌀',  exp: 300, tier: 'diamond',  check: s => s.totalExp >= 5000 },
        { id: 'wrong_clear50',name: '脱胎换骨',   desc: '从错题本移除50道已掌握的题',      icon: '🦋',  exp: 200, tier: 'diamond',  check: s => (s.clearedWrong || 0) >= 50 },
        { id: 'exam100',      name: '身经百战',   desc: '查看100道以上真题',               icon: '🏛️',  exp: 200, tier: 'diamond',  check: s => s.viewedExams >= 100 },
        { id: 'no_wrong_30',  name: '三十天罡',   desc: '连续30题一次答对',                icon: '⭐',  exp: 300, tier: 'diamond',  check: s => { var c=0,mx=0; var ks=Object.keys(s.quizResults||{}).sort(); for(var i=0;i<ks.length;i++){var q=s.quizResults[ks[i]]; if(q.attempts===1&&q.passed){c++;if(c>mx)mx=c;}else{c=0;}} return mx>=30; } },

        // ===== 传说级：终极徽章（1000+ EXP）=====
        { id: 'exp10000',     name: '大道至简',   desc: '累计经验值超过10000',             icon: '🌟',  exp: 1000,tier: 'legendary', check: s => s.totalExp >= 10000 },
        { id: 'perfect_all',  name: '满分神话',   desc: '所有已答题目全部一次答对',        icon: '🏆',  exp: 2000,tier: 'legendary', hidden: true, check: s => { var t=0,p=0; for(var k in s.quizResults){t++;if(s.quizResults[k].attempts===1&&s.quizResults[k].passed)p++;} return t>=20 && t===p; } },
        { id: 'combo100',     name: '百日筑基',   desc: '连续打卡100天',                   icon: '🏮',  exp: 1000,tier: 'legendary', check: s => s.maxStreak >= 100 },
        { id: 'collector',    name: '收藏大师',   desc: '收藏50道错题并全部移除',          icon: '🗝️',  exp: 1500,tier: 'legendary', check: s => (s.wrongQuestions||[]).length + (s.clearedWrong||0) >= 50 && (s.clearedWrong||0) >= 50 },

        // ===== 元素盲盒成就 =====
        { id: 'elem10',       name: '元素学徒',   desc: '收集10种不同元素卡',              icon: '🔬',  exp: 30,  tier: 'silver',   check: s => (s.elementCards || []).length >= 10 },
        { id: 'elem30',       name: '元素猎人',   desc: '收集30种不同元素卡',              icon: '🔭',  exp: 100, tier: 'gold',     check: s => (s.elementCards || []).length >= 30 },
        { id: 'elem50',       name: '周期表征服者', desc: '收集50种不同元素卡',            icon: '🌌',  exp: 300, tier: 'diamond',  check: s => (s.elementCards || []).length >= 50 },
        { id: 'mythic_elem',  name: '神话降临',   desc: '获得1张⭐⭐⭐⭐⭐传说元素卡',       icon: '💫',  exp: 200, tier: 'legendary', hidden: true, check: s => (s.elementCards || []).some(function(c) { return c.t >= 5; }) },
    ];

    // ===== 存储Key =====
    const KEY = 'hxbnx_game_v1';

    // ===== 默认状态 =====
    function defaultState() {
        return {
            completedTopics: [],  // 已通关的页面文件名 如 ['12.html', 'rd-01.html']
            quizResults: {},      // 答题通关记录 { '12.html': { attempts, exp, passed, choices } }
            checkinDates: [],     // 打卡日期字符串数组 'YYYY-MM-DD'
            currentStreak: 0,
            maxStreak: 0,
            totalExp: 0,
            unlockedAchievements: [],
            viewedExams: 0,
            hasExported: false,
            wrongQuestions: [],    // 错题收藏 [{ filename, topicName, questionText, correctIndex, wrongIndex, date }]
            clearedWrong: 0,       // 已移除的错题计数（用于成就统计）
            elementCards: [],      // 元素卡收藏 [{ s: 'H', t: 1 }, ...]  s=symbol, t=stars
            elementDraws: 0,       // 可用抽卡次数
            lastFreeDrawDate: '',  // 上次免费抽卡日期
            createdAt: new Date().toISOString(),
        };
    }

    // ===== 读写状态 =====
    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return defaultState();
            return Object.assign(defaultState(), JSON.parse(raw));
        } catch (e) {
            return defaultState();
        }
    }

    function save(state) {
        localStorage.setItem(KEY, JSON.stringify(state));
    }

    // ===== 今日日期 =====
    function todayStr() {
        return new Date().toISOString().slice(0, 10);
    }

    // ===== 计算等级 =====
    function calcLevel(exp) {
        let info = LEVELS[0];
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (exp >= LEVELS[i].minExp) { info = LEVELS[i]; break; }
        }
        const nextLv = LEVELS.find(l => l.lv === info.lv + 1);
        const prevExp = info.minExp;
        const nextExp = nextLv ? nextLv.minExp : info.minExp + 9999;
        const progress = nextLv ? Math.round((exp - prevExp) / (nextExp - prevExp) * 100) : 100;
        return { lv: info.lv, name: info.name, progress, currentExp: exp, prevExp, nextExp };
    }

    // ===== 打卡（连续天数） =====
    function updateStreak(state) {
        const today = todayStr();
        if (state.checkinDates.includes(today)) return; // 今天已打卡
        state.checkinDates.push(today);

        // 计算连续天数
        const sorted = state.checkinDates.slice().sort();
        let streak = 1, maxStreak = 1, cur = 1;
        for (let i = 1; i < sorted.length; i++) {
            const diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000;
            if (diff === 1) { cur++; streak = cur; }
            else { cur = 1; }
            if (cur > maxStreak) maxStreak = cur;
        }
        state.currentStreak = streak;
        state.maxStreak = Math.max(state.maxStreak, maxStreak);
    }

    // ===== 检查成就 =====
    function checkAchievements(state) {
        const newlyUnlocked = [];
        for (const ach of ACHIEVEMENTS) {
            if (!state.unlockedAchievements.includes(ach.id) && ach.check(state)) {
                state.unlockedAchievements.push(ach.id);
                state.totalExp += ach.exp;
                newlyUnlocked.push(ach);
            }
        }
        return newlyUnlocked;
    }

    // ===== Toast 通知 =====
    function showToast(msg, type = 'success', duration = 3500) {
        let container = document.getElementById('game-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'game-toast-container';
            container.style.cssText = 'position:fixed;top:72px;right:18px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        const colors = { success: '#10b981', achievement: '#fbbf24', info: '#22d3ee', error: '#ef4444' };
        toast.style.cssText = `background:#0f172a;color:#f1f5f9;border-left:4px solid ${colors[type]||colors.info};
            border-radius:8px;padding:12px 18px;font-size:14px;min-width:200px;max-width:300px;
            box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:slideInRight 0.3s ease;`;
        toast.innerHTML = msg;
        container.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'fadeOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, duration);
    }

    // ===== 公共API =====
    const api = {

        // 获取当前状态摘要（供页面渲染用）
        getStatus() {
            const s = load();
            const lvInfo = calcLevel(s.totalExp);
            return {
                state: s,
                level: lvInfo,
                completedCount: s.completedTopics.length,
                currentStreak: s.currentStreak,
                todayCheckin: s.checkinDates.includes(todayStr()),
                achievementsCount: s.unlockedAchievements.length,
                achievements: ACHIEVEMENTS,
            };
        },

        // 练功房通关打卡
        completeTopic(filename) {
            const s = load();
            if (!s.completedTopics.includes(filename)) {
                s.completedTopics.push(filename);
                s.totalExp += 20;
                updateStreak(s);
                const newAch = checkAchievements(s);
                save(s);
                showToast(`⚔️ <strong>通关！</strong> +20 EXP`, 'success');
                if (newAch.length > 0) {
                    setTimeout(() => {
                        newAch.forEach(a => showToast(`${a.icon} <strong>成就解锁：${a.name}</strong><br><small>${a.desc}</small>`, 'achievement', 5000));
                    }, 1000);
                }
                return true;
            } else {
                showToast(`✅ 本关已通关，继续保持`, 'info');
                return false;
            }
        },

        // 记录查看了真题
        viewExam() {
            const s = load();
            s.viewedExams = (s.viewedExams || 0) + 1;
            const newAch = checkAchievements(s);
            save(s);
            if (newAch.length > 0) {
                newAch.forEach(a => showToast(`${a.icon} <strong>成就解锁：${a.name}</strong>`, 'achievement', 5000));
            }
        },

        // 检查某页是否已通关（旧：打卡制；新：答题 ≥1exp 才算）
        isCompleted(filename) {
            const s = load();
            // 答题制：有 quizResult 且 exp > 0 才算通关
            if (s.quizResults && s.quizResults[filename] && s.quizResults[filename].exp > 0) {
                return true;
            }
            // 兼容旧打卡数据
            return s.completedTopics.includes(filename);
        },

        // ===== 答题通关引擎 =====

        // 提交答案 → 返回 { correct, attempts, exp, newAch[] }
        quizSubmit(filename, choiceIndex, correctIndex) {
            const s = load();
            if (!s.quizResults) s.quizResults = {};

            let qr = s.quizResults[filename] || { attempts: 0, choices: [], passed: false, exp: 0 };
            qr.attempts++;
            qr.choices.push(choiceIndex);

            if (choiceIndex === correctIndex) {
                // 答对了！按尝试次数给 EXP
                qr.passed = true;
                if (qr.attempts === 1)      qr.exp = 20;
                else if (qr.attempts === 2)  qr.exp = 10;
                else if (qr.attempts === 3)  qr.exp = 5;
                else                         qr.exp = 0;

                s.totalExp += qr.exp;
                if (qr.exp > 0 && !s.completedTopics.includes(filename)) {
                    s.completedTopics.push(filename);
                }
                s.elementDraws = (s.elementDraws || 0) + 1;
                updateStreak(s);
                const newAch = checkAchievements(s);
                s.quizResults[filename] = qr;
                save(s);

                // Toast
                const emoji = qr.exp >= 20 ? '🎉' : qr.exp >= 10 ? '👍' : qr.exp >= 5 ? '💪' : '📖';
                let msg = emoji + ' <strong>通关文牒！</strong>';
                if (qr.exp > 0) msg += ' +' + qr.exp + ' EXP（第' + qr.attempts + '次答对）';
                else msg += ' 不计分（第4次答对）';
                showToast(msg, qr.exp > 0 ? 'success' : 'info');
                setTimeout(function() { showToast('🧪 <strong>获得1次元素抽卡机会！</strong>', 'info'); }, 1500);

                if (newAch.length > 0) {
                    setTimeout(function () {
                        newAch.forEach(function (a) {
                            showToast(a.icon + ' <strong>成就解锁：' + a.name + '</strong><br><small>' + a.desc + '</small>', 'achievement', 5000);
                        });
                    }, 1000);
                }

                return { correct: true, attempts: qr.attempts, exp: qr.exp, newAch: newAch };
            } else {
                s.quizResults[filename] = qr;
                save(s);
                return { correct: false, attempts: qr.attempts, remaining: 4 - qr.attempts };
            }
        },

        // ===== 错题收藏夹 =====

        // 添加错题
        addWrongQuestion(data) {
            var s = load();
            if (!s.wrongQuestions) s.wrongQuestions = [];
            // 去重：同文件同题不重复加
            var exists = s.wrongQuestions.some(function(q) {
                return q.filename === data.filename && q.questionText === data.questionText;
            });
            if (!exists) {
                s.wrongQuestions.push({
                    filename: data.filename,
                    topicName: data.topicName || '',
                    questionText: data.questionText || '',
                    options: data.options || [],
                    correctIndex: data.correctIndex,
                    wrongIndex: data.wrongIndex,
                    date: todayStr(),
                });
                var newAch = checkAchievements(s);
                save(s);
                showToast('📖 <strong>已收入错题本</strong>', 'info');
                if (newAch.length > 0) {
                    setTimeout(function() {
                        newAch.forEach(function(a) {
                            showToast(a.icon + ' <strong>成就解锁：' + a.name + '</strong><br><small>' + a.desc + '</small>', 'achievement', 5000);
                        });
                    }, 1000);
                }
            }
        },

        // 获取全部错题
        getWrongQuestions() {
            var s = load();
            return s.wrongQuestions || [];
        },

        // 移除错题（已掌握）
        removeWrongQuestion(index) {
            var s = load();
            if (!s.wrongQuestions) return;
            s.wrongQuestions.splice(index, 1);
            if (!s.clearedWrong) s.clearedWrong = 0;
            s.clearedWrong++;
            var newAch = checkAchievements(s);
            save(s);
            if (newAch.length > 0) {
                newAch.forEach(function(a) {
                    showToast(a.icon + ' <strong>成就解锁：' + a.name + '</strong>', 'achievement', 5000);
                });
            }
        },

        // 获取错题数量
        getWrongCount() {
            var s = load();
            return (s.wrongQuestions || []).length;
        },

        // ===== 元素盲盒抽卡 =====

        // 抽卡（传入元素符号和星级）
        drawElementCard(sym, stars) {
            var s = load();
            if (!s.elementCards) s.elementCards = [];
            if ((s.elementDraws || 0) <= 0) return { ok: false };
            var isNew = !s.elementCards.some(function(c) { return c.s === sym; });
            if (isNew) {
                s.elementCards.push({ s: sym, t: stars });
            } else {
                s.totalExp += 3; // 重复卡补偿
            }
            s.elementDraws = Math.max(0, (s.elementDraws || 0) - 1);
            var newAch = checkAchievements(s);
            save(s);
            return { ok: true, isNew: isNew, newAch: newAch };
        },

        // 获取已收藏元素
        getElementCards() {
            var s = load();
            return s.elementCards || [];
        },

        // 获取可用抽卡次数
        getElementDrawCount() {
            var s = load();
            return s.elementDraws || 0;
        },

        // 每日免费抽卡（每天1次）
        claimFreeDraw() {
            var s = load();
            var today = todayStr();
            if (s.lastFreeDrawDate !== today) {
                s.lastFreeDrawDate = today;
                s.elementDraws = (s.elementDraws || 0) + 1;
                save(s);
                return true;
            }
            return false;
        },

        // 判断练功房是否可进入（按编号，01.html 永远开放）
        canAccessTopic(topicNum) {
            if (topicNum <= 1) return true;
            var s = load();
            var prevNum = topicNum - 1;
            var prevFile = (prevNum < 10 ? '0' : '') + prevNum + '.html';

            // 新答题系统：前一个练功房通关文牒已通过
            if (s.quizResults && s.quizResults[prevFile] && s.quizResults[prevFile].passed) {
                return true;
            }
            // 兼容旧打卡系统数据
            if (s.completedTopics.indexOf(prevFile) !== -1) {
                return true;
            }
            return false;
        },

        // 获取答题结果
        getQuizResult(filename) {
            var s = load();
            return (s.quizResults && s.quizResults[filename]) || null;
        },

        // 导出存档
        exportSave() {
            const s = load();
            s.hasExported = true;
            checkAchievements(s);
            save(s);
            const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `hxbnx_save_${todayStr()}.json`;
            a.click();
            showToast('📦 存档已导出', 'info');
        },

        // 导入存档
        importSave(jsonStr) {
            try {
                const data = JSON.parse(jsonStr);
                save(Object.assign(defaultState(), data));
                showToast('✅ 存档导入成功，刷新页面生效', 'success', 5000);
                return true;
            } catch (e) {
                showToast('❌ 存档格式错误', 'error');
                return false;
            }
        },

        // 渲染进度条（传入容器选择器）
        renderProgressBar(selector) {
            const el = document.querySelector(selector);
            if (!el) return;
            const { level, completedCount, currentStreak, todayCheckin, state } = this.getStatus();
            el.innerHTML = `
                <div class="game-bar">
                    <div class="game-bar-lv">Lv.${level.lv}</div>
                    <div class="game-bar-info">
                        <div class="game-bar-name">${level.name}</div>
                        <div class="game-bar-track">
                            <div class="game-bar-fill" style="width:${level.progress}%"></div>
                        </div>
                        <div class="game-bar-nums">${state.totalExp} / ${level.nextExp} EXP</div>
                    </div>
                    <div class="game-bar-stats">
                        <span class="game-stat" title="已通关练功房">⚔️ ${completedCount}/67</span>
                        <span class="game-stat ${currentStreak > 0 ? 'hot' : ''}" title="连修天数">🔥 ${currentStreak}天</span>
                    </div>
                </div>`;
        },

        // 渲染打卡按钮（传入容器选择器，filename为当前页文件名）
        renderCheckinBtn(selector, filename) {
            const el = document.querySelector(selector);
            if (!el) return;
            const completed = this.isCompleted(filename);
            el.innerHTML = `
                <div class="game-checkin">
                    <button class="game-btn-checkin ${completed ? 'done' : ''}"
                        onclick="HXBNX_GAME.completeTopicAndUpdate('${filename}', this)">
                        ${completed ? '✅ 已通关' : '⚔️ 通关打卡 +20 EXP'}
                    </button>
                    <span class="game-checkin-hint">${completed ? '继续下一讲吧！' : '学完本讲，点击打卡记录战绩'}</span>
                </div>`;
        },

        // 打卡+刷新按钮状态（给renderCheckinBtn中的onclick用）
        completeTopicAndUpdate(filename, btn) {
            const result = this.completeTopic(filename);
            if (result) {
                btn.textContent = '✅ 已通关';
                btn.classList.add('done');
                const hint = btn.nextElementSibling;
                if (hint) hint.textContent = '继续下一讲吧！';
                // 刷新顶部进度条
                this.renderProgressBar('#game-progress-bar');
            }
        },

        LEVELS,
        ACHIEVEMENTS,
    };

    // 注入CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeOut { from { opacity:1; } to { opacity:0; transform:translateX(20px); } }
    `;
    document.head.appendChild(style);

    return api;
})();
