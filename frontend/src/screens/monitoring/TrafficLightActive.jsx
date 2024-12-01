import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config'; 
const TrafficLightActive = () => {
  const [trafficLights, setTrafficLights] = useState([]);
  const [north, setNorth] = useState(null);
  const [south, setSouth] = useState(null);
  const [east, setEast] = useState(null);
  const [west, setWest] = useState(null);
  const apiUrl = config.API_URL;

  useEffect(() => {
    // Fetch traffic light settings from the Flask API
    axios
      .get(`${apiUrl}/pyduino/get_trafficLight`) // Adjust the URL based on your API configuration
      .then((response) => {
        const trafficLightsData = response.data;
        setTrafficLights(trafficLightsData);

        // Assign traffic lights to directions and send green timers
        assignTrafficLightsToDirections(trafficLightsData);
      })
      .catch((error) => {
        console.error('Error fetching traffic light settings:', error);
      });
  }, []);

  const assignTrafficLightsToDirections = (lights) => { 
    const today = new Date().toLocaleString('en-US', { weekday: 'long' }); // Get current day name
    const currentTime = new Date(); // Current date and time
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
  
    const lightsToSend = [];
  
    lights.forEach((light) => {
      if (light.traffic_mode !== 'Static' || light.day !== today) return;
  
      // Parse traffic light timer range
      const [timerRange, greenTimerValue] = light.traffic_light_timer.split(' : ');
      
      // Split the timer range into start and end times
      const [startTime, endTime] = timerRange.split(' - ');
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      // Check if the current time is within the range
      const isWithinTimeRange =
        (currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) &&
        (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute));
  
      if (isWithinTimeRange) {
        // The green timer is after the ":"
        const greenTimer = parseInt(greenTimerValue?.trim(), 10);
  
        if (isNaN(greenTimer)) {
          console.error('Invalid green timer value:', greenTimerValue);
          return; // Skip invalid values
        }
  
        // Assign light to its respective direction
        switch (light.traffic_light_name) {
          case 'North':
            setNorth(light);
            break;
          case 'South':
            setSouth(light);
            break;
          case 'East':
            setEast(light);
            break;
          case 'West':
            setWest(light);
            break;
          default:
            console.warn(`Unrecognized traffic light name: ${light.traffic_light_name}`);
        }
  
        // Collect the light data to send to the backend (without start_time, end_time, current_time)
        lightsToSend.push({
          traffic_light_name: light.traffic_light_name,
          intersection_id: light.intersection_id,
          traffic_mode: light.traffic_mode,
          timer: greenTimer,
          end_time: endTime,
        });
      }
    });
  
    // Send the collected traffic light data to the backend
    sendGreenTimers(lightsToSend);
  };

  const sendGreenTimers = (lightsToSend) => {
    if (lightsToSend.length === 0) return;
  
    const currentTime = new Date(); // Get the current time
  
    // Check if the current time is within the range
    const isWithinTimeRange = lightsToSend.some((light) => {
      if (!light.end_time) {
        console.warn(`Missing 'end_time' for light: ${light.traffic_light_name}`);
        return false;
      }
  
      const [endHour, endMinute] = light.end_time.split(':').map(Number); // Parse the end time
      const endTime = new Date();
      endTime.setHours(endHour, endMinute, 0, 0); // Set the end time to the parsed endHour and endMinute
  
      // Return true if the current time is before the end time
      return currentTime < endTime;
    });
  
    if (isWithinTimeRange) {
      // Send the data to the backend
      axios
        .post(`${apiUrl}/pyduino/set-green-timer`, { lights: lightsToSend }) // Send array of lights data
        .then((response) => {
          console.log('Green timers sent successfully:', response.data);
  
          // Send again after success
          setTimeout(() => sendGreenTimers(lightsToSend), 5000); // Retry after a delay (e.g., 5 seconds)
        })
        .catch((error) => {
          console.error('Error sending green timers:', error);
        });
    }
  };  
  

  // return (
  //   <div>
  //     <h2>Traffic Light Status</h2>
  //     <div>
  //       <h3>North</h3>
  //       {north ? (
  //         <p>
  //           Intersection {north.intersection_id} | Timer: {north.traffic_light_timer} | Mode: {north.traffic_mode}
  //         </p>
  //       ) : (
  //         <p>No active light for North.</p>
  //       )}
  //     </div>
  //     <div>
  //       <h3>South</h3>
  //       {south ? (
  //         <p>
  //           Intersection {south.intersection_id} | Timer: {south.traffic_light_timer} | Mode: {south.traffic_mode}
  //         </p>
  //       ) : (
  //         <p>No active light for South.</p>
  //       )}
  //     </div>
  //     <div>
  //       <h3>East</h3>
  //       {east ? (
  //         <p>
  //           Intersection {east.intersection_id} | Timer: {east.traffic_light_timer} | Mode: {east.traffic_mode}
  //         </p>
  //       ) : (
  //         <p>No active light for East.</p>
  //       )}
  //     </div>
  //     <div>
  //       <h3>West</h3>
  //       {west ? (
  //         <p>
  //           Intersection {west.intersection_id} | Timer: {west.traffic_light_timer} | Mode: {west.traffic_mode}
  //         </p>
  //       ) : (
  //         <p>No active light for West.</p>
  //       )}
  //     </div>
  //   </div>
  // );
};

export default TrafficLightActive;
