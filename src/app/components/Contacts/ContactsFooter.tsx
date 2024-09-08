import React from 'react'
import { View, Text } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome';

const ChatFooter = () => {
  return (
    <View className='flex flex-row justify-between p-[20px]'>
        <Icon name="comments" size={20} color="black" className="pl-8"/>
        <Icon name="group" size={20} color="black" className="p-0"/>
        <Icon name="user" size={20} color="black" className="pr-8"/>
    </View> 
  )
}

export default ChatFooter