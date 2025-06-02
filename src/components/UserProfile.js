import { Image, Text, View, TouchableOpacity } from 'react-native';
import userImg from '../assets/user.png';

const UserProfile = ({ user,id, onDelete,profile }) => {
  return (
    <View className='relative flex border  border-slate-200 shadow-sm shadow-inherit rounded-xl' style={{elevation:8}}>
      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => onDelete?.(user,id)}
        className='absolute right-1 top-1 z-10 bg-black rounded-full p-1'
      >
        <Text className='text-white font-bold'>✕</Text>
      </TouchableOpacity>

      <View className='max-h-72 items-center rounded-xl bg-slate-200 shadow-2xl shadow-black flex justify-center p-2'>
        <View className='max-w-64 flex items-center justify-center'>
          <Image
            source={profile ? { uri: profile } : userImg}
            alt='user'
            resizeMode='cover'
            className='w-36 h-36 border rounded-full'
          />
        </View>
        <View className='h-12 justify-center items-center '>
          <Text className='text-s text-black font-semibold text-lg'>
            {user}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default UserProfile;
