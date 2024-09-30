import React from "react";
import { View, Text, Image, Pressable, Modal, StyleSheet } from "react-native";
import { User } from "../../type/type"; // Import kiểu User nếu cần

type LogoutModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  user: User | null;
  handleLogout: () => void;
};

const LogoutModal: React.FC<LogoutModalProps> = ({
  modalVisible,
  setModalVisible,
  user,
  handleLogout,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      <View style={styles.centeredView}>
        <Pressable onPressOut={() => setModalVisible(false)}>
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
                <Text className="text-lg font-semibold">{user?.nickname}</Text>
                <Text className="text-gray-500">{user?.email}</Text>
              </View>
            </View>
            <Pressable
              className="mt-12"
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(false);
                handleLogout();
              }}
            >
              <Text className="text-white text-2xl">Đăng xuất</Text>
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
});

export default LogoutModal;
