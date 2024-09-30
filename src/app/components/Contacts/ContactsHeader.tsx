import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  Button,
  TextInput,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import apiClient from "../../lib/api-client";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Contact } from "../../type/type";
import { GET_USER_INFO, SEARCH_CONTACTS_ROUTE } from "../../utils/constants";
import { useGoogleAuth } from "../../services/auth.service";
import { User } from "../../type/type";
import { SocketContext } from "../../context/SocketContext";
import SearchContacsModal from "../modal/SearchContacsModal";
import CreateGroupChatModal from "../modal/CreateGroupChatModal";
import LogoutModal from "../modal/LogoutModal";

type ContactHeaderProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ContactsScreen">;
  userInfo: User; // Thêm userInfo vào props
};

const ChatHeader: React.FC<ContactHeaderProps> = ({ navigation, userInfo }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { logout, getAuth } = useGoogleAuth();
  const [searchContacts, setSearchContacts] = useState<Contact[]>([]);
  const socket = useContext(SocketContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);

  useEffect(() => {
    const getUserInfo = () => {
      setUser(userInfo);
    };
    getUserInfo();
  }, []);

  // Hàm logout và disconnect socket
  const handleLogout = async () => {
    if (socket) {
      socket.disconnect(); // Ngắt kết nối socket
      console.log("Socket disconnected");
    }
    await logout(); // Đăng xuất
    navigation.replace("Login"); // Chuyển hướng về màn hình login
  };

  const searchContactsFunction = async (searchTerm: string) => {
    try {
      if (searchTerm) {
        const response = await apiClient.post(SEARCH_CONTACTS_ROUTE, {
          params: { userID: user?.userID, searchItem: searchTerm },
        });
        if (response.status === 200) {
          setSearchContacts(response.data);
          console.log("Search contacts: ", response.data);
        }
      } else {
        setSearchContacts([]);
      }
    } catch (error) {
      console.error("Error searching contacts", error);
    }
  };

  useEffect(() => {
    console.log("Updated search contacts: ", searchContacts);
  }, [searchContacts]);

  return (
    <View>
      <View className="flex flex-row w-[100vw] items-center justify-between p-4 bg-white border-b border-gray-200">
        <View className="flex flex-row items-center">
          <Image
            className="w-14 h-14 rounded-full"
            source={require("../../../../assets/images/in_app_logo.png")}
          />
          <Text className="ml-0 text-lg font-semibold pb-[2px]">Message</Text>
        </View>
        <View className="flex flex-row items-center">
          <View className="items-center justify-center flex flex-row">
            <View className="items-end mr-2">
              <Text>Xin chào</Text>
              {loading ? (
                <Text>Loading...</Text>
              ) : error ? (
                <Text>{error}</Text>
              ) : (
                user && <Text>{user.nickname}</Text>
              )}
            </View>
            {loading ? (
              <Text>Loading...</Text>
            ) : error ? (
              <Text>{error}</Text>
            ) : (
              user && (
                <View>
                  <Pressable onPress={() => setUserInfoModalVisible(true)}>
                    <Image
                      source={{ uri: user.picture }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 50,
                        marginRight: 5,
                      }}
                    />
                  </Pressable>
                </View>
              )
            )}
          </View>
        </View>
      </View>
      <View className="p-4 bg-white border-b border-gray-200 flex flex-row items-center justify-center">
        <View>
          <SearchContacsModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            searchContacts={searchContacts}
            searchContactsFunction={searchContactsFunction}
            navigation={navigation}
          />
          <CreateGroupChatModal
            modalVisible={createGroupModalVisible}
            setModalVisible={setCreateGroupModalVisible}
            searchContacts={searchContacts}
            searchContactsFunction={searchContactsFunction}
            navigation={navigation}
            user={user}
          />
          <View className="flex flex-row">
            <Pressable
              className="w-[60vw] h-[40px] mr-4 bg-gray-100 rounded-3xl flex items-center justify-center"
              style={[styles.button]}
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-[#0d7cc1] font-bold">
                Tìm kiếm cuộc trò chuyện
              </Text>
            </Pressable>
            <Pressable
              className="w-[30vw] h-[40px] bg-gray-100 rounded-3xl flex items-center justify-center"
              style={[styles.button]}
              onPress={() => setCreateGroupModalVisible(true)}
            >
              <Text className="text-[#0d7cc1] font-bold">Tạo nhóm</Text>
            </Pressable>
          </View>
        </View>
      </View>
      {/* // userInfoModal */}
      <View>
        <LogoutModal
          modalVisible={userInfoModalVisible}
          setModalVisible={setUserInfoModalVisible}
          user={user}
          handleLogout={handleLogout}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 22,
    padding: 50,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#0d7cc1",
  },
  textStyle: {
    color: "0d7cc1",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default ChatHeader;
