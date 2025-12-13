import { configureStore } from '@reduxjs/toolkit';
import discordReducer from './slices/discordSlice';
import configReducer from './slices/configSlice';

export const store = configureStore({
    reducer: {
        discord: discordReducer,
        config: configReducer
    }
});
