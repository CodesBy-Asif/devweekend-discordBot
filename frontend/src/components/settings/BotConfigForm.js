import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useApiAuth } from '@/hooks/useApiAuth';
import { fetchChannels, selectAllChannels, selectDiscordLoading } from '@/store/slices/discordSlice';

export default function BotConfigForm({ config, onSave }) {
    const dispatch = useDispatch();
    const { authFetch } = useApiAuth();

    // Redux state
    const channels = useSelector(selectAllChannels);
    const loading = useSelector(selectDiscordLoading);

    const [formData, setFormData] = useState({
        logChannelId: '',
        embed: {
            title: '',
            description: '',
            color: 0x00ff00
        },
        button: {
            label: '',
            emoji: ''
        }
    });

    // Initialize form data from config prop
    useEffect(() => {
        if (config) {
            setFormData({
                logChannelId: config.logChannelId || '',
                embed: {
                    title: config.embed?.title || 'Verified Clans & Communities',
                    description: config.embed?.description || 'Prove you belong to one of our partner universities, companies, or clans to get exclusive roles and channels.\n\nClick the button below to start.',
                    color: config.embed?.color || 0x00ff00
                },
                button: {
                    label: config.button?.label || 'Request Clan Role',
                    emoji: config.button?.emoji || '🔒'
                }
            });
        }
    }, [config]);

    // Fetch channels if not already loaded
    useEffect(() => {
        if (channels.length === 0 && !loading.channels) {
            dispatch(fetchChannels(authFetch));
        }
    }, [dispatch, authFetch, channels.length, loading.channels]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // Filter channels
    const textChannels = channels.filter(c => c.type === 0);


    return (
        <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Bot Configuration</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Log Channel</label>
                        <select
                            className="input-modern w-full"
                            value={formData.logChannelId}
                            onChange={e => setFormData({ ...formData, logChannelId: e.target.value })}
                        >
                            <option value="">Select Channel</option>
                            {textChannels.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-zinc-500 mt-1">Channel for audit logs</p>
                    </div>
                </div>


                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-md font-medium text-white mb-4">Verification Message</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Embed Title</label>
                            <input
                                type="text"
                                className="input-modern w-full"
                                value={formData.embed.title}
                                onChange={e => setFormData({ ...formData, embed: { ...formData.embed, title: e.target.value } })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Embed Description</label>
                            <textarea
                                className="input-modern w-full h-24"
                                value={formData.embed.description}
                                onChange={e => setFormData({ ...formData, embed: { ...formData.embed, description: e.target.value } })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Button Label</label>
                                <input
                                    type="text"
                                    className="input-modern w-full"
                                    value={formData.button.label}
                                    onChange={e => setFormData({ ...formData, button: { ...formData.button, label: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Button Emoji</label>
                                <input
                                    type="text"
                                    className="input-modern w-full"
                                    value={formData.button.emoji}
                                    onChange={e => setFormData({ ...formData, button: { ...formData.button, emoji: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="btn-primary">
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
}
