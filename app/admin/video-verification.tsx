import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { mockApi } from '../services/mockApi';

interface PropertyVerification {
  id: string;
  propertyId: string;
  propertyTitle: string;
  landlordId: string;
  landlordName: string;
  videoUrl: string;
  submissionDate: string;
  thumbnailUrl: string;
  status: 'pending' | 'verified' | 'rejected';
}

export default function VideoVerificationScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<PropertyVerification[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PropertyVerification | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be a real API call
      // Mock data for now
      const mockVerifications: PropertyVerification[] = [
        {
          id: 'ver1',
          propertyId: 'prop1',
          propertyTitle: 'Spacious 3 Bedroom Apartment',
          landlordId: 'user1',
          landlordName: 'John Smith',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-apartment-living-room-in-daylight-4964-large.mp4',
          submissionDate: new Date().toISOString(),
          thumbnailUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
          status: 'pending',
        },
        {
          id: 'ver2',
          propertyId: 'prop2',
          propertyTitle: 'Downtown Studio',
          landlordId: 'user1',
          landlordName: 'John Smith',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-small-luxurious-one-bedroom-apartment-4498-large.mp4',
          submissionDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          thumbnailUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
          status: 'pending',
        },
      ];
      
      setVerifications(mockVerifications);
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    setProcessingId(id);
    try {
      // In a real implementation, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      setVerifications(current =>
        current.map(ver => 
          ver.id === id ? { ...ver, status: 'verified' } : ver
        )
      );
      
      // Clear the selected video if it was just verified
      if (selectedVideo?.id === id) {
        setSelectedVideo({...selectedVideo, status: 'verified'});
      }
    } catch (error) {
      console.error('Error verifying property:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      // In a real implementation, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      setVerifications(current =>
        current.map(ver => 
          ver.id === id ? { ...ver, status: 'rejected' } : ver
        )
      );
      
      // Clear the selected video if it was just rejected
      if (selectedVideo?.id === id) {
        setSelectedVideo({...selectedVideo, status: 'rejected'});
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    let badgeStyle = styles.pendingBadge;
    let textStyle = styles.pendingText;
    let statusText = t('Pending');
    
    if (status === 'verified') {
      badgeStyle = styles.verifiedBadge;
      textStyle = styles.verifiedText;
      statusText = t('Verified');
    } else if (status === 'rejected') {
      badgeStyle = styles.rejectedBadge;
      textStyle = styles.rejectedText;
      statusText = t('Rejected');
    }
    
    return (
      <View style={[styles.statusBadge, badgeStyle]}>
        <ThemedText style={textStyle}>{statusText}</ThemedText>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{t('Video Verifications')}</ThemedText>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34568B" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('Video Verifications')}</ThemedText>
        <View style={styles.headerPlaceholder} />
      </View>
      
      {selectedVideo ? (
        <View style={styles.videoDetailContainer}>
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: selectedVideo.videoUrl }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
            />
          </View>
          
          <View style={styles.detailsContainer}>
            <ThemedText style={styles.propertyTitle}>{selectedVideo.propertyTitle}</ThemedText>
            <ThemedText style={styles.landlordName}>{t('Landlord')}: {selectedVideo.landlordName}</ThemedText>
            <ThemedText style={styles.submissionDate}>
              {t('Submitted')}: {new Date(selectedVideo.submissionDate).toLocaleDateString()}
            </ThemedText>
            
            <View style={styles.currentStatus}>
              <ThemedText style={styles.statusLabel}>{t('Status')}: </ThemedText>
              {renderStatusBadge(selectedVideo.status)}
            </View>
            
            {selectedVideo.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(selectedVideo.id)}
                  disabled={!!processingId}
                >
                  {processingId === selectedVideo.id ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="close-circle" size={20} color="white" />
                      <ThemedText style={styles.buttonText}>{t('Reject')}</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.verifyButton]}
                  onPress={() => handleVerify(selectedVideo.id)}
                  disabled={!!processingId}
                >
                  {processingId === selectedVideo.id ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check-circle" size={20} color="white" />
                      <ThemedText style={styles.buttonText}>{t('Verify')}</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.backToListButton}
              onPress={() => setSelectedVideo(null)}
            >
              <MaterialIcons name="arrow-back" size={20} color="#34568B" />
              <ThemedText style={styles.backToListText}>{t('Back to List')}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.listHeader}>
            <ThemedText style={styles.listTitle}>
              {t('Pending Verifications')} ({verifications.filter(v => v.status === 'pending').length})
            </ThemedText>
          </View>
          
          {verifications.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="video-check" size={64} color="#D1D5DB" />
              <ThemedText style={styles.emptyStateText}>{t('No video verifications pending')}</ThemedText>
            </View>
          ) : (
            verifications.map(verification => (
              <TouchableOpacity
                key={verification.id}
                style={[styles.verificationCard, 
                  verification.status === 'verified' && styles.verifiedCard,
                  verification.status === 'rejected' && styles.rejectedCard
                ]}
                onPress={() => setSelectedVideo(verification)}
                disabled={verification.status !== 'pending'}
              >
                <View style={styles.thumbnailContainer}>
                  <Image
                    source={{ uri: verification.thumbnailUrl }}
                    style={styles.thumbnail}
                  />
                  <MaterialCommunityIcons 
                    name="play-circle" 
                    size={32} 
                    color="white" 
                    style={styles.playIcon} 
                  />
                  {renderStatusBadge(verification.status)}
                </View>
                
                <View style={styles.cardContent}>
                  <ThemedText style={styles.cardTitle} numberOfLines={1}>
                    {verification.propertyTitle}
                  </ThemedText>
                  <ThemedText style={styles.cardSubtitle} numberOfLines={1}>
                    {verification.landlordName}
                  </ThemedText>
                  <ThemedText style={styles.cardDate}>
                    {new Date(verification.submissionDate).toLocaleDateString()}
                  </ThemedText>
                </View>
                
                {verification.status === 'pending' && (
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={styles.cardAction}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleReject(verification.id);
                      }}
                      disabled={!!processingId}
                    >
                      {processingId === verification.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <MaterialCommunityIcons name="close-circle" size={24} color="#EF4444" />
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.cardAction}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleVerify(verification.id);
                      }}
                      disabled={!!processingId}
                    >
                      {processingId === verification.id ? (
                        <ActivityIndicator size="small" color="#10B981" />
                      ) : (
                        <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
          
          <View style={styles.sectionDivider} />
          
          <View style={styles.listHeader}>
            <ThemedText style={styles.listTitle}>
              {t('Recent Verifications')}
            </ThemedText>
          </View>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {verifications.filter(v => v.status === 'verified').length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>{t('Approved')}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {verifications.filter(v => v.status === 'rejected').length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>{t('Rejected')}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {verifications.filter(v => v.status === 'pending').length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>{t('Pending')}</ThemedText>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listHeader: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  verificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verifiedCard: {
    opacity: 0.7,
  },
  rejectedCard: {
    opacity: 0.7,
  },
  thumbnailContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -16,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingBadge: {
    backgroundColor: '#F59E0B',
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
  },
  rejectedBadge: {
    backgroundColor: '#EF4444',
  },
  pendingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  verifiedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  rejectedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  cardAction: {
    padding: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  videoDetailContainer: {
    flex: 1,
    padding: 16,
  },
  videoContainer: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  landlordName: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  verifyButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  backToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  backToListText: {
    marginLeft: 8,
    color: '#34568B',
    fontWeight: '500',
  },
}); 