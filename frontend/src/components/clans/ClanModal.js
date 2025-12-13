import { useState, useEffect } from 'react';

export default function ClanModal({ isOpen, onClose, onSave, clan, roles, onCreateRole }) {
    const [formData, setFormData] = useState({
        name: '',
        roleId: '',
        enabled: true
    });

    useEffect(() => {
        if (clan) {
            setFormData({
                name: clan.name,
                roleId: clan.roleId,
                enabled: clan.enabled !== false
            });
        } else {
            setFormData({
                name: '',
                roleId: '',
                enabled: true
            });
        }
    }, [clan, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">
                    {clan ? 'Edit Clan' : 'Create New Clan'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Clan Name</label>
                        <input
                            type="text"
                            required
                            className="input-modern w-full"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Crimson Guard"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Discord Role</label>
                        <div className="flex gap-2">
                            <select
                                className="input-modern w-full"
                                value={formData.roleId}
                                onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                                required
                            >
                                <option value="">Select a role...</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={onCreateRole}
                                className="px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
                                title="Create new role on Discord"
                            >
                                +
                            </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            This role will be assigned to members of this clan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-white/5">
                        <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.enabled ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                            onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm text-zinc-300 select-none cursor-pointer" onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}>
                            Enable this clan
                        </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            {clan ? 'Save Changes' : 'Create Clan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
