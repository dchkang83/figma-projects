// src/utils/stringUtils.js

/**
 * 문자열을 PascalCase로 변환합니다.
 * 예: "button-primary" -> "ButtonPrimary"
 * 
 * @param {string} str 변환할 문자열
 * @returns {string} PascalCase로 변환된 문자열
 */
export const pascalCase = (str) => {
  if (!str) return '';
  
  // '=' 문자 제거
  str = str.replace(/=/g, '');
  
  // 슬래시(/)를 하이픈(-)으로 변환
  str = str.replace(/\//g, '-');
  
  // 한글 클래스명 영문으로 변환
  str = translateKoreanToEnglish(str);
  
  // 하이픈, 언더스코어, 공백으로 구분된 단어를 파스칼 케이스로 변환
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

/**
 * 문자열을 camelCase로 변환합니다.
 * 예: "button-primary" -> "buttonPrimary"
 * 
 * @param {string} str 변환할 문자열
 * @returns {string} camelCase로 변환된 문자열
 */
export const camelCase = (str) => {
  if (!str) return '';
  
  // '=' 문자 제거
  str = str.replace(/=/g, '');
  
  // 슬래시(/)를 하이픈(-)으로 변환
  str = str.replace(/\//g, '-');
  
  // 한글 클래스명 영문으로 변환
  str = translateKoreanToEnglish(str);
  
  // 하이픈, 언더스코어, 공백으로 구분된 단어를 카멜 케이스로 변환
  return str
    .split(/[-_\s]+/)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
};

/**
 * 문자열을 kebab-case로 변환합니다.
 * 예: "ButtonPrimary" -> "button-primary"
 * 
 * @param {string} str 변환할 문자열
 * @returns {string} kebab-case로 변환된 문자열
 */
export const kebabCase = (str) => {
  if (!str) return '';
  
  // '=' 문자 제거
  str = str.replace(/=/g, '');
  
  // 슬래시(/)를 하이픈(-)으로 변환
  str = str.replace(/\//g, '-');
  
  // 한글 클래스명 영문으로 변환
  str = translateKoreanToEnglish(str);
  
  // 파스칼 케이스나 카멜 케이스를 케밥 케이스로 변환
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * 한글 클래스명을 영문으로 변환합니다.
 * 
 * @param {string} str 변환할 문자열
 * @returns {string} 영문으로 변환된 문자열
 */
export const translateKoreanToEnglish = (str) => {
  if (!str) return '';
  
  // 한글 단어와 영문 변환 매핑
  const koreanToEnglish = {
    // 레이아웃 관련
    '컨테이너': 'container',
    '헤더': 'header',
    '푸터': 'footer',
    '사이드바': 'sidebar',
    '내비게이션': 'navigation',
    '네비게이션': 'navigation',
    '메뉴': 'menu',
    '콘텐츠': 'content',
    '컨텐츠': 'content',
    '섹션': 'section',
    '래퍼': 'wrapper',
    '그룹': 'group',
    
    // 컴포넌트 관련
    '모달': 'modal',
    '버튼': 'button',
    '카드': 'card',
    '폼': 'form',
    '입력': 'input',
    '테이블': 'table',
    '목록': 'list',
    '아이템': 'item',
    '아이콘': 'icon',
    '이미지': 'image',
    '배너': 'banner',
    '알림': 'alert',
    '토스트': 'toast',
    '탭': 'tab',
    '패널': 'panel',
    '슬라이더': 'slider',
    '캐러셀': 'carousel',
    '드롭다운': 'dropdown',
    '툴팁': 'tooltip',
    '페이지네이션': 'pagination',
    '로딩': 'loading',
    
    // 텍스트 관련
    '제목': 'title',
    '부제목': 'subtitle',
    '텍스트': 'text',
    '문단': 'paragraph',
    '설명': 'description',
    '레이블': 'label',
    '링크': 'link',
    
    // 상태 관련
    '활성화': 'active',
    '비활성화': 'disabled',
    '숨김': 'hidden',
    '표시': 'visible',
    '오류': 'error',
    '성공': 'success',
    '경고': 'warning',
    '정보': 'info',
    '기본': 'default',
    '주요': 'primary',
    '보조': 'secondary',
    '강조': 'accent',
    
    // 기타
    '닫기': 'close',
    '확인': 'confirm',
    '취소': 'cancel',
    '제출': 'submit',
    '검색': 'search',
    '필터': 'filter',
    '정렬': 'sort',
    '프로필': 'profile',
    '사용자': 'user',
    '로그인': 'login',
    '로그아웃': 'logout',
    '회원가입': 'signup',
    '댓글': 'comment',
    '좋아요': 'like',
    '공유': 'share',
    '저장': 'save',
    '삭제': 'delete',
    '편집': 'edit',
    '추가': 'add',
    '업로드': 'upload',
    '다운로드': 'download'
  };
  
  // 한글 단어를 영문으로 변환
  let result = str;
  Object.keys(koreanToEnglish).forEach(korean => {
    // 정규식을 사용하여 단어 경계에 있는 한글 단어만 변환
    const regex = new RegExp(`(^|[^가-힣])${korean}([^가-힣]|$)`, 'g');
    result = result.replace(regex, (match, p1, p2) => {
      return `${p1}${koreanToEnglish[korean]}${p2}`;
    });
    
    // 단독으로 사용된 한글 단어 변환
    if (result === korean) {
      result = koreanToEnglish[korean];
    }
  });
  
  // 변환되지 않은 한글이 있으면 영문 대체 이름 생성
  if (/[가-힣]/.test(result)) {
    // 한글이 포함된 경우 간단한 해시 생성
    const hash = Array.from(result)
      .reduce((acc, char) => {
        const code = char.charCodeAt(0);
        return (acc + code) % 999;
      }, 0)
      .toString();
    
    // 한글이 포함된 부분을 'element-{해시}'로 대체
    result = result.replace(/[가-힣]+/g, match => `element-${hash}`);
  }
  
  return result;
};