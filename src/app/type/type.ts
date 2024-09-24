// Định nghĩa kiểu cho các màn hình trong trình điều hướng
export type RootStackParamList = {
  Login: undefined;
  SetupProfile: undefined;
  ContactsScreen: undefined;
  ChatScreen: { contact: Contact };
};

export type Contact = {
  _id: string;
  email: string;
  nickname: string;
  setupProfile: boolean;
  picture: string;
};

export interface Message {
  sender: string;
  receiver: string;
  content: string;
  messageType: string;
  fileURL?: string;
  fromSelf?: boolean; // Thêm thuộc tính này nếu cần
}

export interface User {
  userID: string;
  email: string;
  name: string;
  picture?: string;
  nickname?: string;
}

export interface Auth {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  scope: string;
  state: string;
  issuedAt: string;
}

export type ContactList = {
  _id: string,
  lastMessageTime: Date,
  lastMessageContent: string,
  nickname: string,
  email: string,
  picture: string,
};
