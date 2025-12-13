import { useState, useEffect } from 'react';
import { useApiAuth } from '@/hooks/useApiAuth';

export default function DeploymentPanel({ config, onDeploy }) {
    const { authFetch } = useApiAuth();
    const [deploying, setDeploying] = useState(false);
    const [channelId, setChannelId] = useState('');
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        async function fetchChannels() {
            try {
                const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discord/channels`);
                if (res.ok) {
                    const textchannels = await res.json()
                    setChannels(textchannels.filter(c => c.type === 0));
                }
            } catch (error) {
                console.error('Failed to fetch channels:', error);
            }
        }
        fetchChannels();
    }, [authFetch]);

    const handleDeploy = async () => {
        if (!channelId) return;
        setDeploying(true);
        await onDeploy(channelId);
        setDeploying(false);
    };

    // Find deployed channel name if available
    const deployedChannel = config?.requestChannelId
        ? channels.find(c => c.id === config.requestChannelId)
        : null;

    return (
        <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Deploy Verification Message</h2>


            <div className="md:flex gap-8">


                <div className="space-y-4  max-w-lg">
                    <p className="text-sm text-zinc-400">
                        {deployedChannel
                            ? 'You can redeploy to a different channel or send another message to the same channel.'
                            : 'Send the verification embed message to a specific channel. Users will click the button on this message to start the verification process.'
                        }
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Target Channel</label>
                        <div className="flex gap-3">
                            <select
                                className="input-modern flex-1"
                                value={channelId || deployedChannel?.id}
                                defaultValue={deployedChannel?.id}
                                onChange={e => setChannelId(e.target.value)}
                            >
                                <option value="">Select Channel</option>
                                {channels.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleDeploy}
                                disabled={deploying || !channelId}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deploying ? 'Sending...' : deployedChannel ? 'Redeploy' : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Current Deployment Status */}
                {deployedChannel && (
                    <div className="p-4 rounded-lg  flex-1 bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Message Deployed</span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">
                            Currently deployed in <span className="text-white font-medium">#{deployedChannel.name}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
