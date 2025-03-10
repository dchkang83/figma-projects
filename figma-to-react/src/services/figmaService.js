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
  },
  
  // 특정 컴포넌트의 상세 구조 정보 가져오기
  getComponentDetails: async (fileKey, nodeId) => {
    try {
      const response = await axios.get(`${FIGMA_API_URL}/files/${fileKey}/nodes?ids=${nodeId}`, {
        headers: {
          'X-Figma-Token': process.env.REACT_APP_FIGMA_TOKEN
        }
      });
      
      // 노드 데이터에서 컴포넌트 구조 추출
      const nodeData = response.data.nodes[nodeId];
      if (!nodeData) {
        throw new Error(`컴포넌트 노드를 찾을 수 없습니다: ${nodeId}`);
      }
      
      // 컴포넌트 구조 분석
      const componentStructure = analyzeComponentStructure(nodeData.document);
      return componentStructure;
    } catch (error) {
      console.error('Figma 컴포넌트 상세 정보 가져오기 오류:', error);
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
        key: node.key || node.id,
        // 추가 정보 저장
        absoluteBoundingBox: node.absoluteBoundingBox,
        styles: node.styles || {}
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

// 컴포넌트 구조 분석
const analyzeComponentStructure = (node) => {
  // 기본 노드 정보
  const nodeInfo = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible !== false,
    children: []
  };
  
  // 스타일 정보 추가
  if (node.fills) nodeInfo.fills = node.fills;
  if (node.strokes) nodeInfo.strokes = node.strokes;
  if (node.strokeWeight) nodeInfo.strokeWeight = node.strokeWeight;
  if (node.cornerRadius) nodeInfo.cornerRadius = node.cornerRadius;
  if (node.absoluteBoundingBox) nodeInfo.absoluteBoundingBox = node.absoluteBoundingBox;
  
  // 텍스트 노드인 경우 텍스트 내용 추가
  if (node.type === 'TEXT') {
    nodeInfo.characters = node.characters || '';
    nodeInfo.style = node.style || {};
  }
  
  // 자식 노드 처리
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      // 보이는 노드만 처리
      if (child.visible !== false) {
        nodeInfo.children.push(analyzeComponentStructure(child));
      }
    });
  }
  
  return nodeInfo;
};

export default figmaService;