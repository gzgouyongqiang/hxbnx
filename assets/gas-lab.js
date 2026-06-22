/**
 * gas-lab.js — 气体制备工坊
 * 选择目标气体 → 选反应物 → 选条件 → 选装置 → 选除杂 → 选收集 → 选验满
 * 覆盖12种常见气体，含多制法和除杂步骤
 */

const GAS_LAB = (function() {
  const KEY = 'hxbnx_game_v2';

  // ===== 气体数据库（含多制法）=====
  const GASES = [
    {
      id: 'h2', name: '氢气', formula: 'H₂', icon: '💨',
      methods: [
        {
          reactants: 'Zn + 稀H₂SO₄',
          condition: '常温',
          apparatus: '启普发生器（固液不加热）',
          purification: '不需要除杂',
          collection: '向下排空气法 或 排水法',
          test: '点燃，有淡蓝色火焰，罩干冷烧杯有水珠',
          equation: 'Zn + H₂SO₄ = ZnSO₄ + H₂↑'
        },
        {
          reactants: 'Fe + 稀HCl',
          condition: '常温',
          apparatus: '启普发生器（固液不加热）',
          purification: '不需要除杂',
          collection: '向下排空气法 或 排水法',
          test: '点燃，有淡蓝色火焰',
          equation: 'Fe + 2HCl = FeCl₂ + H₂↑'
        }
      ]
    },
    {
      id: 'o2', name: '氧气', formula: 'O₂', icon: '💨',
      methods: [
        {
          reactants: '2KMnO₄',
          condition: '加热',
          apparatus: '固体加热型（试管口略向下倾斜）',
          purification: '不需要除杂',
          collection: '向上排空气法 或 排水法',
          test: '带火星木条复燃',
          equation: '2KMnO₄ △ K₂MnO₄ + MnO₂ + O₂↑'
        },
        {
          reactants: '2KClO₃ + MnO₂',
          condition: '加热（MnO₂催化）',
          apparatus: '固体加热型（试管口略向下倾斜）',
          purification: '不需要除杂',
          collection: '向上排空气法 或 排水法',
          test: '带火星木条复燃',
          equation: '2KClO₃ MnO₂/△ 2KCl + 3O₂↑'
        },
        {
          reactants: '2H₂O₂ + MnO₂',
          condition: '常温（MnO₂催化）',
          apparatus: '固液不加热型（分液漏斗+锥形瓶）',
          purification: '不需要除杂',
          collection: '向上排空气法 或 排水法',
          test: '带火星木条复燃',
          equation: '2H₂O₂ MnO₂ 2H₂O + O₂↑'
        }
      ]
    },
    {
      id: 'co2', name: '二氧化碳', formula: 'CO₂', icon: '💨',
      methods: [
        {
          reactants: 'CaCO₃ + 稀HCl',
          condition: '常温',
          apparatus: '启普发生器（固液不加热）',
          purification: '不需要除杂',
          collection: '向上排空气法',
          test: '燃着木条熄灭，通入澄清石灰水变浑浊',
          equation: 'CaCO₃ + 2HCl = CaCl₂ + H₂O + CO₂↑'
        }
      ]
    },
    {
      id: 'cl2', name: '氯气', formula: 'Cl₂', icon: '💨',
      methods: [
        {
          reactants: 'MnO₂ + 浓HCl',
          condition: '加热',
          apparatus: '固液加热型（圆底烧瓶+分液漏斗）',
          purification: '先通过饱和NaCl溶液除HCl，再通过浓H₂SO₄干燥',
          collection: '向上排空气法（有毒，需尾气处理）',
          test: '湿润淀粉-KI试纸变蓝',
          equation: 'MnO₂ + 4HCl(浓) △ MnCl₂ + Cl₂↑ + 2H₂O'
        },
        {
          reactants: 'KMnO₄ + 浓HCl',
          condition: '常温',
          apparatus: '固液不加热型',
          purification: '先通过饱和NaCl溶液除HCl，再通过浓H₂SO₄干燥',
          collection: '向上排空气法（有毒，需尾气处理）',
          test: '湿润淀粉-KI试纸变蓝',
          equation: '2KMnO₄ + 16HCl(浓) = 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O'
        }
      ]
    },
    {
      id: 'nh3', name: '氨气', formula: 'NH₃', icon: '💨',
      methods: [
        {
          reactants: '2NH₄Cl + Ca(OH)₂',
          condition: '加热',
          apparatus: '固体加热型（试管口略向下倾斜）',
          purification: '不需要除杂',
          collection: '向下排空气法（试管口塞棉花防对流）',
          test: '湿润红色石蕊试纸变蓝',
          equation: '2NH₄Cl + Ca(OH)₂ △ CaCl₂ + 2NH₃↑ + 2H₂O'
        },
        {
          reactants: '浓氨水 + CaO',
          condition: '常温（CaO遇水放热）',
          apparatus: '固液不加热型',
          purification: '不需要除杂',
          collection: '向下排空气法',
          test: '湿润红色石蕊试纸变蓝',
          equation: 'CaO + H₂O = Ca(OH)₂（放热使NH₃逸出）'
        }
      ]
    },
    {
      id: 'so2', name: '二氧化硫', formula: 'SO₂', icon: '💨',
      methods: [
        {
          reactants: 'Na₂SO₃ + 浓H₂SO₄',
          condition: '常温',
          apparatus: '固液不加热型',
          purification: '不需要除杂',
          collection: '向上排空气法（有毒，需尾气处理）',
          test: '通入品红溶液褪色，加热恢复红色',
          equation: 'Na₂SO₃ + H₂SO₄(浓) = Na₂SO₄ + SO₂↑ + H₂O'
        },
        {
          reactants: 'Cu + 浓H₂SO₄',
          condition: '加热',
          apparatus: '固液加热型',
          purification: '不需要除杂',
          collection: '向上排空气法（有毒，需尾气处理）',
          test: '通入品红溶液褪色',
          equation: 'Cu + 2H₂SO₄(浓) △ CuSO₄ + SO₂↑ + 2H₂O'
        }
      ]
    },
    {
      id: 'no', name: '一氧化氮', formula: 'NO', icon: '💨',
      methods: [
        {
          reactants: '3Cu + 稀HNO₃',
          condition: '常温',
          apparatus: '固液不加热型',
          purification: '不需要除杂',
          collection: '排水法（NO与O₂反应，不能用排空气法）',
          test: '无色气体遇空气变红棕色（生成NO₂）',
          equation: '3Cu + 8HNO₃(稀) = 3Cu(NO₃)₂ + 2NO↑ + 4H₂O'
        }
      ]
    },
    {
      id: 'no2', name: '二氧化氮', formula: 'NO₂', icon: '💨',
      methods: [
        {
          reactants: 'Cu + 浓HNO₃',
          condition: '常温',
          apparatus: '固液不加热型',
          purification: '不需要除杂',
          collection: '向上排空气法（有毒，需尾气处理）',
          test: '红棕色气体，通入水中生成HNO₃和NO',
          equation: 'Cu + 4HNO₃(浓) = Cu(NO₃)₂ + 2NO₂↑ + 2H₂O'
        }
      ]
    },
    {
      id: 'h2s', name: '硫化氢', formula: 'H₂S', icon: '💨',
      methods: [
        {
          reactants: 'FeS + 稀H₂SO₄',
          condition: '常温',
          apparatus: '启普发生器（固液不加热）',
          purification: '不需要除杂',
          collection: '向上排空气法（有毒，需尾气处理：NaOH吸收）',
          test: '湿润醋酸铅试纸变黑（PbS）',
          equation: 'FeS + H₂SO₄ = FeSO₄ + H₂S↑'
        }
      ]
    },
    {
      id: 'ch4', name: '甲烷', formula: 'CH₄', icon: '💨',
      methods: [
        {
          reactants: 'CH₃COONa + NaOH',
          condition: '加热（CaO催化）',
          apparatus: '固体加热型（试管口略向下倾斜）',
          purification: '不需要除杂',
          collection: '排水法 或 向下排空气法',
          test: '点燃，淡蓝色火焰，罩干冷烧杯有水珠，倒入澄清石灰水不变浑浊',
          equation: 'CH₃COONa + NaOH CaO/△ Na₂CO₃ + CH₄↑'
        }
      ]
    },
    {
      id: 'c2h4', name: '乙烯', formula: 'C₂H₄', icon: '💨',
      methods: [
        {
          reactants: 'C₂H₅OH + 浓H₂SO₄',
          condition: '170℃（浓H₂SO₄催化脱水）',
          apparatus: '液液加热型（温度计插入液面以下）',
          purification: '先通过NaOH溶液除SO₂/CO₂，再通过浓H₂SO₄干燥',
          collection: '排水法（乙烯密度与空气接近）',
          test: '通入酸性KMnO₄溶液褪色，或通入溴水褪色',
          equation: 'C₂H₅OH 浓H₂SO₄/170℃ C₂H₄↑ + H₂O'
        }
      ]
    },
    {
      id: 'c2h2', name: '乙炔', formula: 'C₂H₂', icon: '💨',
      methods: [
        {
          reactants: 'CaC₂ + H₂O',
          condition: '常温',
          apparatus: '固液不加热型（不能用启普发生器，反应剧烈）',
          purification: '先通过CuSO₄溶液除H₂S/PH₃杂质，再通过浓H₂SO₄干燥',
          collection: '排水法',
          test: '点燃，火焰明亮有浓烟；通入溴水褪色',
          equation: 'CaC₂ + 2H₂O → Ca(OH)₂ + C₂H₂↑'
        }
      ]
    }
  ];

  // ===== 干扰项池 =====
  const DISTRACTORS = {
    reactants: [
      'CaCO₃ + 稀H₂SO₄', 'Na₂CO₃ + 稀HCl', 'Fe + 浓H₂SO₄',
      'Cu + 稀HNO₃', 'Zn + 浓H₂SO₄', 'NaCl + 浓H₂SO₄',
      'NH₄Cl + NaOH', 'Na₂SO₃ + 稀HCl', '乙醇 + 浓HCl',
      '电石 + 饱和食盐水', 'KClO₃', 'H₂O₂ + FeCl₃'
    ],
    condition: [
      '高温', '光照', '加压', '催化剂', '电解', '放电',
      '常温（Fe催化）', '水浴加热', '酒精灯加热'
    ],
    apparatus: [
      '启普发生器（固液不加热）', '固体加热型（试管口略向下倾斜）',
      '固液加热型（圆底烧瓶+分液漏斗）', '固液不加热型（分液漏斗+锥形瓶）',
      '液液加热型（温度计插入液面以下）', '电解槽'
    ],
    purification: [
      '不需要除杂',
      '先通过饱和NaCl溶液除HCl，再通过浓H₂SO₄干燥',
      '先通过NaOH溶液除SO₂/CO₂，再通过浓H₂SO₄干燥',
      '先通过CuSO₄溶液除H₂S/PH₃，再通过浓H₂SO₄干燥',
      '通过浓H₂SO₄干燥',
      '通过碱石灰干燥',
      '通过无水CaCl₂干燥',
      '通过P₂O₅干燥'
    ],
    collection: [
      '向上排空气法', '向下排空气法', '排水法',
      '向上排空气法（有毒，需尾气处理）',
      '向下排空气法（试管口塞棉花防对流）',
      '排水法（NO与O₂反应，不能用排空气法）',
      '排水法（乙烯密度与空气接近）'
    ],
    test: [
      '点燃，有淡蓝色火焰，罩干冷烧杯有水珠',
      '带火星木条复燃',
      '燃着木条熄灭，通入澄清石灰水变浑浊',
      '湿润淀粉-KI试纸变蓝',
      '湿润红色石蕊试纸变蓝',
      '通入品红溶液褪色，加热恢复红色',
      '无色气体遇空气变红棕色（生成NO₂）',
      '红棕色气体，通入水中生成HNO₃和NO',
      '湿润醋酸铅试纸变黑（PbS）',
      '通入酸性KMnO₄溶液褪色，或通入溴水褪色',
      '点燃，火焰明亮有浓烟；通入溴水褪色'
    ]
  };

  var currentGas = null;
  var currentMethod = null;
  var currentStep = 0;
  var userAnswers = {};
  var score = 0;

  // ===== 随机打乱数组 =====
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // ===== 获取随机题目 =====
  function getRandomQuestion() {
    var gas = GASES[Math.floor(Math.random() * GASES.length)];
    var method = gas.methods[Math.floor(Math.random() * gas.methods.length)];
    currentGas = gas;
    currentMethod = method;
    currentStep = 0;
    userAnswers = {};
    score = 0;
    return { gas: gas, method: method };
  }

  // ===== 生成选项（正确答案+干扰项）=====
  function generateOptions(stepKey, correctAnswer) {
    var pool = DISTRACTORS[stepKey] || [];
    var options = [correctAnswer];
    var used = { [correctAnswer]: true };

    // 从干扰项池中随机选3个不重复的
    var shuffled = shuffle(pool);
    for (var i = 0; i < shuffled.length && options.length < 4; i++) {
      if (!used[shuffled[i]]) {
        options.push(shuffled[i]);
        used[shuffled[i]] = true;
      }
    }
    return shuffle(options);
  }

  // ===== 步骤配置 =====
  var STEPS = [
    { key: 'reactants', title: '选择反应物', icon: '🧪', desc: '选择制备该气体的正确反应物' },
    { key: 'condition', title: '选择反应条件', icon: '🔥', desc: '选择正确的反应条件' },
    { key: 'apparatus', title: '选择发生装置', icon: '⚗️', desc: '选择合适的发生装置类型' },
    { key: 'purification', title: '选择除杂/干燥', icon: '🧫', desc: '选择正确的除杂和干燥方法' },
    { key: 'collection', title: '选择收集方法', icon: '📦', desc: '选择合适的收集方法' },
    { key: 'test', title: '选择验满/检验方法', icon: '✅', desc: '选择正确的验满或检验方法' }
  ];

  // ===== 检查答案 =====
  function checkAnswer(stepKey, answer) {
    var correct = currentMethod[stepKey];
    var isCorrect = answer === correct;
    if (isCorrect) score += 3; // 每步3分，全对18分
    return { correct: isCorrect, rightAnswer: correct };
  }

  // ===== 获取当前步骤 =====
  function getCurrentStep() {
    return STEPS[currentStep];
  }

  // ===== 下一步 =====
  function nextStep() {
    if (currentStep + 1 < STEPS.length) {
      currentStep++;
      return true;
    }
    return false;
  }

  // ===== 获取总分 =====
  function getScore() {
    return score;
  }

  // ===== 获取气体列表 =====
  function getGases() {
    return GASES;
  }

  // ===== 获取当前气体 =====
  function getCurrentGas() {
    return currentGas;
  }

  // ===== API =====
  return {
    getRandomQuestion: getRandomQuestion,
    generateOptions: generateOptions,
    checkAnswer: checkAnswer,
    getCurrentStep: getCurrentStep,
    nextStep: nextStep,
    getScore: getScore,
    getGases: getGases,
    getCurrentGas: getCurrentGas,
    STEPS: STEPS
  };
})();
