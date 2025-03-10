// src/scripts/extractComponentCode.js
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pascalCase } = require('../utils/stringUtils');

/**
 * Figma 노드의 스타일 속성을 CSS로 변환
 */
const convertNodeStyleToCSS = (node) => {
  let css = '';
  
  // 레이아웃 속성
  if (node.absoluteBoundingBox) {
    css += `  width: ${node.absoluteBoundingBox.width}px;\n`;
    css += `  height: ${node.absoluteBoundingBox.height}px;\n`;
  }
  
  // 배경색
  if (node.fills && node.fills.length > 0 && node.fills[0].type === 'SOLID') {
    const fill = node.fills[0];
    const { r, g, b, a } = fill.color;
    css += `  background-color: rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a});\n`;
  }
  
  // 테두리
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    const { r, g, b, a } = stroke.color;
    css += `  border: ${node.strokeWeight}px solid rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a});\n`;
  }
  
  // 테두리 반경
  if (node.cornerRadius && node.cornerRadius > 0) {
    css += `  border-radius: ${node.cornerRadius}px;\n`;
  }
  
  // 그림자
  if (node.effects && node.effects.length > 0) {
    const shadows = node.effects.filter(effect => effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW');
    if (shadows.length > 0) {
      const shadowStrings = shadows.map(shadow => {
        const { r, g, b, a } = shadow.color;
        const color = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
        const { offset, radius } = shadow;
        return `${shadow.type === 'INNER_SHADOW' ? 'inset ' : ''}${offset.x}px ${offset.y}px ${radius}px ${color}`;
      });
      css += `  box-shadow: ${shadowStrings.join(', ')};\n`;
    }
  }
  
  // 불투명도
  if (node.opacity !== undefined && node.opacity < 1) {
    css += `  opacity: ${node.opacity};\n`;
  }
  
  // 폰트 스타일 (텍스트 노드인 경우)
  if (node.type === 'TEXT' && node.style) {
    const { fontFamily, fontWeight, fontSize, lineHeightPx, letterSpacing, textAlignHorizontal } = node.style;
    
    css += `  font-family: ${fontFamily};\n`;
    css += `  font-size: ${fontSize}px;\n`;
    css += `  font-weight: ${fontWeight};\n`;
    css += `  line-height: ${lineHeightPx}px;\n`;
    
    if (letterSpacing) {
      css += `  letter-spacing: ${letterSpacing}px;\n`;
    }
    
    if (textAlignHorizontal) {
      css += `  text-align: ${textAlignHorizontal.toLowerCase()};\n`;
    }
    
    // 텍스트 색상
    if (node.fills && node.fills.length > 0 && node.fills[0].type === 'SOLID') {
      const fill = node.fills[0];
      const { r, g, b, a } = fill.color;
      css += `  color: rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a});\n`;
    }
  }
  
  return css;
};

/**
 * 노드 구조를 React JSX로 변환
 */
const convertNodeToJSX = (node, depth = 0) => {
  const indent = '  '.repeat(depth);
  let jsx = '';
  
  // 텍스트 노드
  if (node.type === 'TEXT' && node.characters) {
    return `${indent}<p className="${node.name.replace(/\s+/g, '-').toLowerCase()}">${node.characters}</p>\n`;
  }
  
  // 프레임, 그룹, 컴포넌트 등
  const className = node.name.replace(/\s+/g, '-').toLowerCase();
  jsx += `${indent}<div className="${className}">\n`;
  
  // 자식 노드가 있는 경우 재귀적으로 처리
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      jsx += convertNodeToJSX(child, depth + 1);
    });
  }
  
  jsx += `${indent}</div>\n`;
  return jsx;
};

/**
 * 컴포넌트 노드와 그 자식 노드들에서 모든 CSS 클래스 추출
 */
const extractCSSClasses = (node, classes = {}) => {
  const className = node.name.replace(/\s+/g, '-').toLowerCase();
  classes[className] = convertNodeStyleToCSS(node);
  
  // 자식 노드가 있는 경우 재귀적으로 처리
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      extractCSSClasses(child, classes);
    });
  }
  
  return classes;
};

/**
 * Figma API에서 컴포넌트 노드 데이터 가져오기
 */
const getFigmaNodeData = async (fileKey, nodeId, token) => {
  try {
    const response = await axios.get(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`, {
      headers: {
        'X-Figma-Token': token
      }
    });
    
    return response.data.nodes[nodeId].document;
  } catch (error) {
    console.error('Figma 노드 데이터 가져오기 실패:', error.message);
    throw error;
  }
};

/**
 * React 컴포넌트 파일 생성
 */
const createReactComponent = (componentName, jsxContent, cssClasses) => {
  // JSX 파일 내용
  const componentCode = `import React from 'react';
import './styles/${componentName}.css';

const ${componentName} = (props) => {
  return (
${jsxContent}  );
};

export default ${componentName};
`;

  // CSS 파일 내용
  let cssContent = '';
  for (const className in cssClasses) {
    cssContent += `.${className} {\n${cssClasses[className]}}\n\n`;
  }
  
  // 디렉토리가 없는 경우 생성
  const componentsDir = path.resolve('./src/components');
  const stylesDir = path.resolve('./src/components/styles');
  
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
  }
  
  // 파일 저장
  fs.writeFileSync(
    path.resolve(`./src/components/${componentName}.jsx`),
    componentCode
  );
  
  fs.writeFileSync(
    path.resolve(`./src/components/styles/${componentName}.css`),
    cssContent
  );
  
  console.log(`컴포넌트 생성 완료: ${componentName}`);
};

/**
 * 메인 실행 함수
 */
const extractComponentCode = async () => {
  const token = process.env.REACT_APP_FIGMA_TOKEN;
  const fileKey = process.env.REACT_APP_FIGMA_FILE_KEY;
  const componentId = process.env.REACT_APP_FIGMA_COMPONENT_ID; // 특정 컴포넌트 ID
  
  if (!token || !fileKey || !componentId) {
    console.error('환경 변수에서 필요한 정보를 찾을 수 없습니다.');
    return;
  }
  
  try {
    console.log('Figma 컴포넌트 데이터 가져오는 중...');
    const componentNode = await getFigmaNodeData(fileKey, componentId, token);
    
    if (!componentNode) {
      console.error('컴포넌트를 찾을 수 없습니다.');
      return;
    }
    
    const componentName = pascalCase(componentNode.name);
    const jsxContent = convertNodeToJSX(componentNode, 1);
    const cssClasses = extractCSSClasses(componentNode);
    
    createReactComponent(componentName, jsxContent, cssClasses);
    
  } catch (error) {
    console.error('컴포넌트 코드 추출 실패:', error);
  }
};

// 스크립트 실행
extractComponentCode();