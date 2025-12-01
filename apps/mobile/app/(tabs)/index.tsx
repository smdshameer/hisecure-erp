import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Config from '../../constants/Config';

interface Ticket {
  id: number;
  description: string;
  status: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  createdAt: string;
}

export default function JobsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${Config.API_URL}/service-tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter for OPEN or IN_PROGRESS tickets (assuming tech sees all for now)
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#3b82f6';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'WAITING_FOR_PARTS': return '#ef4444';
      case 'COMPLETED': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const renderItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/job/${item.id}`)} // Added navigation
    >
      <View style={styles.cardHeader}>
        <Text style={styles.ticketId}>#{item.id}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}> {/* Changed to 'badge' and direct color */}
          <Text style={styles.badgeText}>{item.status}</Text> {/* Changed to 'badgeText' */}
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.customerInfo}>
        <Ionicons name="person-outline" size={16} color="#94a3b8" style={{ marginRight: 5 }} /> {/* Added Ionicons */}
        <Text style={styles.customerName}>{item.customer?.name || 'Unknown Customer'}</Text> {/* Added optional chaining and fallback */}
        {item.customer.phone && <Text style={styles.customerDetail}>{item.customer.phone}</Text>}
        {item.customer.address && <Text style={styles.customerDetail}>{item.customer.address}</Text>}
      </View>

      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No jobs assigned</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketId: {
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  customerInfo: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  customerName: {
    color: '#e2e8f0',
    fontWeight: '500',
    marginBottom: 4,
  },
  customerDetail: {
    color: '#94a3b8',
    fontSize: 14,
  },
  date: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'right',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
  },
});
