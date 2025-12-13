export default function EditClanModal({ isOpen, onClose, onSave, clans, currentClan, onClanChange }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Change Clan</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Select Clan</label>
                        <select
                            className="input-modern w-full"
                            value={currentClan}
                            onChange={(e) => onClanChange(e.target.value)}
                        >
                            <option value="">Select a clan...</option>
                            {clans.map(clan => (
                                <option key={clan._id} value={clan.name}>{clan.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="btn-primary"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
