//scatter plot
function liquidGaugeChart(miselector) {

    // set the dimensions and margins of the graph
    var margin = {
        top: 2,
        right: 10,
        bottom: 0,
        left: 0
    },
        width = 250,
        height = 310;

    var selector = miselector,
        dispatch,
        dimension,
        filter = [0, 0],
        postFilter = null,
        miSeleccionado = false,
        group,
        semaforo = false,
        data2,
        value,
        ValueAccesor = function (d) { return d.value; }

    /************************************************************* */

    var config3 = liquidFillGaugeDefaultSettings();
    config3.textVertPosition = 0.5
    config3.waveAnimateTime = 2000;
    config3.valueCountUp = true;
    config3.displayPercent = true;
    config3.waveCount = 1;
    config3.waveHeight = 0.15; //intensidad agua //
    config3.waveAnimate = true;
    config3.waveOffset = 0.25;

    function liquidFillGaugeDefaultSettings() {
        return {
            minValue: 0, // The gauge minimum value.
            maxValue: 100, // The gauge maximum value.
            circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
            circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
            circleColor: "#33b5e5", // The color of the outer circle.
            waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
            waveCount: 1, // The number of full waves per width of the wave circle.
            waveRiseTime: 2000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
            waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
            waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
            waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
            waveAnimate: true, // Controls if the wave scrolls or is static.
            waveColor: "#33b5e5", // The color of the fill wave.
            waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
            textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
            textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
            valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
            displayPercent: true, // If true, a % symbol is displayed after the value.
            textColor: "#045681", // The color of the value text when the wave does not overlap it.
            //waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
            waveTextColor: "#FFFFFF" // The color of the value text when the wave overlaps it.
        };
    }

    /************************************************************* */

    //funcion para generar el grafico aqui
    function my(miselector) {
        selector = miselector;
    };

    //metodos
    my.render = function () {

        //el dispatch svg
        dispatch.on('redraw.' + selector, function () {

            d3.select(selector).selectAll('svg').remove();

            data2 = group.all();

            // Select the svg element, if it exists.
            svg = d3.select(selector)
                .selectAll("svg")
                .data(data2)
                .enter()
                .append("svg")
                .attr("class", "svgInd")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            svg.append("text")
                .attr("x", 0)
                .attr("dy", 20)
                .attr("font-size", "15px")
                .attr("font-weight", "bold")
                .style("fill", "#326880")
                .text(function (d) {
                    return d.key;
                });

            //var valor = data2.map(data2 => data2.value).reduce((acc, data2) => data2 + acc);
            //var valor = data2.map(data2 => ValueAccesor(data2)).reduce((acc, data2) => data2 + acc);
            //console.log(valor)

            //var value = valor
            var config = config3
            //let elementId = selector.toString().substring(1, 20)

            let gauge = d3.select('.svgInd');
            let radius = Math.min(parseInt(gauge.style("width")), parseInt(gauge.style("height"))) / 2.2;

            let locationX = parseInt(gauge.style("width")) / 2 - radius;
            let locationY = parseInt(gauge.style("height")) / 2 - radius;

            let fillPercent
            data2.forEach(function (d) {
                fillPercent = Math.max(config.minValue, Math.min(config.maxValue, d.value)) / config.maxValue;
            });

            if (config == null) config = liquidFillGaugeDefaultSettings();

            let waveHeightScale = null;
            if (config.waveHeightScaling) {
                waveHeightScale = d3.scaleLinear()
                    .range([0, config.waveHeight, 0])
                    .domain([0, 50, 100]);
            } else {
                waveHeightScale = d3.scaleLinear()
                    .range([config.waveHeight, config.waveHeight])
                    .domain([0, 100]);
            }

            let textPixels = (config.textSize * radius / 2);
            let textFinalValue = parseFloat(value).toFixed(2);
            let textStartValue = config.valueCountUp ? config.minValue : textFinalValue;
            let percentText = config.displayPercent ? "%" : "";
            let circleThickness = config.circleThickness * radius;
            let circleFillGap = config.circleFillGap * radius;
            let fillCircleMargin = circleThickness + circleFillGap;
            let fillCircleRadius = radius - fillCircleMargin;
            let waveHeight = fillCircleRadius * waveHeightScale(0.30 * 100);

            let waveLength = fillCircleRadius * 2 / config.waveCount;
            let waveClipCount = 1 + config.waveCount;
            let waveClipWidth = waveLength * waveClipCount;

            // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
            let textRounder = function (value) { return Math.round(value); };

            if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
                textRounder = function (value) { return parseFloat(value).toFixed(1); };
            }
            if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
                textRounder = function (value) { return parseFloat(value).toFixed(2); };
            }

            // Data for building the clip wave area.
            let data = [];
            for (let i = 0; i <= 40 * waveClipCount; i++) {
                data.push({ x: i / (40 * waveClipCount), y: (i / (40)) });
            }
            //console.log(data)
            // Scales for drawing the outer circle.
            let gaugeCircleX = d3.scaleLinear().range([0, 2 * Math.PI]).domain([0, 1]);
            let gaugeCircleY = d3.scaleLinear().range([0, radius]).domain([0, radius]);

            // Scales for controlling the size of the clipping path.
            let waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
            let waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);

            // Scales for controlling the position of the clipping path.
            let waveRiseScale = d3.scaleLinear()
                // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
                // circle at 100%.
                .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
                .domain([0, 1]);
            let waveAnimateScale = d3.scaleLinear()
                .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
                .domain([0, 1]);

            // Scale for controlling the position of the text within the gauge.
            let textRiseScaleY = d3.scaleLinear()
                .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
                .domain([0, 1]);

            // Center the gauge within the parent SVG.
            /*let gaugeGroup = gauge.append("g")
                .attr('transform', 'translate(' + locationX + ',' + locationY + ')');*/

            let gaugeGroup = svg.append("g")
                .attr("transform", "translate(" + locationX + "," + locationY + ")");

            // Draw the outer circle.
            let gaugeCircleArc = d3.arc()
                .startAngle(gaugeCircleX(0))
                .endAngle(gaugeCircleX(1))
                .outerRadius(gaugeCircleY(radius))
                .innerRadius(gaugeCircleY(radius - circleThickness));

            gaugeGroup.append("path")
                .attr("d", gaugeCircleArc)
                //.style("fill", config.circleColor)
                .style("fill", function (d) {
                    if (semaforo) {
                        if (d.value > 70) {
                            return '#CC0000'
                        } else if (d.value >= 40 && d.value < 70) {
                            return '#ffbb33'
                        } else {
                            return '#669900'
                        }
                    } else {
                        return '#33b5e5'
                        //178BCA
                    }
                })
                .attr('transform', 'translate(' + radius + ',' + radius + ')')

            // Text where the wave does not overlap.
            let text1 = gaugeGroup.append("text")
                .text(function (d) {
                    return d.value + percentText;
                })
                .attr("class", "liquidFillGaugeText")
                .attr("text-anchor", "middle")
                .attr("font-size", textPixels + "px")
                //.style("fill", config.textColor)
                .style("fill", function (d) {
                    if (semaforo) {
                        if (d.value > 70) {
                            return '#CC0000'
                        } else if (d.value >= 40 && d.value < 70) {
                            return '#ffbb33'
                        } else {
                            return '#669900'
                        }
                    } else {
                        return '#33b5e5'
                        //178BCA
                    }
                })
                .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')')

            // The clipping wave area.
            let clipArea = d3.area()
                .x(function (d) { return waveScaleX(d.x); })
                .y0(function (d) { return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI)); })
                .y1(function (d) { return (fillCircleRadius * 2 + waveHeight); });
            let waveGroup = gaugeGroup.append("defs")
                .append("clipPath")
                .attr("id", function (d, i) {
                    return "clipWave" + i
                })
            let wave = waveGroup.append("path")
                .datum(data)
                .attr("d", clipArea)
                .attr("T", 0);

            // The inner circle with the clipping wave attached.
            let fillCircleGroup = gaugeGroup.append("g")
                .attr("clip-path", function (d, i) {
                    return "url(#clipWave" + i + ")"
                })

            fillCircleGroup.append("circle")
                .attr("cx", radius)
                .attr("cy", radius)
                .attr("r", fillCircleRadius)
                .style("fill", function (d) {
                    if (semaforo) {
                        if (d.value > 70) {
                            return '#CC0000'
                        } else if (d.value >= 40 && d.value < 70) {
                            return '#ffbb33'
                        } else {
                            return '#669900'
                        }
                    } else {
                        return '#33b5e5'
                        //178BCA
                    }
                })
            //.on("click", click);

            // Text where the wave does overlap.
            let text2 = fillCircleGroup.append("text")
                .text(function (d) {
                    return d.value + percentText;
                })
                .attr("class", "liquidFillGaugeText")
                .attr("text-anchor", "middle")
                .attr("font-size", textPixels + "px")
                .style("fill", config.waveTextColor)
                .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')')
            //.on("click", click);

            let text1InterpolatorValue = textStartValue;
            let text2InterpolatorValue = textStartValue;

            // Make the value count up.
            /*if (config.valueCountUp) {
                text1.transition()
                    .duration(config.waveRiseTime)
                    .tween("text", function(d) {
                        //console.log(d)
                        let i = d3.interpolateNumber(text1InterpolatorValue, d.value);
                        return function(t) {
                            console.log(t)
                            text1InterpolatorValue = textRounder(i(t));
                            // Set the gauge's text with the new value and append the % sign
                            // to the end
                            text1.text(text1InterpolatorValue + percentText);
                        }
                    });
                text2.transition()
                    .duration(config.waveRiseTime)
                    .tween("text", function(d) {
                        let i = d3.interpolateNumber(text2InterpolatorValue, d.value);
                        return function(t) {
                            text2InterpolatorValue = textRounder(i(t));
                            // Set the gauge's text with the new value and append the % sign
                            // to the end                
                            text2.text(text2InterpolatorValue + percentText);
                        }
                    });
            }*/

            // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
            var waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
            if (config.waveRise) {
                waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
                    .transition()
                    .duration(config.waveRiseTime)
                    //.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
                    .attr('transform', function (d, i) {
                        x = Math.max(config.minValue, Math.min(config.maxValue, d.value)) / config.maxValue;
                        return 'translate(' + waveGroupXPosition + ',' + waveRiseScale(x) + ')'
                    })
                    // .each("start", function () { wave.attr('transform', 'translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
                    .on("start", function (d) {
                        wave.attr('transform', 'translate(1,0)');
                    }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
            } else {
                //waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
                waveGroup.attr('transform', function (d, i) {
                    x = Math.max(config.minValue, Math.min(config.maxValue, d.value)) / config.maxValue
                    return 'translate(' + waveGroupXPosition + ',' + waveRiseScale(x) + ')'
                })
            }

            if (config.waveAnimate) animateWave();

            function animateWave() {
                wave.attr('transform', 'translate(' + waveAnimateScale(wave.attr('T')) + ',0)');
                wave.transition()
                    .duration(config.waveAnimateTime * (1 - wave.attr('T')))
                    .ease(d3.easeLinear)
                    .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
                    .attr('T', 1)
                    .on('end', function () {
                        wave.attr('T', 0);
                        animateWave(config.waveAnimateTime);
                    });
            }

        });

    };

    function click(d) {

        if (postFilter) {
            postFilter('Filtro');
        }

        /* if (miSeleccionado) {
             miSeleccionado = false;
             console.log('False')
         } else {
             miSeleccionado = true;
             console.log('True')
         }*/

    }

    //getter y settlers
    my.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return my;
    };

    my.width = function (_) {
        if (!arguments.length) return maxWidth;
        maxWidth = _;
        return my;
    };

    my.height = function (_) {
        if (!arguments.length) return maxHeight;
        maxHeight = _;
        return my;
    };

    my.selector = function (_) {
        if (!arguments.length) return selector;
        selector = _;
        return my;
    };

    my.dispatch = function (_) {
        if (!arguments.length) return dispatch;
        dispatch = _;
        return my;
    };

    my.dimension = function (_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return my;
    };

    my.group = function (_) {
        if (!arguments.length) return group;
        group = _;
        return my;
    };

    my.valueAccessor = function (_) {
        if (!arguments.length) return valueAccessor;
        valueAccessor = _;
        return my;
    };

    my.filter = function (_) {
        if (!arguments.length) return filter;
        filter = _;
        return my;
    };

    my.postFilter = function (_) {
        if (!arguments.length) return postFilter;
        postFilter = _;
        return my;
    };

    my.semaforo = function (_) {
        if (!arguments.length) return semaforo;
        semaforo = _;
        return my;
    };

    my.ValueAccesor = function (_) {
        if (!arguments.length) return ValueAccesor;
        ValueAccesor = _;
        return my;
    };





    return my;

}