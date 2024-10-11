import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

type ContactsFooterProps = {
  setCurrentView: (view: 'contacts' | 'groups') => void; // Hàm để thay đổi view
};

const ContactsFooter = ({ setCurrentView }: ContactsFooterProps) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
      <TouchableOpacity onPress={() => setCurrentView('contacts')}>
        <Icon name="comments" size={20} color="black" style={{ paddingLeft: 60 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentView('groups')}>
        <Icon name="group" size={20} color="black" style={{paddingRight: 60}}/>
      </TouchableOpacity>
    </View>
  );
}

export default ContactsFooter;
