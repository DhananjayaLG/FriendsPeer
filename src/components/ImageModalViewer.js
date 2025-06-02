import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ImageViewing from 'react-native-image-viewing';

export default function ImageModalViewer({ imageUri }) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)} activeOpacity={1}>
        <Image
          source={{ uri: imageUri }}
          style={styles.imageThumbnail}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <ImageViewing
        images={[{ uri: imageUri }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        presentationStyle="overFullScreen"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageThumbnail: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
});
