const generateProxy = (prefix: string, url: string) => {
  const encodedUrl = encodeURIComponent(btoa(url));
  const lastUrl = url.split("/").pop();
  return prefix + encodedUrl + "/" + lastUrl;
};

export const imageProxy = (url: string) => {
  const newUrl = generateProxy("/image-proxy/", url);

  return newUrl;
};
export const proxy = (url: string) => {
  const newUrl = generateProxy("/proxy/", url);

  return newUrl;
};
