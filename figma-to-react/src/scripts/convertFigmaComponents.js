// src/scripts/convertFigmaComponents.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { pascalCase } = require('../utils/stringUtils');

// 필요한 디렉토리 생성
const createDirectories = () => {
  const dirs = [
    './src/components',
    './src/components/styles',
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`디렉토리 생성됨: ${dir}`);
    }
  });
};

// Figma API 서비스
const figmaAPI = {
  async getFileComponents(fileKey, token) {
    try {
      const response = await axios.get(`https://api.figma.com/v1/files/${fileKey}`, {
        headers: {
          'X-Figma-Token': token
        }
      });
      
      const components = [];
      
      // 재귀적으로 컴포넌트 노드 찾기
      const traverseNodes = (node) => {
        if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
          components.push({
            id: node.id,
            name: node.name,
            type: node.type,
            description: node.description || '',
            key: node.key || node.id
          });
        }
        
        if (node.children) {
          node.children.forEach(child => traverseNodes(child));
        }
      };
      
      traverseNodes(response.data.document);
      return components;
    } catch (error) {
      console.error('Figma 컴포넌트 가져오기 실패:', error.message);
      throw error;
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
      console.error('Figma 이미지 가져오기 실패:', error.message);
      throw error;
    }
  },
  
  async getStyles(fileKey, token) {
    try {
      const response = await axios.get(`https://api.figma.com/v1/files/${fileKey}/styles`, {
        headers: {
          'X-Figma-Token': token
        }
      });
      
      return response.data.meta.styles;
    } catch (error) {
      console.error('Figma 스타일 가져오기 실패:', error.message);
      return [];
    }
  }
};

// React 컴포넌트 생성기
const componentGenerator = {
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
  
  generateCSS(component) {
    const componentName = pascalCase(component.name).toLowerCase();
    
    return `.${componentName}-container {
  display: inline-block;
  position: relative;
}
`;
  }
};

// 파일 저장 함수
const saveComponentFiles = (component, imageUrl) => {
  const componentName = pascalCase(component.name);
  const jsxContent = componentGenerator.generateReactComponent(component, imageUrl);
  const cssContent = componentGenerator.generateCSS(component);
  
  // JSX 파일 저장
  fs.writeFileSync(
    path.resolve(`./src/components/${componentName}.jsx`),
    jsxContent
  );
  
  // CSS 파일 저장
  fs.writeFileSync(
    path.resolve(`./src/components/styles/${componentName}.css`),
    cssContent
  );
  
  console.log(`컴포넌트 생성 완료: ${componentName}`);
};

// SVG 이미지 다운로드 함수
const downloadSVG = async (url, componentName) => {
  try {
    const response = await axios.get(url);
    const svgDir = './public/svgs';
    
    if (!fs.existsSync(svgDir)) {
      fs.mkdirSync(svgDir, { recursive: true });
    }
    
    const filePath = `${svgDir}/${componentName}.svg`;
    fs.writeFileSync(filePath, response.data);
    
    return `/svgs/${componentName}.svg`;
  } catch (error) {
    console.error(`SVG 다운로드 실패: ${error.message}`);
    return url; // 실패 시 원래 URL 반환
  }
};

// 메인 함수
const convertFigmaComponents = async () => {
  const token = process.env.REACT_APP_FIGMA_TOKEN;
  const fileKey = process.env.REACT_APP_FIGMA_FILE_KEY;
  
  if (!token || !fileKey) {
    console.error('환경 변수에서 Figma 토큰이나 파일 키를 찾을 수 없습니다.');
    return;
  }
  
  try {
    createDirectories();
    
    console.log('Figma 컴포넌트 가져오는 중...');
    const components = await figmaAPI.getFileComponents(fileKey, token);
    
    if (components.length === 0) {
      console.log('변환할 컴포넌트가 없습니다.');
      return;
    }
    
    console.log(`${components.length}개의 컴포넌트를 찾았습니다.`);
    
    const componentIds = components.map(comp => comp.id);
    console.log('컴포넌트 이미지 URL 가져오는 중...');
    const images = await figmaAPI.getComponentImages(fileKey, componentIds, token);
    
    // 인덱스 파일 생성 준비
    let indexFileContent = '// 자동으로 생성된 컴포넌트 인덱스 파일\n\n';
    
    for (const component of components) {
      const imageUrl = images[component.id];
      
      if (imageUrl) {
        // 로컬 SVG 파일 저장
        console.log(`'${component.name}' 컴포넌트의 SVG 다운로드 중...`);
        const localImagePath = await downloadSVG(imageUrl, pascalCase(component.name));
        
        // 컴포넌트 파일 생성
        saveComponentFiles(component, localImagePath);
        
        // 인덱스 파일에 추가
        const componentName = pascalCase(component.name);
        indexFileContent += `export { default as ${componentName} } from './${componentName}';\n`;
      } else {
        console.warn(`경고: '${component.name}' 컴포넌트의 이미지를 찾을 수 없습니다.`);
      }
    }
    
    // 인덱스 파일 저장
    fs.writeFileSync(
      path.resolve('./src/components/index.js'),
      indexFileContent
    );
    
    console.log('모든 컴포넌트 변환이 완료되었습니다.');
  } catch (error) {
    console.error('변환 실패:', error);
  }
};

// 스크립트 실행
convertFigmaComponents();