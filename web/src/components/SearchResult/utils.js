export function slugify(text)
{
  if(text){
    return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
  }else{
    return "";
  }
}

export const getValue = (data) => {
  if (data != null && data.value != null && (typeof data.value === 'string')) {
    return data.value.toString();
  } else {
    return '';
  }
}
