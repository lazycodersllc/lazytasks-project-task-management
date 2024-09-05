
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {getSettings, Lazytask_updateSetting} from "../../../services/SettingService";


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


const initialState = {
    settings: [],
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

    },
})
export const {
    updateTaskLists
} = settingSlice.actions
export default settingSlice.reducer
