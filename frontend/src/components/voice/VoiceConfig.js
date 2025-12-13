'use client'

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useApiAuth } from '@/hooks/useApiAuth';
import { fetchChannels, selectAllChannels, selectDiscordLoading } from '@/store/slices/discordSlice';
import { Settings } from 'lucide-react';

export default function VoiceConfig() {
    const dispatch = useDispatch();
    const { authFetch } = useApiAuth();

    // Redux state
    const channels = useSelector(selectAllChannels);
    const loading = useSelector(selectDiscordLoading);

    const [config, setConfig] = useState(null);
    const [formData, setFormData] = useState({
        tempVoiceCategoryId: '',
        joinToCreateChannelId: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch config
    useEffect(() => {
        fetchConfig();
        if (channels.length === 0 && !loading.channels) {
            dispatch(fetchChannels(authFetch));
        }
    }, [dispatch, authFetch, channels.length, loading.channels]);

    async function fetchConfig() {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`);
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
                setFormData({
                    tempVoiceCategoryId: data.tempVoiceCategoryId || '',
                    joinToCreateChannelId: data.joinToCreateChannelId || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const updatedConfig = { ...config, ...formData };

            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedConfig)
            });

            if (res.ok) {
                setStatus({ type: 'success', message: 'Configuration saved!' });
                setConfig(await res.json());
                setTimeout(() => setStatus({ type: '', message: '' }), 3000);
            } else {
                setStatus({ type: 'error', message: 'Failed to save configuration.' });
            }
        } catch (error) {
            console.error('Save failed:', error);
            setStatus({ type: 'error', message: 'An error occurred.' });
        } finally {
            setIsSaving(false);
        }
    }


    // Filter channels
    const voiceChannels = channels.filter(c => c.type === 2);
    const categories = channels.filter(c => c.type === 4);

    return (
        <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Voice System Configuration</h2>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Join to Create Channel</label>
                        <select
                            className="input-modern w-full"
                            value={formData.joinToCreateChannelId}
                            onChange={e => setFormData({ ...formData, joinToCreateChannelId: e.target.value })}
                        >
                            <option value="">Select Voice Channel</option>
                            {voiceChannels.map(c => (
                                <option key={c.id} value={c.id}>🔊 {c.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-zinc-500 mt-1">Users joining this channel will trigger creation</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Temp Category</label>
                        <select
                            className="input-modern w-full"
                            value={formData.tempVoiceCategoryId}
                            onChange={e => setFormData({ ...formData, tempVoiceCategoryId: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>📁 {c.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-zinc-500 mt-1">Category where temp channels will be created</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex gap-4">
                        {/* Deploy button removed as per request */}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`text-sm ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {status.message}
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
