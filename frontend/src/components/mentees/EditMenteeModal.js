export default function EditMenteeModal({ isOpen, onClose, onSave, clans, mentee }) {
    if (!isOpen || !mentee) return null;

    const [formData, setFormData] = useState({
        name: mentee.name || '',
        email: mentee.email || '',
        assignedClan: mentee.assignedClan || ''
    });

    useEffect(() => {
        if (mentee) {
            setFormData({
                name: mentee.name || '',
                email: mentee.email || '',
                assignedClan: mentee.assignedClan || ''
            });
        }
    }, [mentee]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Edit Mentee</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="input-modern w-full"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="input-modern w-full"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Assigned Clan</label>
                        <select
                            className="input-modern w-full"
                            value={formData.assignedClan}
                            onChange={(e) => setFormData({ ...formData, assignedClan: e.target.value })}
                        >
                            <option value="">Select a clan...</option>
                            {clans.map(clan => (
                                <option key={clan._id} value={clan.name}>{clan.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
