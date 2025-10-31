import * as ImageManipulator from 'expo-image-manipulator';

// Crop the image to the provided rectangle (in original image pixels), then resize.
// cropRect: { x, y, width, height } in original image coordinates
export const enhanceImage = async (uri, addheight, cropRect) => {
  try {
    const actions = [];
    if (cropRect && cropRect.width > 0 && cropRect.height > 0) {
      actions.push({
        crop: {
          originX: Math.round(cropRect.x),
          originY: Math.round(cropRect.y),
          width: Math.round(cropRect.width),
          height: Math.round(cropRect.height),
        },
      });
    }

    // First: crop (if requested)
    const cropped = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: 1,
      format: ImageManipulator.SaveFormat.PNG,
    });

    // Then: resize to requested height while preserving aspect ratio
    const targetHeight = addheight || cropped.height;
    const ratio = cropped.height / cropped.width;
    const newWidth = Math.round(targetHeight / ratio);
    const newHeight = Math.round(newWidth * ratio);

    const result = await ImageManipulator.manipulateAsync(
      cropped.uri,
      [{ resize: { width: newWidth, height: newHeight } }],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.PNG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Erreur T404K:', error);
    return uri;
  }
};