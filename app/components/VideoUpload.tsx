import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

interface VideoUploadProps {
  onVideoSelected: (uri: string) => void;
  videoUri?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected' | null;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ 
  onVideoSelected, 
  videoUri,
  verificationStatus = null 
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickVideo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        setError(t('Please grant permission to access your media library'));
        setLoading(false);
        return;
      }
      
      // Launch video picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 120, // 2 minutes max
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Check video duration and size here (mock implementation)
        const selectedVideo = result.assets[0];
        
        // Check file size (limit to ~50MB)
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
        if (selectedVideo.fileSize && selectedVideo.fileSize > MAX_SIZE) {
          setError(t('Video exceeds maximum size (50MB). Please select a smaller video.'));
        } else {
          onVideoSelected(selectedVideo.uri);
        }
      }
    } catch (e) {
      setError(t('Error selecting video. Please try again.'));
      console.error('Error picking video:', e);
    } finally {
      setLoading(false);
    }
  };

  const recordVideo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!cameraPermission.granted) {
        setError(t('Please grant permission to use your camera'));
        setLoading(false);
        return;
      }
      
      // Launch camera to record video
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: 120, // 2 minutes max
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onVideoSelected(result.assets[0].uri);
      }
    } catch (e) {
      setError(t('Error recording video. Please try again.'));
      console.error('Error recording video:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationBadge = () => {
    if (!verificationStatus) return null;
    
    let badgeStyle = styles.pendingBadge;
    let iconName = 'time-outline';
    let badgeText = t('Pending Verification');
    let textStyle = styles.pendingText;
    
    if (verificationStatus === 'verified') {
      badgeStyle = styles.verifiedBadge;
      iconName = 'checkmark-circle';
      badgeText = t('Verified');
      textStyle = styles.verifiedText;
    } else if (verificationStatus === 'rejected') {
      badgeStyle = styles.rejectedBadge;
      iconName = 'close-circle';
      badgeText = t('Rejected');
      textStyle = styles.rejectedText;
    }
    
    return (
      <View style={[styles.verificationBadge, badgeStyle]}>
        <Ionicons name={iconName} size={16} color={textStyle.color} />
        <ThemedText style={textStyle}>{badgeText}</ThemedText>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.uploadContainer}>
        <ActivityIndicator size="large" color="#34568B" />
        <ThemedText style={styles.loadingText}>{t('Processing video...')}</ThemedText>
      </View>
    );
  }

  if (videoUri) {
    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: videoUri }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.COVER}
          isLooping={false}
          shouldPlay={false}
        />
        <TouchableOpacity style={styles.changeButton} onPress={pickVideo}>
          <ThemedText style={styles.changeButtonText}>{t('Change Video')}</ThemedText>
        </TouchableOpacity>
        {renderVerificationBadge()}
      </View>
    );
  }

  return (
    <View style={styles.uploadContainer}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
          <MaterialIcons name="video-library" size={32} color="#34568B" />
          <ThemedText style={styles.uploadText}>{t('Select Video')}</ThemedText>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.uploadButton} onPress={recordVideo}>
          <MaterialIcons name="videocam" size={32} color="#34568B" />
          <ThemedText style={styles.uploadText}>{t('Record Video')}</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.helpTextContainer}>
        <ThemedText style={styles.helpText}>
          {t('Upload a walkthrough video of your property (max 2 minutes).')}
        </ThemedText>
        <ThemedText style={styles.helpTextSmall}>
          {t('Your video must be verified before your property can be rented.')}
        </ThemedText>
      </View>
      
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
};

const styles = StyleSheet.create({
  uploadContainer: {
    backgroundColor: '#F5F6F8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    minHeight: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    flex: 1,
  },
  uploadText: {
    marginTop: 8,
    color: '#34568B',
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  helpTextContainer: {
    marginTop: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  helpTextSmall: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#34568B',
  },
  videoContainer: {
    width: '100%',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 200,
  },
  changeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  changeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  verificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  rejectedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  pendingText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  verifiedText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  rejectedText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
}); 