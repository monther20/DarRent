import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollViewProps,
} from 'react-native';

import { Text } from '@/components/Text';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Temporary mock for missing assets
const ASSETS = {
  avatars: {
    owner: 'https://example.com/avatar.jpg'
  }
};

type Message = {
  id: number;
  text: string;
  image?: string;
  timestamp: Date;
  isSent: boolean;
  status: 'sent' | 'delivered' | 'read';
};

const mockMessages: Message[] = [
  {
    id: 1,
    text: 'Hello! I have a question about the maintenance request.',
    timestamp: new Date(2024, 2, 15, 14, 30),
    isSent: true,
    status: 'read',
  },
  {
    id: 2,
    text: 'Sure, how can I help you?',
    timestamp: new Date(2024, 2, 15, 14, 31),
    isSent: false,
    status: 'read',
  },
  {
    id: 3,
    text: 'The maintenance team will arrive tomorrow at 10 AM. Please make sure someone is available.',
    timestamp: new Date(2024, 2, 15, 14, 32),
    isSent: false,
    status: 'read',
  },
];

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();
  const isRTL = false; // Simplified RTL check

  const handleSend = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        timestamp: new Date(),
        isSent: true,
        status: 'sent',
      };
      setMessages([...messages, message]);
      setNewMessage('');
      if (scrollViewRef.current) {
        // @ts-ignore
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const message: Message = {
        id: messages.length + 1,
        text: '',
        image: result.assets[0].uri,
        timestamp: new Date(),
        isSent: true,
        status: 'sent',
      };
      setMessages([...messages, message]);
      if (scrollViewRef.current) {
        // @ts-ignore
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }
  };

  const handleContentSizeChange = () => {
    if (scrollViewRef.current) {
      // @ts-ignore
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderMessageStatus = (status: Message['status']) => {
    const color = status === 'read' ? '#34D399' : '#9CA3AF';
    const icon = status === 'sent' ? 'check' : status === 'delivered' ? 'check-all' : 'eye-check';
    return <MaterialCommunityIcons name={icon} size={16} color={color} />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons 
            name={isRTL ? 'chevron-right' : 'chevron-left'} 
            size={28} 
            color="white" 
          />
        </TouchableOpacity>
        <Image
          source={{ uri: ASSETS.avatars.owner }}
          style={styles.avatar}
          contentFit="cover"
        />
        <Text style={styles.headerTitle}>
          Garden Apartment Owner
        </Text>
      </View>

      {/* Messages */}
      <ScrollView 
        // @ts-ignore
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={handleContentSizeChange}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.isSent ? styles.sentMessageRow : styles.receivedMessageRow
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.isSent ? styles.sentMessageBubble : styles.receivedMessageBubble
              ]}
            >
              {message.image ? (
                <Image
                  source={{ uri: message.image }}
                  style={styles.messageImage}
                  contentFit="cover"
                />
              ) : (
                <Text
                  style={message.isSent ? styles.sentMessageText : styles.receivedMessageText}
                >
                  {message.text}
                </Text>
              )}
              <View style={styles.messageFooter}>
                <Text
                  style={[
                    styles.messageTimestamp,
                    message.isSent ? styles.sentMessageTimestamp : styles.receivedMessageTimestamp
                  ]}
                >
                  {formatDistanceToNow(message.timestamp, {
                    addSuffix: true,
                    locale: isRTL ? ar : undefined,
                  })}
                </Text>
                {message.isSent && renderMessageStatus(message.status)}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handleImagePick}
          >
            <MaterialCommunityIcons 
              name="image-plus" 
              size={24} 
              color="#1e40af" 
            />
          </TouchableOpacity>
          <View style={styles.textInputContainer}>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              style={styles.textInput}
            />
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
          >
            <MaterialCommunityIcons 
              name="send" 
              size={24} 
              color={newMessage.trim() ? '#1e40af' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sentMessageRow: {
    justifyContent: 'flex-end',
  },
  receivedMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
  },
  sentMessageBubble: {
    backgroundColor: '#1e40af',
    borderTopRightRadius: 0,
  },
  receivedMessageBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  messageImage: {
    width: 256,
    height: 256,
    borderRadius: 8,
  },
  sentMessageText: {
    color: 'white',
  },
  receivedMessageText: {
    color: '#1F2937',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTimestamp: {
    fontSize: 12,
    marginRight: 4,
  },
  sentMessageTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedMessageTimestamp: {
    color: '#6B7280',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  imageButton: {
    marginRight: 12,
    marginBottom: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    maxHeight: 96,
  },
  sendButton: {
    marginLeft: 12,
    marginBottom: 8,
  },
}); 