import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView as RNScrollView, // Aliased for clarity and to avoid type conflicts
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView, // Ensured import
  Platform, // Ensured import
  Alert, // Ensured import
} from 'react-native';

import { Text } from '@/components/Text';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const ASSETS = {
  avatars: {
    owner: 'https://example.com/avatar.jpg', 
  },
};

export interface DbMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface UIMessage extends DbMessage {
  isSent: boolean;
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const chatId = params.id as string;
  const { user: authUser, isLoading: authLoading } = useAuth();

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  const scrollViewRef = useRef<RNScrollView | null>(null); // Use aliased type
  const isRTL = false;

  useEffect(() => {
    if (authUser?.id && !userProfileId) {
      const fetchUserProfile = async () => {
        console.log("Fetching profile ID for auth user:", authUser.id);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', authUser.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            throw error;
          }
          if (data) {
            setUserProfileId(data.id);
            console.log("User profile ID fetched:", data.id);
          } else {
            console.warn("User profile not found for auth user:", authUser.id);
          }
        } catch (error) {
          console.error('Error fetching user profile ID:', error);
          Alert.alert("Error", "Could not load your user profile.");
        }
      };
      fetchUserProfile();
    }
  }, [authUser, userProfileId]);

  useEffect(() => {
    if (!chatId || !userProfileId) {
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    const fetchInitialMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        setMessages(data.map(dbMsg => ({
            ...dbMsg,
            isSent: dbMsg.sender_id === userProfileId,
        })) || []);
        scrollViewRef.current?.scrollToEnd({ animated: false });
      } catch (error) {
        console.error('Error fetching initial messages:', error);
        Alert.alert("Error", "Could not load messages.");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchInitialMessages();

    const messageSubscription = supabase
      .channel(`public:messages:chat_id=eq.${chatId}`)
      .on<DbMessage>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const newMessageFromChannel = payload.new as DbMessage;
          setMessages((prevMessages) => {
            if (prevMessages.find(msg => msg.id === newMessageFromChannel.id)) {
              return prevMessages;
            }
            return [...prevMessages, {
                ...newMessageFromChannel,
                isSent: newMessageFromChannel.sender_id === userProfileId,
            }];
          });
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to messages channel for chat:', chatId);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Subscription error:', err);
          Alert.alert("Connection Issue", "Real-time chat updates might be unavailable.");
        }
      });

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [chatId, userProfileId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userProfileId || !chatId) {
      if(!userProfileId) Alert.alert("Cannot Send", "User profile not loaded.");
      return;
    }

    setSendingMessage(true);
    const contentToSend = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ chat_id: chatId, sender_id: userProfileId, content: contentToSend }]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert("Send Error", "Could not send message.");
      setNewMessage(contentToSend); 
    } finally {
      setSendingMessage(false);
    }
  };

  const handleContentSizeChange = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  if (authLoading || (!userProfileId && authUser)) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  if (!authUser) {
      return (
          <View style={[styles.container, styles.centered]}>
              <Text>Please log in to chat.</Text>
          </View>
      )
  }
  
  if (!userProfileId && !authLoading && authUser) {
    return (
        <View style={[styles.container, styles.centered]}>
            <Text>Could not load your user profile for chat.</Text>
        </View>
    );
  }

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name={isRTL ? 'chevron-right' : 'chevron-left'} size={28} color="white" />
        </TouchableOpacity>
        <Image source={{ uri: ASSETS.avatars.owner }} style={styles.avatar} contentFit="cover" />
        <Text style={styles.headerTitle}>Chat</Text> 
      </View>

      {loadingMessages && messages.length === 0 ? (
        <View style={[styles.messagesContainer, styles.centeredFull]}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text>Loading messages...</Text>
        </View>
      ) : (
        <RNScrollView // Use aliased component
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={{ paddingBottom: 10 }}
          onContentSizeChange={handleContentSizeChange}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.isSent ? styles.sentMessageRow : styles.receivedMessageRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isSent ? styles.sentMessageBubble : styles.receivedMessageBubble,
                ]}
              >
                <Text style={message.isSent ? styles.sentMessageText : styles.receivedMessageText}>
                  {message.content}
                </Text>
                <View style={styles.messageFooter}>
                  <Text style={[ styles.messageTimestamp, message.isSent ? styles.sentMessageTimestamp : styles.receivedMessageTimestamp ]}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: isRTL ? ar : undefined })}
                  </Text>
                  {!message.isSent && (
                    <Text style={styles.senderIdText}>
                      (Sender: {message.sender_id.substring(0,6)})
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
          {sendingMessage && (
              <View style={[styles.messageRow, styles.sentMessageRow, { opacity: 0.6, alignItems: 'center'}]}>
                  <View style={[styles.messageBubble, styles.sentMessageBubble, {padding:8, flexDirection: 'row', alignItems: 'center'}]}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{marginRight: 5}} />
                    <Text style={styles.sentMessageText}>Sending...</Text>
                  </View>
              </View>
          )}
        </RNScrollView>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <View style={styles.textInputContainer}>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={userProfileId ? "Type a message..." : "Loading profile..."}
              style={styles.textInput}
              multiline={true} // Standard prop
              editable={!!userProfileId && !sendingMessage} 
            />
          </View>
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSend} 
            disabled={sendingMessage || !newMessage.trim() || !userProfileId} // Standard prop
          >
            <MaterialCommunityIcons
              name="send"
              size={24}
              color={(newMessage.trim() && !sendingMessage && userProfileId) ? '#1e40af' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredFull: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#1e40af',
    paddingTop: Platform.OS === 'android' ? 25 : 15,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1c3a94',
  },
  backButton: {
    marginRight: 12,
    padding:5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  sentMessageRow: {
    justifyContent: 'flex-end',
    marginLeft: 50,
  },
  receivedMessageRow: {
    justifyContent: 'flex-start',
    marginRight: 50,
  },
  messageBubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '100%',
    elevation: 1,
  },
  sentMessageBubble: {
    backgroundColor: '#1e40af',
    borderTopRightRadius: 4,
  },
  receivedMessageBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 4,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  sentMessageText: {
    color: 'white',
    fontSize: 15,
  },
  receivedMessageText: {
    color: '#1F2937',
    fontSize: 15,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  messageTimestamp: {
    fontSize: 11,
    marginRight: 6,
  },
  sentMessageTimestamp: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  receivedMessageTimestamp: {
    color: '#6B7280',
  },
  senderIdText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 8,
  },
  textInput: {
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
});
