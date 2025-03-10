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
  const [generatedComponents, setGeneratedComponents] = useState({});
  const [generating, setGenerating] = useState({});
  
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
    try {
      console.log('컴포넌트 생성 시작:', component);
      setGenerating(prev => ({ ...prev, [component.id]: true }));
      
      // 컴포넌트 코드 생성
      const reactCode = generateReactComponent(component, component.imageUrl);
      const cssCode = generateComponentCSS(component);
      
      console.log('생성된 코드:', { reactCode, cssCode });
      
      // 생성된 코드 저장
      setGeneratedComponents(prev => ({
        ...prev,
        [component.id]: {
          jsx: reactCode,
          css: cssCode,
          name: component.name
        }
      }));
    } catch (err) {
      console.error('컴포넌트 생성 실패:', err);
      setError('컴포넌트 생성 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setGenerating(prev => ({ ...prev, [component.id]: false }));
    }
  };
  
  // JSX 파일 다운로드
  const downloadJSX = (componentId) => {
    const component = generatedComponents[componentId];
    if (!component) return;
    
    const fileName = `${component.name}.jsx`;
    const fileContent = component.jsx;
    
    downloadFile(fileName, fileContent);
  };
  
  // CSS 모듈 파일 다운로드
  const downloadCSS = (componentId) => {
    const component = generatedComponents[componentId];
    if (!component) return;
    
    const fileName = `${component.name}.module.css`;
    const fileContent = component.css;
    
    downloadFile(fileName, fileContent);
  };
  
  // 파일 다운로드 헬퍼 함수
  const downloadFile = (fileName, content) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
                    <button 
                      onClick={() => generateComponentCode(component)}
                      disabled={generating[component.id]}
                      className="generate-button"
                    >
                      {generating[component.id] ? '생성 중...' : 'React 컴포넌트 생성'}
                    </button>
                    
                    {generatedComponents[component.id] && (
                      <div className="generated-component">
                        <h4>생성된 컴포넌트</h4>
                        <div className="code-preview">
                          <h5>JSX</h5>
                          <pre>{generatedComponents[component.id].jsx}</pre>
                          <button 
                            onClick={() => downloadJSX(component.id)}
                            className="download-button"
                          >
                            JSX 다운로드
                          </button>
                        </div>
                        <div className="code-preview">
                          <h5>CSS Module</h5>
                          <pre>{generatedComponents[component.id].css}</pre>
                          <button 
                            onClick={() => downloadCSS(component.id)}
                            className="download-button"
                          >
                            CSS 다운로드
                          </button>
                        </div>
                      </div>
                    )}
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