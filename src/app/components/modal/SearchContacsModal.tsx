import React from "react";
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
import { Contact } from "../../type/type";

type SearchModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  searchContacts: Contact[];
  searchContactsFunction: (searchTerm: string) => void;
  navigation: any; // bạn có thể thay bằng loại chính xác cho navigation
};

const SearchContactsModal: React.FC<SearchModalProps> = ({
  modalVisible,
  setModalVisible,
  searchContacts,
  searchContactsFunction,
  navigation,
}) => {
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
                        <Text className="text-gray-500">{contact.email}</Text>
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

export default SearchContactsModal;
