import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface ChecklistItem {
  id: string;
  text: string;
  category: 'documents' | 'questions' | 'inspection' | 'custom';
  checked: boolean;
}

interface PropertyFeature {
  name: string;
  value: string | number | boolean;
}

interface ViewingPreparationChecklistProps {
  propertyId: string;
  propertyTitle: string;
  propertyFeatures?: PropertyFeature[];
  onSave?: (items: ChecklistItem[]) => void;
  onClose: () => void;
}

export const ViewingPreparationChecklist = ({
  propertyId,
  propertyTitle,
  propertyFeatures = [],
  onSave,
  onClose,
}: ViewingPreparationChecklistProps) => {
  const { t } = useTranslation(['common', 'viewings']);
  
  // Generate initial checklist based on property features
  const generateInitialChecklist = (): ChecklistItem[] => {
    const defaultItems: ChecklistItem[] = [
      { id: 'doc1', text: t('Bring ID document', { ns: 'viewings' }), category: 'documents', checked: false },
      { id: 'doc2', text: t('Bring proof of income', { ns: 'viewings' }), category: 'documents', checked: false },
      { id: 'doc3', text: t('Bring reference letters if available', { ns: 'viewings' }), category: 'documents', checked: false },
      { id: 'insp1', text: t('Check for water damage/mold', { ns: 'viewings' }), category: 'inspection', checked: false },
      { id: 'insp2', text: t('Test all light switches', { ns: 'viewings' }), category: 'inspection', checked: false },
      { id: 'insp3', text: t('Check water pressure in bathroom', { ns: 'viewings' }), category: 'inspection', checked: false },
      { id: 'insp4', text: t('Check all windows open/close properly', { ns: 'viewings' }), category: 'inspection', checked: false },
      { id: 'insp5', text: t('Check for cell phone reception', { ns: 'viewings' }), category: 'inspection', checked: false },
      { id: 'insp6', text: t('Test noise levels (traffic, neighbors)', { ns: 'viewings' }), category: 'inspection', checked: false },
      { id: 'quest1', text: t('Ask about utility costs', { ns: 'viewings' }), category: 'questions', checked: false },
      { id: 'quest2', text: t('Ask about parking availability', { ns: 'viewings' }), category: 'questions', checked: false },
      { id: 'quest3', text: t('Ask about maintenance procedures', { ns: 'viewings' }), category: 'questions', checked: false },
    ];
    
    // Add feature-specific questions based on property features
    const featureBasedItems: ChecklistItem[] = [];
    
    propertyFeatures.forEach(feature => {
      if (feature.name === 'bedrooms' && Number(feature.value) > 1) {
        featureBasedItems.push({
          id: `quest_bed`,
          text: t('Ask about bedroom sizes comparison', { ns: 'viewings' }),
          category: 'questions',
          checked: false
        });
      }
      
      if (feature.name === 'bathrooms' && Number(feature.value) > 1) {
        featureBasedItems.push({
          id: `quest_bath`,
          text: t('Check all bathrooms for functionality', { ns: 'viewings' }),
          category: 'inspection',
          checked: false
        });
      }
      
      if (feature.name === 'furnished' && feature.value === true) {
        featureBasedItems.push({
          id: `insp_furniture`,
          text: t('Inspect condition of all furniture', { ns: 'viewings' }),
          category: 'inspection',
          checked: false
        });
        featureBasedItems.push({
          id: `quest_furniture`,
          text: t('Ask about furniture inventory list', { ns: 'viewings' }),
          category: 'questions', 
          checked: false
        });
      }
    });
    
    return [...defaultItems, ...featureBasedItems];
  };
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>(generateInitialChecklist());
  const [newItemText, setNewItemText] = useState<string>('');
  const [viewingNotes, setViewingNotes] = useState<string>('');

  const handleToggleItem = (id: string) => {
    setChecklist(current => 
      current.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSave = () => {
    if (onSave) {
      onSave(checklist);
    }
    onClose();
  };

  const renderCategoryItems = (category: 'documents' | 'questions' | 'inspection' | 'custom') => {
    const categoryItems = checklist.filter(item => item.category === category);
    return categoryItems.map(item => (
      <TouchableOpacity
        key={item.id}
        style={styles.checklistItem}
        onPress={() => handleToggleItem(item.id)}
      >
        <MaterialIcons 
          name={item.checked ? "check-box" : "check-box-outline-blank"} 
          size={24} 
          color={item.checked ? "#34568B" : "#9CA3AF"} 
        />
        <ThemedText style={[
          styles.checklistText,
          item.checked && styles.checkedText
        ]}>
          {item.text}
        </ThemedText>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('Viewing Preparation', { ns: 'viewings' })}</ThemedText>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.propertyInfoContainer}>
        <ThemedText style={styles.propertyTitle} numberOfLines={2}>
          {propertyTitle}
        </ThemedText>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="description" size={20} color="#34568B" />
            <ThemedText style={styles.sectionTitle}>
              {t('Documents to Bring', { ns: 'viewings' })}
            </ThemedText>
          </View>
          {renderCategoryItems('documents')}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="search" size={20} color="#34568B" />
            <ThemedText style={styles.sectionTitle}>
              {t('Things to Inspect', { ns: 'viewings' })}
            </ThemedText>
          </View>
          {renderCategoryItems('inspection')}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="help-outline" size={20} color="#34568B" />
            <ThemedText style={styles.sectionTitle}>
              {t('Questions to Ask', { ns: 'viewings' })}
            </ThemedText>
          </View>
          {renderCategoryItems('questions')}
        </View>

        <View style={styles.weatherContainer}>
          <View style={styles.weatherHeader}>
            <Ionicons name="partly-sunny-outline" size={24} color="#34568B" />
            <ThemedText style={styles.weatherTitle}>{t('Weather Forecast', { ns: 'viewings' })}</ThemedText>
          </View>
          <ThemedText style={styles.weatherNote}>
            {t('Check the weather forecast before your viewing to prepare accordingly.', { ns: 'viewings' })}
          </ThemedText>
          <TouchableOpacity style={styles.weatherButton}>
            <ThemedText style={styles.weatherButtonText}>
              {t('View Forecast', { ns: 'viewings' })}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>
            {t('Save Checklist', { ns: 'viewings' })}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    backgroundColor: '#34568B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  propertyInfoContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34568B',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34568B',
    marginLeft: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checklistText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#4B5563',
    flex: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  weatherContainer: {
    backgroundColor: '#EBF5FF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    marginBottom: 80,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34568B',
    marginLeft: 8,
  },
  weatherNote: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  weatherButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  weatherButtonText: {
    color: '#34568B',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#34568B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 