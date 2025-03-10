// src/utils/stringUtils.js

/**
 * 문자열을 PascalCase로 변환합니다.
 * 예: "button-primary" -> "ButtonPrimary"
 * 
 * @param {string} str 변환할 문자열
 * @returns {string} PascalCase로 변환된 문자열
 */
const pascalCase = (str) => {
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
const camelCase = (str) => {
  const pascal = pascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/**
 * 문자열을 kebab-case로 변환합니다.
 * 예: "ButtonPrimary" -> "button-primary"
 * 
 * @param {string} str 변환할 문자열
 * @returns {string} kebab-case로 변환된 문자열
 */
const kebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

module.exports = {
  pascalCase,
  camelCase,
  kebabCase
};