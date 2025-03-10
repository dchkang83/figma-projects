// src/scripts/convertFigmaComponents.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { pascalCase } = require('../utils/stringUtils');
const { optimize } = require('svgo');
const svgr = require('@svgr/core').default;

// 필요한 디렉토리 생성
const createDirectories = () => {
  const dirs = [
    './src/components',
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
  generateReactComponent(component, svgData) {
    const componentName = pascalCase(component.name);
    
    // SVG 내용이 있으면 React 컴포넌트로 변환
    if (svgData.svgContent) {
      try {
        const reactComponent = convertSvgToReactComponent(svgData.svgContent, componentName);
        if (reactComponent) {
          // 변환된 React 컴포넌트 코드 반환
          return reactComponent;
        }
      } catch (error) {
        console.error(`컴포넌트 변환 실패: ${error.message}`);
      }
    }
    
    // 변환 실패 시 기본 React 컴포넌트 반환
    return `import React from 'react';
import classNames from 'classnames/bind';
import styles from './${componentName}.module.css';

const cx = classNames.bind(styles);

/**
 * ${component.description || componentName + ' 컴포넌트'}
 */
const ${componentName} = (props) => {
  return (
    <div className={cx('container')} {...props}>
      {props.children}
    </div>
  );
};

export default ${componentName};
`;
  },
  
  generateCSS(component) {
    const componentName = pascalCase(component.name).toLowerCase();
    
    return `.container {
  display: flex;
  position: relative;
  width: 100%;
  height: auto;
}
`;
  }
};

// 파일 저장 함수
const saveComponentFiles = (component, svgData) => {
  const componentName = pascalCase(component.name);
  const jsxContent = componentGenerator.generateReactComponent(component, svgData);
  const cssContent = componentGenerator.generateCSS(component);
  
  // JSX 파일 저장
  fs.writeFileSync(
    path.resolve(`./src/components/${componentName}.jsx`),
    jsxContent
  );
  
  // CSS 모듈 파일 저장
  fs.writeFileSync(
    path.resolve(`./src/components/${componentName}.module.css`),
    cssContent
  );
  
  console.log(`컴포넌트 생성 완료: ${componentName}`);
};

// SVG 이미지 다운로드 함수
const downloadSVG = async (url, componentName) => {
  try {
    const response = await axios.get(url);
    const svgContent = response.data;
    const svgDir = './public/svgs';
    
    if (!fs.existsSync(svgDir)) {
      fs.mkdirSync(svgDir, { recursive: true });
    }
    
    const filePath = `${svgDir}/${componentName}.svg`;
    fs.writeFileSync(filePath, svgContent);
    
    return {
      localPath: `/svgs/${componentName}.svg`,
      svgContent: svgContent
    };
  } catch (error) {
    console.error(`SVG 다운로드 실패: ${error.message}`);
    return {
      localPath: url,
      svgContent: null
    };
  }
};

// SVG를 React 컴포넌트로 변환하는 함수
const convertSvgToReactComponent = (svgContent, componentName) => {
  try {
    // SVG 내용에서 필요한 부분만 추출
    const svgMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    
    if (!svgMatch) {
      throw new Error('유효한 SVG 내용을 찾을 수 없습니다.');
    }
    
    // SVG 속성 추출
    const svgTagMatch = svgContent.match(/<svg([^>]*)>/i);
    const svgAttributes = svgTagMatch ? svgTagMatch[1] : '';
    
    // viewBox 추출
    const viewBoxMatch = svgAttributes.match(/viewBox=["']([^"']*)["']/i);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'; // 기본값
    
    // width와 height 추출
    const widthMatch = svgAttributes.match(/width=["']([^"']*)["']/i);
    const heightMatch = svgAttributes.match(/height=["']([^"']*)["']/i);
    const width = widthMatch ? widthMatch[1] : '100%';
    const height = heightMatch ? heightMatch[1] : '100%';
    
    // SVG 내용
    const svgInner = svgMatch[1];
    
    // React 컴포넌트 생성
    return `import React from 'react';
import classNames from 'classnames/bind';
import styles from './${componentName}.module.css';

const cx = classNames.bind(styles);

/**
 * ${componentName} 컴포넌트
 */
const ${componentName} = ({ width = "${width}", height = "${height}", ...props }) => {
  return (
    <div className={cx('container')}>
      <svg
        width={width}
        height={height}
        viewBox="${viewBox}"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        ${svgInner}
      </svg>
    </div>
  );
};

export default ${componentName};
`;
  } catch (error) {
    console.error(`SVG 변환 실패: ${error.message}`);
    return null;
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
        const svgData = await downloadSVG(imageUrl, pascalCase(component.name));
        
        // 컴포넌트 파일 생성
        saveComponentFiles(component, svgData);
        
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