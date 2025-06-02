# polygonal-image-cropper

Un composant React Native basé sur Expo pour recadrer une image de manière polygonale à partir de la galerie ou de la caméra.

## 🔧 Installation

```bash
npm install polygonal-image-cropper

Ou

yarn add polygonal-image-cropper


EXPO SDK 53 -------------------------------------------------------------

"peerDependencies": {
    "expo": "53.0.9",
    "react": "19.0.0",
    "react-native": "0.79.2"
  },
  "dependencies": {
    "expo": "53.0.9",
    "expo-camera": "16.1.6",
    "expo-image-manipulator": "13.1.6",
    "expo-image-picker": "16.1.4",
    "expo-media-library": "17.1.6",
    "expo-screen-orientation": "8.1.6",
    "@expo/vector-icons": "14.1.0",
    "react-native-svg": "15.11.2",
    "react-native-view-shot": "4.0.3"
  },


------------------------------ DO THIS IN YOUR APP SCREEN CODE !!!!!!!!!! :-------------------------------

import ImageCropper from 'polygonal-image-cropper/src/ImageCropper';


  const [crop, setCrop] = useState(false);
  const [useCameraInCropper, setUseCameraInCropper] = useState(false);
  const [initialImageForCropper, setInitialImageForCropper] = useState(null);




 TO OPEN THE GALERIE BEFORE THE CROPPER YOU NEED TO ADD THIS IN YOU APP SCREEN CODE TOO :
 
 const handlePickAndCropImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setInitialImageForCropper(result.assets[0].uri);
      setUseCameraInCropper(false); // sécurité
      setCrop(true);
    }
  } catch (error) {
    console.log("Erreur lors du choix de l'image :", error);
  }
}; 




YOUR CAMERA AND GALERY Bottons :


        <TouchableOpacity
              style={styles.buttonOutline}
              onPress={() => {
                setUseCameraInCropper(true);
                setCrop(true);
              }}
            >
              <Text style={styles.buttonTextB}>Take A photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={handlePickAndCropImage}
            >
              <Text style={styles.buttonTextB}>Chose image From the phone Galerie</Text>
            </TouchableOpacity>




condition:

{crop ? (
  <View style={{ flex: 1 }}>
    <TouchableOpacity
      onPress={() => {
        setCrop(false);
        setUseCameraInCropper(false);
      }}
      style={{
        position: 'absolute',
        top: 40,
        right: 5,
        zIndex: 9999,
        backgroundColor: '#ffffffaa',
        padding: 10,
        borderRadius: 3,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}> X </Text>
    </TouchableOpacity>

    <ImageCropper
        initialImage={initialImageForCropper}
        openCameraFirst={useCameraInCropper}
        onConfirm={(uri, name) => {
          setImage(uri);
          setURi(uri);
          setImageName(name);
          setCrop(false);
          setUseCameraInCropper(false);
          setInitialImageForCropper(null);
          setIsReady(true);
        }}
        onCancel={() => {
          setCrop(false);
          setUseCameraInCropper(false);
          setInitialImageForCropper(null);
        }}
      />

  </View>
)}
