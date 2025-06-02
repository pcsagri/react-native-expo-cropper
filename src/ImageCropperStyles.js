import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT;
const IMAGE_WIDTH = SCREEN_WIDTH;

const PRIMARY_GREEN = '#198754';
const DEEP_BLACK = '#0B0B0B';
const GLOW_WHITE = 'rgba(255, 255, 255, 0.85)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: DEEP_BLACK,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 10,
  },
  button: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    width: SCREEN_WIDTH * 0.4,
    height: 60,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconText: {
    color: PRIMARY_GREEN,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageContainer: {
  width: IMAGE_WIDTH,
  height: IMAGE_HEIGHT,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  backgroundColor: 'black',
},

  image: {
  width: '100%',
  height: '100%',
  resizeMode: 'contain',
},

  overlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
},

  croppedImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
    marginTop: 10,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 10,
  },
  fixedButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    width: SCREEN_WIDTH * 0.4,
    height: 60,
  },
  centerButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 10,
  },
  welcomeText: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    textAlign: 'center',
    color: GLOW_WHITE,
    fontSize: 40,
    fontWeight: '800',
    zIndex: 10,
  },
  startButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    width: SCREEN_WIDTH * 0.9,
    height: 70,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  loadingOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
},
loadingGif: {
  width: 120,
  height: 120,
},

fullscreenImageContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  backgroundColor: 'black',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
},


});

export default styles;
