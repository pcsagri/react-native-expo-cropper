import * as ImageManipulator from 'expo-image-manipulator';

export const enhanceImage = async (uri , addheight) => {
  try {
    const imageInfo = await ImageManipulator.manipulateAsync(uri, []);
    const ratio = imageInfo.height / imageInfo.width;

    const maxHeight = addheight;
    const newWidth = Math.round(maxHeight / ratio);
    const newHeight = Math.round(newWidth * ratio);

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        { resize: { width: newWidth, height: newHeight } },
      ],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.PNG
      }
    );

    return result.uri;
  } catch (error) {
    console.error("Erreur T404K:", error);
    return uri;
  }
};