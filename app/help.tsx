import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLanguage } from '@/contexts/LanguageContext';
import { MenuButton } from '@/components/MenuButton';
import { router } from 'expo-router';

export default function HelpScreen() {
  const { t } = useTranslation(['help']);
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const faqItems = [
    {
      question: t('faq1.question'),
      answer: t('faq1.answer'),
    },
    {
      question: t('faq2.question'),
      answer: t('faq2.answer'),
    },
    {
      question: t('faq3.question'),
      answer: t('faq3.answer'),
    },
  ];

  const contactOptions = [
    {
      title: t('contact.email'),
      icon: 'envelope',
      action: () => Linking.openURL('mailto:support@darrent.com'),
    },
    {
      title: t('contact.phone'),
      icon: 'phone',
      action: () => Linking.openURL('tel:+1234567890'),
    },
    {
      title: t('contact.chat'),
      icon: 'comments',
      action: () => Linking.openURL('https://darrent.com/chat'),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('title')}</ThemedText>
        <View style={styles.headerIcon}>
          <MenuButton position="right" />
        </View>
      </ThemedView>

      <ScrollView style={styles.content}>
        {/* FAQ Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('faqTitle')}</ThemedText>
          {faqItems.map((item, index) => (
            <ThemedView key={index} style={styles.faqItem}>
              <ThemedText style={styles.faqQuestion}>{item.question}</ThemedText>
              <ThemedText style={styles.faqAnswer}>{item.answer}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Contact Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('contactTitle')}</ThemedText>
          {contactOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.contactItem} onPress={option.action}>
              <FontAwesome name={option.icon} size={24} color="#34568B" />
              <ThemedText style={styles.contactText}>{option.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#34568B',
  },
  headerIcon: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2C3E50',
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 16,
  },
});
