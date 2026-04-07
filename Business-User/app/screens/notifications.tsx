import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text } from '../../components/AppText';
import { ChevronLeft, Bell, CreditCard, Clock, CheckCircle, AlertTriangle, UserPlus, Car, CheckCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NOTIFICATIONS = [
  { id: 1, type: 'clock', title: 'Your 3-hour booking is ending soon', desc: 'Do you want to extend your trip?', time: '2 hours ago', unread: true, section: 'Today' },
  { id: 2, type: 'car', title: 'Trip Started', desc: 'Your trip has started. Have a safe ride', time: '2 hours ago', unread: true, section: 'Today' },
  { id: 3, type: 'driver', title: 'Driver Assigned', desc: 'Tap here to view your driver details', time: '2 hours ago', unread: true, section: 'Today', link: true },
  { id: 4, type: 'payment', title: 'Payment Successful', desc: '₦5,000 payment received. Your booking is confirmed.', time: '2 hours ago', unread: true, section: 'Today' },
  { id: 5, type: 'success', title: 'Trip Completed', desc: 'Ride completed. Thank you for choosing 22Logistics', time: 'yesterday', unread: false, section: 'This Week', rightText: '4 days' },
  { id: 6, type: 'alert', title: 'Booking Cancelled by Admin', desc: 'Your booking has been cancelled due to unavailability. Please reschedule', time: 'yesterday', unread: false, section: 'This Week', rightText: '4 days' },
  { id: 7, type: 'success', title: 'Trip Completed', desc: 'Ride completed. Thank you for choosing 22Logistics', time: 'yesterday', unread: false, section: 'This Week', rightText: '4 days' },
  { id: 8, type: 'payment', title: 'Payment Successful', desc: '₦5,000 payment received. Your booking is confirmed.', time: 'yesterday', unread: false, section: 'This Week', rightText: '4 days' }
];

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState('All');

  const getIcon = (type: string) => {
    switch (type) {
      case 'clock': return <Clock size={20} color="#4B5563" />;
      case 'car': return <Car size={20} color="#4B5563" />;
      case 'driver': return <UserPlus size={20} color="#4B5563" />;
      case 'payment': return <CreditCard size={20} color="#4B5563" />;
      case 'success': return <CheckCircle size={20} color="#10B981" />; // Green check
      case 'alert': return <AlertTriangle size={20} color="#F59E0B" />; // Yellow alert
      default: return <Bell size={20} color="#4B5563" />;
    }
  };

  const currentDateTime = "Today"; 
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color="#D1D5DB" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <TouchableOpacity style={styles.markReadBtn}>
          <CheckCheck color="#EF4444" size={16} style={{marginRight: 4}} />
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'All' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('All')}
        >
          <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'Unread' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('Unread')}
        >
          <Text style={[styles.tabText, activeTab === 'Unread' && styles.activeTabText]}>Unread ({unreadCount})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.summaryText}>You have <Text style={styles.summaryHighlight}>3 Notification</Text> today</Text>

        <Text style={styles.sectionTitle}>Today</Text>

        {NOTIFICATIONS.filter(n => n.section === 'Today').map((item, index) => (
           <View key={`today-${item.id}`} style={styles.notificationItem}>
              <View style={styles.iconBox}>
                {getIcon(item.type)}
              </View>
              <View style={styles.itemContent}>
                 <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.unread && <View style={styles.unreadDot} />}
                 </View>
                 {item.link ? (
                    <Text style={styles.itemLinkDesc}>{item.desc}</Text>
                 ) : (
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                 )}
                 <Text style={styles.itemTime}>{item.time}</Text>
              </View>
           </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>This Week</Text>

        {NOTIFICATIONS.filter(n => n.section === 'This Week').map((item, index) => (
           <View key={`week-${item.id}`} style={styles.notificationItem}>
              <View style={styles.iconBox}>
                {getIcon(item.type)}
              </View>
              <View style={styles.itemContent}>
                 <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.rightText && <Text style={styles.itemRightText}>{item.rightText}</Text>}
                 </View>
                 <Text style={styles.itemDesc}>{item.desc}</Text>
                 <Text style={styles.itemTime}>{item.time}</Text>
              </View>
           </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: '#0B1B2B', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 10, paddingBottom: 20 
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  markReadBtn: { flexDirection: 'row', alignItems: 'center' },
  markReadText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabBtn: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  activeTabBtn: { borderBottomWidth: 2, borderBottomColor: '#111827' },
  tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  activeTabText: { color: '#111827', fontWeight: '700' },

  content: { padding: 20, paddingBottom: 60 },
  summaryText: { fontSize: 14, color: '#4B5563', marginBottom: 24 },
  summaryHighlight: { color: '#3B82F6', fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },

  notificationItem: { flexDirection: 'row', marginBottom: 24, alignItems: 'flex-start' },
  iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  
  itemContent: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 16 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  itemRightText: { fontSize: 10, color: '#9CA3AF' },
  
  itemDesc: { fontSize: 12, color: '#4B5563', lineHeight: 18, marginBottom: 6 },
  itemLinkDesc: { fontSize: 12, color: '#3B82F6', lineHeight: 18, marginBottom: 6, fontWeight: '500' },
  itemTime: { fontSize: 10, color: '#9CA3AF' }
});
