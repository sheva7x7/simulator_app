import React, {useState} from "react";
import { submitVehicle } from "../actions/map"
import "./settings.css";

const Settings = () => {
    const [carNo, setCarNo] = useState("");
    const [lat, setLat] = useState("");
    const [lon, setLon] = useState("");
    const [error, setError] = useState({})

    const carNoChange = (e) => {
        setCarNo(e.target.value)
    }

    const latChange = (e) => {
        setLat(e.target.value);
    }

    const lonChange = (e) => {
        setLon(e.target.value);
    }

    const submit = async () => {
        let isError = false
        let errorObj = {...error}
        if (carNo === "") {
            errorObj = {
                ...errorObj,
                carNo: {
                    message: "Vehicle number cannot be empty"
                }
            }
            isError = true;
        }
        if (lat === "" || isNaN(lat)) {
            errorObj = {
                ...errorObj,
                lat: {
                    message: "Latitude must be numeric"
                }
            }
            isError = true;
        }
        if (lon === "" || isNaN(lon)) {
            errorObj = {
                ...errorObj,
                lon: {
                    message: "Longitude must be numeric"
                }
            }
            isError = true;
        }
        if (isError) {
            setError(errorObj);
        } else {
            const payload = {
                car_no: carNo,
                LatLon: {
                    lat: +lat,
                    lon: +lon
                }
            };
            const isSubmitted = await submitVehicle(payload);
            if (isSubmitted) {
                setCarNo("");
                setLat("");
                setLon("");
                setError({});
            }
        }
    }

    return (
        <div className="settings_wrapper">
            <div>
                Update vehicle position
            </div>
            <div className="input_wrapper">
                <div className="input_field">
                    <label >Enter Vehicle Number</label>
                    <input type="text" value={carNo} name="v_no" onChange={carNoChange}/>
                    {
                        error.carNo && <div className="error">{error.carNo.message}</div>
                    }
                </div>
                <div className="input_field">
                    <label >Enter Latitude</label>
                    <input type="text" value={lat} name="lat" onChange={latChange}/>
                    {
                        error.lat && <div clssName="error">{error.lat.message}</div>
                    }
                </div>
                <div className="input_field">
                    <label >Enter Longitude</label>
                    <input type="text" value={lon} name="lon" onChange={lonChange}/>
                    {
                        error.lon && <div className="error">{error.lon.message}</div>
                    }
                </div>
            </div>
            <div className="button_wrapper">
                <button onClick={submit}>Submit</button>
            </div>
        </div>
    )
}

export default Settings