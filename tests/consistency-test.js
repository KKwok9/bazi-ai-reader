/**
 * /api/chart 一致性校验测试
 * 
 * 目标：验证同一 BirthInfo 多次调用返回的 Chart_Data 完全一致
 * 这是系统级验证，确保不会出现"悄悄错误"
 */

const testCases = [
  {
    name: '测试案例1: 1990年5月15日14:30',
    birthInfo: {
      birthYear: 1990,
      birthMonth: 5,
      birthDay: 15,
      birthHour: 14,
      birthMinute: 30,
      timezone: 'Asia/Shanghai',
      gender: 'male'
    }
  },
  {
    name: '测试案例2: 2000年1月1日0:00',
    birthInfo: {
      birthYear: 2000,
      birthMonth: 1,
      birthDay: 1,
      birthHour: 0,
      birthMinute: 0,
      timezone: 'Asia/Shanghai'
    }
  },
  {
    name: '测试案例3: 1985年12月31日23:59',
    birthInfo: {
      birthYear: 1985,
      birthMonth: 12,
      birthDay: 31,
      birthHour: 23,
      birthMinute: 59,
      timezone: 'Asia/Shanghai',
      gender: 'female'
    }
  }
];

/**
 * 调用 /api/chart 接口
 */
async function callChartAPI(birthInfo) {
  const response = await fetch('http://localhost:3000/api/chart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(birthInfo)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * 深度比较两个对象是否完全相同
 */
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

/**
 * 提取核心数据用于一致性比较（排除时间戳等动态字段）
 */
function extractCoreData(chartData) {
  if (!chartData || !chartData.success || !chartData.data) {
    return null;
  }
  
  const data = chartData.data;
  
  return {
    version: data.version,
    pillars: data.pillars,
    elements: data.elements,
    tenGods: data.tenGods,
    nayin: data.nayin,
    spirits: data.spirits,
    metadata: {
      source: data.metadata.source,
      library: data.metadata.library
      // 排除 calculatedAt 和 timestamp，因为它们是动态的
    }
  };
}

/**
 * 运行一致性测试
 */
async function runConsistencyTest() {
  console.log('=== /api/chart 一致性校验测试 ===\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testCase of testCases) {
    console.log(`🧪 ${testCase.name}`);
    console.log(`输入: ${JSON.stringify(testCase.birthInfo)}`);
    
    try {
      // 连续调用 5 次相同的接口
      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = await callChartAPI(testCase.birthInfo);
        results.push(result);
        
        // 短暂延迟，模拟真实使用场景
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 提取核心数据进行比较
      const coreDataList = results.map(extractCoreData);
      
      // 检查是否所有结果都相同
      let isConsistent = true;
      const firstResult = coreDataList[0];
      
      if (!firstResult) {
        console.log('❌ 第一次调用失败');
        failedTests++;
        totalTests++;
        continue;
      }
      
      for (let i = 1; i < coreDataList.length; i++) {
        if (!coreDataList[i]) {
          console.log(`❌ 第${i + 1}次调用失败`);
          isConsistent = false;
          break;
        }
        
        if (!deepEqual(firstResult, coreDataList[i])) {
          console.log(`❌ 第${i + 1}次调用结果与第1次不一致`);
          console.log('第1次结果:', JSON.stringify(firstResult, null, 2));
          console.log(`第${i + 1}次结果:`, JSON.stringify(coreDataList[i], null, 2));
          isConsistent = false;
          break;
        }
      }
      
      if (isConsistent) {
        console.log('✅ 一致性测试通过 - 5次调用结果完全一致');
        console.log(`核心数据: ${JSON.stringify(firstResult, null, 2)}`);
        passedTests++;
      } else {
        failedTests++;
      }
      
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
      failedTests++;
    }
    
    totalTests++;
    console.log('');
  }
  
  // 输出测试总结
  console.log('=== 测试总结 ===');
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过: ${passedTests}`);
  console.log(`失败: ${failedTests}`);
  console.log(`成功率: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);
  
  if (failedTests > 0) {
    console.log('\n⚠️  发现一致性问题，需要检查八字计算逻辑！');
    process.exit(1);
  } else {
    console.log('\n🎉 所有一致性测试通过！');
  }
}

// 运行测试
if (require.main === module) {
  runConsistencyTest().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { runConsistencyTest };