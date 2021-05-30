import axios from 'axios';

export const getBoundary = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_HOST}/boundary`);
            const fence = response.data.fence;
            console.log(fence)
            dispatch({
                type: "UPDATE_FENCE",
                payload: fence
            })
        }
        catch (err) {
            console.log("error", err)
        }
    }
}

export const getVehiclesInBoundary = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_HOST}/vehicles/bound`);
            const vehicleObj = {}
            const vehicles = response.data
            vehicles.forEach((vehicle) => {
                vehicleObj[vehicle.car_no] = vehicle
            }); 
            dispatch({
                type: "REFRESH_VEHICLES",
                payload: vehicleObj
            })
        }
        catch (err) {
            console.log("error", err)
        }
    }
}

export const updateBoundary = (polygonPayload) => {
    return async (dispatch) => {
        try {
            const boundaryPayload = {
                fence: polygonPayload
            }
            const response = await axios.post(`${process.env.REACT_APP_API_HOST}/boundary`, boundaryPayload);
            console.log(response)
            const fence = response.data.fence;
            console.log(fence)
            dispatch({
                type: "UPDATE_FENCE",
                payload: fence
            })
        }
        catch (err) {
            console.log("error", err)
        }
    }
}

export const submitVehicle = async (payload) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_HOST}/vehicle`, payload);
        console.log(response.data)
        if (response.data.car_no === payload.car_no) {
            return true;
        }
        return false;
    }
    catch (err) {
        console.log("error", err)
        return false;
    }
}

