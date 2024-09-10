// auth.service.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useState } from "react";

export interface User {
  email: string;
  name: string;
  picture?: string;
}

export interface Auth {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  scope: string;
  state: string;
  issuedAt: string;
}

const googleAuthConfig = {
  iosClientId:
    "690901206282-8pg84s04sr1fej7osn4gkb0h1rrf6165.apps.googleusercontent.com",
  expoClientId:
    "690901206282-8t080scv3g5gr99oqc95c1e6q4fnkqvg.apps.googleusercontent.com",
};

export const useGoogleAuth = () => {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [request, response, promptAsync] = Google.useAuthRequest(
    googleAuthConfig,
    {
      projectNameForProxy: "@vubinh69/ctu-message-slug",
    }
  );

  const login = async () => {
    if (response?.type === "success") {
      const authData = response.authentication;
      await AsyncStorage.setItem("auth", JSON.stringify(authData));
      await getUserData(authData.accessToken);
      return authData;
    }
  };

  const logout = async () => {
    const auth = await getAuth();
    const token = auth?.accessToken as string;
    console.log("Logging out with token: ", auth?.accessToken);
    await setAuth(null);
    await AsyncStorage.removeItem("auth");
    await AsyncStorage.removeItem("userInfo");
  
    try {
      // Thực hiện yêu cầu hủy token từ Google
      // if (token) {
      //   await AuthSession.revokeAsync(
      //     { token },
      //     { revocationEndpoint: "https://oauth2.googleapis.com/revoke" }
      //   );
      // }

      
  
      // Xóa dữ liệu xác thực và thông tin user khỏi AsyncStorage

  
      // Đặt `auth` về null sau khi xóa dữ liệu thành công
      
  
      return true;
    } catch (error) {
      console.error("Error during logout: ", error);
      return false;
    }
  };
  

  const getAuth = async (): Promise<Auth | null> => {
    const jsonValue = await AsyncStorage.getItem("auth");
    return jsonValue ? JSON.parse(jsonValue) : null;
  };

  const getUserData = async (accessToken: string): Promise<User | null> => {
    try {
      // Gọi API để lấy dữ liệu user
      let response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Chỉ gọi response.json() một lần và lưu trữ kết quả
      const userData: User = await response.json();

      // Lưu thông tin user vào AsyncStorage
      await AsyncStorage.setItem("userInfo", JSON.stringify(userData));

      // Kiểm tra lại xem dữ liệu đã lưu thành công hay chưa
      const savedUser = await AsyncStorage.getItem("userInfo");
      if (savedUser) {
        console.log("User saved in AsyncStorage: ", JSON.parse(savedUser));
      } else {
        console.error("Failed to save user data to AsyncStorage");
      }

      return userData;
    } catch (error) {
      console.error("Error fetching user data: ", error);
      return null;
    }
  };

  return {
    request,
    response,
    promptAsync,
    login,
    logout,
    getAuth,
    getUserData,
  };
};
