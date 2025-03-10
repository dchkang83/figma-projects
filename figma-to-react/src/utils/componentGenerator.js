// src/utils/componentGenerator.js
import { pascalCase, kebabCase } from './stringUtils';

// Figma 컴포넌트 데이터를 기반으로 React 컴포넌트 코드 생성
export const generateReactComponent = (component, imageUrl) => {
  const componentName = pascalCase(component.name);
  
  return `
import React from 'react';
import classNames from 'classnames/bind';
import styles from './${componentName}.module.css';

const cx = classNames.bind(styles);

/**
 * ${component.description || componentName + ' 컴포넌트'}
 */
const ${componentName} = (props) => {
  return (
    <div className={cx('container')} {...props}>
      {/* SVG 이미지를 직접 사용하거나 내부 요소로 구현 */}
      <img src="${imageUrl}" alt="${componentName}" />
      {props.children}
    </div>
  );
};

export default ${componentName};
`;
};

// CSS 모듈 코드 생성
export const generateComponentCSS = (component) => {
  const componentName = pascalCase(component.name).toLowerCase();
  
  return `
.container {
  display: flex;
  position: relative;
  width: 100%;
  height: auto;
}
`;
};

// 더 복잡한 컴포넌트 변환 로직
export const convertFigmaToReact = (figmaComponent, styleData) => {
  const componentName = pascalCase(figmaComponent.name);
  const className = kebabCase(figmaComponent.name);
  
  // 스타일 변수 생성
  let styles = '';
  if (styleData && styleData.fills) {
    styles += `  background-color: ${styleData.fills[0].color || 'transparent'};\n`;
  }
  if (styleData && styleData.strokes) {
    styles += `  border: ${styleData.strokeWeight || 1}px solid ${styleData.strokes[0].color || 'black'};\n`;
  }
  
  // React 컴포넌트 템플릿 생성
  // 실제 구현에서는 훨씬 복잡한 변환 로직을 가질 수 있음
  return {
    jsx: `
import React from 'react';
import classNames from 'classnames/bind';
import styles from './${componentName}.module.css';

const cx = classNames.bind(styles);

/**
 * ${figmaComponent.description || componentName + ' 컴포넌트'}
 */
const ${componentName} = ({ children, ...props }) => {
  return (
    <div className={cx('container')} {...props}>
      {children}
    </div>
  );
};

export default ${componentName};
`,
    css: `
.container {
${styles}
  width: ${styleData?.width || 'auto'};
  height: ${styleData?.height || 'auto'};
}
`
  };
};