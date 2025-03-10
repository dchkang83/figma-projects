// src/App.js
import React, { useState, useEffect } from 'react';
import figmaService from './services/figmaService';
import { generateReactComponent, generateComponentCSS } from './utils/componentGenerator';
import Modal1 from './components/Modal1';
import './App.css';

function App() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExample, setShowExample] = useState(false);
  
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const fileKey = process.env.REACT_APP_FIGMA_FILE_KEY;
        
        // Figma 파일에서 컴포넌트 가져오기
        const fetchedComponents = await figmaService.getFileComponents(fileKey);
        
        // 컴포넌트 이미지 URL 가져오기
        if (fetchedComponents.length > 0) {
          const componentIds = fetchedComponents.map(comp => comp.id);
          const images = await figmaService.getComponentImages(fileKey, componentIds);
          
          // 이미지 URL 추가
          const componentsWithImages = fetchedComponents.map(comp => ({
            ...comp,
            imageUrl: images[comp.id]
          }));
          
          setComponents(componentsWithImages);
        } else {
          setComponents([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('컴포넌트 가져오기 실패:', err);
        setError('Figma 컴포넌트를 가져오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    fetchComponents();
  }, []);
  
  // 컴포넌트 코드 생성 및 다운로드
  const generateComponentCode = (component) => {
    const reactCode = generateReactComponent(component, component.imageUrl);
    const cssCode = generateComponentCSS(component);
    
    // 코드를 표시하거나 파일로 다운로드할 수 있음
    console.log(reactCode, cssCode);
    
    // 여기서 파일 시스템 작업을 수행하거나 다운로드 링크 생성 가능
    // 실제 구현에서는 서버 측에서 파일 생성을 처리해야 함
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Figma to React Component Converter</h1>
        <button 
          className="example-button" 
          onClick={() => setShowExample(!showExample)}
        >
          {showExample ? '예시 숨기기' : '예시 보기'}
        </button>
      </header>
      
      {showExample && (
        <div className="example-section">
          <h2>예시 컴포넌트</h2>
          <div className="example-component">
            <Modal1 />
          </div>
          <div className="example-code">
            <h3>컴포넌트 코드</h3>
            <pre>
{`import React from 'react';
import classNames from 'classnames/bind';
import styles from './Modal1.module.css';

const cx = classNames.bind(styles);

const Modal1 = () => {
  return (
    <div className={cx('container')}>
      <h1>내 애플리케이션</h1>
    </div>
  );
};

export default Modal1;`}
            </pre>
          </div>
        </div>
      )}
      
      <main>
        {loading ? (
          <p>컴포넌트를 가져오는 중...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="component-list">
            <h2>가져온 컴포넌트 ({components.length})</h2>
            {components.length === 0 ? (
              <p>컴포넌트를 찾을 수 없습니다.</p>
            ) : (
              <ul>
                {components.map(component => (
                  <li key={component.id} className="component-item">
                    <h3>{component.name}</h3>
                    {component.imageUrl && (
                      <img 
                        src={component.imageUrl} 
                        alt={component.name} 
                        className="component-preview" 
                      />
                    )}
                    <button onClick={() => generateComponentCode(component)}>
                      React 컴포넌트 생성
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;