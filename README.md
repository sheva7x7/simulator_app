# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## To run the app

```
npm install Or yarn install
npm start Or yarn start
```

### Features

1. Application onload - load google map api, load fence, start mqtt client, load vehicles within fence.
2. Settings - user to upload vehicle position (car_no, lat and lon)
3. Mqtt listener to get message of new position. There are 2 topics being subscribed
    - car_in_boundary: vehicle is within boundary, update marker or create new marker
    - car_outside_boundary: vehicle is outside boundary, remove marker if it's in the boundary originally.
4. Google Map Drawing Manager - After redrawing of the fence, all markers are removed and new set of vehicles are retrieved from the REST endpoint.