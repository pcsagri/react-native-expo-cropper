import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import ImageCropper from './src/ImageCropper';

const App = () => {
  const handleCrop = (uri) => {
    console.log('Cropped Image URI:', uri);
  };

  return (
    <>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <ImageCropper onCrop={handleCrop} />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', 
  },
});

export default App;
