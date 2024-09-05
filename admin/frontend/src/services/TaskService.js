import ApiService from "./ApiService";

export async function getTaskListsByProject(id, data) {
    try {
        const response = await ApiService.fetchData({
            url: `/tasks/by/project/${id}`,
            method: 'get',
            params: data
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function getTask(id) {
    try {
        const response = await ApiService.fetchData({
            url: `/tasks/show/${id}`,
            method: 'get',
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}
export async function removeTask(id, data) {
    try {
        const response = await ApiService.fetchData({
            url: `/tasks/delete/${id}`,
            method: 'put',
            data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function addTask( data ) {
    try {
        const response = await ApiService.fetchData({
            url: '/tasks/create',
            method: 'post',
            data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}


// Update Task

export const updateTask = async (id, data) => {

    const response = await ApiService.fetchData({
        url: `/tasks/edit/${id}`,
        method: 'put',
        data,
    })
    return response.data;
}

// Update Task Sort Order

export const updateTaskSortOrder = async (data) => {

    try {
        const response = await ApiService.fetchData({
            url: `/tasks/sort-order/update`,
            method: 'put',
            data,
        })
        return response.data;
    }catch (error) {
        return error.message;
    }
}

export async function addTaskSection( data ) {
    try {
        const response = await ApiService.fetchData({
            url: '/sections/create',
            method: 'post',
            data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function updateTaskSection( id, data ) {
    try {
        const response = await ApiService.fetchData({
            url: `/sections/edit/${id}`,
            method: 'put',
            data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function markIsCompleteTaskSection( id, data ) {
    try {
        const response = await ApiService.fetchData({
            url: `/sections/mark-is-complete/${id}`,
            method: 'put',
            data,
        })
        console.log(data)
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function removeTaskSection( id, data ) {
    try {
        const response = await ApiService.fetchData({
            url: `/sections/delete/${id}`,
            method: 'put',
            data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}


// Update Section Sort Order

export const updateSectionSortOrder = async (data) => {

    try {
        const response = await ApiService.fetchData({
            url: `/sections/sort-order/update`,
            method: 'put',
            data,
        })
        return response.data;
    }catch (error) {
        return error.message;
    }
}


export async function addProjectPriority( data ) {
    try {
        const response = await ApiService.fetchData({
            url: '/priorities/create',
            method: 'post',
            data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function addComments( data ) {
    try {
        const response = await ApiService.fetchData({
            url: '/comments/create',
            method: 'post',
            data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function removeComments( id, data ) {
    try {
        const response = await ApiService.fetchData({
            url: `/comments/delete/${id}`,
            method: 'put',
            data
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function addAttachments( data ) {
    try {
        const response = await ApiService.fetchData({
            url: '/attachments/create',
            method: 'post',
            headers: {
                "Accept": "application/json, text/plain, */*",
                'Content-type': 'multipart/form-data',
                'Access-Control-Allow-Origin': '*',
            },
            data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function removeAttachments( id, data ) {
    try {
        const response = await ApiService.fetchData({
            url: `/attachments/delete/${id}`,
            method: 'get',
            params: data
        })
        console.log(response.data)
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function assignTagToTask( data ) {
    try {
        const response = await ApiService.fetchData({
            url: '/tasks/tag/assign',
            method: 'post',
            data
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function removeTagFromTask( data ) {
    try {
        const response = await ApiService.fetchData({
            url: '/tasks/tag/remove',
            method: 'put',
            data
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}


export async function getTaskListsByUser(id, data) {
    try {
        const response = await ApiService.fetchData({
            url: `/tasks/by/user/${id}`,
            method: 'get',
            params: data
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function getQuickTaskListsByUser(id, data) {
    try {
        const response = await ApiService.fetchData({
            url: `/quick-tasks/by/user/${id}`,
            method: 'get',
            params: data
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export async function deleteQuickTaskAfterConvertTask(id) {
    try {
        const response = await ApiService.fetchData({
            url: `/quick-tasks/delete/${id}`,
            method: 'delete',
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}



export async function addQuickTask( data ) {
    try {
        const response = await ApiService.fetchData({
            url: '/quick-tasks/create',
            method: 'post',
            data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}


