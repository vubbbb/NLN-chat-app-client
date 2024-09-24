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

type ChatHeaderProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ContactsScreen">;
  userInfo: User; // Thêm userInfo vào props
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ navigation, userInfo }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { logout, getAuth } = useGoogleAuth();
  const [searchContacts, setSearchContacts] = useState<Contact[]>([]);
  const socket = useContext(SocketContext);

  const [modalVisible, setModalVisible] = useState(false);
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
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              alert("Modal has been closed.");
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <Pressable onPressOut={() => setModalVisible(false)}>
                <View style={styles.modalView} className="h-[52vh]">
                  <TextInput
                    onChangeText={(text) => searchContactsFunction(text)}
                    placeholder="Tìm kiếm"
                    placeholderTextColor="#0d7cc1"
                    className="bg-gray-100 border-[1px] border-gray-300 rounded-3xl h-[50px] w-[250px] text-center"
                  />
                  {/* <Button title="Tìm kiếm" onPress={getContacts} /> */}
                  <ScrollView className="h-[100vh] w-[75vw] bg-white">
                    {searchContacts.length > 0 ? (
                      searchContacts.map((contact) => (
                        <Pressable
                          key={contact._id}
                          onPress={() => {
                            setModalVisible(false);
                            navigation.navigate("ChatScreen", {
                              contact: contact,
                            });
                          }}
                        >
                          <View className="flex flex-row items-center p-4 border-b border-gray-200">
                            <View className="mr-4">
                              <Image
                                source={{ uri: contact.picture }}
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: 25,
                                }}
                              />
                            </View>
                            <View>
                              <Text className="text-lg font-semibold">
                                {contact.nickname}
                              </Text>
                              <Text className="text-gray-500">
                                {contact.email}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      ))
                    ) : (
                      <Text className="text-gray-500 p-4">
                        Không tìm thấy kết quả.
                      </Text>
                    )}
                  </ScrollView>
                </View>
              </Pressable>
            </View>
          </Modal>
          <Pressable
            className="w-[90vw] h-[40px] bg-gray-100 rounded-3xl flex items-center justify-center"
            style={[styles.button]}
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-[#0d7cc1] font-bold">
              Tìm kiếm cuộc trò chuyện
            </Text>
          </Pressable>
        </View>
      </View>
      {/* // userInfoModal */}
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={userInfoModalVisible}
          onRequestClose={() => {
            alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <Pressable onPressOut={() => setUserInfoModalVisible(false)}>
              <View style={styles.modalView} className="h-[52vh]">
                <View className="flex flex-col items-center p-4 border-b border-gray-200">
                  <View className="mr-4">
                    <Image
                      source={{ uri: user?.picture }}
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: 75,
                        borderColor: "#0d7cc1",
                        borderWidth: 2,
                        marginBottom: 20,
                      }}
                    />
                  </View>
                  <View className="justify-center items-center">
                    <Text className="text-lg font-semibold">
                      {user?.nickname}
                    </Text>
                    <Text className="text-gray-500">{user?.email}</Text>
                  </View>
                </View>
                  <Pressable
                    className="mt-12"
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => {
                      setUserInfoModalVisible(false);
                      handleLogout();
                    }}
                  >
                    <Text className="text-white text-2xl">Đăng xuất</Text>
                  </Pressable>
              </View>
            </Pressable>
          </View>
        </Modal>
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
