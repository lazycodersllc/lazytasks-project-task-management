import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {getAllRoles} from "../../services/RoleService";

export const fetchAllRoles = createAsyncThunk('role/fetchAllRoles', async () => {
    return getAllRoles()
})
export const roleSlice = createSlice({
    name: 'auth/role',
    initialState: {
        roles: [],
        role:{},
        isLoading: false,
        isError: false,
        error: '',
        success: null,
    },
    reducers: {
        removeSuccessMessage: (state) => {
            state.success = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllRoles.pending, (state) => {
                state.roles = []
                state.isError = true
            })
            .addCase(fetchAllRoles.fulfilled, (state, action) => {
                state.roles = action.payload.data
                state.isError = false
                state.success = 'Successfully fetched roles.'
            })
            .addCase(fetchAllRoles.rejected, (state) => {
                state.isError = true
            })
    }
})

export const {
    removeSuccessMessage
}=roleSlice.actions

export default roleSlice.reducer
