import { createSelector } from "reselect";

export const getFence = (state) => state.fence;

export const getFenceSelector = createSelector(
    getFence, (data) => data
)

export const getVehicles = (state) => state.vehicles;

export const getVehiclesSelector = createSelector(
    getVehicles, (data) => data
)