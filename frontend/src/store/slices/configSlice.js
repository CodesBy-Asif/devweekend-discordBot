import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchConfig = createAsyncThunk(
    'config/fetchConfig',
    async (authFetch, { rejectWithValue }) => {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`);
            if (!res.ok) throw new Error('Failed to fetch config');
            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateConfig = createAsyncThunk(
    'config/updateConfig',
    async ({ authFetch, formData }, { rejectWithValue }) => {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to update config');
            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const configSlice = createSlice({
    name: 'config',
    initialState: {
        config: null,
        loading: false,
        error: null,
        updateStatus: 'idle' // idle, loading, succeeded, failed
    },
    reducers: {
        resetUpdateStatus: (state) => {
            state.updateStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchConfig.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConfig.fulfilled, (state, action) => {
                state.loading = false;
                state.config = action.payload;
            })
            .addCase(fetchConfig.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateConfig.pending, (state) => {
                state.updateStatus = 'loading';
            })
            .addCase(updateConfig.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded';
                state.config = action.payload;
            })
            .addCase(updateConfig.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.error = action.payload;
            });
    }
});

export const { resetUpdateStatus } = configSlice.actions;
export const selectConfig = (state) => state.config.config;
export const selectConfigLoading = (state) => state.config.loading;
export const selectUpdateStatus = (state) => state.config.updateStatus;

export default configSlice.reducer;
