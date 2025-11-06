// D3 Radial Tree Diagram with Socket.IO

// Specify the chart’s dimensions (based on window size)
const width = Math.min(window.innerWidth, 900);
const height = Math.min(window.innerHeight, 900);
const cx = width * 0.5; // adjust as needed to fit
const cy = height * 0.5; // adjust as needed to fit
const radius = Math.min(width, height) / 2 - 30;

// Create a radial tree layout. The layout’s first dimension (x)
// is the angle, while the second (y) is the radius.
const tree = d3.tree()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

// Creates the SVG container.
const svg = d3.select("svg");
svg.attr("width", width)
  .attr("height", height)
  .attr("viewBox", [-cx, -cy, width, height])
  .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

// Create a group for links, nodes, and labels
const linkG = svg.selectAll(".links")
    .data([null])
    .join("g")
    .attr("class", "links")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

const nodeG = svg.selectAll(".nodes")
    .data([null])
    .join("g")
      .attr("class", "nodes");

const labelG = svg.selectAll(".labels")
    .data([null])
    .join("g")
      .attr("class", "labels")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3);

// Function to call when socketio event is received
function update(data) {

  // Convert the data to a d3.hierarchy
  let root = tree(d3.hierarchy(data)
                    .sort((a, b) => d3.ascending(a.data.name, b.data.name)));

  // Append links.
  linkG.selectAll("path")
    .data(root.links())
    .join("path")
    .attr("d", d3.linkRadial()
          .angle(d => d.x)
          .radius(d => d.y));

  // Append nodes.
  nodeG.selectAll("circle")
    .data(root.descendants())
    .join("circle")
    .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
    .attr("fill", d => d.children ? "#555" : "#999")
    .attr("r", 2.5);

  // Append labels.
  labelG.selectAll("text")
    .data(root.descendants())
    .join("text")
    .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0) rotate(${d.x >= Math.PI ? 180 : 0})`)
    .attr("dy", "0.31em")
    .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
    .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
    .attr("paint-order", "stroke")
    .attr("stroke", "white")
    .attr("fill", "currentColor")
    .text(d => trimLabel(d.data.name));

  return svg.node();
}

function trimLabel(name, max = 15) {
  return name.length > max ? name.slice(0, max - 1) + "…" : name;
}

// Set up Socket.IO client
const socket = io();
socket.on("treeUpdate", data => update(data));
