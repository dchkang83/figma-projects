// src/services/figmaService.js
import axios from 'axios';

const FIGMA_API_URL = 'https://api.figma.com/v1';

const figmaService = {
  // Figma 파일에서 컴포넌트 데이터 가져오기
  getFileComponents: async (fileKey) => {
    try {
      const response = await axios.get(`${FIGMA_API_URL}/files/${fileKey}`, {
        headers: {
          'X-Figma-Token': process.env.REACT_APP_FIGMA_TOKEN
        }
      });
      
      // 컴포넌트 데이터 필터링 및 정리
      const components = extractComponents(response.data);
      return components;
    } catch (error) {
      console.error('Figma 컴포넌트 가져오기 오류:', error);
      throw error;
    }
  },
  
  // 특정 컴포넌트의 이미지 가져오기
  getComponentImages: async (fileKey, componentIds) => {
    try {
      const idsParam = componentIds.join(',');
      const response = await axios.get(
        `${FIGMA_API_URL}/images/${fileKey}?ids=${idsParam}&format=svg`,
        {
          headers: {
            'X-Figma-Token': process.env.REACT_APP_FIGMA_TOKEN
          }
        }
      );
      
      return response.data.images;
    } catch (error) {
      console.error('Figma 이미지 가져오기 오류:', error);
      throw error;
    }
  }
};

// Figma 응답에서 컴포넌트 데이터 추출
const extractComponents = (figmaData) => {
  const components = [];
  
  // 재귀적으로 컴포넌트 노드 찾기
  const traverseNodes = (node) => {
    // 컴포넌트 타입 노드 식별
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      components.push({
        id: node.id,
        name: node.name,
        type: node.type,
        description: node.description || '',
        key: node.key || node.id
      });
    }
    
    // 자식 노드 탐색
    if (node.children) {
      node.children.forEach(child => traverseNodes(child));
    }
  };
  
  // 루트부터 시작하여 모든 노드 탐색
  traverseNodes(figmaData.document);
  
  return components;
};

export default figmaService;