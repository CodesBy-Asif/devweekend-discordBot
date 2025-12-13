import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch channels
// Async thunk to fetch channels
export const fetchChannels = createAsyncThunk(
    'discord/fetchChannels',
    async (authFetch, { rejectWithValue }) => {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discord/channels`);
            if (!res.ok) throw new Error('Failed to fetch channels');
            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    },
    {
        condition: (_, { getState }) => {
            const { discord } = getState();
            if (discord.loading.channels || discord.channels.length > 0) return false;
        }
    }
);

// Async thunk to fetch roles
export const fetchRoles = createAsyncThunk(
    'discord/fetchRoles',
    async (authFetch, { rejectWithValue }) => {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discord/roles`);
            if (!res.ok) throw new Error('Failed to fetch roles');
            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    },
    {
        condition: (_, { getState }) => {
            const { discord } = getState();
            if (discord.loading.roles || discord.roles.length > 0) return false;
        }
    }
);

// Async thunk to fetch guild info
export const fetchGuildInfo = createAsyncThunk(
    'discord/fetchGuildInfo',
    async (authFetch, { rejectWithValue }) => {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discord/guild`);
            if (!res.ok) throw new Error('Failed to fetch guild info');
            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    },
    {
        condition: (_, { getState }) => {
            const { discord } = getState();
            if (discord.loading.guild || discord.guildInfo) return false;
        }
    }
);

const discordSlice = createSlice({
    name: 'discord',
    initialState: {
        channels: [],
        roles: [],
        guildInfo: null,
        loading: {
            channels: false,
            roles: false,
            guild: false
        },
        error: {
            channels: null,
            roles: null,
            guild: null
        }
    },
    reducers: {},
    extraReducers: (builder) => {
        // Channels
        builder
            .addCase(fetchChannels.pending, (state) => {
                state.loading.channels = true;
                state.error.channels = null;
            })
            .addCase(fetchChannels.fulfilled, (state, action) => {
                state.loading.channels = false;
                state.channels = action.payload;
            })
            .addCase(fetchChannels.rejected, (state, action) => {
                state.loading.channels = false;
                state.error.channels = action.payload;
            });

        // Roles
        builder
            .addCase(fetchRoles.pending, (state) => {
                state.loading.roles = true;
                state.error.roles = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading.roles = false;
                state.roles = action.payload;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading.roles = false;
                state.error.roles = action.payload;
            });

        // Guild Info
        builder
            .addCase(fetchGuildInfo.pending, (state) => {
                state.loading.guild = true;
                state.error.guild = null;
            })
            .addCase(fetchGuildInfo.fulfilled, (state, action) => {
                state.loading.guild = false;
                state.guildInfo = action.payload;
            })
            .addCase(fetchGuildInfo.rejected, (state, action) => {
                state.loading.guild = false;
                state.error.guild = action.payload;
            });
    }
});

// Selectors
export const selectAllChannels = (state) => state.discord.channels;
export const selectTextChannels = (state) => state.discord.channels.filter(c => c.type === 0); // 0 is GUILD_TEXT (simplified by backend?) 
// Wait, backend returns simplified objects but type filtering was done in backend? 
// Backend /channels endpoint returns ONLY text channels (type 0) in the current implementation!
// I need to update backend to return ALL channels if I want to filter them here.
// Or create separate endpoints.
// The user wants Voice Channels too.
// Backend `discord.js` line 59: `.filter(channel => channel.type === 0)`
// I MUST FIX BACKEND FIRST to return all channels!

export const selectRoles = (state) => state.discord.roles;
export const selectGuildInfo = (state) => state.discord.guildInfo;
export const selectDiscordLoading = (state) => state.discord.loading;

export default discordSlice.reducer;
