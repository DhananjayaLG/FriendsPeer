import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ImageViewing from 'react-native-image-viewing';

export default function ProfileModalViewer({ imageUri,size }) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Image
            source={{ uri: imageUri }}
            alt='user'
            resizeMode='cover'
            className={`${size=="large"?"w-48 h-48" :"w-16 h-16"} border rounded-full`}
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
