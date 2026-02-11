//GraphDisplay.gsx
import React from "react";
import { ResponsiveLine } from "@nivo/line";

const GraphDisplay = ({ graphData }) => {
  if (!graphData.length) return <div className="graph-placeholder">Currently None Selected</div>;

  return (
    <div style={{ height: "100%" }}>
      <ResponsiveLine
        data={graphData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: "time", format: "%Y-%m-%d", precision: "day" }}
        yScale={{ type: "linear", min: "auto", max: "auto", stacked: false, reverse: false }}
        axisLeft={{ legend: "value", legendOffset: -40 }}
        axisBottom={{
            format: "%m/%d", //shorter date
            tickValues: "every 1 day", //force each day to be a tick
            legend: "date",
            legendOffset: 36,
            legendPosition: "middle"
          }}
        pointSize={10}
        pointBorderWidth={2}
        enableSlices="x"
        useMesh={true}
        colors={{ scheme: "category10" }}
      />
    </div>
  );
};

export default GraphDisplay;
