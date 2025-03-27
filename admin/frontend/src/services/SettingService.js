import ApiService from "./ApiService";

// Get Users
export const getSettings = async () => {
    try {
        const response = await ApiService.fetchData({
            url: '/settings',
            method: 'get'
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

// Update setting

export const Lazytask_updateSetting = async (data) => {

    const response = await ApiService.fetchData({
        url: `/settings`,
        method: 'post',
        headers: {
            "Accept": "application/json, text/plain, */*",
            'Content-type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*',
        },
        data,
    })

    return response.data;
}

export const Lazytask_getConfig = async () => {

    const response = await ApiService.fetchData({
        url: `/settings/config`,
        method: 'get'
    })

    return response.data;
}

export const Lazytask_updateConfig = async (data) => {

    const response = await ApiService.fetchData({
        url: `/settings/config/update`,
        method: 'post',
        data
    })

    return response.data;
}



