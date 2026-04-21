import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { Text } from '@/components/AppText';

interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  isLoading: boolean; // Just in case a screen needs to know the state
}

const LoadingContext = createContext<LoadingContextType>({} as LoadingContextType);

// The Provider Component
export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();

  const showLoading = (message?: string) => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage(undefined);
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {/* 1. Render all your app's normal screens */}
      {children}
      
      {/* 2. Global Overlay. 
          Using a Modal ensures it always renders over headers/bottom tabs 
      */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0B3D91" /> 
            {loadingMessage && (
              <Text style={styles.messageText}>{loadingMessage}</Text>
            )}
          </View>
        </View>
      </Modal>
    </LoadingContext.Provider>
  );
};

// Custom Hook helper
export const useLoading = () => useContext(LoadingContext);

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dimmed background
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  messageText: {
    marginTop: 16,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  }
});
