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
const generateJSXFromStructure = (node, componentName, usedClassNames = new Set(), usedStyles = new Map()) => {
  if (!node) return '';

  // 노드 타입에 따른 적절한 태그 선택
  const tag = getAppropriateTag(node);
  const className = generateMeaningfulClassName(node);
  usedClassNames.add(className);
  usedStyles.set(className, node);

  // 스타일 속성 추출 (우선순위 조정)
  const baseStyle = extractNodeStyle(node);
  const layoutStyle = node.layoutMode ? getLayoutStyles(node) : {};
  const positionStyle = getPositionStyle(node);
  
  // 스타일 우선순위에 따라 병합
  const style = {
    ...baseStyle,          // 기본 스타일
    ...layoutStyle,        // 레이아웃 스타일 (flex 관련)
    ...positionStyle,      // 위치 스타일 (position, top, left 등)
  };

  // Auto Layout이 있는 경우 position 스타일 제거
  if (node.layoutMode) {
    delete style.position;
    delete style.top;
    delete style.left;
    delete style.right;
    delete style.bottom;
  }
  
  let jsx = '';
  const indent = '    ';

  // 컨테이너 요소 생성
  if (node.type === 'COMPONENT' || node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'INSTANCE') {
    jsx += `${indent}<${tag} className={cx('${className}')} style={${JSON.stringify(style)}}>\n`;
    
    // 자식 요소 처리
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        jsx += generateJSXFromStructure(child, '', usedClassNames, usedStyles);
      });
    }
    
    jsx += `${indent}</${tag}>\n`;
  }
  // 텍스트 요소 처리
  else if (node.type === 'TEXT') {
    const textContent = node.characters || '';
    jsx += `${indent}<${tag} className={cx('${className}')} style={${JSON.stringify(style)}}>${textContent}</${tag}>\n`;
  }
  // 벡터, 이미지 등의 요소 처리
  else {
    jsx += `${indent}<${tag} className={cx('${className}')} style={${JSON.stringify(style)}} />\n`;
  }

  return jsx;
};

// 노드 타입에 따른 적절한 HTML 태그 선택
const getAppropriateTag = (node) => {
  switch (node.type) {
    case 'TEXT':
      return determineTextTag(node);
    case 'VECTOR':
    case 'BOOLEAN_OPERATION':
      return 'svg';
    case 'RECTANGLE':
      return node.cornerRadius > 0 ? 'div' : 'div';
    case 'ELLIPSE':
      return 'div';
    case 'LINE':
      return 'hr';
    case 'IMAGE':
      return 'img';
    case 'COMPONENT':
    case 'INSTANCE':
    case 'FRAME':
    case 'GROUP':
      return node.name.toLowerCase().includes('button') ? 'button' : 'div';
    default:
      return 'div';
  }
};

// 레이아웃 속성 추출
const getLayoutProps = (node) => {
  const props = {};

  if (node.layoutMode) {
    props.display = 'flex';
    props.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
    
    // Auto Layout 속성
    if (node.primaryAxisAlignItems) {
      props.justifyContent = convertFigmaAlignment(node.primaryAxisAlignItems);
    }
    if (node.counterAxisAlignItems) {
      props.alignItems = convertFigmaAlignment(node.counterAxisAlignItems);
    }
    if (node.itemSpacing) {
      props.gap = `${node.itemSpacing}px`;
    }
    
    // 패딩
    if (node.paddingTop) props.paddingTop = `${node.paddingTop}px`;
    if (node.paddingRight) props.paddingRight = `${node.paddingRight}px`;
    if (node.paddingBottom) props.paddingBottom = `${node.paddingBottom}px`;
    if (node.paddingLeft) props.paddingLeft = `${node.paddingLeft}px`;
  }

  return props;
};

// 스타일 속성 추출 개선
const extractNodeStyle = (node) => {
  const style = {};

  // 크기 설정
  if (node.absoluteBoundingBox) {
    const { width, height, x, y } = node.absoluteBoundingBox;
    
    if (width > 0) style.width = `${width}px`;
    if (height > 0) style.height = `${height}px`;
    
    // 절대 위치 설정
    if (!node.layoutMode) {
      style.position = 'absolute';
      style.left = `${x}px`;
      style.top = `${y}px`;
    }
  }

  // 배경 설정
  if (node.fills && node.fills.length > 0) {
    const visibleFills = node.fills.filter(fill => fill.visible !== false);
    if (visibleFills.length > 0) {
      const fill = visibleFills[0];
      switch (fill.type) {
        case 'SOLID':
          style.backgroundColor = rgbaToHex(fill.color);
          if (fill.opacity !== undefined) style.opacity = fill.opacity;
          break;
        case 'GRADIENT_LINEAR':
          style.backgroundImage = getGradientString(fill);
          break;
        case 'IMAGE':
          style.backgroundImage = `url(${fill.imageRef})`;
          style.backgroundSize = 'cover';
          style.backgroundPosition = 'center';
          break;
      }
    }
  }

  // 테두리 설정
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    if (stroke.visible !== false) {
      style.border = `${node.strokeWeight}px solid ${rgbaToHex(stroke.color)}`;
    }
  }

  // 모서리 둥글기
  if (node.cornerRadius) {
    if (typeof node.cornerRadius === 'number') {
      style.borderRadius = `${node.cornerRadius}px`;
    } else {
      style.borderRadius = `${node.topLeftRadius}px ${node.topRightRadius}px ${node.bottomRightRadius}px ${node.bottomLeftRadius}px`;
    }
  }

  // 텍스트 스타일
  if (node.type === 'TEXT' && node.style) {
    const { fontSize, fontWeight, fontFamily, letterSpacing, lineHeight, textAlignHorizontal } = node.style;
    
    if (fontSize) style.fontSize = `${fontSize}px`;
    if (fontWeight) style.fontWeight = fontWeight;
    if (fontFamily) style.fontFamily = fontFamily;
    if (letterSpacing) style.letterSpacing = `${letterSpacing}px`;
    if (lineHeight) style.lineHeight = `${lineHeight}px`;
    if (textAlignHorizontal) style.textAlign = textAlignHorizontal.toLowerCase();
  }

  // 효과 설정
  if (node.effects && node.effects.length > 0) {
    node.effects.forEach(effect => {
      if (effect.visible === false) return;
      
      switch (effect.type) {
        case 'DROP_SHADOW':
          style.boxShadow = `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${rgbaToHex(effect.color)}`;
          break;
        case 'INNER_SHADOW':
          style.boxShadow = `inset ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${rgbaToHex(effect.color)}`;
          break;
        case 'LAYER_BLUR':
          style.filter = `blur(${effect.radius}px)`;
          break;
      }
    });
  }

  return style;
};

// 의미 있는 클래스명 생성
const generateMeaningfulClassName = (node) => {
  let baseName = node.name.toLowerCase();
  
  // 숫자나 특수문자만으로 이루어진 이름 처리
  if (/^[0-9\W]+$/.test(baseName)) {
    baseName = getNodeTypeName(node) + '-' + baseName;
  }
  
  // 일반적인 컴포넌트 이름 패턴 적용
  if (node.type === 'FRAME') {
    baseName = `frame-${baseName}`;
  } else if (node.type === 'GROUP') {
    baseName = `group-${baseName}`;
  } else if (node.type === 'INSTANCE') {
    baseName = `component-${baseName}`;
  }
  
  return sanitizeClassName(baseName);
};

// 노드 타입에 따른 기본 이름 생성
const getNodeTypeName = (node) => {
  switch (node.type) {
    case 'TEXT': return 'text';
    case 'RECTANGLE': return 'box';
    case 'ELLIPSE': return 'circle';
    case 'VECTOR': return 'icon';
    case 'FRAME': return 'section';
    case 'GROUP': return 'group';
    case 'INSTANCE': return 'component';
    default: return 'element';
  }
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
  try {
    // 컴포넌트 상세 구조 정보 가져오기
    const componentStructure = await figmaService.getComponentDetails(fileKey, component.id);
    
    // 컴포넌트 구조를 기반으로 CSS 생성
    const cssContent = generateCSSFromStructure(componentStructure);
    
    // 미디어 쿼리 추가
    const mediaQueries = generateMediaQueries(componentStructure);
    
    return `${cssContent}\n\n${mediaQueries}`;
  } catch (error) {
    console.error('컴포넌트 구조 분석 실패:', error);
    return generateDefaultCSS(component);
  }
};

// 컴포넌트 구조를 기반으로 CSS 생성
const generateCSSFromStructure = (node) => {
  // 사용된 클래스명과 스타일을 추적하기 위한 Map
  const usedStyles = new Map();
  
  // JSX를 생성하면서 사용된 클래스명과 스타일 수집
  generateJSXFromStructure(node, '', new Set(), usedStyles);
  
  let css = '';
  
  // 실제 사용된 클래스와 유효한 스타일에 대해서만 CSS 생성
  usedStyles.forEach((nodeStyle, className) => {
    const generatedCSS = generateNodeCSS(className, nodeStyle);
    if (generatedCSS.trim()) {  // 빈 CSS는 제외
      css += generatedCSS;
    }
  });
  
  return css;
};

// 노드의 CSS 생성
const generateNodeCSS = (className, node) => {
  // 스타일 추출
  const style = extractNodeStyle(node);
  
  // 유효한 스타일이 없으면 빈 문자열 반환
  if (!style || Object.keys(style).filter(key => !isDefaultValue(key, style[key])).length === 0) {
    return '';
  }
  
  let css = `.${className} {\n`;
  
  // 기본 스타일 (기본값과 다른 경우만 포함)
  Object.entries(style).forEach(([property, value]) => {
    if (!isDefaultValue(property, value)) {
      css += `  ${kebabCase(property)}: ${value};\n`;
    }
  });
  
  // 레이아웃 모드에 따른 스타일
  if (node.layoutMode) {
    const layoutStyles = getLayoutStyles(node);
    Object.entries(layoutStyles).forEach(([property, value]) => {
      if (!isDefaultValue(property, value)) {
        css += `  ${kebabCase(property)}: ${value};\n`;
      }
    });
  }
  
  css += '}\n\n';
  
  // 호버 상태 (실제 변경사항이 있는 경우만)
  if (node.reactions && node.reactions.length > 0) {
    const hoverStyles = getHoverStyles(node);
    if (Object.keys(hoverStyles).length > 0) {
      css += `.${className}:hover {\n`;
      Object.entries(hoverStyles).forEach(([property, value]) => {
        if (!isDefaultValue(property, value)) {
          css += `  ${kebabCase(property)}: ${value};\n`;
        }
      });
      css += '}\n\n';
    }
  }
  
  return css;
};

// 레이아웃 스타일 추출 개선
const getLayoutStyles = (node) => {
  const styles = {};
  
  if (node.layoutMode) {
    // Flex 컨테이너 설정
    styles.display = 'flex';
    styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
    
    // 정렬
    if (node.primaryAxisAlignItems) {
      styles.justifyContent = convertFigmaAlignment(node.primaryAxisAlignItems);
    }
    if (node.counterAxisAlignItems) {
      styles.alignItems = convertFigmaAlignment(node.counterAxisAlignItems);
    }
    
    // 간격
    if (typeof node.itemSpacing === 'number' && node.itemSpacing > 0) {
      styles.gap = `${node.itemSpacing}px`;
    }
    
    // 패딩
    if (node.paddingTop) styles.paddingTop = `${node.paddingTop}px`;
    if (node.paddingRight) styles.paddingRight = `${node.paddingRight}px`;
    if (node.paddingBottom) styles.paddingBottom = `${node.paddingBottom}px`;
    if (node.paddingLeft) styles.paddingLeft = `${node.paddingLeft}px`;
    
    // Auto Layout 추가 속성
    if (node.layoutGrow === 1) {
      styles.flexGrow = 1;
    }
    if (node.layoutAlign === 'STRETCH') {
      styles.alignSelf = 'stretch';
    }
  }
  
  return styles;
};

// 호버 스타일 추출
const getHoverStyles = (node) => {
  const styles = {};
  
  if (node.reactions) {
    node.reactions.forEach(reaction => {
      if (reaction.actions) {
        reaction.actions.forEach(action => {
          if (action.type === 'NODE') {
            const hoverStyle = extractNodeStyle(action.destinationId);
            Object.entries(hoverStyle).forEach(([property, value]) => {
              // 기존 스타일과 다른 경우만 포함
              if (node[property] !== value) {
                styles[property] = value;
              }
            });
          }
        });
      }
    });
  }
  
  return styles;
};

// 기본값 체크
const isDefaultValue = (property, value) => {
  const defaultValues = {
    margin: '0px',
    padding: '0px',
    display: 'block',
    position: 'static',
    border: 'none',
    backgroundColor: 'transparent',
    opacity: '1',
    fontWeight: '400',
    fontSize: '16px',
    lineHeight: 'normal',
    color: '#000000'
  };
  
  return defaultValues[property] === value;
};

// 미디어 쿼리 생성
const generateMediaQueries = (node) => {
  let mediaQueries = '';
  
  // 브레이크포인트 정의
  const breakpoints = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1200
  };
  
  // 각 브레이크포인트에 대한 미디어 쿼리 생성
  Object.entries(breakpoints).forEach(([device, width]) => {
    mediaQueries += `@media (max-width: ${width}px) {\n`;
    
    // 반응형 스타일 생성
    if (node.children) {
      mediaQueries += generateResponsiveStyles(node.children, device);
    }
    
    mediaQueries += '}\n\n';
  });
  
  return mediaQueries;
};

// 반응형 스타일 생성
const generateResponsiveStyles = (nodes, device) => {
  let styles = '';
  
  nodes.forEach(node => {
    const className = sanitizeClassName(node.name);
    
    // 디바이스별 스타일 조정
    styles += `.${className} {\n`;
    
    switch (device) {
      case 'mobile':
        if (node.type === 'TEXT') {
          styles += '  font-size: 14px;\n';
        }
        styles += '  padding: 10px;\n';
        break;
      case 'tablet':
        if (node.type === 'TEXT') {
          styles += '  font-size: 16px;\n';
        }
        styles += '  padding: 15px;\n';
        break;
      case 'desktop':
        // 데스크톱 기본 스타일 유지
        break;
    }
    
    styles += '}\n\n';
    
    // 자식 노드에 대한 반응형 스타일
    if (node.children) {
      styles += generateResponsiveStyles(node.children, device);
    }
  });
  
  return styles;
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

// 위치 스타일 추출 개선
const getPositionStyle = (node) => {
  const style = {};
  
  if (!node.layoutMode && node.constraints) {
    const { horizontal, vertical } = node.constraints;
    
    style.position = 'absolute';
    
    // 수평 제약 조건
    switch (horizontal) {
      case 'LEFT_RIGHT':
        style.left = '0';
        style.right = '0';
        delete style.width; // 너비는 자동으로 계산됨
        break;
      case 'CENTER':
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        break;
      case 'RIGHT':
        style.right = '0';
        break;
      case 'LEFT':
      default:
        if (node.absoluteBoundingBox?.x) {
          style.left = `${node.absoluteBoundingBox.x}px`;
        }
        break;
    }
    
    // 수직 제약 조건
    switch (vertical) {
      case 'TOP_BOTTOM':
        style.top = '0';
        style.bottom = '0';
        delete style.height; // 높이는 자동으로 계산됨
        break;
      case 'CENTER':
        style.top = '50%';
        style.transform = style.transform 
          ? 'translate(-50%, -50%)'
          : 'translateY(-50%)';
        break;
      case 'BOTTOM':
        style.bottom = '0';
        break;
      case 'TOP':
      default:
        if (node.absoluteBoundingBox?.y) {
          style.top = `${node.absoluteBoundingBox.y}px`;
        }
        break;
    }
  }
  
  return style;
};

// 배경 스타일 추출
const getBackgroundStyle = (fills) => {
  const style = {};
  
  for (const fill of fills) {
    if (fill.visible === false) continue;
    
    switch (fill.type) {
      case 'SOLID':
        style.backgroundColor = rgbaToHex(fill.color);
        if (fill.opacity !== undefined && fill.opacity !== 1) {
          style.opacity = fill.opacity;
        }
        break;
        
      case 'GRADIENT_LINEAR':
        style.backgroundImage = getGradientString(fill);
        break;
        
      case 'GRADIENT_RADIAL':
        const stops = fill.gradientStops
          .map(stop => `${rgbaToHex(stop.color)} ${Math.round(stop.position * 100)}%`)
          .join(', ');
        style.backgroundImage = `radial-gradient(circle at center, ${stops})`;
        break;
        
      case 'IMAGE':
        style.backgroundImage = `url(${fill.imageRef})`;
        style.backgroundSize = fill.scaleMode === 'FILL' ? 'cover' : 'contain';
        style.backgroundPosition = 'center';
        style.backgroundRepeat = 'no-repeat';
        break;
    }
  }
  
  return style;
};

// 테두리 스타일 추출
const getBorderStyle = (node) => {
  const style = {};
  
  if (node.strokes && node.strokes.length > 0) {
    const visibleStrokes = node.strokes.filter(stroke => stroke.visible !== false);
    
    for (const stroke of visibleStrokes) {
      if (stroke.type === 'SOLID') {
        const color = rgbaToHex(stroke.color);
        const weight = node.strokeWeight || 1;
        const strokeAlign = node.strokeAlign || 'CENTER';
        
        // 테두리 스타일 설정
        style.border = `${weight}px solid ${color}`;
        
        // 테두리 정렬에 따른 조정
        if (strokeAlign === 'INSIDE') {
          style.boxSizing = 'border-box';
        } else if (strokeAlign === 'OUTSIDE') {
          style.boxSizing = 'content-box';
        }
        
        // 대시 패턴이 있는 경우
        if (node.strokeDashes && node.strokeDashes.length > 0) {
          style.borderStyle = 'dashed';
          style.borderWidth = `${weight}px`;
          style.borderColor = color;
        }
      }
    }
  }
  
  return style;
};

// 효과 스타일 추출
const getEffectStyle = (effects) => {
  const style = {};
  let shadows = [];
  let filters = [];
  
  effects.forEach(effect => {
    if (effect.visible === false) return;
    
    switch (effect.type) {
      case 'DROP_SHADOW':
      case 'INNER_SHADOW':
        shadows.push(getShadowString(effect));
        break;
        
      case 'LAYER_BLUR':
        filters.push(`blur(${effect.radius}px)`);
        break;
        
      case 'BACKGROUND_BLUR':
        style.backdropFilter = `blur(${effect.radius}px)`;
        break;
    }
  });
  
  if (shadows.length > 0) {
    style.boxShadow = shadows.join(', ');
  }
  
  if (filters.length > 0) {
    style.filter = filters.join(' ');
  }
  
  return style;
};

// 그라데이션 문자열 생성
const getGradientString = (fill) => {
  const stops = fill.gradientStops.map(stop => 
    `${rgbaToHex(stop.color)} ${Math.round(stop.position * 100)}%`
  ).join(', ');
  
  const angle = fill.gradientTransform 
    ? Math.atan2(fill.gradientTransform[1], fill.gradientTransform[0]) * (180 / Math.PI)
    : 0;
    
  return `linear-gradient(${angle}deg, ${stops})`;
};

// 그림자 문자열 생성
const getShadowString = (effect) => {
  const { offset, radius, spread, color } = effect;
  const inset = effect.type === 'INNER_SHADOW' ? 'inset ' : '';
  return `${inset}${offset.x}px ${offset.y}px ${radius}px ${spread}px ${rgbaToHex(color)}`;
};

// 텍스트 태그 결정
const determineTextTag = (node) => {
  if (!node.style) return 'p';
  
  const fontSize = node.style.fontSize || 0;
  const fontWeight = node.style.fontWeight || 400;
  
  if (fontSize >= 24 || (fontSize >= 20 && fontWeight >= 600)) return 'h1';
  if (fontSize >= 20 || (fontSize >= 16 && fontWeight >= 600)) return 'h2';
  if (fontSize >= 16 || (fontSize >= 14 && fontWeight >= 600)) return 'h3';
  return 'p';
};

// 노드가 유효한 스타일을 가지고 있는지 확인
const hasValidStyles = (node) => {
  // 기본 스타일 체크
  const style = extractNodeStyle(node);
  const hasNonDefaultStyles = Object.entries(style).some(([property, value]) => !isDefaultValue(property, value));
  
  // 레이아웃 스타일 체크
  const layoutStyles = node.layoutMode ? getLayoutStyles(node) : {};
  const hasNonDefaultLayoutStyles = Object.entries(layoutStyles).some(([property, value]) => !isDefaultValue(property, value));
  
  // 호버 스타일 체크
  const hoverStyles = node.reactions ? getHoverStyles(node) : {};
  const hasHoverStyles = Object.keys(hoverStyles).length > 0;
  
  return hasNonDefaultStyles || hasNonDefaultLayoutStyles || hasHoverStyles;
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

// Figma 정렬 값을 CSS 값으로 변환
const convertFigmaAlignment = (alignment) => {
  const alignmentMap = {
    'MIN': 'flex-start',
    'CENTER': 'center',
    'MAX': 'flex-end',
    'SPACE_BETWEEN': 'space-between'
  };
  return alignmentMap[alignment] || 'flex-start';
};

// 패딩 문자열 생성
const getPaddingString = (node) => {
  if (!node.padding) return undefined;
  
  const { top = 0, right = 0, bottom = 0, left = 0 } = node.padding;
  return `${top}px ${right}px ${bottom}px ${left}px`;
};