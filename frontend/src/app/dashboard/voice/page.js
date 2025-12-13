'use client'

import { useApiAuth } from '@/hooks/useApiAuth'
import VoiceConfig from '@/components/voice/VoiceConfig'

export default function VoiceChannelsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Voice Channels</h1>
                    <p className="text-zinc-400 mt-1">Configure automated voice channel settings.</p>
                </div>
            </div>

            <VoiceConfig />
        </div>
    )
}
