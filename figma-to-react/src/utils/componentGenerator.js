// src/utils/componentGenerator.js
import { pascalCase, kebabCase, translateKoreanToEnglish } from './stringUtils';
import figmaService from '../services/figmaService';

// Figma 컴포넌트 데이터를 기반으로 React 컴포넌트 코드 생성
export const generateReactComponent = async (component, imageUrl, fileKey) => {
  const componentName = pascalCase(component.name);
  
  try {
    // 컴포넌트 상세 구조 정보 가져오기
    const componentStructure = await figmaService.getComponentDetails(fileKey, component.id);
    
    // 컴포넌트 구조를 기반으로 JSX 생성
    const jsxContent = generateJSXFromStructure(componentStructure, componentName);
    
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
${jsxContent}
  );
};

export default ${componentName};
`;
  } catch (error) {
    console.error('컴포넌트 구조 분석 실패:', error);
    
    // 오류 발생 시 기본 템플릿 사용
    return generateDefaultComponent(component, imageUrl);
  }
};

// 컴포넌트 구조를 기반으로 JSX 생성
const generateJSXFromStructure = (node, componentName) => {
  // 최상위 컨테이너 생성
  let jsx = `    <div className={cx('container')} {...props}>\n`;
  
  // 자식 노드 처리
  if (node.children && node.children.length > 0) {
    jsx += generateChildrenJSX(node.children, 6);
  } else if (node.type === 'TEXT') {
    // 텍스트 노드인 경우
    jsx += `      <p className={cx('text')}>${node.characters || '텍스트'}</p>\n`;
  }
  
  // 컨테이너 닫기
  jsx += `      {props.children}\n    </div>`;
  
  return jsx;
};

// 자식 노드를 JSX로 변환
const generateChildrenJSX = (children, indentLevel) => {
  let jsx = '';
  const indent = ' '.repeat(indentLevel);
  
  children.forEach(child => {
    // 노드 이름에서 유효한 CSS 클래스명 생성
    const className = sanitizeClassName(child.name);
    
    // 노드 유형에 따라 다른 JSX 생성
    if (child.type === 'TEXT') {
      // 텍스트 노드
      let textContent = child.characters || child.name;
      
      // 텍스트 내용은 원본 그대로 유지 (한글 변환하지 않음)
      // 텍스트 스타일에 따라 태그 결정
      let tag = 'p';
      if (child.style) {
        const fontSize = child.style.fontSize || 0;
        if (fontSize >= 24) tag = 'h1';
        else if (fontSize >= 20) tag = 'h2';
        else if (fontSize >= 16) tag = 'h3';
      }
      
      jsx += `${indent}<${tag} className={cx('${className}')}>${textContent}</${tag}>\n`;
    } 
    else if (child.type === 'RECTANGLE' || child.type === 'ELLIPSE' || child.type === 'VECTOR') {
      // 도형 노드 - div로 표현
      jsx += `${indent}<div className={cx('${className}')}></div>\n`;
    }
    else if (child.type === 'FRAME' || child.type === 'GROUP' || child.type === 'INSTANCE') {
      // 프레임, 그룹, 인스턴스 노드 - div로 표현하고 자식 노드 처리
      jsx += `${indent}<div className={cx('${className}')}>\n`;
      
      if (child.children && child.children.length > 0) {
        jsx += generateChildrenJSX(child.children, indentLevel + 2);
      }
      
      jsx += `${indent}</div>\n`;
    }
  });
  
  return jsx;
};

// 유효한 CSS 클래스명으로 변환
const sanitizeClassName = (name) => {
  if (!name) return 'element';
  
  // kebabCase 함수를 사용하여 기본 변환
  let className = kebabCase(name);
  
  // CSS 클래스명에 사용할 수 없는 특수문자 처리
  // 슬래시(/)는 이미 kebabCase에서 하이픈(-)으로 변환됨
  className = className
    .replace(/\./g, '-dot-')     // 점(.)을 -dot-으로 변환
    .replace(/\\/g, '-slash-')   // 백슬래시(\)를 -slash-로 변환
    .replace(/:/g, '-colon-')    // 콜론(:)을 -colon-으로 변환
    .replace(/\*/g, '-star-')    // 별표(*)를 -star-로 변환
    .replace(/\+/g, '-plus-')    // 더하기(+)를 -plus-로 변환
    .replace(/\[/g, '-bracket-') // 대괄호([)를 -bracket-으로 변환
    .replace(/\]/g, '-bracket-') // 대괄호(])를 -bracket-으로 변환
    .replace(/\(/g, '-paren-')   // 괄호(()를 -paren-으로 변환
    .replace(/\)/g, '-paren-')   // 괄호())를 -paren-으로 변환
    .replace(/>/g, '-gt-')       // 부등호(>)를 -gt-로 변환
    .replace(/</g, '-lt-')       // 부등호(<)를 -lt-로 변환
    .replace(/&/g, '-amp-')      // 앰퍼샌드(&)를 -amp-로 변환
    .replace(/,/g, '-comma-')    // 쉼표(,)를 -comma-로 변환
    .replace(/'/g, '-quote-')    // 작은따옴표(')를 -quote-로 변환
    .replace(/"/g, '-quote-')    // 큰따옴표(")를 -quote-로 변환
    .replace(/!/g, '-excl-')     // 느낌표(!)를 -excl-로 변환
    .replace(/\?/g, '-quest-')   // 물음표(?)를 -quest-로 변환
    .replace(/=/g, '-equals-')   // 등호(=)를 -equals-로 변환
    .replace(/\|/g, '-pipe-')    // 파이프(|)를 -pipe-로 변환
    .replace(/;/g, '-semi-')     // 세미콜론(;)을 -semi-로 변환
    .replace(/@/g, '-at-')       // 골뱅이(@)를 -at-로 변환
    .replace(/\$/g, '-dollar-')  // 달러($)를 -dollar-로 변환
    .replace(/#/g, '-hash-')     // 해시(#)를 -hash-로 변환
    .replace(/%/g, '-percent-')  // 퍼센트(%)를 -percent-로 변환
    .replace(/\^/g, '-caret-')   // 캐럿(^)을 -caret-로 변환
    .replace(/~/g, '-tilde-');   // 틸드(~)를 -tilde-로 변환
  
  // 숫자로 시작하는 클래스명 처리 (CSS에서는 숫자로 시작할 수 없음)
  if (/^[0-9]/.test(className)) {
    className = 'n-' + className;
  }
  
  return className;
};

// 텍스트 내용을 영문으로 변환
const translateTextContent = (text) => {
  // 일반적인 UI 텍스트 변환
  const commonUITexts = {
    '제목': 'Title',
    '부제목': 'Subtitle',
    '내용': 'Content',
    '설명': 'Description',
    '확인': 'Confirm',
    '취소': 'Cancel',
    '닫기': 'Close',
    '저장': 'Save',
    '삭제': 'Delete',
    '편집': 'Edit',
    '추가': 'Add',
    '검색': 'Search',
    '로그인': 'Login',
    '로그아웃': 'Logout',
    '회원가입': 'Sign Up',
    '아이디': 'ID',
    '비밀번호': 'Password',
    '이메일': 'Email',
    '이름': 'Name',
    '전화번호': 'Phone',
    '주소': 'Address',
    '메뉴': 'Menu',
    '홈': 'Home',
    '소개': 'About',
    '서비스': 'Services',
    '연락처': 'Contact',
    '공지사항': 'Notice',
    '자주 묻는 질문': 'FAQ',
    '문의하기': 'Inquiry',
    '더 보기': 'See More',
    '자세히 보기': 'View Details',
    '계속하기': 'Continue',
    '뒤로 가기': 'Go Back',
    '다음': 'Next',
    '이전': 'Previous',
    '완료': 'Complete',
    '시작하기': 'Get Started',
    '환영합니다': 'Welcome',
    '오류가 발생했습니다': 'An error occurred',
    '성공적으로 처리되었습니다': 'Successfully processed',
    '필수 항목입니다': 'Required field',
    '유효하지 않은 형식입니다': 'Invalid format'
  };
  
  // 정확히 일치하는 텍스트가 있으면 변환
  if (commonUITexts[text]) {
    return commonUITexts[text];
  }
  
  // 부분 일치하는 텍스트 처리
  let result = text;
  Object.keys(commonUITexts).forEach(korean => {
    if (text.includes(korean)) {
      result = result.replace(korean, commonUITexts[korean]);
    }
  });
  
  // 여전히 한글이 있으면 일반적인 영문 텍스트로 대체
  if (/[가-힣]/.test(result)) {
    // 한글 텍스트의 길이에 따라 다른 대체 텍스트 사용
    const length = text.length;
    if (length <= 2) {
      return 'Text';
    } else if (length <= 5) {
      return 'Short Text';
    } else if (length <= 20) {
      return 'Medium Text';
    } else {
      return 'Long Text Description. This is a placeholder for Korean text that would appear in the actual design.';
    }
  }
  
  return result;
};

// 기본 컴포넌트 템플릿 생성 (구조 분석 실패 시 사용)
const generateDefaultComponent = (component, imageUrl) => {
  const componentName = pascalCase(component.name);
  
  // 컴포넌트 유형에 따라 다른 구조 생성
  // 모달 컴포넌트인 경우
  if (component.name.toLowerCase().includes('modal')) {
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
      <div className={cx('header')}>
        <h1 className={cx('title')}>제목</h1>
        <button className={cx('close-button')}>×</button>
      </div>
      <div className={cx('body')}>
        <p className={cx('text')}>내용</p>
      </div>
      <div className={cx('footer')}>
        <button className={cx('button', 'primary')}>확인</button>
        <button className={cx('button', 'secondary')}>취소</button>
      </div>
      {props.children}
    </div>
  );
};

export default ${componentName};
`;
  }
  
  // 기본 컴포넌트 구조
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
      <div className={cx('content')}>
        <h2 className={cx('title')}>제목</h2>
        <p className={cx('text')}>내용</p>
      </div>
      {props.children}
    </div>
  );
};

export default ${componentName};
`;
};

// CSS 모듈 코드 생성
export const generateComponentCSS = async (component, fileKey) => {
  const componentName = pascalCase(component.name).toLowerCase();
  
  try {
    // 컴포넌트 상세 구조 정보 가져오기
    const componentStructure = await figmaService.getComponentDetails(fileKey, component.id);
    
    // 컴포넌트 구조를 기반으로 CSS 생성
    const cssContent = generateCSSFromStructure(componentStructure);
    
    return cssContent;
  } catch (error) {
    console.error('컴포넌트 구조 분석 실패:', error);
    
    // 오류 발생 시 기본 CSS 템플릿 사용
    return generateDefaultCSS(component);
  }
};

// 컴포넌트 구조를 기반으로 CSS 생성
const generateCSSFromStructure = (node) => {
  let css = `.container {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  background-color: #ffffff;
  border-radius: 4px;
  overflow: hidden;
}\n\n`;
  
  // 노드 스타일 처리
  if (node.fills && node.fills.length > 0 && node.fills[0].visible !== false) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID') {
      const color = rgbaToHex(fill.color);
      css += `.container {
  background-color: ${color};
}\n\n`;
    }
  }
  
  // 자식 노드의 CSS 생성
  if (node.children && node.children.length > 0) {
    css += generateChildrenCSS(node.children);
  }
  
  return css;
};

// 자식 노드의 CSS 생성
const generateChildrenCSS = (children) => {
  let css = '';
  
  children.forEach(child => {
    // 노드 이름에서 유효한 CSS 클래스명 생성
    const className = sanitizeClassName(child.name);
    
    // 노드 유형에 따라 다른 CSS 생성
    if (child.type === 'TEXT') {
      // 텍스트 노드
      css += `.${className} {
  margin: 0;
  padding: 0;
`;
      
      // 텍스트 스타일 적용
      if (child.style) {
        if (child.style.fontSize) css += `  font-size: ${child.style.fontSize}px;\n`;
        if (child.style.fontWeight) css += `  font-weight: ${child.style.fontWeight};\n`;
        if (child.style.fontFamily) css += `  font-family: ${child.style.fontFamily};\n`;
        if (child.style.textAlignHorizontal) {
          css += `  text-align: ${child.style.textAlignHorizontal.toLowerCase()};\n`;
        }
      }
      
      css += `  color: #333333;
}\n\n`;
    }
    else if (child.type === 'RECTANGLE' || child.type === 'ELLIPSE' || child.type === 'VECTOR') {
      // 도형 노드
      css += `.${className} {
  position: relative;
`;
      
      // 크기 정보 적용
      if (child.absoluteBoundingBox) {
        css += `  width: ${child.absoluteBoundingBox.width}px;\n`;
        css += `  height: ${child.absoluteBoundingBox.height}px;\n`;
      }
      
      // 배경색 적용
      if (child.fills && child.fills.length > 0 && child.fills[0].visible !== false) {
        const fill = child.fills[0];
        if (fill.type === 'SOLID') {
          const color = rgbaToHex(fill.color);
          css += `  background-color: ${color};\n`;
        }
      }
      
      // 테두리 적용
      if (child.strokes && child.strokes.length > 0 && child.strokes[0].visible !== false) {
        const stroke = child.strokes[0];
        if (stroke.type === 'SOLID') {
          const color = rgbaToHex(stroke.color);
          css += `  border: ${child.strokeWeight || 1}px solid ${color};\n`;
        }
      }
      
      // 모서리 둥글기 적용
      if (child.cornerRadius) {
        css += `  border-radius: ${child.cornerRadius}px;\n`;
      }
      
      css += `}\n\n`;
    }
    else if (child.type === 'FRAME' || child.type === 'GROUP' || child.type === 'INSTANCE') {
      // 프레임, 그룹, 인스턴스 노드
      css += `.${className} {
  display: flex;
  flex-direction: column;
  position: relative;
`;
      
      // 크기 정보 적용
      if (child.absoluteBoundingBox) {
        css += `  width: ${child.absoluteBoundingBox.width}px;\n`;
        css += `  height: ${child.absoluteBoundingBox.height}px;\n`;
      }
      
      // 배경색 적용
      if (child.fills && child.fills.length > 0 && child.fills[0].visible !== false) {
        const fill = child.fills[0];
        if (fill.type === 'SOLID') {
          const color = rgbaToHex(fill.color);
          css += `  background-color: ${color};\n`;
        }
      }
      
      // 테두리 적용
      if (child.strokes && child.strokes.length > 0 && child.strokes[0].visible !== false) {
        const stroke = child.strokes[0];
        if (stroke.type === 'SOLID') {
          const color = rgbaToHex(stroke.color);
          css += `  border: ${child.strokeWeight || 1}px solid ${color};\n`;
        }
      }
      
      // 모서리 둥글기 적용
      if (child.cornerRadius) {
        css += `  border-radius: ${child.cornerRadius}px;\n`;
      }
      
      css += `}\n\n`;
      
      // 자식 노드의 CSS 생성
      if (child.children && child.children.length > 0) {
        css += generateChildrenCSS(child.children);
      }
    }
  });
  
  return css;
};

// RGBA 색상을 HEX 코드로 변환
const rgbaToHex = (color) => {
  if (!color) return '#000000';
  
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;
  
  // 알파 값이 1이면 RGB 형식으로 반환
  if (a === 1) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  // 알파 값이 있으면 rgba 형식으로 반환
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// 기본 CSS 템플릿 생성 (구조 분석 실패 시 사용)
const generateDefaultCSS = (component) => {
  // 모달 컴포넌트인 경우
  if (component.name.toLowerCase().includes('modal')) {
    return `
.container {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  max-width: 500px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #999999;
  cursor: pointer;
}

.body {
  padding: 20px;
}

.text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #666666;
}

.footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #eaeaea;
  gap: 12px;
}

.button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.button.primary {
  background-color: #1677ff;
  color: white;
}

.button.secondary {
  background-color: #f5f5f5;
  color: #333333;
  border: 1px solid #d9d9d9;
}
`;
  }
  
  // 기본 컴포넌트 스타일
  return `
.container {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content {
  display: flex;
  flex-direction: column;
}

.title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #666666;
}
`;
};

// 더 복잡한 컴포넌트 변환 로직
export const convertFigmaToReact = async (figmaComponent, fileKey) => {
  try {
    // 컴포넌트 상세 구조 정보 가져오기
    const componentStructure = await figmaService.getComponentDetails(fileKey, figmaComponent.id);
    
    const componentName = pascalCase(figmaComponent.name);
    
    // 컴포넌트 구조를 기반으로 JSX 생성
    const jsxContent = generateJSXFromStructure(componentStructure, componentName);
    
    // 컴포넌트 구조를 기반으로 CSS 생성
    const cssContent = generateCSSFromStructure(componentStructure);
    
    return {
      jsx: `
import React from 'react';
import classNames from 'classnames/bind';
import styles from './${componentName}.module.css';

const cx = classNames.bind(styles);

/**
 * ${figmaComponent.description || componentName + ' 컴포넌트'}
 */
const ${componentName} = (props) => {
  return (
${jsxContent}
  );
};

export default ${componentName};
`,
      css: cssContent
    };
  } catch (error) {
    console.error('컴포넌트 구조 분석 실패:', error);
    
    // 오류 발생 시 기본 템플릿 사용
    const componentName = pascalCase(figmaComponent.name);
    
    return {
      jsx: generateDefaultComponent(figmaComponent),
      css: generateDefaultCSS(figmaComponent)
    };
  }
};