import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '../components/ScreenHeader';
import { mockApi } from '../services/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-native-calendars';
import { ViewingRequestCard } from '../components/viewings/ViewingRequestCard';
import { ViewingRequestModal } from '../components/viewings/ViewingRequestModal';
import { ViewingDetailsModal } from '../components/viewings/ViewingDetailsModal';
import { Ionicons } from '@expo/vector-icons';

type ViewingRequest = {
  id: string;
  renterId: string;
  renterName: string;
  propertyId: string;
  propertyTitle: string;
  preferredDates: string[];
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  notes?: string;
  createdAt: string;
  confirmedDate?: string;
};

type MarkedDate = {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
    selectedColor?: string;
    dotColor?: string;
  };
};

export default function ViewingCalendarScreen() {
  const { t } = useTranslation(['common', 'viewings']);
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [loading, setLoading] = useState(true);
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ViewingRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<MarkedDate>({});
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  
  const [selectedRequest, setSelectedRequest] = useState<ViewingRequest | null>(null);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  useEffect(() => {
    loadViewingRequests();
  }, []);

  const loadViewingRequests = async () => {
    setLoading(true);
    try {
      // In the future this will use real API to fetch viewing requests
      // Todo: Replace with mockApi.getViewingRequests(user.id)
      const mockRequests: ViewingRequest[] = [
        {
          id: 'vr1',
          renterId: 'renter1',
          renterName: 'Ahmed Mohammed',
          propertyId: 'prop1',
          propertyTitle: 'Luxury Apartment in Downtown',
          preferredDates: [
            new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          ],
          status: 'pending',
          notes: 'Interested in viewing during evening hours',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'vr2',
          renterId: 'renter2',
          renterName: 'Sara Ahmed',
          propertyId: 'prop2',
          propertyTitle: '2 Bedroom Villa with Pool',
          preferredDates: [
            new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          ],
          status: 'confirmed',
          notes: 'Has questions about the backyard',
          createdAt: new Date().toISOString(),
          confirmedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'vr3',
          renterId: 'renter3',
          renterName: 'Khalid Al-Farsi',
          propertyId: 'prop1',
          propertyTitle: 'Luxury Apartment in Downtown',
          preferredDates: [
            new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          ],
          status: 'completed',
          notes: 'Asked about parking availability',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          confirmedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      setViewingRequests(mockRequests);
      setFilteredRequests(mockRequests);
      updateMarkedDates(mockRequests);
    } catch (error) {
      console.error('Error loading viewing requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarkedDates = (requests: ViewingRequest[]) => {
    const marked: MarkedDate = {};
    
    requests.forEach(request => {
      // Mark all preferred dates for pending requests
      if (request.status === 'pending') {
        request.preferredDates.forEach(dateString => {
          const dateKey = dateString.split('T')[0];
          marked[dateKey] = {
            marked: true,
            dotColor: '#F2994A', // Orange for pending
          };
        });
      }
      
      // Mark confirmed dates
      if (request.status === 'confirmed' && request.confirmedDate) {
        const dateKey = request.confirmedDate.split('T')[0];
        marked[dateKey] = {
          marked: true,
          dotColor: '#27AE60', // Green for confirmed
        };
      }
      
      // Mark completed dates
      if (request.status === 'completed' && request.confirmedDate) {
        const dateKey = request.confirmedDate.split('T')[0];
        marked[dateKey] = {
          marked: true,
          dotColor: '#2D9CDB', // Blue for completed
        };
      }
    });
    
    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#34568B',
      };
    }
    
    setMarkedDates(marked);
  };

  const handleDateSelect = (day: any) => {
    const selected = day.dateString;
    setSelectedDate(selected);
    
    // Update marked dates to highlight the selected date
    updateMarkedDates(viewingRequests);
    
    // Filter requests for the selected date
    filterRequestsByDate(selected);
  };
  
  const filterRequestsByDate = (date: string) => {
    const filtered = viewingRequests.filter(request => {
      // Check if any preferred date matches the selected date
      const preferredMatch = request.preferredDates.some(
        prefDate => prefDate.split('T')[0] === date
      );
      
      // Check if confirmed date matches the selected date
      const confirmedMatch = request.confirmedDate && 
        request.confirmedDate.split('T')[0] === date;
      
      return preferredMatch || confirmedMatch;
    });
    
    setFilteredRequests(filtered);
  };
  
  const filterByStatus = (status: 'all' | 'pending' | 'confirmed' | 'completed') => {
    setActiveFilter(status);
    
    if (status === 'all') {
      filterRequestsByDate(selectedDate);
    } else {
      const filtered = viewingRequests.filter(request => {
        const dateMatch = request.preferredDates.some(
          prefDate => prefDate.split('T')[0] === selectedDate
        ) || (request.confirmedDate && 
              request.confirmedDate.split('T')[0] === selectedDate);
              
        return request.status === status && dateMatch;
      });
      
      setFilteredRequests(filtered);
    }
  };
  
  const handleRequestPress = (request: ViewingRequest) => {
    setSelectedRequest(request);
    if (request.status === 'pending') {
      setIsRequestModalVisible(true);
    } else {
      setIsDetailsModalVisible(true);
    }
  };
  
  const handleRequestAction = async (
    action: 'confirm' | 'reschedule' | 'reject',
    requestId: string,
    date?: string,
    notes?: string
  ) => {
    setIsRequestModalVisible(false);
    setIsDetailsModalVisible(false);
    
    try {
      // In real implementation, this would use the API to update the request
      const updatedRequests = viewingRequests.map(req => {
        if (req.id === requestId) {
          if (action === 'confirm') {
            return { ...req, status: 'confirmed', confirmedDate: date || req.preferredDates[0] };
          } else if (action === 'reject') {
            return { ...req, status: 'rejected' };
          }
        }
        return req;
      });
      
      setViewingRequests(updatedRequests);
      updateMarkedDates(updatedRequests);
      filterRequestsByDate(selectedDate);
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t('viewingRequests', { ns: 'viewings' })} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34568B" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('viewingRequests', { ns: 'viewings' })} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDateSelect}
            monthFormat={'MMMM yyyy'}
            hideExtraDays={true}
            firstDay={0}
            disableAllTouchEventsForDisabledDays={true}
            enableSwipeMonths={true}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#34568B',
              selectedDayBackgroundColor: '#34568B',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#F2994A',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              arrowColor: '#34568B',
              monthTextColor: '#34568B',
              textMonthFontWeight: 'bold',
              textDayFontWeight: '300',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
            onPress={() => filterByStatus('all')}
          >
            <ThemedText style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              {t('all', { ns: 'common' })}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'pending' && styles.activeFilterButton]}
            onPress={() => filterByStatus('pending')}
          >
            <ThemedText style={[styles.filterText, activeFilter === 'pending' && styles.activeFilterText]}>
              {t('pending', { ns: 'common' })}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'confirmed' && styles.activeFilterButton]}
            onPress={() => filterByStatus('confirmed')}
          >
            <ThemedText style={[styles.filterText, activeFilter === 'confirmed' && styles.activeFilterText]}>
              {t('confirmed', { ns: 'common' })}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'completed' && styles.activeFilterButton]}
            onPress={() => filterByStatus('completed')}
          >
            <ThemedText style={[styles.filterText, activeFilter === 'completed' && styles.activeFilterText]}>
              {t('completed', { ns: 'common' })}
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#F2994A' }]} />
            <ThemedText style={styles.legendText}>{t('pendingRequests', { ns: 'viewings' })}</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#27AE60' }]} />
            <ThemedText style={styles.legendText}>{t('confirmedViewings', { ns: 'viewings' })}</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#2D9CDB' }]} />
            <ThemedText style={styles.legendText}>{t('completedViewings', { ns: 'viewings' })}</ThemedText>
          </View>
        </View>
        
        <View style={styles.requestsContainer}>
          <View style={styles.requestsHeader}>
            <ThemedText style={styles.requestsTitle}>
              {selectedDate && new Date(selectedDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} 
              {' '}- {filteredRequests.length} {t('viewingRequests', { ns: 'viewings' })}
            </ThemedText>
          </View>
          
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#BDBDBD" />
              <ThemedText style={styles.emptyStateText}>
                {t('noViewingRequests', { ns: 'viewings' })}
              </ThemedText>
            </View>
          ) : (
            filteredRequests.map((request) => (
              <ViewingRequestCard
                key={request.id}
                request={request}
                onPress={() => handleRequestPress(request)}
              />
            ))
          )}
        </View>
      </ScrollView>
      
      {selectedRequest && (
        <>
          <ViewingRequestModal
            visible={isRequestModalVisible}
            request={selectedRequest}
            onClose={() => setIsRequestModalVisible(false)}
            onConfirm={(requestId, date, notes) => handleRequestAction('confirm', requestId, date, notes)}
            onReschedule={(requestId, date, notes) => handleRequestAction('reschedule', requestId, date, notes)}
            onReject={(requestId) => handleRequestAction('reject', requestId)}
          />
          
          <ViewingDetailsModal
            visible={isDetailsModalVisible}
            request={selectedRequest}
            onClose={() => setIsDetailsModalVisible(false)}
            onMarkComplete={(requestId) => {
              // Mark the viewing as completed
              const updatedRequests = viewingRequests.map(req => 
                req.id === requestId ? { ...req, status: 'completed' } : req
              );
              setViewingRequests(updatedRequests);
              updateMarkedDates(updatedRequests);
              filterRequestsByDate(selectedDate);
              setIsDetailsModalVisible(false);
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    minWidth: 80,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#34568B',
  },
  filterText: {
    fontSize: 14,
    color: '#4F4F4F',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  legendContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#4F4F4F',
  },
  requestsContainer: {
    flex: 1,
  },
  requestsHeader: {
    marginBottom: 12,
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
  },
  emptyStateText: {
    marginTop: 12,
    color: '#757575',
    fontSize: 16,
    textAlign: 'center',
  },
}); 