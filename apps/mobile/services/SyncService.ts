import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import Config from '../constants/Config';

const QUEUE_KEY = 'offline_action_queue';

export interface OfflineAction {
    id: string;
    type: 'COMPLETE_JOB' | 'UPDATE_STATUS';
    payload: any;
    timestamp: number;
}

class SyncService {
    private isConnected: boolean = true;

    constructor() {
        NetInfo.addEventListener(state => {
            this.isConnected = !!state.isConnected;
            if (this.isConnected) {
                this.processQueue();
            }
        });
    }

    async addToQueue(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
        const queue = await this.getQueue();
        const newAction: OfflineAction = {
            ...action,
            id: Date.now().toString(),
            timestamp: Date.now(),
        };
        queue.push(newAction);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

        if (this.isConnected) {
            this.processQueue();
        }
    }

    async getQueue(): Promise<OfflineAction[]> {
        const json = await AsyncStorage.getItem(QUEUE_KEY);
        return json ? JSON.parse(json) : [];
    }

    async processQueue() {
        const queue = await this.getQueue();
        if (queue.length === 0) return;

        console.log(`Processing ${queue.length} offline actions...`);

        const remainingQueue: OfflineAction[] = [];

        for (const action of queue) {
            try {
                await this.executeAction(action);
            } catch (error) {
                console.error(`Failed to execute action ${action.id}:`, error);
                // Keep in queue if it's a network error, otherwise maybe discard or move to dead letter
                // For simplicity, we keep it to retry later
                remainingQueue.push(action);
            }
        }

        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
    }

    private async executeAction(action: OfflineAction) {
        // Retrieve token from storage (assuming it's stored separately)
        const token = await AsyncStorage.getItem('userToken');
        const headers = { Authorization: `Bearer ${token}` };

        switch (action.type) {
            case 'COMPLETE_JOB':
                // payload: { ticketId, status, notes, photoUri }
                // If photoUri is present, we might need to upload it first
                // For MVP, assume we just send the data
                await axios.patch(`${Config.API_URL}/service-tickets/${action.payload.ticketId}`, {
                    status: 'COMPLETED',
                    description: action.payload.notes // Appending notes to description or separate field
                }, { headers });
                break;

            case 'UPDATE_STATUS':
                await axios.patch(`${Config.API_URL}/service-tickets/${action.payload.ticketId}`, {
                    status: action.payload.status,
                }, { headers });
                break;
        }
    }
}

export default new SyncService();
