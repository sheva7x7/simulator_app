import React, {useState, useEffect} from "react"
import GoogleMap from "google-map-react"
import {useDispatch, useSelector} from "react-redux"
import mqtt from "mqtt"
import { isEmpty } from "lodash"
import { getFenceSelector, getVehiclesSelector } from "../reducer/selectors"
import {getBoundary, getVehiclesInBoundary, updateBoundary} from "../actions/map"


const Map = (props) => {
    const {
        center,
        zoom
    } = props

    const [gmap, setGmap] = useState()
    const [gmaps, setGmaps] = useState()
    const [mqttClient, setMqttClient] = useState()
    const [fencePolygon, setFencePolygon] = useState()
    const [drawnPolygon, setDrawnPolygon] = useState()
    const [drawingManager, setDrawingManager] = useState()
    const [vehicleMarkers, setVehicleMarkers] = useState({})

    const dispatch = useDispatch()
    const fence = useSelector(getFenceSelector)
    const vehicles = useSelector(getVehiclesSelector)

    useEffect(() => {
        dispatch(getBoundary())
        dispatch(getVehiclesInBoundary())
        mqttConnect()
    }, [dispatch])

    useEffect(() => {
        if (gmap && gmaps) {
            createDrawingManager()
        }
        if (fence.coordinates && gmap && gmaps) {
            drawFence(fence)            
            dispatch(getVehiclesInBoundary())
        }
    }, [gmap, gmaps, fence])

    useEffect(() => {
        if (mqttClient && gmaps && gmap) {
            mqttClient.removeAllListeners("message")
            mqttClient.on('connect', () => {
                console.log("connecting")
            })
            mqttClient.on('error', (err) => {
                console.error('Connection error: ', err)
                mqttClient.end()
            })
            mqttClient.on('reconnect', () => {
                console.log("disconnecting")
            })
            mqttClient.on('message', (topic, message) => {
                if (topic === "car_in_boundary") {
                    const paylaod = JSON.parse(message)
                    addMarker(paylaod)
                }
                if (topic === "car_outside_boundary") {
                    const paylaod = JSON.parse(message)
                    removeMarker(paylaod)
                }
            })
            mqttSub("car_in_boundary")
            mqttSub("car_outside_boundary")
        }
    }, [mqttClient, vehicleMarkers, gmaps, gmap])

    useEffect(() => {
        if (fencePolygon) {
            createDrawingManager()
        }
    }, [fencePolygon])

    useEffect(() => {
        if (!isEmpty(vehicles) && gmap && gmaps) {
            resetVehicleMarkers()
        }
    }, [vehicles, gmap, gmaps])

    const handleApiLoaded = (map, maps) => {
        setGmap(map)
        setGmaps(maps)
    }

    const mqttConnect = () => {
        setMqttClient(mqtt.connect(process.env.REACT_APP_MQTT_HOST))
    }

    const mqttSub = (topic) => {
        if (mqttClient) {
            mqttClient.subscribe(topic, (error) => {
                if (error) {
                    console.log('Subscribe to topics error', error)
                    return
                }
                console.log("Subscribe to topics")
            })
        }
    }

    const resetVehicleMarkers = () => {
        if (vehicleMarkers && !isEmpty(vehicleMarkers)) {
            removeAllMarkers()
        }
        const markers = {}
        for (const key in vehicles) {
            if (vehicles.hasOwnProperty(key)) {
                const vehicle = vehicles[key]
                const marker = setMarker(vehicle)
                markers[vehicle.car_no] = marker
            }
        }
        setVehicleMarkers(markers)
    }

    const removeAllMarkers = () => {
        for (const key in vehicleMarkers) {
            if (vehicleMarkers.hasOwnProperty(key)) {
                const marker = vehicleMarkers[key]
                marker.setMap(null)
            }
        }
        setVehicleMarkers({})
    }

    const addMarker = (vehicle) => {
        console.log(vehicleMarkers)
        const car_no = vehicle.car_no
        if (vehicleMarkers[car_no]) {
            const marker = vehicleMarkers[car_no]
            const latlng = {
                lat: vehicle.latlon.lat,
                lng: vehicle.latlon.lon
            }
            marker.setPosition(latlng)
        } else {
            const markers = {...vehicleMarkers}
            const marker = setMarker(vehicle)
            markers[vehicle.car_no] = marker
            setVehicleMarkers({...markers})
        }
    }

    const removeMarker = (vehicle) => {
        const car_no = vehicle.car_no
        if (vehicleMarkers[car_no]) {
            const markers = {...vehicleMarkers}
            markers[car_no].setMap(null)
            delete markers[car_no]
        } 
    }

    const setMarker = (vehicle) => {
        const latlng = {
            lat: vehicle.latlon.lat,
            lng: vehicle.latlon.lon
        }
        const marker = new gmaps.Marker({
            position: latlng,
            icon: "http://maps.google.com/mapfiles/kml/pal4/icon62.png",
            title: `Car Number: ${vehicle.car_no}, lat: ${vehicle.latlon.lat}, lon: ${vehicle.latlon.lon}`,
            map: gmap
        })
        console.log(marker)
        return marker
    }

    const drawFence = (fence) => {
        const coords = fence.coordinates[0].map((e) => (
            {
                lat: e[0],
                lng: e[1]
            }
        ))
        const polygon = new gmaps.Polygon({
            paths: coords,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35
        })
        if (drawnPolygon) {
            drawnPolygon.setMap(null)
            setDrawnPolygon(null)
        }
        polygon.setMap(gmap)
        setFencePolygon(polygon)
    }

    const createDrawingManager = () => {
        if (!drawingManager) {
            const dm = new gmaps.drawing.DrawingManager({
                drawingMode: gmaps.drawing.OverlayType.POLYGON,
                drawingControl: true,
                drawingControlOptions: {
                    position: gmaps.ControlPosition.TOP_CENTER,
                    drawingModes: [
                        gmaps.drawing.OverlayType.POLYGON
                    ],
                },
                markerOptions: {
                    icon: "http://maps.google.com/mapfiles/kml/pal4/icon62.png",
                },
                polygonOptions: {
                    fillColor: "red",
                    fillOpacity: 1,
                    strokeWeight: 5,
                    clickable: false,
                    editable: true,
                    zIndex: 100,
                },
            })

            gmaps.event.addListener(dm, "polygoncomplete", resetFencePolygon)
            dm.setMap(gmap)
            setDrawingManager(dm)
        } else {
            gmaps.event.clearListeners(drawingManager, "polygoncomplete")
            gmaps.event.addListener(drawingManager, "polygoncomplete", resetFencePolygon)
        }
    }

    const resetFencePolygon = (polygon) => {
        if (fencePolygon) {
            fencePolygon.setMap(null)
        }
        setDrawnPolygon(polygon)
        const polygonPayload = {
            type: "polygon",
            coordinates: [getCoordinates(polygon)]
        }
        dispatch(updateBoundary(polygonPayload))
    }

    const getCoordinates = (polygon) => {
        const polygonBounds = polygon.getPath()
        const bounds = []
        for (let i = 0; i < polygonBounds.length; i++) {
            bounds.push(getPoint(polygonBounds, i))
        } 
        bounds.push(getPoint(polygonBounds, 0))
        return bounds
    }

    const getPoint = (bounds, index) => [
        bounds.getAt(index).lat(),
        bounds.getAt(index).lng()
    ]

    return (
        <GoogleMap
            bootstrapURLKeys={{ key: "AIzaSyAlpWB_V_UhTQslLTHQYWLfRSKyyzOpyB0", libraries: ['drawing'].join(',') }}
            defaultCenter={center}
            defaultZoom={zoom}
            yesIWantToUseGoogleMapApiInternals={true}
            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
        >
           
        </GoogleMap>
    )
}

export default Map
