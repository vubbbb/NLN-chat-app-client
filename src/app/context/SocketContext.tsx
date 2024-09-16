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
import { withLayoutContext } from "expo-router";

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
  const [userID, setUserID] = useState<string>();
  // Khởi tạo và kết nối socket khi có thông tin người dùng
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    const getUserDataFromStorage = async () => {
      const userDataString = await AsyncStorage.getItem("userInfo");
      console.log("User data string:", userDataString);
      if (userDataString) {
        const userData: User = JSON.parse(userDataString);
        setUserID(userData?.userID as string);
      }
    };
    // Lấy dữ liệu người dùng từ AsyncStorage
    getUserDataFromStorage();
  }, []); // Chạy một lần khi component mount

  useEffect(() => {
    // Khởi tạo socket nếu user có giá trị và socket chưa được khởi tạo
    if (userID && !socket.current) {
      socket.current = io(HOST, {
        timeout: 60000,
        reconnection: false,
        query: {
          userID: userID,
        },
        withCredentials: true,
        // rejectUnauthorized: false,
        transports: ["websocket"],
      });

      socket.current.on("connect", () => {
        console.log("Connected to server with ID:", socket.current?.id);
      });

      // TODO: Xử lý các sự kiện từ server
      const handleRecieveMessage = (message: any) => {};


      socket.current.on("recieveMessage", handleRecieveMessage);

      socket.current.on("connect_error", (err) => {
        // the reason of the error, for example "xhr poll error"
        console.log(err.message);
      });
      socket.current.on("disconnect", (error) => {
        console.log("Socket disconnected: ", error);
      });

      // return () => {
      //   socket.current?.disconnect();
      // };
    }
  }, [userID]); // Chạy lại khi user thay đổi

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
