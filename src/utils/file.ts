enum AssetsType {
  Images = 'images'
}

export function isImages(fileName: string) {
  return /\.(png|svg|jpg|gif)$/.test(fileName);
}

/**
 * Verify whether the file needs to be processed by file loader
 * @param fileName File name or file path to be verified
 * @returns
 */
export function viaFileLoader(fileName: string) {
  const assetsTypeFunc = [isImages];
  return assetsTypeFunc.some(func => func(fileName));
}

/**
 * Get asset type through file name
 * @param fileName
 * @returns
 */
export function getAssetsType(fileName: string) {
  const assetsTypeFuncMap: {
    [key in AssetsType]: (fileName: string) => boolean;
  } = {
    [AssetsType.Images]: isImages
  };
  let assetsType: AssetsType;
  for(assetsType in assetsTypeFuncMap) {
    if (assetsTypeFuncMap[assetsType] && assetsTypeFuncMap[assetsType](fileName)) {
      return assetsType;
    }
  }
  return undefined;
}
