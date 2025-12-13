'use client'

import { useState, useEffect } from 'react'
import { useApiAuth } from '@/hooks/useApiAuth'

export default function EmailTemplatePanel({ config, onSave }) {
    const { authFetch } = useApiAuth()
    const [saving, setSaving] = useState(false)
    const [emailConfig, setEmailConfig] = useState({
        emailFromName: 'DW AI',
        emailSubject: 'Your Verification Code: {{code}}',
        emailTemplate: getDefaultTemplate()
    })

    useEffect(() => {
        if (config) {
            setEmailConfig({
                emailFromName: config.emailFromName || 'DW AI',
                emailSubject: config.emailSubject || 'Your Verification Code: {{code}}',
                emailTemplate: config.emailTemplate || getDefaultTemplate()
            })
        }
    }, [config])

    function getDefaultTemplate() {
        return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #5865F2;">Verification Code</h2>
    <p>You requested to join <strong>{{clan}}</strong>.</p>
    <p>Your verification code is:</p>
    <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px;">
        {{code}}
    </div>
    <p>This code expires in <strong>10 minutes</strong>.</p>
    <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
</div>`
    }

    async function handleSave() {
        setSaving(true)
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailConfig)
            })

            if (res.ok) {
                onSave?.()
            }
        } catch (error) {
            console.error('Failed to save email config:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-pink-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </span>
                        Email Template
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">Customize the OTP verification email</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">From Name</label>
                    <input
                        type="text"
                        value={emailConfig.emailFromName}
                        onChange={e => setEmailConfig({ ...emailConfig, emailFromName: e.target.value })}
                        className="input-modern w-full"
                        placeholder="DW AI"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Subject Line</label>
                    <input
                        type="text"
                        value={emailConfig.emailSubject}
                        onChange={e => setEmailConfig({ ...emailConfig, emailSubject: e.target.value })}
                        className="input-modern w-full"
                        placeholder="Your Verification Code: {{code}}"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Use {"{{code}}"} for OTP and {"{{clan}}"} for clan name</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Email Body (HTML)</label>
                    <textarea
                        value={emailConfig.emailTemplate}
                        onChange={e => setEmailConfig({ ...emailConfig, emailTemplate: e.target.value })}
                        className="input-modern w-full h-64 font-mono text-sm"
                        placeholder="<div>Your HTML template...</div>"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                        Available variables: {"{{code}}"}, {"{{clan}}"}, {"{{email}}"}
                    </p>
                </div>

                <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                    <p className="text-sm font-medium text-zinc-300 mb-2">Preview</p>
                    <div
                        className="bg-white rounded p-4 text-black text-sm"
                        dangerouslySetInnerHTML={{
                            __html: emailConfig.emailTemplate
                                .replace(/{{code}}/g, '123456')
                                .replace(/{{clan}}/g, 'Sample Clan')
                                .replace(/{{email}}/g, 'user@example.com')
                        }}
                    />
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button
                        onClick={() => setEmailConfig({ ...emailConfig, emailTemplate: getDefaultTemplate() })}
                        className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Email Settings'}
                    </button>
                </div>
            </div>
        </div>
    )
}
