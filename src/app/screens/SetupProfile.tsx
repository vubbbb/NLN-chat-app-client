import React, { useEffect, useState } from "react";
import { View, Text, Image, Button, TextInput, SafeAreaView} from "react-native";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import apiClient from "../lib/api-client";
import {
  GET_USER_INFO,
  UPDATE_PROFILE_ROUTE,
  ADD_PROFILE_IMAGE_ROUTE,
} from "../utils/constants";
import {  } from "react-native-safe-area-context";
import { RootStackParamList } from "../index";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  color?: number;
  profileSetup?: boolean;
}

type Props = NativeStackScreenProps<RootStackParamList, "SetupProfile">;

export default function SetupProfileScreen({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Bắt đầu với false vì chưa tải dữ liệu
  const [userName, setUserName] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<User>(GET_USER_INFO, {
          params: {
            userID: "66b1822240322af42cd5add9",
          },
        });
        setUser(response.data);
      } catch (error) {
        setError((error as Error).message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    if (!user) {
      getUserData();
    } else {
      setUserName(user.firstName as string);
      setPosition(user.lastName as string);
      setLoading(false);
      setImageLoading(false);
    }
  }, [user, setUser]);

  const saveChange = async () => {
    const response = await apiClient.post(UPDATE_PROFILE_ROUTE, {
      params: {
        userID: "66b1822240322af42cd5add9",
        firstName: userName,
        lastName: position,
      },
    });
    if (response.status === 201) {
      navigation.navigate("ContactsScreen");
    }
  };

// Cloudinary configuration
const CLOUD_NAME = 'dkashxvw8'; 
const UPLOAD_PRESET = 'ml_default'; 

const uploadImageToCloudinary = async (fileUri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'image/jpeg', // Đặt loại MIME phù hợp với ảnh của bạn
    name: 'profile-image.jpg', // Đặt tên file
  } as any); // TypeScript không nhận diện đúng kiểu đối tượng, sử dụng `as any` để vượt qua

  formData.append('upload_preset', UPLOAD_PRESET); // Thay bằng upload preset của bạn

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, // Thay bằng URL Cloudinary của bạn
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 200 && response.data.secure_url) {
      console.log('Image uploaded successfully:', response.data.secure_url);
      handleImageUpload(response.data.secure_url);
      // Xử lý URL của ảnh đã upload, ví dụ: lưu vào state hoặc gửi đến server
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

const handleImageUpload = async (fileUri: string) => {
  const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, {
    params: {
      userID: "66b1822240322af42cd5add9",
      image: fileUri,
    },
  });
  if (response.status === 201) {
    console.log('Image uploaded to server: ', response.data.image);
  }
}

const pickImage = async () => {
  // Yêu cầu quyền truy cập
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Sorry, we need camera roll permissions to make this work!');
    return;
  }

  // Mở thư viện ảnh
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled && result.assets[0]) {
    const fileUri = result.assets[0].uri;
    if (fileUri) {
      uploadImageToCloudinary(fileUri);
      setImage(fileUri);
      setImageLoading(false); 
    }
  }
};

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="m-8">
        <Image
          className="w-[150] h-[90] mb-8 mt-0"
          source={require("../../../assets/images/in_app_logo.png")}
        />
      </View>
      <View className="text-black mb-8">
        <Text className="text-3xl">
          Xin chào {userName ? userName : user?.firstName}!
        </Text>
      </View>
      <View className=" bg-gray-200 w-[22rem] h-[22rem] rounded-3xl flex-row">
        <View className="items-center justify-center flex-1">
          {imageLoading ? (
            <View className="bg-gray-300 w-[100px] h-[100px] rounded-full">
            </View>
          ) : error ? (
            <Text>{error}</Text>
          ) : (
            user && (
              <View>
                <Image
                  source={{ uri: image ? image : user.image }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              </View>
            )
          )}
          <View className="items-center justify-center mt-4">
            <Button
              title="Chọn ảnh"
              onPress={() => {
                pickImage();
              }}
            />
          </View>
        </View>

        <View className="items-center justify-center flex-1 border-l-[1px] border-l-white">
          <SafeAreaView>
            <TextInput
              onChangeText={setUserName}
              value={userName ? userName : user?.firstName}
              className="bg-gray-300 w-[130px] m-4 h-[50px] rounded-xl text-center"
              placeholder="Nickname của bạn"
              placeholderTextColor="black"
            />
            <TextInput
              onChangeText={setPosition}
              value={position ? position : user?.lastName}
              placeholder="Khoa của bạn"
              className="bg-gray-300 w-[130px] m-4 h-[50px] rounded-xl text-center"
              placeholderTextColor="black"
            />
          </SafeAreaView>
        </View>
      </View>
      <View className="mt-12">
        <Button
          title="Lưu thay đổi"
          onPress={() => {
            saveChange();
          }}
        />
      </View>
    </View>
  );
}
