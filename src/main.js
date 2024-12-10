import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const dataLink =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const width = 720;
const height = 500;
const margin = { top: 30, bottom: 30, left: 40, right: 30 };

const tooltip = d3
  .select("#graph")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("opacity", 0);

const svg = d3
  .select("#graph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// Fetch data
d3.json(dataLink).then((data) => {
  // Parse data
  const rawTime = data.map((d) => d.Time.split(":"));
  const rawYear = data.map((d) => +d.Year);

  // Format data
  const timeFormat = d3.timeFormat("%M:%S");
  const formattedTime = rawTime.map((d) => {
    const t = new Date(0);
    t.setMinutes(d[0]);
    t.setSeconds(d[1]);
    return t;
  });

  // Create scales
  const xScale = d3
    .scaleLinear()
    .domain([d3.min(rawYear) - 1, d3.max(rawYear) + 1])
    .range([margin.left, width - margin.right]);
  const yScale = d3
    .scaleTime()
    .domain(d3.extent(formattedTime, (d) => d))
    .range([margin.top, height - margin.bottom]);
  const colorScale = d3
    .scaleOrdinal()
    .domain([false, true])
    .range(d3.schemeCategory10);

  // Generate axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);
  svg
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("id", "x-axis");
  svg
    .append("g")
    .call(yAxis)
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("id", "y-axis");

  // Draw points
  const dots = svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", (d) => +d.Year)
    .attr("data-yvalue", (d, i) => formattedTime[i])
    .attr("cx", (d) => xScale(+d.Year))
    .attr("cy", (d, i) => yScale(formattedTime[i]))
    .attr("r", 5)
    .attr("index", (d, i) => i)
    .style("fill", (d) => colorScale(d.Doping !== ""));

  // Attach tooltip
  dots
    .on("mouseover", (event) => {
      const i = d3.select(event.target).attr("index");

      tooltip
        .style("top", event.pageY + "px")
        .style("left", event.pageX + "px")
        .attr("data-year", rawYear[i])
        .html(() => {
          const mainBody =
            data[i].Name +
            " (" +
            data[i].Nationality +
            ")<br>Time: " +
            timeFormat(formattedTime[i]) +
            "<br>Year: " +
            rawYear[i];

          const doping = data[i].Doping !== "" ? "<br>" + data[i].Doping : "";

          return mainBody + doping;
        })
        .style("opacity", 0.9);
    })
    .on("mouseout", (event) => {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Draw the legend
  const legend = svg.append("g").attr("id", "legend").selectAll("rect").data();
});
