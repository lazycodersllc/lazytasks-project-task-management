import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {apiSignUp, getAllMembers, getUser, updateUser} from "../../services/AuthService";

export const fetchAllMembers = createAsyncThunk(
    'auth/fetchAllMember',
    async (data) => {
    return getAllMembers(data);
})
export const createUser = createAsyncThunk('auth/createUser', async (data) => {
    return apiSignUp(data);
})

//Edit User Thunk
export const editUser = createAsyncThunk(
    'auth/editUser',
    async ({ id, data }) => {
        return updateUser(id, data)
    }
)

export const fetchUser = createAsyncThunk('auth/fetchUser', async (id) => {
    return getUser(id);
})
export const initialState = {
    avatar: '',
    user_id: '',
    username: '',
    name: '',
    email: '',
    authority: [],
    roles: [],
    llc_roles: [],
    llc_permissions: [],
    allMembers: [],
    user : {},
}

export const userSlice = createSlice({
    name: 'auth/user',
    initialState,
    reducers: {
        setUser: (_, action) => action.payload,
        userLoggedOut: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(createUser.fulfilled, (state, action) => {
                return action.payload.data
            })
            .addCase(createUser.rejected, (state, action) => {
                return action.payload
            })
            .addCase(fetchAllMembers.fulfilled, (state, action) => {
                state.allMembers = action.payload.data
            })
            .addCase(fetchAllMembers.rejected, (state, action) => {
                return action.payload
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.user = action.payload.data
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(editUser.pending, (state) => {
                state.isError = false
                state.isLoading = true
            })
            .addCase(editUser.fulfilled, (state, action) => {
                if(state.allMembers && state.allMembers.length > 0){
                    const indexToUpdate = state.allMembers && state.allMembers.length > 0 && state.allMembers.findIndex(
                        (user) => parseInt(user.id) === parseInt(action.payload.data.id)
                    )
                    state.allMembers[indexToUpdate] = action.payload.data
                }
            })
            .addCase(editUser.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })

    }
})

export const {
    setUser,
    userLoggedOut } = userSlice.actions

export default userSlice.reducer
