export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-zinc-400 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white transition-colors ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
