import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ChatFooter = () => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
      <Icon name="comments" size={20} color="black" style={{ paddingLeft: 8 }} />
      <Icon name="group" size={20} color="black" />
      <Icon name="user" size={20} color="black" style={{ paddingRight: 8 }} />
    </View>
  );
}

export default ChatFooter;
