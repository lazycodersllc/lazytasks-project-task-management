
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
    getSettings,
    Lazytask_getConfig,
    Lazytask_updateConfig,
    Lazytask_updateSetting
} from "../../../services/SettingService";


export const fetchSettings = createAsyncThunk(
    'setting/fetchSettings',
    async () => {
        return getSettings()
    }
)

export const editSetting = createAsyncThunk(
    'setting/editSetting',
    async ({data}) => {
    return Lazytask_updateSetting(data)
})

export const fatchLazytasksConfig = createAsyncThunk(
    'setting/fatchLazytasksConfig',
    async () => {
    return Lazytask_getConfig()
})

export const editLazytasksConfig = createAsyncThunk(
    'setting/editLazytasksConfig',
    async ({data}) => {
    return Lazytask_updateConfig( data )
})


const initialState = {
    settings: [],
    lazytasksConfig:{},
    isLoading: false,
    isError: false,
    error: '',
    success: null,
}


const settingSlice = createSlice({
    name: 'setting',
    initialState,
    reducers: {
        updateLazytaskSettings: (state, action) => {
            state.settings = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.settings = action.payload.data
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(editSetting.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(editSetting.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                console.log(action.payload)
                if(action.payload.status === 200){
                    state.settings= action.payload.data
                }
                state.success = `Setting Update Successfully`
            })
            .addCase(editSetting.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(fatchLazytasksConfig.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(fatchLazytasksConfig.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.lazytasksConfig = action.payload.data
            })
            .addCase(fatchLazytasksConfig.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(editLazytasksConfig.pending, (state) => {
                // state.isLoading = true
                state.isError = false
            })
            .addCase(editLazytasksConfig.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.lazytasksConfig = action.payload.data
                state.success = `Setting Update Successfully`
            })
            .addCase(editLazytasksConfig.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })

    },
})
export const {
    updateTaskLists
} = settingSlice.actions
export default settingSlice.reducer
