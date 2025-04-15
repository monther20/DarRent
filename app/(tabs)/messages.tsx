import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Image, ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Text } from '@/components/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyledScrollView } from '@/components/styled';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ASSETS } from '@/constants/assets';

import api from '../../services/api';
import { Message, User } from '../../services/mockData';

type ConversationPreview = {
  userId: string;
  name: string;
  profileImage: string;
  lastMessage: string;
  timestamp: string;
  isRead: boolean;
  propertyId?: string;
  propertyTitle?: string;
  unread: number;
};

const getAvatarForUser = (userId: string, name: string): string => {
  // This is a simple way to consistently map users to avatars
  // In a real app, you'd get this from the user profile
  const hash = userId.charCodeAt(0) % 2;
  switch (hash) {
    case 0:
      return ASSETS.avatars.owner;
    case 1:
      return ASSETS.avatars.tenant;
    default:
      return ASSETS.images.placeholder;
  }
};

export default function MessagesScreen() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Get current user
        const user = await api.users.getCurrentUser();
        setCurrentUser(user);

        // Get all messages
        const messages = await api.messages.getByUser(user.id);

        // Group by conversation
        const conversationMap = new Map<string, Message[]>();
        
        for (const message of messages) {
          const otherUserId = message.senderId === user.id 
            ? message.receiverId 
            : message.senderId;
          
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, []);
          }
          
          conversationMap.get(otherUserId)?.push(message);
        }

        // Sort messages in each conversation by timestamp
        conversationMap.forEach((messages) => {
          messages.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });

        // Create conversation previews
        const conversationPreviews = await Promise.all(
          Array.from(conversationMap.entries()).map(async ([userId, messages]) => {
            const otherUser = await api.users.getById(userId);
            const lastMessage = messages[0];
            
            let propertyTitle;
            if (lastMessage.propertyId) {
              const property = await api.properties.getById(lastMessage.propertyId);
              propertyTitle = property?.title;
            }
            
            return {
              userId,
              name: otherUser?.fullName || 'Unknown User',
              profileImage: otherUser?.profileImage || 'default_avatar.jpg',
              lastMessage: lastMessage.content,
              timestamp: lastMessage.timestamp,
              isRead: lastMessage.isRead || lastMessage.senderId === user.id,
              propertyId: lastMessage.propertyId,
              propertyTitle,
              unread: 0,
            };
          })
        );

        // Sort conversations by timestamp (most recent first)
        conversationPreviews.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setConversations(conversationPreviews);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderConversation = ({ item }: { item: ConversationPreview }) => (
    <Pressable
      style={styles.conversationItem}
      onPress={() => router.push(`/chat/${item.userId}`)}
    >
      <Image
        source={{ uri: getAvatarForUser(item.userId, item.name) }}
        style={styles.avatar}
        resizeMode="cover"
      />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.timestamp}>
            {formatDistanceToNow(new Date(item.timestamp), {
              addSuffix: true,
              locale: isRTL ? ar : undefined,
            })}
          </Text>
        </View>
        <View style={styles.conversationFooter}>
          <Text style={styles.messagePreview} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34568B" />
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" />
          <Text style={styles.searchPlaceholder}>Search conversations...</Text>
        </View>
      </View>

      {/* Conversations List */}
      <StyledScrollView style={styles.scrollView}>
        {conversations.map((conversation) => (
          <Pressable
            key={conversation.userId}
            style={styles.conversationItem}
            onPress={() => router.push(`/chat/${conversation.userId}`)}
          >
            <Image
              source={{ uri: getAvatarForUser(conversation.userId, conversation.name) }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={styles.userName}>{conversation.name}</Text>
                <Text style={styles.timestamp}>
                  {formatDistanceToNow(new Date(conversation.timestamp), {
                    addSuffix: true,
                    locale: isRTL ? ar : undefined,
                  })}
                </Text>
              </View>
              <View style={styles.conversationFooter}>
                <Text style={styles.messagePreview} numberOfLines={1}>
                  {conversation.lastMessage}
                </Text>
                {conversation.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>
                      {conversation.unread}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </StyledScrollView>

      {/* New Message FAB */}
      <Pressable
        style={[
          styles.fab,
          isRTL ? { left: 24, right: undefined } : undefined
        ]}
        onPress={() => router.push('/new-message')}
      >
        <MaterialCommunityIcons name="message-plus" size={24} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#34568B',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchPlaceholder: {
    color: '#9CA3AF',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontWeight: '600',
  },
  timestamp: {
    color: '#6B7280',
    fontSize: 14,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messagePreview: {
    color: '#4B5563',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#34568B',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#34568B',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 