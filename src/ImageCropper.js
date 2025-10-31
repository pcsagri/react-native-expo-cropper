import styles from './ImageCropperStyles';
import React, { useState, useRef, useEffect } from 'react';
import { Modal,View, Image, Dimensions, TouchableOpacity, Animated, Platform , Text } from 'react-native';
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
  const lastValidPosition = useRef(null);
  const [captureRequested, setCaptureRequested] = useState(false);
  const [overlayReady, setOverlayReady] = useState(false);

  // Local screen size used for imageMeasure calculation
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  




  useEffect(() => {
  if (openCameraFirst) {
  setShowCustomCamera(true);
} else if (initialImage) {
  setImage(initialImage);
}
}, [openCameraFirst, initialImage]);


  // Measure based strictly on actual layout, not screen ratio
  // to avoid mismatches that truncate the selectable bottom area
  // (onImageLayout handles measurement updates)

  // Perform capture after UI commits (avoids iOS timer/RAF awaits)
  // iOS capture logic using useEffect with overlay readiness
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (!captureRequested || !showResult || !overlayReady || !viewRef.current) return;

    let cancelled = false;
    const doCapture = async () => {
      try {
        const capturedUri = await captureRef(viewRef.current, {
          format: 'png',
          quality: 1,
        });
        const enhancedUri = await enhanceImage(capturedUri ,addheight);
        const name = `IMAGE XTK${Date.now()}.png`;
        if (!cancelled && onConfirm) {
          onConfirm(enhancedUri, name);
        }
      } catch (error) {
        console.error("Erreur lors de la capture :", error);
        alert("Erreur lors de la capture !");
      } finally {
        if (!cancelled) {
          setShowResult(false);
          setIsLoading(false);
          setShowFullScreenCapture(false);
          setCaptureRequested(false);
          setOverlayReady(false);
        }
      }
    };
    doCapture();
    return () => { cancelled = true; };
  }, [captureRequested, showResult, overlayReady, addheight, onConfirm]);

  // Helpers to compute crop rectangle in original image pixels
  const getImageSizeAsync = (uri) =>
    new Promise((resolve, reject) => {
      Image.getSize(uri, (w, h) => resolve({ width: w, height: h }), reject);
    });

  const computeCropRect = (pts, measure, origW, origH) => {
    const containerW = measure.width;
    const containerH = measure.height;
    if (!containerW || !containerH || !origW || !origH || !pts || pts.length === 0) return null;

    const ratio = origH / origW;
    let dispW, dispH, offX, offY;
    if (containerW * ratio <= containerH) {
      // image constrained by width
      dispW = containerW;
      dispH = containerW * ratio;
      offX = 0;
      offY = (containerH - dispH) / 2;
    } else {
      // image constrained by height
      dispH = containerH;
      dispW = containerH / ratio;
      offY = 0;
      offX = (containerW - dispW) / 2;
    }

    const xs = pts.map(p => Math.max(0, Math.min(dispW, p.x - offX)));
    const ys = pts.map(p => Math.max(0, Math.min(dispH, p.y - offY)));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const normMinX = minX / dispW;
    const normMaxX = maxX / dispW;
    const normMinY = minY / dispH;
    const normMaxY = maxY / dispH;

    const originX = Math.round(normMinX * origW);
    const originY = Math.round(normMinY * origH);
    const widthPx = Math.round((normMaxX - normMinX) * origW);
    const heightPx = Math.round((normMaxY - normMinY) * origH);

    return { x: originX, y: originY, width: widthPx, height: heightPx };
  };


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
      if (index !== -1) {
        selectedPointIndex.current = index;
        lastValidPosition.current = { ...points[index] }; // store original position before move
      }
      lastTap.current = now;
    }
  };

  const handleMove = (e) => {
    if (showResult || selectedPointIndex.current === null) return;
  
    const { locationX: moveX, locationY: moveY } = e.nativeEvent;
    const width = imageMeasure.current.width;
    const height = imageMeasure.current.height;
  
    const boundedX = Math.max(0, Math.min(moveX, width));
    const boundedY = Math.max(0, Math.min(moveY, height));
  
    // Valid move — update point and store as new last valid position
    const updatedPoint = { x: boundedX, y: boundedY };
    lastValidPosition.current = updatedPoint;
  
    setPoints(prev =>
      prev.map((p, i) =>
        i === selectedPointIndex.current ? updatedPoint : p
      )
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
          {!showResult && !image && (
            <View pointerEvents="box-none" style={styles.centerButtonsContainer}>
 
              {image && (
                <TouchableOpacity style={styles.button} onPress={handleReset}>
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
              )}
              {image && (
              <TouchableOpacity
                style={styles.button}
                  onPress={async () => {
                    setIsLoading(true);
                    setShowResult(true);
                    setOverlayReady(false);
                    setCaptureRequested(true);
                    
                    // Android capture logic using requestAnimationFrame
                    if (Platform.OS === 'android') {
                      try {
                        await new Promise((resolve) => requestAnimationFrame(resolve));
                        const capturedUri = await captureRef(viewRef.current, {
                          format: 'png',
                          quality: 1,
                        });
                        const enhancedUri = await enhanceImage(capturedUri, addheight);
                        const name = `IMAGE XTK${Date.now()}.png`;
                        
                        if (onConfirm) {
                          onConfirm(enhancedUri, name);
                        }
                        
                        setShowResult(false);
                        setIsLoading(false);
                        setShowFullScreenCapture(false);
                        setCaptureRequested(false);
                        setOverlayReady(false);
                      } catch (error) {
                        console.error("Erreur lors de la capture :", error);
                        alert("Erreur lors de la capture !");
                        setIsLoading(false);
                      }
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
              <Svg
                pointerEvents="none"
                key={showResult ? 'mask' : 'edit'}
                style={styles.overlay}
                onLayout={() => {
                  if (showResult) setOverlayReady(true);
                }}
              >
                <Path
                  d={`M 0 0 H ${imageMeasure.current.width} V ${imageMeasure.current.height} H 0 Z ${createPath()}`}
                  fill={showResult ? 'white' : 'rgba(255, 255, 255, 0.8)'}
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
          {!showResult && image && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleReset}>
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                  try {
                    setIsLoading(true);
                    const { width: origW, height: origH } = await getImageSizeAsync(image);
                    const rect = computeCropRect(points, imageMeasure.current, origW, origH);
                    const enhancedUri = await enhanceImage(image, addheight, rect);
                    const name = `IMAGE XTK${Date.now()}.png`;
                    if (onConfirm) onConfirm(enhancedUri, name);
                  } catch (error) {
                    console.error('Erreur lors de la capture :', error);
                    alert('Erreur lors de la capture !');
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
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