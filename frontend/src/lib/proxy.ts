export const imageProxy = (url: string) => {
  const newUrl = "/image-proxy?url=" + encodeURIComponent(url);

  return newUrl;
};
