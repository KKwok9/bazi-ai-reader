#!/usr/bin/env node

/**
 * 系统验证测试运行器
 * 
 * 运行所有系统级验证测试，包括：
 * 1. 一致性测试 - 验证 /api/chart 的确定性
 * 2. 边界安全测试 - 验证 /api/interpret 的安全边界
 * 3. 启动验证 - 验证系统配置和依赖
 */

const { spawn } = require('child_process');
const fs = require('fs');

/**
 * 运行单个测试脚本
 */
function runTest(scriptPath, testName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 开始运行: ${testName}`);
    console.log(`📄 脚本路径: ${scriptPath}`);
    console.log('=' .repeat(50));
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testName} - 测试通过`);
        resolve({ name: testName, success: true, code });
      } else {
        console.log(`❌ ${testName} - 测试失败 (退出码: ${code})`);
        resolve({ name: testName, success: false, code });
      }
    });
    
    child.on('error', (error) => {
      console.error(`❌ ${testName} - 运行错误:`, error.message);
      reject({ name: testName, success: false, error: error.message });
    });
  });
}

/**
 * 检查测试文件是否存在
 */
function checkTestFiles() {
  const testFiles = [
    { path: 'scripts/verify-setup.js', name: '启动验证' },
    { path: 'tests/consistency-test.js', name: '一致性测试' },
    { path: 'tests/boundary-test.js', name: '边界安全测试' }
  ];
  
  const missingFiles = testFiles.filter(file => !fs.existsSync(file.path));
  
  if (missingFiles.length > 0) {
    console.error('❌ 缺少测试文件:');
    missingFiles.forEach(file => console.error(`  - ${file.path} (${file.name})`));
    return false;
  }
  
  return testFiles;
}

/**
 * 检查服务器是否运行
 */
async function checkServerRunning() {
  try {
    const response = await fetch('http://localhost:3000/api/chart', {
      method: 'GET'
    });
    
    // 即使返回 405 (Method Not Allowed) 也说明服务器在运行
    return response.status === 405;
  } catch (error) {
    return false;
  }
}

/**
 * 主测试运行函数
 */
async function runAllTests() {
  console.log('=== 系统验证测试运行器 ===');
  console.log(`运行时间: ${new Date().toLocaleString()}`);
  console.log('');
  
  // 检查测试文件
  console.log('🔍 检查测试文件...');
  const testFiles = checkTestFiles();
  if (!testFiles) {
    process.exit(1);
  }
  console.log('✅ 所有测试文件存在');
  
  // 运行启动验证（不需要服务器运行）
  const setupResult = await runTest('scripts/verify-setup.js', '启动验证');
  
  // 检查服务器是否运行（用于 API 测试）
  console.log('\n🔍 检查开发服务器状态...');
  const serverRunning = await checkServerRunning();
  
  let results = [setupResult];
  
  if (serverRunning) {
    console.log('✅ 开发服务器正在运行 (http://localhost:3000)');
    
    // 运行 API 测试
    const consistencyResult = await runTest('tests/consistency-test.js', '一致性测试');
    const boundaryResult = await runTest('tests/boundary-test.js', '边界安全测试');
    
    results.push(consistencyResult, boundaryResult);
  } else {
    console.log('⚠️  开发服务器未运行，跳过 API 测试');
    console.log('   请先运行 "npm run dev" 启动服务器，然后重新运行测试');
    
    results.push(
      { name: '一致性测试', success: false, skipped: true },
      { name: '边界安全测试', success: false, skipped: true }
    );
  }
  
  // 输出测试总结
  console.log('\n' + '='.repeat(50));
  console.log('=== 测试总结 ===');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success && !r.skipped).length;
  const skippedTests = results.filter(r => r.skipped).length;
  
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过: ${passedTests}`);
  console.log(`失败: ${failedTests}`);
  console.log(`跳过: ${skippedTests}`);
  
  if (failedTests === 0 && skippedTests === 0) {
    console.log('\n🎉 所有测试通过！系统验证完成');
    console.log('\n📋 系统状态:');
    console.log('✅ 配置验证通过');
    console.log('✅ API 一致性验证通过');
    console.log('✅ 边界安全验证通过');
    console.log('\n🚀 系统已准备就绪，可以投入使用！');
  } else if (skippedTests > 0 && failedTests === 0) {
    console.log('\n⚠️  部分测试被跳过，请启动服务器后重新运行完整测试');
    console.log('\n📋 启动服务器步骤:');
    console.log('1. npm run dev');
    console.log('2. npm run test:all  # 重新运行完整测试');
  } else {
    console.log('\n❌ 发现问题，请检查失败的测试并修复');
    
    const failedTestNames = results.filter(r => !r.success && !r.skipped).map(r => r.name);
    console.log('\n失败的测试:');
    failedTestNames.forEach(name => console.log(`  - ${name}`));
    
    process.exit(1);
  }
}

// 运行测试
runAllTests().catch(error => {
  console.error('\n❌ 测试运行器失败:', error);
  process.exit(1);
});