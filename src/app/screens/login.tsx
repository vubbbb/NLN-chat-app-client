import React from "react";
import { View, Text, Image, Button, SafeAreaView } from "react-native";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../index';


type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View>
        <Text className="text-center text-xl">Xin chào!</Text>
        <Text className="text-center text-xl">Chào mừng bạn đến với CTU Message</Text>
      </View>
      <View className="mt-8">
        <Image className="w-32 h-32" source={require("@/assets/images/LOGO_CTU.png")} />
      </View>
      <View className="m-8">
        <Image className="w-[280px] h-[168px]" source={require("@/assets/images/login logo.png")} />
      </View>
      <View className="m-8">
        <Button
          title="Đăng nhập bằng CTU Mail"
          onPress={() => navigation.navigate('SetupProfile')}
        />
      </View>
    </View>
  );
}
