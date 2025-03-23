const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    const monthlyVariance = data.monthlyVariance;
    const baseTemperature = data.baseTemperature;
    document.getElementById("temp-base").innerText = `Base temperature: ${baseTemperature} °C`;
    const years = monthlyVariance.map((d) => d.year);
    const months = monthlyVariance.map((d) => d.month);
    const variances = monthlyVariance.map((d) => d.variance);

    const minYear = d3.min(years);
    const maxYear = d3.max(years);
    const minTemp = baseTemperature + d3.min(variances);
    const maxTemp = baseTemperature + d3.max(variances);

    const width = 900;
    const height = 500;
    const padding = 60;

    const svg = d3.select("#heatmap").attr("width", width).attr("height", height);

    const xScale = d3
      .scaleTime()
      .domain([new Date(minYear, 0), new Date(maxYear + 1, 0)])
      .range([padding, width - padding]);

    const yScale = d3
      .scaleBand()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      .range([padding, height - padding])
      .padding(0);

    const colors = ["#084594", "#2171b5", "#4292c6", "#6baed6", "#9ecae1", "#f7fbff", "#f7ead8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#b2182b", "#8c0308"];
    const tempRange = maxTemp - minTemp;
    const colorScale = d3.scaleQuantize().domain([minTemp, maxTemp]).range(colors);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")).tickSizeOuter(0);

    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((month) => {
        const date = new Date(0);
        date.setMonth(month);
        return d3.timeFormat("%B")(date);
      })
      .tickSizeOuter(0);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - padding})`)
      .attr("id", "x-axis")
      .call(xAxis)
      .append("text")
      .attr("id", "text-years")
      .text("Years");

    svg.append("g").attr("transform", `translate(${padding}, 0)`).attr("id", "y-axis").call(yAxis);

    const tooltip = d3.select("#tooltip");

    svg
      .selectAll(".cell")
      .data(monthlyVariance)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => baseTemperature + d.variance)
      .attr("x", (d) => xScale(new Date(d.year, 0)))
      .attr("y", (d) => yScale(d.month - 1))
      .attr("width", (d) => {
        const yearsRange = maxYear - minYear;
        return (width - 2 * padding) / yearsRange;
      })
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(baseTemperature + d.variance))
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 0.9);
        tooltip.attr("data-year", d.year);
        tooltip.html(`${d.year} - ${d3.timeFormat("%B")(new Date(0, d.month - 1))}<br>Temperatura: ${(baseTemperature + d.variance).toFixed(2)}°C`);
        tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    const legendWidth = 300;
    const legendHeight = 40;

    const legendSvg = d3.select("#legend").append("svg").attr("width", legendWidth).attr("height", legendHeight);

    const legendScale = d3.scaleLinear().domain([minTemp, maxTemp]).range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .tickValues(
        colors
          .filter((d, i) => i % 2 === 0)
          .map((color, i) => minTemp + (tempRange / colors.length) * (i * 2))
          .concat([maxTemp])
      )
      .tickFormat(d3.format(".1f"));

    legendSvg
      .selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .attr("x", (d, i) => (legendWidth / colors.length) * i)
      .attr("y", 0)
      .attr("width", legendWidth / colors.length)
      .attr("height", legendHeight / 2)
      .attr("fill", (d) => d);

    legendSvg
      .append("g")
      .attr("transform", `translate(0, ${legendHeight / 2})`)
      .call(legendAxis);
  })
  .catch((error) => console.error("Error loading data:", error));
