const sanitizeStr = (str) => {
  const pattern = /\s{2,}/ig;
  const cleanStr = str.replace(pattern, ' ');
  return cleanStr.trim();
};

export default sanitizeStr;
