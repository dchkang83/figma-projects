// src/utils/componentGenerator.js
import { pascalCase, kebabCase } from './stringUtils';

// Figma 컴포넌트 데이터를 기반으로 React 컴포넌트 코드 생성
export const generateReactComponent = (component, imageUrl) => {
  const componentName = pascalCase(component.name);
  
  // 컴포넌트 유형에 따라 다른 구조 생성
  // 실제로는 Figma API에서 가져온 구조 정보를 분석하여 생성해야 함
  // 여기서는 간단한 예시로 구현
  
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
  
  // 카드 컴포넌트인 경우
  else if (component.name.toLowerCase().includes('card')) {
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
      <div className={cx('image-container')}>
        <img src="${imageUrl || ''}" alt="${componentName}" className={cx('image')} />
      </div>
      <div className={cx('content')}>
        <h2 className={cx('title')}>카드 제목</h2>
        <p className={cx('description')}>카드 설명</p>
      </div>
      <div className={cx('footer')}>
        <button className={cx('button')}>자세히 보기</button>
      </div>
      {props.children}
    </div>
  );
};

export default ${componentName};
`;
  }
  
  // 버튼 컴포넌트인 경우
  else if (component.name.toLowerCase().includes('button')) {
    return `
import React from 'react';
import classNames from 'classnames/bind';
import styles from './${componentName}.module.css';

const cx = classNames.bind(styles);

/**
 * ${component.description || componentName + ' 컴포넌트'}
 */
const ${componentName} = ({ children, variant = 'primary', ...props }) => {
  return (
    <button 
      className={cx('button', variant)} 
      {...props}
    >
      {children || '버튼'}
    </button>
  );
};

export default ${componentName};
`;
  }
  
  // 기본 컴포넌트 구조
  else {
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
  }
};

// CSS 모듈 코드 생성
export const generateComponentCSS = (component) => {
  const componentName = pascalCase(component.name).toLowerCase();
  
  // 컴포넌트 유형에 따라 다른 스타일 생성
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
  
  // 카드 컴포넌트인 경우
  else if (component.name.toLowerCase().includes('card')) {
    return `
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  padding: 16px;
}

.title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.description {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #666666;
}

.footer {
  padding: 12px 16px;
  border-top: 1px solid #eaeaea;
}

.button {
  width: 100%;
  padding: 8px 0;
  background-color: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
`;
  }
  
  // 버튼 컴포넌트인 경우
  else if (component.name.toLowerCase().includes('button')) {
    return `
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button.primary {
  background-color: #1677ff;
  color: white;
  border: none;
}

.button.secondary {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #d9d9d9;
}

.button.danger {
  background-color: #ff4d4f;
  color: white;
  border: none;
}

.button:hover {
  opacity: 0.8;
}

.button:active {
  transform: translateY(1px);
}
`;
  }
  
  // 기본 컴포넌트 스타일
  else {
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
  }
};

// 더 복잡한 컴포넌트 변환 로직
export const convertFigmaToReact = (figmaComponent, styleData) => {
  const componentName = pascalCase(figmaComponent.name);
  
  // 컴포넌트 유형에 따라 다른 구조 생성
  let jsxContent = '';
  let cssContent = '';
  
  // 모달 컴포넌트인 경우
  if (figmaComponent.name.toLowerCase().includes('modal')) {
    jsxContent = `
import React from 'react';
import classNames from 'classnames/bind';
import styles from './${componentName}.module.css';

const cx = classNames.bind(styles);

/**
 * ${figmaComponent.description || componentName + ' 컴포넌트'}
 */
const ${componentName} = ({ title = "제목", content = "내용", onClose, onConfirm, onCancel, ...props }) => {
  return (
    <div className={cx('container')} {...props}>
      <div className={cx('header')}>
        <h1 className={cx('title')}>{title}</h1>
        <button className={cx('close-button')} onClick={onClose}>×</button>
      </div>
      <div className={cx('body')}>
        <p className={cx('text')}>{content}</p>
      </div>
      <div className={cx('footer')}>
        <button className={cx('button', 'primary')} onClick={onConfirm}>확인</button>
        <button className={cx('button', 'secondary')} onClick={onCancel}>취소</button>
      </div>
    </div>
  );
};

export default ${componentName};
`;

    cssContent = `
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
  
  // 기본 컴포넌트 구조
  else {
    jsxContent = `
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
      <div className={cx('content')}>
        <h2 className={cx('title')}>제목</h2>
        <p className={cx('text')}>내용</p>
      </div>
      {children}
    </div>
  );
};

export default ${componentName};
`;

    cssContent = `
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
  }
  
  return {
    jsx: jsxContent,
    css: cssContent
  };
};