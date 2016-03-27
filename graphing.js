//configure date picker format



$(document).ready(function() {

        //this adds datepicker methods to our first row, in a nice non american format
        $(".datepick").datepicker({
            dateFormat: "dd M yy",
            //this ensures the focus is on the current element after a date has been selected
            onClose: function() {
                this.focus()
            },
            onSelect: function(selected) {
                //validation 

                var thisType = $(this).attr('id')
                if (thisType === 'orig-1st-del') {
                    //then the date of the next date picker must be > than this.selected
                    $("#orig-last-del").datepicker("option", "minDate", new Date(selected))
                        //then this date must be > orig-first-del
                } else if (thisType === 'curr-1st-del') {
                    //then the date of the next date picker must be > than this.selected
                    $("#curr-last-del").datepicker("option", "minDate", new Date(selected))


                }
            }
        });
        //we need  counter for the rows
        var id = 1

        //bind a click event to the link with add new ID
        $("#addnew").click(function() {

            //the addrow is the lowermost row with populated data, select this
            //this refers to the clicked element, and parent() parent() allows us 
            //to walk up the dom from a > td > tr
            var addRow = $(this).parent().parent()

            //make a copy of this lowermost row
            var newRow = addRow.clone()

            //now we have saved a copy of the lower most populated row, we clear content of all input tags in this row
            //note we selected this row already above
            $('input', addRow).val('')

            //insert the copied row (newRow) before the addrow
            addRow.before(newRow)

            //now select the add link, of the newRow and change the text
            $('td:last-child', newRow).html("<a href='' class='remove'><span class='ui-icon ui-icon-circle-close'></span></a>")

            //add click handler to delete links with class remove
            $('a.remove').click(function() {
                    $(this).closest('tr').remove();
                    return false
                })
                //now we've added a row, the date pickers need to be unbound
                //hasdatepicker is jqueries way of indicating which fields have already had a datepicekr added 
                //remove these classes
            $(newRow).find(".hasDatepicker").removeClass("hasDatepicker")
                //remove the .datepick class (that we assigned) to other siblind inputs
            $(newRow).find(".datepick").siblings().remove();
            //destroy all previous datepicker methods
            $(newRow).find(".datepick").datepicker("destroy");

            //now create new methods.
            //in our new row, find the 1st, 2nd etc. instance of inputs designated as datepick
            //set their id to be unique. id is incremented by 4 per row, so
            //incrementing by 1,2,3&4 allows us to assing unique numbers to each datepick class element's id
            $(newRow).find(".datepick:eq(0)").attr('id', "newdatepicker" + (id + 1));
            $(newRow).find(".datepick:eq(1)").attr('id', "newdatepicker" + (id + 2));
            $(newRow).find(".datepick:eq(2)").attr('id', "newdatepicker" + (id + 3));
            $(newRow).find(".datepick:eq(3)").attr('id', "newdatepicker" + (id + 4));
            //now the datepick elements are all unique, we can rebind datepicker methods 
            //and there will be no conflict
            $(newRow).find(".datepick").datepicker({
                dateFormat: "dd M yy",
                //this ensures the focus is on the current element after a date has been selected
                onClose: function() {
                    this.focus()
                },
                onSelect: function(selected) {

                    console.log('this id is', $(this).attr('id'))
                }
            });
            id += 4

            //prevent any default behaviour
            return false
        })

        $('#gen-graph').click(function() {
            var data = {}
            var originalData = []
            var currentData = []
            $('#deliverytable input').each(function(i) {
                var cellval = $(this).val();
                var celltype = $(this).attr('name');
                // var celltype = celltyperaw.substring(0,celltyperaw.length-1)
                //table is traversed row by row

                //convert to ms since 1970 for js
                if ($(this).attr('class') === 'datepick hasDatepicker') {
                    if (cellval) {
                        //we don't have a blank date
                        var d = new Date(cellval)
                        cellval = d.valueOf()
                    } else {
                        cellval = 0
                    }

                }

                //save into the data object, populate keys if not already present
                if (!data[celltype]) {
                    data[celltype] = []
                    data[celltype].push(cellval)
                } else {
                    data[celltype].push(cellval)
                }


            })

            //set up original data
            data['orig-1st-del[]'].forEach(function(item) {
                var temp = []
                temp[0] = item
                originalData.push(temp)
            })

            originalData.forEach(function(item, index) {
                item.push(data['orig-last-del[]'][index])
            })

            //set up current data
            data['curr-1st-del[]'].forEach(function(item) {
                var temp = []
                temp[0] = item
                currentData.push(temp)
            })

            currentData.forEach(function(item, index) {
                item.push(data['curr-last-del[]'][index])
            })

            var chart = $('#container').highcharts()

            //clear our chart of series
            var seriesLength = chart.series.length;
            for (var i = seriesLength - 1; i > -1; i--) {
                chart.series[i].remove();
            }

            //now plot the data 
            chart.addSeries({
                name: 'Original forecast',
                data: originalData,
                color: 'rgba(0, 0, 250, 0.3)',
                maxPointWidth: 6
            })

            chart.addSeries({
                    name: 'Current forecast',
                    data: currentData,
                    color: "rgba(0, 200, 250, 0.3)",
                    maxPointWidth: 6
                })
                //and add the equipment descriptions
            chart.xAxis[0].setCategories(data['desc[]']);

            //set up scatter data for first deliveries
            var currFirst = []

            currentData.forEach(function(item) {
                currFirst.push(item[0])
            })
            var orgFirst = []
            originalData.forEach(function(item) {

                orgFirst.push(item[0])
            })

            //add for the original data
            chart.addSeries({
                name: 'Original first item due',
                type: 'scatter',
                data: orgFirst,
                pointPlacement: 0.15,
                color: 'rgba(0, 0, 250, 0.9)',
                showInLegend: false,
                marker: {
                    symbol: 'triangle',
                    radius: 6
                }

            })
            chart.addSeries({
                name: 'Current first item due',
                type: 'scatter',
                data: currFirst,
                pointPlacement: -0.15,
                color: "rgba(0, 200, 250, 1)",
                showInLegend: false,

                marker: {
                    symbol: 'triangle',
                    radius: 6
                }
            })


        })

    })
    //set highcharts to use local time not UTC
Highcharts.setOptions({
    global: {
        useUTC: false
    }
});

$(function() {
    $('#container').highcharts({


        chart: {
            type: 'columnrange',
            inverted: true
        },
        style: {
            fontFamily: 'serif'
        },
        credits: {
            enabled: false
        },

        title: {
            text: 'Delivery schedule plot'
        },

        subtitle: {
            text: ''
        },

        xAxis: {
            categories: [],
            gridLineWidth: 1
        },

        yAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%b-%Y',
                year: '%Y'
            },
            labels: {

                rotation: 45,
                align: 'left'
            },
            title: {
                text: 'Time'
            },

        },

        plotOptions: {
            columnrange: {
                dataLabels: {
                    enabled: true,
                    padding: 9,
                    formatter: function() {
                        return Highcharts.dateFormat('%d %b %y', this.y);
                    }
                },

            }
        },

        legend: {
            enabled: true
        },

        tooltip: {
            formatter: function() {
                console.log('series type', this.series.type)

                //the tooltip is different if we consider a scatter point or a columnrange
                if (this.series.type === 'columnrange') {
                    //display range of bar on tooltip hover over
                    return this.series.name + ' : ' + Highcharts.dateFormat('%d %b %y', this.point.low) + ' - ' +
                        Highcharts.dateFormat('%d %b %y', this.point.high)
                } else {
                    return this.series.name + ' : ' + Highcharts.dateFormat('%d %b %y', this.y)
                }


            }
        },

        series: []

    });
});