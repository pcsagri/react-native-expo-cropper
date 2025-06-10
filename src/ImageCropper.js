import styles from './ImageCropperStyles';
import React, { useState, useRef, useEffect } from 'react';
import { Modal,View, Image, Dimensions, TouchableOpacity, Animated, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import CustomCamera from './CustomCamera';
import { enhanceImage } from './ImageProcessor';

const ImageCropper = ({ onConfirm, openCameraFirst, initialImage ,addheight}) => {


  const [image, setImage] = useState(null);
  const [points, setPoints] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showCustomCamera, setShowCustomCamera] = useState(false);
  const viewRef = useRef(null);
  const imageMeasure = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const selectedPointIndex = useRef(null);
  const lastTap = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showFullScreenCapture, setShowFullScreenCapture] = useState(false);
  




  useEffect(() => {
  if (openCameraFirst) {
  setShowCustomCamera(true);
} else if (initialImage) {
  setImage(initialImage);
}
}, [openCameraFirst, initialImage]);


  useEffect(() => {
  if (!image) return;

  Image.getSize(image, (imgWidth, imgHeight) => {
    const screenRatio = SCREEN_WIDTH / SCREEN_HEIGHT;
    const imageRatio = imgWidth / imgHeight;

    if (imageRatio > screenRatio) {
      imageMeasure.current = {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH / imageRatio,
      };
    } else {
      imageMeasure.current = {
        width: SCREEN_HEIGHT * imageRatio,
        height: SCREEN_HEIGHT,
      };
    }
  });
}, [image]);


  const initializeCropBox = () => {
    const { width, height } = imageMeasure.current;
    // if (width === 0 || height === 0 || points.length > 0) return;
    const boxWidth = width * 0.6;
    const boxHeight = height * 0.6;
    const centerX = width / 2;
    const centerY = height / 2;
    setPoints([
      { x: centerX - boxWidth / 2, y: centerY - boxHeight / 2 },
      { x: centerX + boxWidth / 2, y: centerY - boxHeight / 2 },
      { x: centerX + boxWidth / 2, y: centerY + boxHeight / 2 },
      { x: centerX - boxWidth / 2, y: centerY + boxHeight / 2 },
    ]);
  };


  const onImageLayout = (e) => {
    const layout = e.nativeEvent.layout;
    imageMeasure.current = {
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height
    };
    initializeCropBox();
  };

  const createPath = () => {
    if (points.length < 1) return '';
    let path = `M ${points[0].x} ${points[0].y} `;
    points.forEach(point => path += `L ${point.x} ${point.y} `);
    return path + 'Z';
  };

  const handleTap = (e) => {
    if (!image || showResult) return;
    const now = Date.now();
    const { locationX: tapX, locationY: tapY } = e.nativeEvent;
    if (lastTap.current && now - lastTap.current < 300) {
      const exists = points.some(p => Math.abs(p.x - tapX) < 15 && Math.abs(p.y - tapY) < 15);
      if (!exists) setPoints([...points, { x: tapX, y: tapY }]);
      lastTap.current = null;
    } else {
      const index = points.findIndex(p => Math.abs(p.x - tapX) < 20 && Math.abs(p.y - tapY) < 20);
      if (index !== -1) selectedPointIndex.current = index;
      lastTap.current = now;
    }
  };

  const handleMove = (e) => {
    if (showResult || selectedPointIndex.current === null) return;
    const { locationX: moveX, locationY: moveY } = e.nativeEvent;
    const boundedX = Math.max(0, Math.min(moveX, imageMeasure.current.width));
    const boundedY = Math.max(0, Math.min(moveY, imageMeasure.current.height));
    setPoints(prev =>
      prev.map((p, i) => i === selectedPointIndex.current ? { x: boundedX, y: boundedY } : p)
    );
  };

  const handleRelease = () => {
    selectedPointIndex.current = null;
  };

  const handleReset = () => {
    // setPoints([]);
    initializeCropBox();
  };


  return (
    <View style={styles.container}>

      {showCustomCamera ? (
        <CustomCamera
          onPhotoCaptured={(uri) => { setImage(uri); setShowCustomCamera(false); }}
          onCancel={() => setShowCustomCamera(false)}
        />
      ) : (
        <>
          {!showResult && (
            <View style={image ? styles.buttonContainer : styles.centerButtonsContainer}>
 
              {image && (
                <TouchableOpacity style={styles.button} onPress={handleReset}>
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
              )}
              {image && (
              <TouchableOpacity
                style={styles.button}
                  onPress={async () => {
                        // setShowFullScreenCapture(true); 
                        setIsLoading(true);
                        // setShowResult(true);
                        try {
                          await new Promise((resolve) => requestAnimationFrame(resolve));
                          const capturedUri = await captureRef(viewRef, {
                            format: 'png',
                            quality: 1,
                          });

                        
                        const enhancedUri = await enhanceImage(capturedUri ,addheight);
                        const name = `IMAGE XTK${Date.now()}.png`;

                    
                    if (onConfirm) {
                      onConfirm(enhancedUri, name);
                    }
                  } catch (error) {
                    console.error("Erreur lors de la capture :", error);
                    alert("Erreur lors de la capture !");
                  } finally {
                    setShowResult(false);
                    setIsLoading(false);
                    setShowFullScreenCapture(false);
                  }
                }}
  >
    <Text style={styles.buttonText}>Confirm</Text>
  </TouchableOpacity>
)}

            </View>
          )}


          {image && (
            <View
              ref={viewRef}
              collapsable={false}
              style={showFullScreenCapture ? styles.fullscreenImageContainer : styles.imageContainer}
              onStartShouldSetResponder={() => true}
              onResponderStart={handleTap}
              onResponderMove={handleMove}
              onResponderRelease={handleRelease}
            >
              <Image source={{ uri: image }} style={styles.image} onLayout={onImageLayout} />
              <Svg style={styles.overlay}>
                <Path
                  d={`M 0 0 H ${imageMeasure.current.width} V ${imageMeasure.current.height} H 0 Z ${createPath()}`}
                  fill={showResult ? 'black' : 'rgba(0, 0, 0, 0.7)'}
                  fillRule="evenodd"
                />
                {!showResult && points.length > 0 && (
                  <Path d={createPath()} fill="transparent" stroke="white" strokeWidth={2} />
                )}
                {!showResult && points.map((point, index) => (
                  <Circle key={index} cx={point.x} cy={point.y} r={10} fill="white" />
                ))}
              </Svg>
            </View>
          )}
        </>
      )}

            <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <Image
            source={require('../src/assets/loadingCamera.gif')}
            style={styles.loadingGif}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

export default ImageCropper;