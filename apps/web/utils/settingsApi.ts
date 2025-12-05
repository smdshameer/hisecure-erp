import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Setting {
    id: number;
    module: string;
    key: string;
    value: string;
    description?: string;
    updatedAt: string;
}

export const getSettings = async (module?: string): Promise<Setting[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/settings`, {
        params: { module },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateSetting = async (key: string, value: string, module?: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/settings/${key}`, {
        key,
        value,
        module
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
