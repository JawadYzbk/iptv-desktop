const generateProxy = (prefix: string, url: string) => {
  if (url.startsWith(window.location.protocol + "//" + window.location.host)) {
    return url;
  }
  if (url.startsWith(prefix)) {
    return url;
  }
  if (url.startsWith("https://")) {
    return prefix + "https/" + url.substring(8);
  } else if (url.startsWith("http://")) {
    return prefix + "http/" + url.substring(7);
  }
  alert("Unknown scheme: " + url);
  throw new Error("Unknown scheme: " + url);
};

export const imageProxy = (url: string) => {
  const newUrl = generateProxy("/image-proxy/", url);

  return newUrl;
};
export const proxy = (url: string) => {
  const newUrl = generateProxy("/proxy/", url);

  return newUrl;
};
