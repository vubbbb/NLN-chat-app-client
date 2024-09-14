import React, {
  useContext,
  createContext,
  useEffect,
  useRef,
  ReactNode,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io, { Socket } from "socket.io-client";
import { HOST } from "../utils/constants";

// Tạo Context với kiểu dữ liệu cụ thể cho socket
const SocketContext = createContext<Socket | null>(null);

// Định nghĩa interface cho User
export interface User {
  userID: string;
  email: string;
  name: string;
  picture?: string;
  nickname?: string;
}

// Hook để sử dụng SocketContext
export const useSocket = () => {
  return useContext(SocketContext);
};

// Định nghĩa kiểu props cho SocketProvider
interface SocketProviderProps {
  children: ReactNode;
}

// Component Provider cho Socket
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // Sử dụng useRef với kiểu dữ liệu Socket từ socket.io-client
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      // Lấy thông tin user từ AsyncStorage
      const userDataString = await AsyncStorage.getItem("userInfo");

      if (userDataString) {
        const userInfo: User = JSON.parse(userDataString);

        // Khởi tạo socket kết nối
        socket.current = io(HOST, {
          query: {
            userInfo: userInfo?.userID,
          },
        });

        // Sự kiện khi kết nối thành công
        socket.current.on("connect", () => {
          console.log("Connected to server");
        });

      }
    };

    // Gọi hàm initSocket để khởi tạo socket kết nối
    initSocket();

    // Cleanup khi component bị unmount
    return () => {
      socket.current?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
