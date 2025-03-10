// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import figmaService from './services/figmaService';
import { generateReactComponent, generateComponentCSS } from './utils/componentGenerator';
import { pascalCase } from './utils/stringUtils';
import Modal1 from './components/Modal1';

function App() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExample, setShowExample] = useState(false);
  const [generatedComponents, setGeneratedComponents] = useState({});
  const [generating, setGenerating] = useState({});
  const [copySuccess, setCopySuccess] = useState({});
  
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
  const generateComponentCode = async (component) => {
    try {
      console.log('컴포넌트 생성 시작:', component);
      setGenerating(prev => ({ ...prev, [component.id]: true }));
      
      // 컴포넌트 이름에서 '=' 문자 제거
      const cleanedComponent = {
        ...component,
        name: component.name.replace(/=/g, '')
      };
      
      // Figma 파일 키 가져오기
      const fileKey = process.env.REACT_APP_FIGMA_FILE_KEY;
      if (!fileKey) {
        throw new Error('Figma 파일 키가 설정되지 않았습니다.');
      }
      
      // 컴포넌트 코드 생성 (비동기 함수로 변경)
      const reactCode = await generateReactComponent(cleanedComponent, component.imageUrl, fileKey);
      const cssCode = await generateComponentCSS(cleanedComponent, fileKey);
      
      console.log('생성된 코드:', { reactCode, cssCode });
      
      // 생성된 코드 저장
      setGeneratedComponents(prev => ({
        ...prev,
        [component.id]: {
          jsx: reactCode,
          css: cssCode,
          name: cleanedComponent.name
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
    if (component) {
      const componentName = pascalCase(component.name.replace(/=/g, ''));
      downloadFile(`${componentName}.jsx`, component.jsx);
    }
  };
  
  // CSS 모듈 파일 다운로드
  const downloadCSS = (componentId) => {
    const component = generatedComponents[componentId];
    if (component) {
      const componentName = pascalCase(component.name.replace(/=/g, ''));
      downloadFile(`${componentName}.module.css`, component.css);
    }
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
  
  // 코드 복사 함수
  const copyToClipboard = (text, type, componentId) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // 복사 성공 상태 업데이트
        setCopySuccess(prev => ({
          ...prev,
          [componentId]: {
            ...prev[componentId],
            [type]: true
          }
        }));
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => {
          setCopySuccess(prev => ({
            ...prev,
            [componentId]: {
              ...prev[componentId],
              [type]: false
            }
          }));
        }, 3000);
      },
      (err) => {
        console.error('클립보드 복사 실패:', err);
      }
    );
  };
  
  return (
    <div className="App">


<div>test
<Modal1 />

</div>

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
                    <div>
                      <button 
                        onClick={async () => await generateComponentCode(component)}
                        disabled={generating[component.id]}
                        className="generate-button"
                      >
                        {generating[component.id] ? '생성 중...' : 'React 컴포넌트 생성'}
                      </button>
                    </div>
                    
                    {generatedComponents[component.id] && (
                      <div className="generated-component">
                        <h4>{generatedComponents[component.id].name} 컴포넌트 생성됨</h4>
                        
                        <div className="code-preview">
                          <div className="code-header">
                            <h5>JSX 코드</h5>
                            <button 
                              className="copy-button"
                              onClick={() => copyToClipboard(
                                generatedComponents[component.id].jsx, 
                                'jsx', 
                                component.id
                              )}
                            >
                              {copySuccess[component.id]?.jsx ? '복사됨!' : '복사하기'}
                            </button>
                          </div>
                          <pre>{generatedComponents[component.id].jsx}</pre>
                          <button 
                            className="download-button"
                            onClick={() => downloadJSX(component.id)}
                          >
                            JSX 다운로드
                          </button>
                        </div>
                        
                        <div className="code-preview">
                          <div className="code-header">
                            <h5>CSS 모듈 코드</h5>
                            <button 
                              className="copy-button"
                              onClick={() => copyToClipboard(
                                generatedComponents[component.id].css, 
                                'css', 
                                component.id
                              )}
                            >
                              {copySuccess[component.id]?.css ? '복사됨!' : '복사하기'}
                            </button>
                          </div>
                          <pre>{generatedComponents[component.id].css}</pre>
                          <button 
                            className="download-button"
                            onClick={() => downloadCSS(component.id)}
                          >
                            CSS 모듈 다운로드
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