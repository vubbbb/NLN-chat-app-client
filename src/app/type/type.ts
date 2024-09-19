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
