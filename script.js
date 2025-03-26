// Canvas dimensions to fit screen
let width = window.innerWidth,
    height = window.innerHeight;

// Create SVG and position the tree starting from the top-left corner
const svg = d3
    .select("#tree")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(88, 50)`); // Position from top-left with padding

const data = {
    name: "Spoorthy VV",
    children: [
        {
            name: "Skills",
            children: [
                { name: "Spark SQL" },
                { name: "PySpark" },
                {
                    name: "Databricks",
                    children: [
                        { name: "DLT" },
                        { name: "Unity Catalog" },
                        { name: "Delta Lake" }
                    ]
                },
                {
                    name: "Linux",
                    children: [
                        { name: "Shell Scripting" },
                        { name: "Automation" },
                        { name: "System Admin" }
                    ]
                },
                { name: "AWS" },
                { name: "APIs" }
            ]
        },
        {
            name: "Projects",
            children: [
                { name: "Metadata Search Engine" },
                { name: "Log Monitoring System" },
                { name: "Data Quality Rules" }
            ]
        },
        {
            name: "Certifications",
            children: [
                { name: "Databricks Data Engineer" },
                { name: "AWS Certified Practitioner" },
                { name: "Confluent Fundamentals" }
            ]
        },
        {
            name: "Interests",
            children: [
                { name: "AI/ML" },
                { name: "Open Source Contributions" },
                { name: "Gaming" },
                { name: "Fitness & Running" }
            ]
        }
    ]
};

// Create tree layout with smaller spacing to prevent dragging
let treeLayout = d3.tree().size([height - 300, width - 1500]);

// Create root hierarchy and collapse all nodes
const root = d3.hierarchy(data);
root.x0 = height / 4;
root.y0 = 0;

// Collapse all nodes initially
root.descendants().forEach((d) => {
    if (d.depth && d.children) {
        d._children = d.children;
        d.children = null;
    }
});

// Toggle node expand/collapse
function toggle(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

// Define link paths (diagonal)
function diagonal(d) {
    return `M${d.source.y},${d.source.x}
            C${(d.source.y + d.target.y) / 2},${d.source.x}
            ${(d.source.y + d.target.y) / 2},${d.target.x}
            ${d.target.y},${d.target.x}`;
}

// Update and draw the tree
function update(source) {
    const treeData = treeLayout(root);

    const nodes = treeData.descendants(),
        links = treeData.links();

    nodes.forEach((d) => {
        d.y = d.depth * 190; // Reduce horizontal spacing to prevent sinking
        d.x = d.x + 25; // Add slight vertical offset for cleaner view
    });

    // JOIN and update nodes
    const node = svg.selectAll("g.node").data(nodes, (d) => d.id || (d.id = ++i));

    const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${source.y0 || 0},${source.x0 || 0})`)
        .on("click", (event, d) => toggle(d));

    nodeEnter
        .append("circle")
        .attr("r", 5)
        .style("fill", (d) => (d._children ? "#4d9dff" : "#00cc00"));

    nodeEnter
        .append("text")
        .attr("dy", ".35em")
        .attr("x", (d) => (d.children || d._children ? -12 : 12))
        .attr("text-anchor", (d) => (d.children || d._children ? "end" : "start"))
        .text((d) => d.data.name);

    const nodeUpdate = nodeEnter.merge(node);

    // Move nodes to correct position
    nodeUpdate
        .transition()
        .duration(300)
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

    // Remove any exiting nodes
    node.exit()
        .transition()
        .duration(300)
        .attr("transform", (d) => `translate(${source.y},${source.x})`)
        .remove();

    // JOIN and update links
    const link = svg.selectAll("path.link").data(links, (d) => d.target.id);

    const linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", (d) => diagonal({ source: source, target: source }));

    linkEnter.merge(link).transition().duration(300).attr("d", diagonal);

    link.exit()
        .transition()
        .duration(300)
        .attr("d", (d) => diagonal({ source: source, target: source }))
        .remove();

    // Save positions for next update
    nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Handle window resize dynamically
window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    svg.attr("width", width).attr("height", height);
    treeLayout.size([height - 500, width - 500]);
    update(root);
});

// Initialize and render tree
let i = 0;
update(root);
