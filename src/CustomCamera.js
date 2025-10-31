import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
const { width } = Dimensions.get('window');

export default function CustomCamera({ onPhotoCaptured}) {
  const [isReady, setIsReady] = useState(false);
  const [loadingBeforeCapture, setLoadingBeforeCapture] = useState(false);
  const [setHasPermission] = useState(null);
  const cameraRef = useRef(null);

 

useEffect(() => {
  (async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  })();
}, []);



  const takePicture = async () => {
    if (cameraRef.current) {
      try {

        setTimeout(() => {
          setLoadingBeforeCapture(true);
        }, 1000);
  
        if (Platform.OS === 'android') {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
  
        const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        shutterSound: false,
      });

  
        onPhotoCaptured(photo.uri);
  
        setLoadingBeforeCapture(false);
      } catch (error) {
        setLoadingBeforeCapture(false);
        Alert.alert("Erreur");
      }
    }
  };
  

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing="back"
          ref={cameraRef}
          onCameraReady={() => setIsReady(true)}
        />

        {/* Loading overlay */}
        {loadingBeforeCapture && (
          <>
            <View style={styles.loadingOverlay}>
              <Image
                source={require('../src/assets/loadingCamera.gif')}
                style={styles.loadingGif}
                resizeMode="contain"
              />
            </View>
            <View style={styles.touchBlocker} pointerEvents="auto" />
          </>
        )}

        {/* Cadre de scan */}
        <View style={styles.scanFrame} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={takePicture}
          disabled={!isReady || loadingBeforeCapture}
        />
      </View>
    </SafeAreaView>
  );
}

const PRIMARY_GREEN = '#198754';
const DEEP_BLACK = '#0B0B0B';
const GLOW_WHITE = 'rgba(255, 255, 255, 0.85)';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: DEEP_BLACK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraWrapper: {
    width: width,
    aspectRatio: 9 / 16,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  scanFrame: {
    position: 'absolute',
    width: '95%',
    height: '80%',
    borderWidth: 4,
    borderColor: PRIMARY_GREEN,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGif: {
    width: 100,
    height: 100,
  },
  touchBlocker: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 21,
    backgroundColor: 'transparent',
  },
  cancelIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 5,
    padding: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: GLOW_WHITE,
    borderWidth: 5,
    borderColor: PRIMARY_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: GLOW_WHITE,
  },
  container: {
    flex: 1,
    backgroundColor: DEEP_BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconText: {
    fontSize: 18,
    color: GLOW_WHITE,
    fontWeight: '600',
  },
});
