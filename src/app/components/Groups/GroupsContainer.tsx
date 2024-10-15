import React, {
  useEffect,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { View, Text, Image, FlatList, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, User, Group, Message } from "../../type/type";
import apiClient from "../../lib/api-client";
import { GET_USER_GROUP_CHATS_ROUTE } from "../../utils/constants";
import { useFocusEffect } from "@react-navigation/native";
import { SocketContext } from "../../context/SocketContext";

// Định nghĩa kiểu Props cho component GroupsContainer
type GroupsContainerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ContactsScreen">;
  userInfo: User; // Thêm userInfo vào props
};

const GroupsContainer: React.FC<GroupsContainerProps> = ({
  navigation,
  userInfo,
}) => {
  const [groupList, setGroupList] = useState<Group[]>([]);
  const socket = useContext(SocketContext);

  // Hàm lấy danh sách nhóm chat từ server
  const loadGroupsList = async () => {
    try {
      const response = await apiClient.post(GET_USER_GROUP_CHATS_ROUTE, {
        params: {
          userID: userInfo.userID,
        },
      });
      if (response.status === 200) {
        setGroupList(response.data.groupChats);
      }
    } catch (error) {
      console.error("Error retrieving group list", error);
    }
  };

  useEffect(() => {
    loadGroupsList();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroupsList();
    }, [])
  );

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message: Message) => {
      console.log("New message received: ", message.content);
      loadGroupsList();
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, [socket, loadGroupsList]);

  const handlePress = (item: Group) => {
    const group: Group = {
      _id: item._id, // ID của nhóm
      name: item.name, // Tên nhóm
      messages: item.messages, // Danh sách tin nhắn
      members: item.members, // Danh sách thành viên
      admin: item.admin, // ID người quản trị
      createdAt: item.createdAt, // Thời gian tạo
      updatedAt: item.updatedAt, // Thời gian cập nhật
    };
    navigation.navigate("GroupChatScreen", {
      group,
      userInfo, // Truyền thông tin group vào ChatScreen
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: Group }) => {
      return (
        <View className="bg-gray-100">
          <Pressable
            key={item._id}
            onPress={() => {
              handlePress(item);
            }}
          >
            <View className="flex flex-row">
              <View className="p-[20px] justify-center">
                <Image
                  source={require("../../../../assets/images/groupchat.png")}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                    marginRight: 5,
                  }}
                />
              </View>
              <View className="p-[20px] pl-0 justify-center border-b-[1px] w-[100vw] items-start">
                <Text className="font-bold text-xl">{item.name}</Text>
                <View className="flex flex-row items-center">
                  <Text>
                    {item.messages &&
                    item.messages.length > 0 &&
                    item.messages[0].content
                      ? item.messages[0].content.length > 10
                        ? item.messages[0].content.slice(0, 10) + "..."
                        : item.messages[0].content
                      : "No messages"}
                  </Text>
                  {/* <Text>
                    {item.messages.length > 0 &&
                      (() => {
                        const messageDate = new Date(
                          item.messages[0].timeStamp
                        );
                        const currentDate = new Date();

                        const isSameDay =
                          messageDate.getDate() === currentDate.getDate() &&
                          messageDate.getMonth() === currentDate.getMonth() &&
                          messageDate.getFullYear() ===
                            currentDate.getFullYear();

                        if (isSameDay) {
                          return messageDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        } else {
                          return messageDate.toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        }
                      })()}
                  </Text> */}
                </View>
              </View>
            </View>
          </Pressable>
        </View>
      );
    },
    [handlePress]
  );

  const memoizedData = useMemo(() => groupList, [groupList]);

  return (
    <FlatList
      data={memoizedData}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      style={{ height: 530 }}
    />
  );
};

export default GroupsContainer;
