import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Setting {
    id: number;
    category: string;
    key: string;
    value: string;
    description?: string;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'SECRET';
    isSecret: boolean;
    isDeveloper: boolean;
    version: number;
    updatedAt: string;
}

export interface SettingHistory {
    id: number;
    oldValue: string;
    newValue: string;
    version: number;
    timestamp: string;
}

export const getSettings = async (category?: string): Promise<Setting[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/settings`, {
        params: { module: category }, // Backend still maps 'module' query param to category if needed, or we should update backend query param too. Let's check backend controller. service uses 'category' in where but controller takes 'module' query param. So 'params: { module: category }' is correct mapping for now.
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateSetting = async (key: string, value: string, category?: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/settings/${key}`, {
        key,
        value,
        module: category // DTO still expects 'module' field? Let's check UpdateSettingDto.
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getSettingHistory = async (key: string): Promise<SettingHistory[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/settings/${key}/history`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const rollbackSetting = async (key: string, version: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/settings/${key}/rollback`, { version }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
