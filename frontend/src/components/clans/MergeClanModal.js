import { useState } from 'react';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApiAuth } from '@/hooks/useApiAuth';

export default function MergeClanModal({ sourceClan, allClans, onClose, onSuccess }) {
    const { authFetch } = useApiAuth();
    const [targetClanId, setTargetClanId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Filter out source clan from options
    const targetOptions = allClans.filter(c => c._id !== sourceClan._id);

    const handleMerge = async () => {
        if (!targetClanId) return;

        if (!confirm(`Are you sure you want to merge ${sourceClan.name} into the selected clan? This cannot be undone.`)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clans/${sourceClan._id}/merge`, {
                method: 'POST',
                body: JSON.stringify({ targetClanId })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to merge clans');
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e1f22] rounded-lg w-full max-w-md shadow-xl border border-[#1e1f22]">
                <div className="flex justify-between items-center p-4 border-b border-[#2b2d31]">
                    <h2 className="text-xl font-bold text-white">Merge Clan</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                        <div className="text-sm text-yellow-200">
                            <p className="font-bold mb-1">Warning: Irreversible Action</p>
                            <p>Merging will move all mentees and requests from <strong>{sourceClan.name}</strong> to the target clan.</p>
                            <p className="mt-2"><strong>{sourceClan.name}</strong> will be deleted.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div>

                            <div className="text-xs text-gray-400 mb-1">Source</div>
                            <div className="flex-1 p-3 bg-[#2b2d31] rounded border border-[#1e1f22] text-center">
                                <div className="font-bold text-white">{sourceClan.name}</div>
                            </div>
                        </div>
                        <ArrowRight className=" mt-5 text-gray-500" />
                        <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">Target</label>
                            <select
                                value={targetClanId}
                                onChange={(e) => setTargetClanId(e.target.value)}
                                className="w-full bg-[#2b2d31] border border-[#1e1f22] text-white rounded p-3 focus:outline-none focus:border-[#5865F2]"
                            >
                                <option value="">Select Clan</option>
                                {targetOptions.map(clan => (
                                    <option key={clan._id} value={clan._id}>{clan.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-[#2b2d31] rounded transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMerge}
                            disabled={!targetClanId || loading}
                            className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? 'Merging...' : 'Confirm Merge'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
