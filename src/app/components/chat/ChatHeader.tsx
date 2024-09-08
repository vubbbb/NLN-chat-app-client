import React from 'react'
import { View, Text, Image } from "react-native"

const ChatHeader = ({user}: any) => {
  return (
    <View>
    <View className="p-[20px] justify-center">
      <Image
        source={{ uri: user.uri }}
        style={{
          width: 150,
          height: 150,
          borderRadius: 50,
          marginRight: 5,
        }}
      />
    </View>
    <Text>hi {user.id}</Text>
  </View>
  )
}

export default ChatHeader