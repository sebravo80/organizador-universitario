import api from './api';

export const getPersonalNotes = async () => (await api.get('/personalnotes')).data;
export const createPersonalNote = async (text) => (await api.post('/personalnotes', { text })).data;
export const updatePersonalNote = async (id, data) => (await api.put(`/personalnotes/${id}`, data)).data;
export const deletePersonalNote = async (id) => (await api.delete(`/personalnotes/${id}`)).data;