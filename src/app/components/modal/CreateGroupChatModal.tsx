import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { Contact, User } from "../../type/type";
import apiClient from "../../lib/api-client";
import { CREATE_GROUP_CHAT_ROUTE } from "../../utils/constants";

type CreateGroupChatModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  searchContacts: Contact[];
  searchContactsFunction: (searchTerm: string) => void;
  navigation: any | null; // Thay bằng loại chính xác cho navigation nếu cần
  user: User | null;
};

const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({
  modalVisible,
  setModalVisible,
  searchContacts,
  searchContactsFunction,
  navigation,
  user,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [groupName, setGroupName] = useState("");

  // Hàm tạo nhóm chat
  const createGroupChat = async () => {
    if (!groupName || selectedContacts.length === 0) {
      alert("Vui lòng nhập tên nhóm và chọn ít nhất một thành viên");
      return;
    }

    try {
      const response = await apiClient.post(CREATE_GROUP_CHAT_ROUTE, {
        userID: user?.userID, // ID của người tạo nhóm
        name: groupName, // Tên nhóm chat
        members: [
          user?.userID, // Thêm user hiện tại vào danh sách thành viên
          ...selectedContacts.map((contact) => contact._id), // Thêm các liên hệ đã chọn
        ],
      });
      if (response.status === 201) {
        console.log("Group chat created successfully");
        alert("Nhóm chat đã được tạo thành công");
        setModalVisible(false);
        // Điều hướng đến màn hình chat với nhóm mới tạo
        // navigation.navigate("ChatScreen", {
        //   groupChatId: response.data.groupChatId, // Sử dụng ID nhóm chat trả về từ API
        // });
      }
    } catch (error) {
      console.error("Error creating group chat", error);
      alert("Có lỗi xảy ra khi tạo nhóm chat");
    }
  };

  const toggleSelectContact = (contact: Contact) => {
    if (selectedContacts.some((c) => c._id === contact._id)) {
      setSelectedContacts((prev) => prev.filter((c) => c._id !== contact._id));
    } else {
      setSelectedContacts((prev) => [...prev, contact]);
    }
  };

  const isSelected = (contact: Contact) =>
    selectedContacts.some((c) => c._id === contact._id);

  return (
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
        {/* Pressable để tắt modal */}
        <Pressable
          onPressOut={() => {
            setModalVisible(false);
            setSelectedContacts([]);
          }}
        >
          <View style={styles.modalView} className="h-[70vh]">
            {/* Ô tìm kiếm */}
            <TextInput
              onChangeText={(text) => setGroupName(text)}
              placeholder="Tên nhóm chat"
              placeholderTextColor="#0d7cc1"
              value={groupName}
              className="bg-gray-100 border-[1px] border-gray-300 rounded-3xl h-[50px] w-[250px] text-center mb-4"
            />
            <TextInput
              onChangeText={(text) => searchContactsFunction(text)}
              placeholder="Tìm kiếm và tạo nhóm"
              placeholderTextColor="#0d7cc1"
              className="bg-gray-100 border-[1px] border-gray-300 rounded-3xl h-[50px] w-[250px] text-center"
            />

            <View></View>
            {/* Danh sách thành viên đã chọn */}
            {selectedContacts.length > 0 && (
              <View
                style={styles.selectedMembersContainer}
                className="h-[120px]"
              >
                <Text className="text-lg font-semibold mb-2">
                  Thành viên đã chọn:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                 
                >
                  {selectedContacts.map((contact) => (
                    <Pressable
                      key={contact._id}
                      onPress={() => toggleSelectContact(contact)}
                    >
                      <View key={contact._id} style={styles.selectedMemberItem}>
                        <Image
                          source={{ uri: contact.picture }}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                          }}
                        />
                        <Text className="text-sm">{contact.nickname}</Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Danh sách liên hệ */}
            <ScrollView >
              {searchContacts.length > 0 ? (
                searchContacts.map((contact) => (
                  <Pressable
                    key={contact._id}
                    onPress={() => toggleSelectContact(contact)}
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
                        <Text className="text-gray-500">{contact.email }</Text>
                        {isSelected(contact) && (
                          <Text className="text-[#0d7cc1]">Đã chọn</Text>
                        )}
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

            {/* Nút tạo nhóm */}
            {/* Nút tạo nhóm */}
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={createGroupChat}
            >
              <Text className="text-white">
                Tạo nhóm với {selectedContacts.length} thành viên
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </View>
    </Modal>
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
  contactItem: {
    padding: 10,
  },
  selectedMembersContainer: {
    marginVertical: 10,
  },
  selectedMemberItem: {
    alignItems: "center",
    marginRight: 10,
  },
});

export default CreateGroupChatModal;
