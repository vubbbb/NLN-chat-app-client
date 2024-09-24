import socketio, { Socket } from "socket.io-client";
import React, {createContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HOST } from "../utils/constants";

export const socket = socketio(HOST, {
  withCredentials: true,
  transports: ["websocket"],
});

// Tạo context để chia sẻ socket giữa các component
export const SocketContext = createContext<Socket | null>(null);
