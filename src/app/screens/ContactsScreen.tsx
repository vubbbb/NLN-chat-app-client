import React from 'react'
import { View, Text, Image, Button, SafeAreaView } from 'react-native'
import { RootStackParamList } from '../index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import  ChatHeader  from '../components/Contacts/ContactsHeader';
import ContactsContainer from '../components/Contacts/ContactsContainer';
import ChatFooter from '../components/Contacts/ContactsFooter';


type Props = NativeStackScreenProps<RootStackParamList, 'ContactsScreen'>;

const ContactsScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView className='items-center justify-center flex-1'>
        <ChatHeader />
        <ContactsContainer navigation={navigation} />
        <ChatFooter />
    </SafeAreaView>
  )
}

export default ContactsScreen