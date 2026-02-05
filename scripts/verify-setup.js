#!/usr/bin/env node

/**
 * 系统启动验证脚本
 * 
 * 验证项目配置和依赖是否正确，确保系统可以正常启动
 * 包括 AI API key 校验和基础配置检查
 */

const fs = require('fs');

/**
 * 检查必需的文件是否存在
 */
function checkRequiredFiles() {
  console.log('🔍 检查必需文件...');
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    '.env.example',
    'types/chart.ts',
    'types/api.ts',
    'lib/bazi/calculator.ts',
    'lib/ai/interpreter.ts',
    'app/api/chart/route.ts',
    'app/api/interpret/route.ts'
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error('❌ 缺少必需文件:');
    missingFiles.forEach(file => console.error(`  - ${file}`));
    return false;
  }
  
  console.log('✅ 所有必需文件存在');
  return true;
}

/**
 * 检查 package.json 配置
 */
function checkPackageJson() {
  console.log('🔍 检查 package.json...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // 检查必需的依赖
    const requiredDeps = ['next', 'react', 'react-dom'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length > 0) {
      console.error('❌ 缺少必需依赖:');
      missingDeps.forEach(dep => console.error(`  - ${dep}`));
      return false;
    }
    
    // 检查脚本
    const requiredScripts = ['dev', 'build', 'start'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
      console.error('❌ 缺少必需脚本:');
      missingScripts.forEach(script => console.error(`  - ${script}`));
      return false;
    }
    
    console.log('✅ package.json 配置正确');
    return true;
    
  } catch (error) {
    console.error('❌ package.json 解析失败:', error.message);
    return false;
  }
}

/**
 * 检查环境变量配置
 */
function checkEnvironmentConfig() {
  console.log('🔍 检查环境变量配置...');
  
  // 检查 .env.example 是否存在
  if (!fs.existsSync('.env.example')) {
    console.error('❌ .env.example 文件不存在');
    return false;
  }
  
  // 读取 .env.example 内容
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const requiredEnvVars = [
    'AI_API_KEY',
    'AI_BASE_URL',
    'AI_MODEL',
    'AI_TIMEOUT',
    'AI_MAX_RETRIES'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !envExample.includes(envVar));
  
  if (missingEnvVars.length > 0) {
    console.error('❌ .env.example 缺少必需环境变量:');
    missingEnvVars.forEach(envVar => console.error(`  - ${envVar}`));
    return false;
  }
  
  // 检查实际环境变量（如果 .env 文件存在）
  if (fs.existsSync('.env')) {
    console.log('📋 检查 .env 文件配置...');
    
    const envContent = fs.readFileSync('.env', 'utf8');
    
    // 解析环境变量
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    // 检查 AI_API_KEY
    if (!envVars['AI_API_KEY'] || envVars['AI_API_KEY'] === 'your_openai_api_key_here') {
      console.warn('⚠️  AI_API_KEY 未配置或使用默认值');
      console.warn('   AI 解读功能将不可用，但八字计算功能正常');
    } else {
      // 验证 API Key 格式
      const apiKey = envVars['AI_API_KEY'];
      if (apiKey.startsWith('sk-') && apiKey.length > 20) {
        console.log('✅ AI_API_KEY 格式正确');
        
        // 检查其他 AI 配置
        const aiConfigs = {
          'AI_BASE_URL': envVars['AI_BASE_URL'] || 'https://api.openai.com/v1',
          'AI_MODEL': envVars['AI_MODEL'] || 'gpt-3.5-turbo',
          'AI_TIMEOUT': envVars['AI_TIMEOUT'] || '30000',
          'AI_MAX_RETRIES': envVars['AI_MAX_RETRIES'] || '3'
        };
        
        console.log('📋 AI 服务配置:');
        Object.entries(aiConfigs).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
        
        // 验证超时和重试次数是否为有效数字
        const timeout = parseInt(aiConfigs['AI_TIMEOUT']);
        const maxRetries = parseInt(aiConfigs['AI_MAX_RETRIES']);
        
        if (isNaN(timeout) || timeout < 5000 || timeout > 60000) {
          console.warn('⚠️  AI_TIMEOUT 应该在 5000-60000 毫秒之间');
        }
        
        if (isNaN(maxRetries) || maxRetries < 1 || maxRetries > 5) {
          console.warn('⚠️  AI_MAX_RETRIES 应该在 1-5 之间');
        }
        
      } else {
        console.warn('⚠️  AI_API_KEY 格式可能不正确（应以 sk- 开头）');
      }
    }
  } else {
    console.warn('⚠️  .env 文件不存在，请复制 .env.example 并配置');
    console.warn('   AI 解读功能将不可用，但八字计算功能正常');
  }
  
  console.log('✅ 环境变量配置检查完成');
  return true;
}

/**
 * 检查 TypeScript 配置
 */
function checkTypeScriptConfig() {
  console.log('🔍 检查 TypeScript 配置...');
  
  try {
    const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    
    // 检查基本配置
    if (!tsConfig.compilerOptions) {
      console.error('❌ tsconfig.json 缺少 compilerOptions');
      return false;
    }
    
    const requiredOptions = ['target', 'module', 'moduleResolution'];
    const missingOptions = requiredOptions.filter(option => !tsConfig.compilerOptions[option]);
    
    if (missingOptions.length > 0) {
      console.error('❌ tsconfig.json 缺少必需选项:');
      missingOptions.forEach(option => console.error(`  - ${option}`));
      return false;
    }
    
    console.log('✅ TypeScript 配置正确');
    return true;
    
  } catch (error) {
    console.error('❌ tsconfig.json 解析失败:', error.message);
    return false;
  }
}

/**
 * 运行所有验证
 */
function runVerification() {
  console.log('=== 系统启动验证 ===\n');
  
  const checks = [
    { name: '必需文件检查', fn: checkRequiredFiles },
    { name: 'package.json 检查', fn: checkPackageJson },
    { name: '环境变量检查', fn: checkEnvironmentConfig },
    { name: 'TypeScript 配置检查', fn: checkTypeScriptConfig }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const result = check.fn();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${check.name} 失败:`, error.message);
      allPassed = false;
    }
    console.log('');
  }
  
  console.log('=== 验证总结 ===');
  if (allPassed) {
    console.log('🎉 所有验证通过！系统可以正常启动');
    console.log('\n📋 启动步骤:');
    console.log('1. npm install');
    console.log('2. 复制 .env.example 到 .env 并配置 AI_API_KEY');
    console.log('3. npm run dev');
    console.log('4. 访问 http://localhost:3000');
    console.log('\n🧪 系统验证:');
    console.log('5. node tests/consistency-test.js  # 一致性测试');
    console.log('6. node tests/boundary-test.js     # 边界安全测试');
  } else {
    console.log('❌ 验证失败，请修复上述问题后重试');
    process.exit(1);
  }
}

// 运行验证
runVerification();