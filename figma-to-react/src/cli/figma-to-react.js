#!/usr/bin/env node
// src/cli/figma-to-react.js

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { pascalCase } = require('../utils/stringUtils');

// CLI 설정
program
  .name('figma-to-react')
  .description('Figma 컴포넌트를 React 컴포넌트로 변환하는 CLI 도구')
  .version('1.0.0')
  .option('-t, --token <token>', 'Figma API 토큰')
  .option('-f, --file <fileKey>', 'Figma 파일 키')
  .option('-o, --output <dir>', '출력 디렉토리', './src/components')
  .option('-s, --select', '컴포넌트 선택 모드 활성화', false);

program.parse();

const options = program.opts();

// 필수 매개변수 확인
if (!options.token || !options.file) {
  console.error(chalk.red('오류: Figma API 토큰과 파일 키가 필요합니다.'));
  program.help();
  process.exit(1);
}

// Figma API 헬퍼
const figmaAPI = {
  async getFileComponents(fileKey, token) {
    try {
      const response = await axios.get(`https://api.figma.com/v1/files/${fileKey}`, {
        headers: {
          'X-Figma-Token': token
        }
      });
      
      const components = [];
      
      const traverseNodes = (node) => {
        if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
          components.push({
            id: node.id,
            name: node.name,
            type: node.type,
            description: node.description || ''
          });
        }
        
        if (node.children) {
          node.children.forEach(child => traverseNodes(child));
        }
      };
      
      traverseNodes(response.data.document);
      return components;
    } catch (error) {
      throw new Error(`Figma 컴포넌트 가져오기 실패: ${error.message}`);
    }
  },
  
  async getComponentData(fileKey, nodeId, token) {
    try {
      const response = await axios.get(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`, {
        headers: {
          'X-Figma-Token': token
        }
      });
      
      return response.data.nodes[nodeId].document;
    } catch (error) {
      throw new Error(`Figma 노드 데이터 가져오기 실패: ${error.message}`);
    }
  },
  
  async getComponentImages(fileKey, componentIds, token) {
    try {
      const idsParam = componentIds.join(',');
      const response = await axios.get(
        `https://api.figma.com/v1/images/${fileKey}?ids=${idsParam}&format=svg`,
        {
          headers: {
            'X-Figma-Token': token
          }
        }
      );
      
      return response.data.images;
    } catch (error) {
      throw new Error(`Figma 이미지 가져오기 실패: ${error.message}`);
    }
  }
};

// 코드 생성 함수
const codeGenerator = {
  generateReactComponent(component, imageUrl) {
    const componentName = pascalCase(component.name);
    
    return `import React from 'react';
import './styles/${componentName}.css';

/**
 * ${component.description || componentName + ' 컴포넌트'}
 */
const ${componentName} = (props) => {
  return (
    <div className="${componentName.toLowerCase()}-container" {...props}>
      {/* Figma에서 가져온 SVG 이미지 */}
      <img src="${imageUrl}" alt="${componentName}" />
      {props.children}
    </div>
  );
};

export default ${componentName};
`;
  },
  
  generateCSSFile(component) {
    const componentName = pascalCase(component.name).toLowerCase();
    
    return `.${componentName}-container {
  display: inline-block;
  position: relative;
}
`;
  }
};

// 메인 함수
const main = async () => {
  const spinner = ora('Figma 컴포넌트 가져오는 중...').start();
  
  try {
    // 저장 디렉토리 생성
    const outputDir = options.output;
    const stylesDir = path.join(outputDir, 'styles');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }
    
    // 컴포넌트 가져오기
    const components = await figmaAPI.getFileComponents(options.file, options.token);
    
    if (components.length === 0) {
      spinner.fail('변환할 컴포넌트가 없습니다.');
      return;
    }
    
    spinner.succeed(`${components.length}개의 컴포넌트를 찾았습니다.`);
    
    // 컴포넌트 선택 또는 모두 변환
    let selectedComponents = components;
    
    if (options.select) {
      const answers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'components',
          message: '변환할 컴포넌트를 선택하세요.',
          choices: components.map(comp => ({
            name: `${comp.name} (${comp.type})`,
            value: comp,
            checked: false
          }))
        }
      ]);
      
      selectedComponents = answers.components;
      
      if (selectedComponents.length === 0) {
        console.log(chalk.yellow('선택된 컴포넌트가 없습니다. 종료합니다.'));
        return;
      }
    }
    
    // 이미지 URL 가져오기
    spinner.start('컴포넌트 이미지 가져오는 중...');
    const componentIds = selectedComponents.map(comp => comp.id);
    const images = await figmaAPI.getComponentImages(options.file, componentIds, options.token);
    
    spinner.succeed('이미지 URL을 가져왔습니다.');
    
    // 인덱스 파일 생성 준비
    let indexFileContent = '// 자동으로 생성된 컴포넌트 인덱스 파일\n\n';
    
    // 각 컴포넌트에 대해 React 컴포넌트 생성
    for (const component of selectedComponents) {
      spinner.start(`'${component.name}' 컴포넌트 변환 중...`);
      
      const imageUrl = images[component.id];
      if (!imageUrl) {
        spinner.warn(`'${component.name}' 컴포넌트의 이미지를 찾을 수 없습니다.`);
        continue;
      }
      
      const componentName = pascalCase(component.name);
      
      // JSX 파일 생성
      const jsxContent = codeGenerator.generateReactComponent(component, imageUrl);
      fs.writeFileSync(
        path.join(outputDir, `${componentName}.jsx`),
        jsxContent
      );
      
      // CSS 파일 생성
      const cssContent = codeGenerator.generateCSSFile(component);
      fs.writeFileSync(
        path.join(stylesDir, `${componentName}.css`),
        cssContent
      );
      
      // 인덱스 파일에 추가
      indexFileContent += `export { default as ${componentName} } from './${componentName}';\n`;
      
      spinner.succeed(`'${component.name}' 컴포넌트 변환 완료`);
    }
    
    // 인덱스 파일 저장
    fs.writeFileSync(
      path.join(outputDir, 'index.js'),
      indexFileContent
    );
    
    console.log(chalk.green('\n변환이 성공적으로 완료되었습니다.'));
    console.log(chalk.blue(`출력 디렉토리: ${path.resolve(outputDir)}`));
    
  } catch (error) {
    spinner.fail(`오류 발생: ${error.message}`);
    process.exit(1);
  }
};

// 실행
main();