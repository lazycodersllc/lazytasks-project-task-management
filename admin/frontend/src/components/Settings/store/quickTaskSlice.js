
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    addQuickTask,
    addTask,
    assignTagToTask, getQuickTaskListsByUser,
    getTaskListsByUser, removeTagFromTask, updateTask
} from "../../../services/TaskService";


export const fetchQuickTasksByUser = createAsyncThunk(
    'quickTask/fetchQuickTasksByUser',
    async ({ id, data }) => {
        return getQuickTaskListsByUser(id, data)
    }
)

export const createQuickTask = createAsyncThunk(
    'quickTask/createQuickTask',
    async (data) => {
    return addQuickTask(data)
})


const initialState = {
    tasks: [],
    isLoading: false,
    isError: false,
    error: '',
    success: null,
}


const quickTaskSlice = createSlice({
    name: 'quickTask',
    initialState,
    reducers: {
        updateTaskLists: (state, action) => {
            state.tasks = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuickTasksByUser.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(fetchQuickTasksByUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.tasks = action.payload.data
            })
            .addCase(fetchQuickTasksByUser.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(createQuickTask.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(createQuickTask.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                if(action.payload.status === 200){
                    state.tasks= [action.payload.data, ...state.tasks]
                }
                state.success = `Task Created Successfully`
            })
            .addCase(createQuickTask.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })

    },
})
export const {
    updateTaskLists
} = quickTaskSlice.actions
export default quickTaskSlice.reducer
