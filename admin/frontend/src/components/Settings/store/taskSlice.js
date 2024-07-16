
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    addAttachments,
    addComments,
    addProjectPriority,
    addTask,
    addTaskSection, assignTagToTask, getTask,
    getTaskListsByProject, removeAttachments, removeTagFromTask,
    updateSectionSortOrder,
    updateTask,
    updateTaskSection, updateTaskSortOrder
} from "../../../services/TaskService";

export const fetchTasksByProject = createAsyncThunk(
    'tasks/fetchTasksByProject',
    async ({ id, data }) => {
        return getTaskListsByProject(id, data)
    }
)

export const createTask = createAsyncThunk('tasks/createTask', async (data) => {
    return addTask(data)
})

//Edit task Thunk
export const editTask = createAsyncThunk(
    'tasks/editTask',
    async ({ id, data }) => {
        return updateTask(id, data)
    }
)

export const editTaskSortOrder = createAsyncThunk(
    'tasks/editTaskSortOrder',
    async ({data}) => {
        return updateTaskSortOrder(data)
    })
export const createTaskSection = createAsyncThunk('tasks/createTaskSection', async (data) => {
    return addTaskSection(data)
})

export const createProjectPriority = createAsyncThunk('tasks/createProjectPriority', async (data) => {
    return addProjectPriority(data)
})

export const editTaskSection = createAsyncThunk(
    'tasks/updateTaskSection',
    async ({id, data}) => {
    return updateTaskSection(id, data)
})

export const editSectionSortOrder = createAsyncThunk(
    'tasks/editSectionSortOrder',
    async ({data}) => {
    return updateSectionSortOrder(data)
})

export const createComment = createAsyncThunk('tasks/createComment', async (data) => {
    return addComments(data)
})

export const createAttachment = createAsyncThunk('tasks/createAttachment', async ({data}) => {
    return addAttachments(data)
})

export const deleteAttachment = createAsyncThunk(
    'tasks/deleteAttachment',
    async ({ id, data}) => {
    return removeAttachments(id, data)
})

export const addTagToTask = createAsyncThunk('tasks/addTagToTask', async (data) => {
    return assignTagToTask(data)
})
export const deleteTagFromTask = createAsyncThunk('tasks/deleteTagFromTask', async (data) => {
    return removeTagFromTask(data)
})

export const fetchTask = createAsyncThunk(
    'tasks/fetchTask',
    async ({ id }) => {
        return getTask(id)
    }
)

const initialState = {
    tasks: [],
    task:{},
    projectInfo: {},
    taskListSections: {},
    addedListSections: {},
    columns: {},
    childColumns: {},
    ordered: [],
    boardMembers: [],
    projectPriorities: [],
    comment:{},
    attachments:[],
    attachment:{},
    taskTags:[],
    isLoading: false,
    isError: false,
    error: '',
    success: null,
}

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        initialTask: (state) => {
            state.task= {}
        },
        updateOrdered: (state, action) => {
            state.ordered = action.payload
        },
        updateColumns: (state, action) => {
            state.columns = action.payload
            // console.log(action.payload)
        },
        updateChildColumns: (state, action) => {
            state.childColumns = action.payload
            // console.log(action.payload)
        },
        updateProjectPriorities: (state, action) => {
            state.projectPriorities = action.payload
            // console.log(action.payload)
        },
        setEditableTask: (state, action) => {
            /*state.task = state.tasks.find(
                (task) => task.id === action.payload
            )*/

            Object.entries(state.columns).forEach(([key, tasks]) => {
                if (key === action.payload.section_slug) {
                    state.columns[key] = tasks.map(task =>
                        task.id === action.payload.id ? action.payload : task
                    );
                }
            });

        },
        updateTaskListSections: (state, action) => {
            state.taskListSections = action.payload
        },
        removeSuccessMessage: (state) => {
            state.success = null
        },
        removeProjectFromState: (state,action) => {
            state.task = action.payload
        },
        updateBoardMembers: (state, action) => {
            state.boardMembers = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasksByProject.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(fetchTasksByProject.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.tasks = action.payload.data
                state.projectInfo = action.payload.data && action.payload.data.projectInfo? action.payload.data.projectInfo:{}
                state.taskListSections = action.payload.data && action.payload.data.taskListSectionsName ? action.payload.data.taskListSectionsName : {}
                state.ordered = action.payload.data && action.payload.data.taskSections ? action.payload.data.taskSections : []
                state.columns = action.payload.data && action.payload.data.tasks ? action.payload.data.tasks : {}
                state.childColumns = action.payload.data && action.payload.data.childTasks ? action.payload.data.childTasks : {}
                state.boardMembers = action.payload.data && action.payload.data.projectInfo && action.payload.data.projectInfo.members ? action.payload.data.projectInfo.members:[]
                state.projectPriorities = action.payload.data && action.payload.data.projectPriorities && action.payload.data.projectPriorities.length > 0 ? action.payload.data.projectPriorities:[]
            })
            .addCase(fetchTasksByProject.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(fetchTask.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(fetchTask.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.task = action.payload.data
            })
            .addCase(fetchTask.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(createTask.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                // for task
                if(action.payload.data && action.payload.data.section_slug && action.payload.data.parent===null){
                    Object.entries(state.columns).findIndex(([key, value]) => {
                        if (key === action.payload.data.section_slug) {
                            state.columns[key].push(action.payload.data)
                        }
                    })
                }

                // for sub task
                if (action.payload.data && action.payload.data.section_slug && action.payload.data.parent && action.payload.data.parent.slug) {
                    let keyExist = Object.keys(state.childColumns).some(key => key === action.payload.data.parent.slug);

                    if (!keyExist) {
                        state.childColumns[action.payload.data.parent.slug] = [action.payload.data]
                    }else {
                        state.childColumns[action.payload.data.parent.slug].push(action.payload.data)
                    }
                }
                state.success = `Task Created Successfully`
            })
            .addCase(createTask.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(editTask.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(editTask.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
               /* Object.entries(state.columns).findIndex(([key, value]) => {
                   return [
                ...state.columns[key],
                    state.columns[key].find((task) => {
                        console.log(action.payload.data);
                        console.log(task)
                        console.log(task.id)

                    if (task.id === action.payload.data.id) {
                        console.log(action.payload.data)
                        return action.payload.data
                    }

                    })
                ]
                })*/

                if(action.payload.data && action.payload.data.section_slug && action.payload.data.parent===null){
                    Object.entries(state.columns).forEach(([key, tasks]) => {
                        if (key === action.payload.data.section_slug) {
                            state.columns[key] = tasks.map(task =>
                                task.id === action.payload.data.id ? action.payload.data : {...task}
                            );
                        }
                    });
                }

                // for sub task
                if (action.payload.data && action.payload.data.section_slug && action.payload.data.parent && action.payload.data.parent.slug) {
                    Object.entries(state.childColumns).forEach(([key, tasks]) => {
                        if (key === action.payload.data.parent.slug) {
                            state.childColumns[key] = tasks.map(task =>
                                task.id === action.payload.data.id ? action.payload.data : {...task}
                            );
                        }
                    });
                }

                state.success = `Task update successfully`
            })
            .addCase(editTask.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(editTaskSortOrder.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(editTaskSortOrder.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                // console.log(action.payload.data)
                /*Object.entries(state.columns).findIndex(([key, value]) => {
                    if (key === action.payload.data.section_slug) {
                        state.columns[key].push(action.payload.data)
                    }
                })*/
                state.success = `Task update successfully`
            })
            .addCase(editTaskSortOrder.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(createTaskSection.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(createTaskSection.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                const addedTaskListSection = action.payload.data && action.payload.data.taskListSectionsName ? action.payload.data.taskListSectionsName : {}
                const addedData = action.payload.data && action.payload.data.taskSections ? action.payload.data.taskSections : ''
                const addedColumn = action.payload.data && action.payload.data.tasks ? action.payload.data.tasks : {}
                state.ordered = [...state.ordered, addedData]
                state.taskListSections = {...state.taskListSections, ...addedTaskListSection}
                state.columns = {...state.columns, ...addedColumn}
                state.success = `${action.payload.data.name} Created Successfully`
            })
            .addCase(createTaskSection.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(editTaskSection.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(editTaskSection.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                const addedTaskListSection = action.payload.data && action.payload.data.taskListSectionsName ? action.payload.data.taskListSectionsName : {}
                const addedData = action.payload.data && action.payload.data.taskSections ? action.payload.data.taskSections : ''
                // state.ordered = [...state.ordered, addedData]
                // state.taskListSections = {...state.taskListSections, ...addedTaskListSection}
                state.success = `Task Section Updated Successfully`
            })
            .addCase(editTaskSection.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(editSectionSortOrder.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(editSectionSortOrder.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                // state.ordered = [...state.ordered, addedData]
                // state.taskListSections = {...state.taskListSections, ...addedTaskListSection}
                state.success = `Updated Successfully`
            })
            .addCase(editSectionSortOrder.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(createProjectPriority.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(createProjectPriority.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.projectPriorities = action.payload.data
                state.success = `Priority Created Successfully`
            })
            .addCase(createProjectPriority.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(createComment.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.comment = action.payload.data
                state.success = `Comment Created Successfully`
            })
            .addCase(createComment.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(createAttachment.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(createAttachment.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.attachments = action.payload.data
                /*Object.entries(state.columns).forEach(([key, tasks]) => {
                    if (action.payload.task && key === action.payload.task.section_slug) {
                        state.columns[key] = tasks.map(task =>
                            task.id === action.payload.task.id ? action.payload.task : {...task}
                        );
                    }
                });*/

                if(action.payload.task && action.payload.task.section_slug && action.payload.task.parent===null){
                    Object.entries(state.columns).forEach(([key, tasks]) => {
                        if (key === action.payload.task.section_slug) {
                            state.columns[key] = tasks.map(task =>
                                task.id === action.payload.task.id ? action.payload.task : {...task}
                            );
                        }
                    });
                }

                // for sub task
                if (action.payload.task && action.payload.task.section_slug && action.payload.task.parent && action.payload.task.parent.slug) {
                    Object.entries(state.childColumns).forEach(([key, tasks]) => {
                        if (key === action.payload.task.parent.slug) {
                            state.childColumns[key] = tasks.map(task =>
                                task.id === action.payload.task.id ? action.payload.task : {...task}
                            );
                        }
                    });
                }
                state.success = `Attachment Upload Successfully`
                console.log(action.payload.data)
            })
            .addCase(createAttachment.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(deleteAttachment.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(deleteAttachment.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.attachments = action.payload.data
                /*Object.entries(state.columns).forEach(([key, tasks]) => {
                    if (action.payload.task && key === action.payload.task.section_slug) {
                        state.columns[key] = tasks.map(task =>
                            task.id === action.payload.task.id ? action.payload.task : task
                        );
                    }
                });*/

                if(action.payload.task && action.payload.task.section_slug && action.payload.task.parent===null){
                    Object.entries(state.columns).forEach(([key, tasks]) => {
                        if (key === action.payload.task.section_slug) {
                            state.columns[key] = tasks.map(task =>
                                task.id === action.payload.task.id ? action.payload.task : {...task}
                            );
                        }
                    });
                }

                // for sub task
                if (action.payload.task && action.payload.task.section_slug && action.payload.task.parent && action.payload.task.parent.slug) {
                    Object.entries(state.childColumns).forEach(([key, tasks]) => {
                        if (key === action.payload.task.parent.slug) {
                            state.childColumns[key] = tasks.map(task =>
                                task.id === action.payload.task.id ? action.payload.task : {...task}
                            );
                        }
                    });
                }
                state.success = `Attachment Upload Successfully`
                console.log(action.payload.data)
            })
            .addCase(deleteAttachment.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(addTagToTask.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(addTagToTask.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false

                if(action.payload.task && action.payload.task.section_slug && action.payload.task.parent===null){
                    Object.entries(state.columns).forEach(([key, tasks]) => {
                        if (key === action.payload.task.section_slug) {
                            state.columns[key] = tasks.map(task =>
                                task.id === action.payload.task.id ? action.payload.task : {...task}
                            );
                        }
                    });
                }

                // for sub task
                if (action.payload.task && action.payload.task.section_slug && action.payload.task.parent && action.payload.task.parent.slug) {
                    Object.entries(state.childColumns).forEach(([key, tasks]) => {
                        if (key === action.payload.task.parent.slug) {
                            state.childColumns[key] = tasks.map(task =>
                                task.id === action.payload.task.id ? action.payload.task : {...task}
                            );
                        }
                    });
                }

                state.taskTags = action.payload.data
                state.success = `Attachment Upload Successfully`
            })
            .addCase(addTagToTask.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(deleteTagFromTask.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(deleteTagFromTask.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false

                // for task
                if(action.payload.task && action.payload.task.section_slug && action.payload.task.parent===null){
                    Object.entries(state.columns).forEach(([key, tasks]) => {
                        if (key === action.payload.task.section_slug) {
                            state.columns[key] = tasks.map(task =>
                                task.id === action.payload.task.id ? action.payload.task : {...task}
                            );
                        }
                    });
                }


                // for sub task
                if (action.payload.task && action.payload.task.section_slug && action.payload.task.parent && action.payload.task.parent.slug) {
                    Object.entries(state.childColumns).forEach(([key, tasks]) => {
                        if (key === action.payload.task.parent.slug) {
                            state.childColumns[key] = tasks.map(task =>
                                task.id === action.payload.task.id ? action.payload.task : {...task}
                            );
                        }
                    });
                }
                state.taskTags = action.payload.data
                state.success = `Attachment Upload Successfully`
            })
            .addCase(deleteTagFromTask.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })

    },
})
export const {
    updateOrdered,
    updateColumns,
    updateChildColumns,
    updateProjectPriorities,
    updateTaskListSections,
    setEditableTask,
    removeSuccessMessage,
    removeProjectFromState,
    updateBoardMembers,
    initialTask
} = taskSlice.actions
export default taskSlice.reducer
