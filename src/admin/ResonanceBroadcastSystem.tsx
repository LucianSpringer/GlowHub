// ResonanceBroadcastSystem.tsx - Mass Notification Panel
import { useState } from 'react';
import { Bell, Send, Users, Clock } from 'lucide-react';
import {
    createNotification,
    filterAudience,
    dispatchNotifications,
    generateMockDropshippers,
    type DispatchStatus,
    type AudienceFilter
} from '../engines/PushNotificationDispatcher';

export const ResonanceBroadcastSystem = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [urgency, setUrgency] = useState<'NORMAL' | 'HIGH' | 'FLASH'>('NORMAL');
    const [countdown, setCountdown] = useState(0);
    const [filter, setFilter] = useState<AudienceFilter>({ activeOnly: true });
    const [status, setStatus] = useState<DispatchStatus | null>(null);
    const [sending, setSending] = useState(false);

    const allDropshippers = generateMockDropshippers(150);
    const targetAudience = filterAudience(allDropshippers, filter);

    const insertVariable = (variable: string) => {
        setBody(prev => prev + `{{${variable}}}`);
    };

    const handleSend = async () => {
        if (!title || !body) return;
        setSending(true);

        const notification = createNotification(title, body, urgency, countdown || undefined);

        await dispatchNotifications(notification, targetAudience, 30, (s) => {
            setStatus({ ...s });
        });

        setSending(false);
    };

    const progressPercent = status ? (status.sent / status.totalRecipients) * 100 : 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-xl text-white">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Resonance Broadcast</h3>
                        <p className="text-xs text-slate-500">Mass notification system</p>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
                {/* Left: Message Composer */}
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Flash Sale Alert!"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Message Body</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your message... Use {{variables}} for personalization"
                            rows={4}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => insertVariable('user_name')} className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-600 hover:bg-slate-200">
                                + user_name
                            </button>
                            <button onClick={() => insertVariable('user_tier')} className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-600 hover:bg-slate-200">
                                + user_tier
                            </button>
                        </div>
                    </div>

                    {/* Urgency Toggle */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Urgency Level</label>
                        <div className="flex gap-2">
                            {(['NORMAL', 'HIGH', 'FLASH'] as const).map(u => (
                                <button
                                    key={u}
                                    onClick={() => setUrgency(u)}
                                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${urgency === u
                                        ? u === 'FLASH' ? 'bg-red-500 text-white' : u === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>

                    {urgency === 'FLASH' && (
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-2">
                                <Clock size={14} /> Countdown Timer (seconds)
                            </label>
                            <input
                                type="number"
                                value={countdown}
                                onChange={(e) => setCountdown(parseInt(e.target.value) || 0)}
                                placeholder="e.g. 3600"
                                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
                            />
                        </div>
                    )}
                </div>

                {/* Right: Audience & Status */}
                <div className="space-y-4">
                    {/* Audience Filter */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                            <Users size={16} /> Target Audience
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={filter.activeOnly}
                                    onChange={(e) => setFilter({ ...filter, activeOnly: e.target.checked })}
                                    className="rounded"
                                />
                                Active dropshippers only
                            </label>

                            <div className="flex gap-2">
                                {(['SILVER', 'GOLD', 'PLATINUM'] as const).map(tier => (
                                    <label key={tier} className="flex items-center gap-1 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={filter.tiers?.includes(tier) || false}
                                            onChange={(e) => {
                                                const newTiers = filter.tiers ? [...filter.tiers] : [];
                                                if (e.target.checked) newTiers.push(tier);
                                                else newTiers.splice(newTiers.indexOf(tier), 1);
                                                setFilter({ ...filter, tiers: newTiers.length ? newTiers : undefined });
                                            }}
                                            className="rounded"
                                        />
                                        {tier}
                                    </label>
                                ))}
                            </div>

                            <div className="pt-2 border-t border-slate-200">
                                <label className="text-xs text-slate-500 block mb-1">Inactive for X days</label>
                                <input
                                    type="number"
                                    value={filter.inactiveDays || ''}
                                    onChange={(e) => setFilter({ ...filter, inactiveDays: parseInt(e.target.value) || undefined })}
                                    placeholder="e.g. 7"
                                    className="w-full border border-slate-200 rounded px-2 py-1 text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                            <div className="text-2xl font-mono font-bold text-orange-600">{targetAudience.length}</div>
                            <div className="text-[10px] text-slate-500 uppercase">Recipients</div>
                        </div>
                    </div>

                    {/* Dispatch Status */}
                    {status && (
                        <div className="bg-slate-50 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-slate-500">Dispatch Progress</span>
                                <span className={`text-xs font-bold ${status.status === 'COMPLETED' ? 'text-emerald-600' :
                                    status.status === 'FAILED' ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                    {status.status}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                                <div
                                    className="h-full bg-orange-500 rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-lg font-mono font-bold text-slate-700">{status.sent}</div>
                                    <div className="text-[9px] text-slate-500">Sent</div>
                                </div>
                                <div>
                                    <div className="text-lg font-mono font-bold text-emerald-600">{status.delivered}</div>
                                    <div className="text-[9px] text-slate-500">Delivered</div>
                                </div>
                                <div>
                                    <div className="text-lg font-mono font-bold text-red-500">{status.failed}</div>
                                    <div className="text-[9px] text-slate-500">Failed</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={sending || !title || !body}
                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${sending || !title || !body
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90'
                            }`}
                    >
                        {sending ? (
                            <>Sending...</>
                        ) : (
                            <>
                                <Send size={16} /> Broadcast to {targetAudience.length} Dropshippers
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
