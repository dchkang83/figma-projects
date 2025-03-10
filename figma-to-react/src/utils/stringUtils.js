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
  
  // 파스칼 케이스나 카멜 케이스를 케밥 케이스로 변환
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};