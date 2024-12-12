// WeekPlanTable.jsx
import React from "react";

const WeekPlanTable = ({
  intersection = [],
  weekPlan,
  sortedDays,
  cameras = [],
  handleSelectedIntersection,
  handleSelectedWeekPlan,
  setSelected,
}) => {
  return (
    <>
      {intersection && intersection.length > 0 ? (
        weekPlan.map((road) => (
          <div className="weekPlanTable" key={road.week_plan_id}>
            <div className="d-flex align-items-center justify-content-between">
              <p>{road.intersection_name}</p>
              <div className="d-flex align-items-center justify-content-around">
                <h5
                  className="bi bi-plus-circle btn btn-outline-dark cursor-pointer"
                  data-bs-toggle="modal"
                  data-bs-target="#setWeekPlanBackdrop"
                  onClick={() => handleSelectedIntersection(road)}
                ></h5>
                <h5
                  className="bi bi-trash btn btn-outline-danger"
                  onClick={() => handleSelectedWeekPlan(road)}
                  data-bs-toggle="modal"
                  data-bs-target="#deleteBackdrop"
                ></h5>
              </div>
            </div>
            <div className="row ps-4">
              {sortedDays
                .filter(({ lights }) =>
                  lights.some(
                    (light) => light.intersection_id === road.intersection_id
                  )
                )
                .map(({ day, lights }) => (
                  <div
                    key={day}
                    className="col-5 m-1 rounded p-2"
                    style={{ backgroundColor: "#e0f7fa" }}
                  >
                    <h5>{day} </h5>
                    <div className="bg-white">
                      {/* Table for Static Traffic Lights */}
                      <h6>Static Traffic Lights</h6>
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th>Traffic Light</th>
                            <th>Timer</th>

                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lights
                            .filter(
                              (light) =>
                                light.intersection_id ===
                                  road.intersection_id &&
                                light.traffic_mode === "Static" // Filter by intersection_id and Static mode
                            )
                            .map((light) => (
                              <tr key={light.traffic_light_id}>
                                <td>
                                  {light.traffic_light_name ||
                                    light.traffic_light_name_two_way || (
                                      <i>No name</i>
                                    )}
                                </td>
                                <td>
                                  {light.traffic_light_timer ? (
                                    light.traffic_light_timer
                                      .split(";")
                                      .map((segment, index) => {
                                        const [timeRange, timer] =
                                          segment.split(" : "); // Split time range and timer
                                        return (
                                          <div key={index}>
                                            {/* Display the time range (StartTime - EndTime) */}
                                            {timeRange?.trim()}
                                            {timer ? (
                                              <span style={{ color: "red" }}>
                                                {" : " + timer.trim()}
                                              </span>
                                            ) : null}
                                          </div>
                                        );
                                      })
                                  ) : (
                                    <i>No Timer</i>
                                  )}
                                  <i
                                    className="bi bi-clock text-danger cursor-pointer"
                                    data-bs-toggle="modal"
                                    data-bs-target="#addTrafficLightTimer"
                                    onClick={() => setSelected(light)}
                                  ></i>
                                </td>

                                <td>
                                  <div>
                                    <i
                                      className="bi bi-pencil btn btn-outline-warning m-2"
                                      onClick={() => setSelected(light)}
                                      data-bs-toggle="modal"
                                      data-bs-target="#editBackdrop"
                                    ></i>
                                    <i
                                      className="bi bi-trash btn btn-outline-danger"
                                      onClick={() => setSelected(light)}
                                      data-bs-toggle="modal"
                                      data-bs-target="#deleteBackdrop"
                                    ></i>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>

                      {/* Table for Dynamic Traffic Lights */}
                      <h6>Dynamic Traffic Lights</h6>
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th>Traffic Light</th>
                            <th>Timer</th>
                            <th>Camera Status</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lights
                            .filter(
                              (light) =>
                                light.intersection_id ===
                                  road.intersection_id &&
                                light.traffic_mode === "Dynamic" // Filter by intersection_id and Dynamic mode
                            )
                            .map((light) => (
                              <tr key={light.traffic_light_id}>
                                <td>
                                  {light.traffic_light_name || <i>No Name</i>}
                                </td>
                                <td>
                                  {light.traffic_light_timer ? (
                                    light.traffic_light_timer
                                      .split(";")
                                      .map((segment, index) => {
                                        const [timeRange] =
                                          segment.split(" : "); // Only time range for Dynamic
                                        return (
                                          <div key={index}>
                                            {/* Display the time range (StartTime - EndTime) */}
                                            {timeRange?.trim()}
                                            <p>
                                              {light.traffic_mode ||
                                                "No traffic Mode"}
                                            </p>
                                          </div>
                                        );
                                      })
                                  ) : (
                                    <i>No Timer</i>
                                  )}
                                </td>
                                <td>
                                  {light.camera_info?.camera_status || (
                                    <i>No Camera Status</i>
                                  )}
                                </td>
                                <td>
                                  <div>
                                    <i
                                      className="bi bi-pencil btn btn-outline-warning m-2"
                                      onClick={() => setSelected(light)}
                                      data-bs-toggle="modal"
                                      data-bs-target="#editBackdrop"
                                    ></i>
                                    <i
                                      className="bi bi-trash btn btn-outline-danger"
                                      onClick={() => setSelected(light)}
                                      data-bs-toggle="modal"
                                      data-bs-target="#deleteBackdrop"
                                    ></i>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      ) : (
        <p>No weekPlan available.</p>
      )}
    </>
  );
};

export default WeekPlanTable;
