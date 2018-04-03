import React, { Component } from 'react';
import moment from 'moment';
import * as d3 from "d3";
import {Button} from 'react-bootstrap';
import html2canvas from 'html2canvas';


export default class LineChart extends Component {
    constructor(props) {
        super(props);

        this.exportToJPG = this.exportToJPG.bind(this);
    }

    exportToJPG() {

        html2canvas(document.getElementById('lineChart')).then(
            (canvas) => {
                canvas.toBlob(function(blob) {
                    // Generate file download
                    let link = document.createElement("a");
                    link.setAttribute("href", blob);
                    link.setAttribute("download", 'kpi.png');
                    link.click();
                });
                // let img = canvas.toDataURL("image/png");
                //
                // let link = document.createElement("a");
                // link.setAttribute("href", img);
                // link.setAttribute("download", 'kpi.png');
                // link.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                // link.download = 'kpi.jpg';
                // document.body.appendChild(link);
                // link.click();
                // document.body.removeChild(link);
            }
        ).catch(e => console.log(e));

    }

    drawD3() {

        let props = this.props;

        let parseTime = d3.timeParse("%Y%m%d");

        let bisectDate = d3.bisector(function(d) { return d.date; }).left;

        d3.select(".visualAnalysisTableD3").selectAll("*").remove();

        let dataType = props.dataType;
        let summaryData = props.data;
        let margin = {
                top: 200, right: 50, bottom: 50, left: 50
            },
            width = 1100 - margin.left - margin.right,
            height = 900 - margin.top - margin.bottom;

        let mappedData = [];
        let mappedData2 = [];

        const lowerControlLimit = parseFloat(props.stats[0].mean) - parseFloat(props.stats[0].std);
        const upperControlLimit = parseFloat(props.stats[0].mean) + parseFloat(props.stats[0].std);

        let lowerControlLimit2 = 0;
        let upperControlLimit2 = 0;

        if(summaryData[0][0]['Game Date']) {
            for (let i = 0; i < summaryData[0].length; i++) {
                let date = summaryData[0][i]['Game Date'], value = summaryData[0][i][dataType[0]], opponent = summaryData[0][i]['Opponent'];
                if (date && value && opponent) {
                    mappedData.push({date: new Date(date), value: parseFloat(value), opponent: opponent});
                }
            }
        }

        mappedData.sort(function(a, b) {
            return a.date - b.date;
        });

        const playerImageSize = {width: 200, height: 200, gap: 20};

        let xScale = d3.scaleUtc().range([0, width]);

        let yMin = mappedData.length > 0 ? d3.min(mappedData, function(d) { return d.value; }) : 0,
            yMax = mappedData.length > 0 ? d3.max(mappedData, function(d) { return d.value; }) : 0;


        let yMin2 = 0,
            yMax2 = 0;

        if (summaryData[1][0][dataType[1]] && props.showSecondPlayer) {
            yMin2 = d3.min(summaryData[1], function(d) { return (d[dataType[1]] ? parseFloat(d[dataType[1]]) : Number.MAX_SAFE_INTEGER); });
            yMax2 = d3.max(summaryData[1], function(d) { return (d[dataType[1]] ? parseFloat(d[dataType[1]]) : Number.MIN_SAFE_INTEGER); });

            lowerControlLimit2 = parseFloat(props.stats[1].mean) - parseFloat(props.stats[1].std);
            upperControlLimit2 = parseFloat(props.stats[1].mean) + parseFloat(props.stats[1].std);

            if (dataType[0] === dataType[1]) {
                yMin = Math.min(yMin, yMin2);
                yMax = Math.max(yMax, yMax2);
                yMin2 = yMin;
                yMax2 = yMax;
            }

            for (let i = 0; i < summaryData[1].length; i++) {
                let date = summaryData[1][i]['Game Date'], value = summaryData[1][i][dataType[1]], opponent = summaryData[1][i]['Opponent'];
                if (date && value && opponent) {
                    mappedData2.push({date: new Date(date), value: parseFloat(value), opponent: opponent});
                }

            }

            xScale.domain(d3.extent(mappedData.concat(mappedData2), function(d) { return d.date.getTime(); }));


        } else {
            xScale.domain(d3.extent(mappedData, function(d) { return d.date.getTime(); }));
        }

        let yScaleLeft = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);
        let yScaleRight = d3.scaleLinear().domain([yMin2, yMax2]).range([height, 0]);

        let valueLine = d3.line()
            .x(d => { return (d.date ? xScale(d.date) : 0);})
            .y(d => { return (d.value ? yScaleLeft(d.value) : 0);});

        let valueLine2 = d3.line()
            .x(d => {return d.date ? xScale(d.date) : 0;})
            .y(d => { return d.value ? yScaleRight(d.value) : 0;});

        let svg = d3
            .select(".visualAnalysisTableD3")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("image")
            .attr('x', 0)
            .attr('y', - playerImageSize.height - playerImageSize.gap)
            .attr('width', playerImageSize.width)
            .attr('height', playerImageSize.height)
            .attr('class', "legend-img")
            .attr("xlink:href", props.images[0]);

        svg.append("text")
            .style("stroke", "steelblue")
            .attr("y", - playerImageSize.height * 2 / 3 - playerImageSize.gap)
            .attr("x", playerImageSize.width + playerImageSize.gap)
            .text(props.players[0]);

        svg.append("text")
            .style("stroke", "steelblue")
            .attr("y", - playerImageSize.height / 5 - playerImageSize.gap)
            .attr("x", playerImageSize.width * 1.8)
            .text("Max");

        svg.append("text")
            .style("stroke", "steelblue")
            .attr("y", - playerImageSize.height / 5 - playerImageSize.gap)
            .attr("x", playerImageSize.width * 2 + playerImageSize.gap)
            .text(props.stats[0].max);

        svg.append("text")
            .style("stroke", "steelblue")
            .attr("y", - playerImageSize.height * 2 / 5 - playerImageSize.gap)
            .attr("x", playerImageSize.width * 1.8)
            .text("Min");

        svg.append("text")
            .style("stroke", "steelblue")
            .attr("y", - playerImageSize.height * 2 / 5 - playerImageSize.gap)
            .attr("x", playerImageSize.width * 2 + playerImageSize.gap)
            .text(props.stats[0].min);

        svg.append("text")
            .style("stroke", "steelblue")
            .attr("y", - playerImageSize.height * 3 / 5 - playerImageSize.gap)
            .attr("x", playerImageSize.width * 1.8)
            .text("Std");

        svg.append("text")
            .style("stroke", "steelblue")
            .attr("y", - playerImageSize.height * 3 / 5 - playerImageSize.gap)
            .attr("x", playerImageSize.width * 2 + playerImageSize.gap)
            .text(props.stats[0].std);

        svg.append("text")
            .style("stroke", "steelblue")
            .attr("y", - playerImageSize.height * 4 / 5 - playerImageSize.gap)
            .attr("x", playerImageSize.width * 1.8)
            .text("Mean");

        svg.append("text")
            .style("stroke", "steelblue")
            .attr("y", - playerImageSize.height * 4 / 5 - playerImageSize.gap)
            .attr("x", playerImageSize.width * 2 + playerImageSize.gap)
            .text(props.stats[0].mean);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b-%d")))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        svg.append("g")
            .attr("class", "y axis")
            .style("stroke", "steelblue")
            .call(d3.axisLeft(yScaleLeft));

        let legend1 = d3.line().x(d => {return d.x}).y(d => {return d.y});

        let legendTrend = d3.line().x(d => {return d.x}).y(d => {return d.y - playerImageSize.height / 6});

        let legendPoints1 = [
            {x: playerImageSize.width + playerImageSize.gap, y: - playerImageSize.height / 3 - playerImageSize.gap},
            {x: playerImageSize.width + playerImageSize.gap + props.players[0].length * 7.5, y: - playerImageSize.height / 3 - playerImageSize.gap}];

        svg.append("path")
            .data([legendPoints1])
            .attr("class", "line")
            .style("stroke", "steelblue")
            .style("stroke-dasharray", ("3, 3"))
            .attr("d", legendTrend);

        svg.append("path")
            .data([legendPoints1])
            .attr("class", "line")
            .style("stroke", "steelblue")
            .attr("d", legend1);

        svg.append("path")
            .data([mappedData])
            .attr("class", "line")
            .style("stroke", "steelblue")
            .attr("d", valueLine);


        // trend line for player 1
        if (props.trends[0] && mappedData.length > 0) {
            let gradient = props.gradients[0] / props.bases[0], intercept = props.intercepts[0];
            let x0 = (new Date(summaryData[0][0]['Game Date'])).getTime();
            let x1 = (new Date(summaryData[0].slice(-1)[0]['Game Date'])).getTime();

            let trendPoints = [{date: x0, value: gradient * x0 + intercept}, {date: x1, value: gradient * x1 + intercept}];

            svg.append("path")
                .data([trendPoints])
                .attr("class", "line")
                .style("stroke-dasharray", ("3, 3"))
                .style("stroke", "steelblue")
                .attr("d", valueLine);
        }

        // trend line for player 2
        if (props.trends[1] && mappedData2.length > 0) {
            let gradient = props.gradients[1] / props.bases[1], intercept = props.intercepts[1];
            let x0 = (new Date(summaryData[1][0]['Game Date'])).getTime();
            let x1 = (new Date(summaryData[1].slice(-1)[0]['Game Date'])).getTime();

            let trendPoints = [{date: x0, value: gradient * x0 + intercept}, {date: x1, value: gradient * x1 + intercept}];

            svg.append("path")
                .data([trendPoints])
                .attr("class", "line")
                .style("stroke-dasharray", ("3, 3"))
                .style("stroke", "#fe4365")
                .attr("d", valueLine2);
        }

        // plot SD area
        if ((props.sdLines[0] && props.stats[0].std)) {

            let area = d3.area()
                .x(d => {return xScale(d.date)})
                .y0(d => {return yScaleLeft(upperControlLimit)})
                .y1(d => {return yScaleLeft(lowerControlLimit)});

            svg.append("path")
                .datum(mappedData)
                .attr("class", "area")
                .attr("d", area);
        }

        // plot SD area
        if ((props.sdLines[1] && props.stats[1].std)) {

            let area2 = d3.area()
                .x(d => {return xScale(d.date)})
                .y0(d => {return yScaleRight(upperControlLimit2)})
                .y1(d => {return yScaleRight(lowerControlLimit2)});

            svg.append("path")
                .datum(mappedData2)
                .attr("class", "area2")
                .attr("d", area2);
        }

        svg.append("circle")
            .data([1])
            .attr("class", "dot")
            .attr("cx", d => { return playerImageSize.width + playerImageSize.gap + props.players[0].length * 7.5 / 2})
            .attr("cy", d => { return - playerImageSize.height / 3 - playerImageSize.gap })
            .attr("r", 5);


        let tooltip1 = d3.select("body").append("div")
            .attr("class", "tooltip1")
            .style("opacity", 0);

        svg.selectAll(".dot")
            .data(mappedData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => { return d.date ? xScale(d.date) : 0;})
            .attr("cy", d => { return d.value ? yScaleLeft(parseFloat(d.value)) : 0;})
            .attr("r", 5)
            .on("mouseover", function(d) {
                tooltip1.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip1.html(moment(d.date).format("YYYY-MM-DD") + "<br/>"  + d.opponent + "<br/>" + d.value)
                    .style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
        })
            .on("mouseout", function(d) {
                tooltip1.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


        svg.append("text")
            .attr("transform", "rotate(-90)")
            .style("stroke", "steelblue")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(dataType[0]);

        // svg.selectAll(".data-point-label")
        //     .data(mappedData)
        //     .enter()
        //     .append("text")
        //     .attr("x", function(d) { return d.date ? xScale(d.date) - 12 : 0; })
        //     .attr("y", function(d) { return d.value ? yScaleLeft(d.value) - 10 : 0; })
        //     .attr("class", "data-point-label")
        //     .text(function(d) { return d.value ? d.value : "NaN"; });



        // plot second player
        if(summaryData[1][0][dataType[1]] && props.showSecondPlayer) {

            lowerControlLimit2 = parseFloat(props.stats[1].mean) - parseFloat(props.stats[1].std);
            upperControlLimit2 = parseFloat(props.stats[1].mean) + parseFloat(props.stats[1].std);


            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b-%d")))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            // yScaleRight = d3.scaleLinear().domain([yMin2, yMax2]).range([height, 0]);

            // valueLine2 = d3.line()
            //     .x(d => {return d.date ? xScale(d.date) : 0;})
            //     .y(d => { return d.value ? yScaleRight(d.value) : 0;});

            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + width + " ,0)")
                .style("stroke", "#fe4365")
                .call(d3.axisRight(yScaleRight));

            svg.append("image")
                .attr('x', width - playerImageSize.width)
                .attr('y', - playerImageSize.height - playerImageSize.gap)
                .attr('width', playerImageSize.width)
                .attr('height', playerImageSize.height)
                .attr('class', "legend-img")
                .attr("xlink:href", props.images[1]);

            svg.append("text")
                .style("stroke", "#fe4365")
                .attr("y", - playerImageSize.height * 2 / 3 - playerImageSize.gap)
                .attr("x", width - playerImageSize.width - playerImageSize.gap - props.players[1].length * 7.5)
                .text(props.players[1]);

            svg.append("text")
                .style("stroke", "fe4365")
                .attr("y", - playerImageSize.height / 5 - playerImageSize.gap)
                .attr("x", width - playerImageSize.width * 1.8 - 20)
                .text("Max");

            svg.append("text")
                .style("stroke", "fe4365")
                .attr("y", - playerImageSize.height / 5 - playerImageSize.gap)
                .attr("x", width - playerImageSize.width * 2 - playerImageSize.gap - 20)
                .text(props.stats[1].max);

            svg.append("text")
                .style("stroke", "fe4365")
                .attr("y", - playerImageSize.height * 2 / 5 - playerImageSize.gap)
                .attr("x", width - playerImageSize.width * 1.8 - 20)
                .text("Min");

            svg.append("text")
                .style("stroke", "fe4365")
                .attr("y", - playerImageSize.height * 2 / 5 - playerImageSize.gap)
                .attr("x", width - playerImageSize.width * 2 - playerImageSize.gap - 20)
                .text(props.stats[1].min);

            svg.append("text")
                .style("stroke", "fe4365")
                .attr("y", - playerImageSize.height * 3 / 5 - playerImageSize.gap)
                .attr("x", width - playerImageSize.width * 1.8 - 20)
                .text("Std");

            svg.append("text")
                .style("stroke", "fe4365")
                .attr("y", - playerImageSize.height * 3 / 5 - playerImageSize.gap)
                .attr("x", width - playerImageSize.width * 2 - playerImageSize.gap - 20)
                .text(props.stats[1].std);

            svg.append("text")
                .style("stroke", "fe4365")
                .attr("y", - playerImageSize.height * 4 / 5 - playerImageSize.gap)
                .attr("x", width - playerImageSize.width * 1.8 - 20)
                .text("Mean");

            svg.append("text")
                .style("stroke", "fe4365")
                .attr("y", - playerImageSize.height * 4 / 5 - playerImageSize.gap)
                .attr("x", width - playerImageSize.width * 2 - playerImageSize.gap - 20)
                .text(props.stats[1].mean);

            let legendPoints2 = [
                {
                    x: width - playerImageSize.width - playerImageSize.gap - props.players[1].length * 7.5,
                    y: - playerImageSize.height / 3 - playerImageSize.gap
                },
                {
                    x: width - playerImageSize.width - playerImageSize.gap,
                    y: - playerImageSize.height / 3 - playerImageSize.gap
                }];

            svg.append("path")
                .data([legendPoints2])
                .attr("class", "line")
                .style("stroke", "#fe4365")
                .attr("d", legend1);

            svg.append("path")
                .data([legendPoints2])
                .attr("class", "line")
                .style("stroke", "#fe4365")
                .style("stroke-dasharray", ("3, 3"))
                .attr("d", legendTrend);

            svg.append("rect")
                .data([[1]])
                .attr("class", "dot2")
                .attr("x", d => { return width - playerImageSize.width - playerImageSize.gap - props.players[1].length * 7.5 / 2 - 5})
                .attr("y", d => { return - playerImageSize.height / 3 - playerImageSize.gap - 5})
                .attr("height", 10)
                .attr("width", 10);

            svg.append("path")
                .data([mappedData2])
                .attr("class", "line")
                .style("stroke", "#fe4365")
                .attr("d", valueLine2);



            svg.append("text")
                .attr("transform", "rotate(-90)")
                .style("stroke", "#fe4365")
                .attr("y", width + 30)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(dataType[1]);

            let tooltip2 = d3.select("body").append("div")
                .attr("class", "tooltip2")
                .style("opacity", 0);

            svg.selectAll(".dot2")
                .data(mappedData2)
                .enter()
                .append("rect")
                .attr("class", "dot2")
                .attr("x", d => { return d.date ? xScale(d.date) - 5 : 0;})
                .attr("y", d => { return d.value ? yScaleRight(parseFloat(d.value)) - 5 : 0; })
                .attr("height", 10)
                .attr("width", 10).on("mouseover", function(d) {
                tooltip2.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip2.html(moment(d.date).format("YYYY-MM-DD") + "<br/>"  + d.opponent + "<br/>" + d.value)
                    .style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
            })
                .on("mouseout", function(d) {
                    tooltip2.transition()
                        .duration(500)
                        .style("opacity", 0);
                });



            // svg.selectAll(".data-point-label-2")
            //     .data(mappedData2)
            //     .enter()
            //     .append("text")
            //     .attr("x", function(d) {return d.date ? xScale(d.date) - 12 : 0;})
            //     .attr("y", function(d) {return d.value ? yScaleRight(d.value) - 10 : 0;})
            //     .attr("class", "data-point-label-2")
            //     .text(function(d) {return d.value ? d.value : "NaN";});


        }
    }

    render() {
        return (
            <div>
                <article>
                    <div className='text-center D3-canvas' id='lineChart'><svg className='visualAnalysisTableD3'></svg></div>
                    {this.drawD3()}
                </article>

                {/*<Button className='btn-cardinal-orange' onClick={this.exportToJPG} download={'kpi.jpg'}>JPG</Button>*/}
            </div>





        )
    }

}
