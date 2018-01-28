export const getValue = data => {
  if (data != null && data.value != null && typeof data.value === 'string') {
    return data.value.toString();
  } else {
    return '';
  }
};
