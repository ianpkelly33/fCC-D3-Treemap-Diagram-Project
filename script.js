const datasets = {
    videogames: {
        title: "Video Game Sales",
        description: "Top 100 Most Sold Video Games Grouped by Platform:",
        url:
            "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
    },
    movies: {
        title: "Movie Sales",
        description: "Top 100 Highest Grossing Movies Grouped By Genre:",
        url:
            "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
    },
    kickstarter: {
        title: "Kickstarter Pledges",
        description:
            "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category:",
        url:
            "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"
    }
};

const urlParams = new URLSearchParams(window.location.search);
const dataset = datasets[urlParams.get("data")];

d3.json(dataset.url)
    .then(data => {
        document.getElementById("title").innerHTML = dataset.title;
        document.getElementById("description").innerHTML = dataset.description;

        const svg = d3.select(".visHolder"),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        const interpolator = colors => d3.interpolateRgb(colors, "white")(0.33);
        const colors = d3.scaleOrdinal().range(
            [
                "#E6194B",
                "#3CB44B",
                "#FFE119",
                "#4363D8",
                "#F58231",
                "#911EB4",
                "#42D4F4",
                "#F032E6",
                "#BFEF45",
                "#FABED4",
                "#469990",
                "#DCBEFF",
                "#9A6324",
                "#FFFAC8",
                "#800000",
                "#AAFFC3",
                "#808000",
                "#FFD8B1",
                "#000075",
                "#A9A9A9"
            ].map(interpolator)
        );

        const treemap = d3.treemap().size([width, height]).paddingInner(1);
        const root = d3.hierarchy(data)
            .eachBefore(d => d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
            .sum(d => d.value)
            .sort((a, b) => b.height - a.height || b.value - a.value);
        treemap(root);

        const handleMousemove = (event, d) => {
            d3.select("#tooltip")
                .html(
                    "Name: " + d.data.name +
                    "<br>Category: " + d.data.category +
                    "<br>Value: " + d.data.value
                )
                .attr("data-value", d.data.value)
                .style("top", event.pageY - 28 + "px")
                .style("left", event.pageX + 10 + "px")
                .style("opacity", 1);
        };

        const handleMouseout = () => d3.select("#tooltip").style("opacity", 0);

        const tile = svg.selectAll("g")
            .data(root.leaves())
            .enter()
            .append("g")
            .attr("transform", d => "translate(" + d.x0 + "," + d.y0 + ")");

        tile.append("rect")
            .attr("class", "tile")
            .attr("id", d => d.data.id)
            .attr("data-name", d => d.data.name)
            .attr("data-category", d => d.data.category)
            .attr("data-value", d => d.data.value)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => colors(d.data.category))
            .on("mousemove", handleMousemove)
            .on("mouseout", handleMouseout);

        tile.append("text")
            .on("mousemove", handleMousemove)
            .on("mouseout", handleMouseout)
            .attr('class', 'tile-text')
            .selectAll("tspan")
            .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
            .enter()
            .append("tspan")
            .attr("x", 4)
            .attr("y", (d, i) => 13 + i * 10)
            .text(d => d);

        const categories = root.leaves()
            .map(nodes => nodes.data.category)
            .filter((category, index, self) => self.indexOf(category) === index);

        const legendSelect = d3.select("#legend");
        const legendWidth = +legendSelect.attr("width");
        const legendPaddingTop = 10;
        const legendRectSize = 15;
        const legendX = 150;
        const legendY = 10;
        const legendTextX = 5;
        const legendTextY = -2;
        const legendElemsPerRow = Math.floor(legendWidth / legendX);

        const legend = legendSelect.append("g")
            .attr("transform", "translate(60," + legendPaddingTop + ")")
            .selectAll("g")
            .data(categories)
            .enter()
            .append("g")
            .attr("transform", (d, i) => {
                return (
                    "translate(" +
                    (i % legendElemsPerRow) * legendX + "," +
                    (Math.floor(i / legendElemsPerRow) * legendRectSize +
                        legendY * Math.floor(i / legendElemsPerRow)) + ")"
                );
            });

        legend.append("rect")
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .attr("fill", d => colors(d));

        legend.append("text")
            .attr("x", legendRectSize + legendTextX)
            .attr("y", legendRectSize + legendTextY)
            .attr("fill", "white")
            .text(d => d);
    })
    .catch(err => console.log(err));
