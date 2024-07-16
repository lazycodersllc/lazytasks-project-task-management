
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    addAttachments,
    assignTagToTask,
    getTaskListsByUser, removeAttachments, removeTagFromTask, updateTask
} from "../../../services/TaskService";
import {createAttachment, deleteAttachment} from "./taskSlice";


export const fetchTasksByUser = createAsyncThunk(
    'myTasks/fetchTasksByUser',
    async ({ id, data }) => {
        return getTaskListsByUser(id, data)
    }
)


//Edit task Thunk
export const editMyTask = createAsyncThunk(
    'myTasks/editMyTask',
    async ({ id, data }) => {
        return updateTask(id, data)
    }
)

export const createMyTaskAttachment = createAsyncThunk(
    'myTasks/createMyTaskAttachment',
    async ({data}) => {
    return addAttachments(data)
})


export const deleteMyTaskAttachment = createAsyncThunk(
    'myTasks/deleteMyTaskAttachment',
    async ({ id, data}) => {
        return removeAttachments(id, data)
    })


export const addTagToMyTask = createAsyncThunk('myTasks/addTagToMyTask', async (data) => {
    return assignTagToTask(data)
})
export const deleteTagFromMyTask = createAsyncThunk('myTasks/deleteTagFromMyTask', async (data) => {
    return removeTagFromTask(data)
})


const initialState = {
    tasks: [],
    userTaskListSections: {},
    userTaskColumns: {},
    userTaskOrdered: [],
    userTaskChildColumns: {},
    taskTags:[],
    userProjects:[],
    taskStatus:[],
    isLoading: false,
    isError: false,
    error: '',
    success: null,
    taskListRefresh: false,
    loggedInUserId: null,
}


const taskSlice = createSlice({
    name: 'myTask',
    initialState,
    reducers: {
        updateOrdered: (state, action) => {
            state.userTaskOrdered = action.payload
        },
        updateColumns: (state, action) => {
            state.userTaskColumns = action.payload
            // console.log(action.payload)
        },
        updateIsLoading: (state, action) => {
            state.taskListRefresh = action.payload
        },
        setLoggedInUserId(state, action) {
            state.loggedInUserId = action.payload;
        },
        setEditableMyTask(state, action) {
            Object.entries(state.userTaskColumns).forEach(([key, tasks]) => {
                if (key === action.payload.my_task_section) {
                    state.userTaskColumns[key] = tasks.map(task =>{
                            if(parseInt(task.id) === parseInt(action.payload.id)){
                                return action.payload
                            }
                            return task
                        }
                    );
                }
            });
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasksByUser.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(fetchTasksByUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.tasks = action.payload.data
                state.userTaskOrdered = action.payload.data && action.payload.data.orders ? action.payload.data.orders : []
                state.userTaskColumns = action.payload.data && action.payload.data.tasks ? action.payload.data.tasks : {}
                state.userTaskListSections = action.payload.data && action.payload.data.taskSections ? action.payload.data.taskSections : {}
                state.userTaskChildColumns = action.payload.data && action.payload.data.childTasks ? action.payload.data.childTasks : {}
                state.userProjects = action.payload.data && action.payload.data.userProjects ? action.payload.data.userProjects : []
                state.taskStatus = action.payload.data && action.payload.data.taskStatus ? action.payload.data.taskStatus : []

            })
            .addCase(fetchTasksByUser.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(editMyTask.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(editMyTask.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false

                Object.entries(state.userTaskColumns).forEach(([key, tasks]) => {

                    if (key === action.payload.data.my_task_section && parseInt(state.loggedInUserId) === parseInt(action.payload.data.assignedTo_id)) {
                        state.userTaskColumns[key] = tasks.map(task => {
                            if (task.id === action.payload.data.id) {
                                return action.payload.data
                            }
                            return task
                        })
                        const newArray = tasks.filter((task) => {
                            return task.id === action.payload.data.id

                        })
                        if(newArray.length===0){
                            state.userTaskColumns[key].push(action.payload.data)
                        }
                    } else {
                        state.userTaskColumns[key] = tasks.filter(task => {
                            return task.id !== action.payload.data.id
                        })
                    }

                    /*if (key === action.payload.data.my_task_section && action.payload.data.parent && action.payload.data.parent.slug) {
                        state.userTaskChildColumns[action.payload.data.parent.slug] = tasks.map(task =>
                            task.id === action.payload.data.id ? action.payload.data : task
                        );
                    }*/
                });
                state.success = `Task update successfully`
            })
            .addCase(editMyTask.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(addTagToMyTask.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(addTagToMyTask.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                Object.entries(state.userTaskColumns).forEach(([key, tasks]) => {
                    if (action.payload.task && key === action.payload.task.my_task_section) {
                        state.userTaskColumns[key] = tasks.map(task =>{
                                if(parseInt(task.id) === parseInt(action.payload.task.id)){
                                    return action.payload.task
                                }
                                return task
                            }

                        );
                    }
                });
                state.taskTags = action.payload.data
                state.success = `Attachment Upload Successfully`
            })
            .addCase(addTagToMyTask.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(deleteTagFromMyTask.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(deleteTagFromMyTask.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                Object.entries(state.userTaskColumns).forEach(([key, tasks]) => {
                    if (action.payload.task && key === action.payload.task.my_task_section) {
                        state.userTaskColumns[key] = tasks.map(task =>{
                                if(parseInt(task.id) === parseInt(action.payload.task.id)){
                                    return action.payload.task
                                }
                                return task
                            }

                        );
                    }
                });
                state.taskTags = action.payload.data
                state.success = `Attachment Upload Successfully`
            })
            .addCase(deleteTagFromMyTask.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(createMyTaskAttachment.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(createMyTaskAttachment.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.attachments = action.payload.data
                Object.entries(state.userTaskColumns).forEach(([key, tasks]) => {
                    if (action.payload.task && key === action.payload.task.my_task_section) {
                        state.userTaskColumns[key] = tasks.map(task =>{
                                if(parseInt(task.id) === parseInt(action.payload.task.id)){
                                    return action.payload.task
                                }
                                return task
                            }

                        );
                    }
                });
                state.success = `Attachment Upload Successfully`
                console.log(action.payload.data)
            })
            .addCase(createMyTaskAttachment.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(deleteMyTaskAttachment.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(deleteMyTaskAttachment.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.attachments = action.payload.data
                Object.entries(state.userTaskColumns).forEach(([key, tasks]) => {
                    if (action.payload.task && key === action.payload.task.my_task_section) {
                        state.userTaskColumns[key] = tasks.map(task =>{
                                if(parseInt(task.id) === parseInt(action.payload.task.id)){
                                    return action.payload.task
                                }
                                return task
                            }

                        );
                    }
                });
                state.success = `Attachment Deleted Successfully`
                console.log(action.payload.data)
            })
            .addCase(deleteMyTaskAttachment.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })

    },
})
export const {
    updateOrdered,
    updateColumns,
    updateIsLoading,
    setLoggedInUserId,
    setEditableMyTask
} = taskSlice.actions
export default taskSlice.reducer
