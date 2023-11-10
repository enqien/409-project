$(document).ready(function(){
    var auto_refresh = function() {
        var REFRESH_TIMEOUT = 60000;
        var timeout = setTimeout(function(){
            location.reload();
        }, REFRESH_TIMEOUT);
        $('.header-bar input.auto').change(function(){
            if(this.checked) {
                timeout = setTimeout(function(){
                    location.reload();
                }, REFRESH_TIMEOUT);
                location.reload();
            }else{
                clearTimeout(timeout);
            }
        });
    };
    var perfy_chart_bw = function() {
        if($('table tr.data:eq(0)').find('td[type=Gbps]').length > 0) {
            $('div.chart-panel').append("<h2>Trend: Throughput</h2>");
            $('div.chart-panel').append("<canvas id='bwChart' width='1200' height='600'></canvas>");
        } else {
          return;
        }
        var ctx = document.getElementById("bwChart").getContext('2d');
        var border_colors =  [
            'rgba(255,99,132,1)',
            //'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            //'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            //'rgba(255, 159, 64, 1)',
            'rgba(55,199,122,1)',
            //'rgba(154, 162, 35, 1)',
            'rgba(55, 206, 186, 1)',
            //'rgba(175, 19, 62, 1)',
            'rgba(134, 124, 25, 1)',
            //'rgba(89, 190, 164, 1)',
        ]
        row_labels = []
        nrows = $('table tr.data').length;
        keys = document.getElementsByClassName('iskey');
        ncols = keys.length;
        for (let i = 0; i < nrows; i++) {
            let label = ''
            for (let j = 0; j < ncols; j++) {
                label += keys[j].innerText
                label += ":"
                eles = document.getElementsByClassName('row_'+i+' col_'+j)
                label += eles[0].textContent.trim()
                label += " "
            }
            row_labels.push(label)
        }

        datasets = [];
        i=0;
        // $('table tr.data:eq(0)').find('td[type=Gbps]').each(function(){
        //     ind = $(this).index();
        firstCol = 10000;
        firstColVals = [];
        $('table tr.header.last th').each(function(){
            ind = $(this).index();
            if(! $(this).hasClass('iskey')) {
                if (ind < firstCol){
                    firstCol = ind;
                }
                th = $('table tr.header.last th:eq(' + ind + ')')
                box = $('<label class="box"></label');
                box.css('background-color', border_colors[i]);
                th.append(box);
                data = []
                datalabel = $('table tr.last th:eq(' + ind + ') p')[0].innerText;
                els = document.getElementsByClassName('col-' + datalabel);
                row = 0;
                [].forEach.call(els, function (e, j) {
                    val = e.getElementsByTagName("a")[0].innerHTML;
                    if (val.trim() == "")
                        val = NaN
                    data.push({
                        'x': row_labels[j],
                        'y': val,
                    })
                    if (ind == firstCol) {
                        firstColVals.push(val)
                    } else if (! isNaN(val)) {
                        console.log(val, row, firstColVals[row]);
                        if (! isNaN(firstColVals[row])) {
                            thisVal = parseFloat(val);
                            baseVal = parseFloat(firstColVals[row]);
                            delta = (thisVal - baseVal) / baseVal * 100;
                            if (delta >= 10) {
                                $(e).addClass("green");
                            }
                            if (delta <= -10) {
                                $(e).addClass("red");
                            }
                            oldHtml = e.getElementsByTagName("a")[0].innerHTML;
                            console.log(e);

                            e.getElementsByTagName("a")[0].innerHTML = oldHtml+" ["+delta.toFixed(1)+"%]";
                        }
                    }
                    row++;
                });
                datasets.push({
                    label: datalabel,
                    data: data,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: border_colors[i],
                })
                i++;
            }
        });
        ylabel = 'Throughput (Gbps)'
        console.log(row_labels);
        console.log(datasets);
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: row_labels,
                datasets: datasets,
            },
            options: {
                legend: {
                    display: false
                },
                animation: {
                    duration: 1000
                },
                scales: {
                    xAxes: [{
                        gridLines : {
                            display : false,
                        },
                        ticks: {
                            autoSkip : false,
                            beginAtZero:true
                            },
                        scaleLabel: {
                            display: true,
                            labelString: 'Trials'
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: ylabel
                        }
                    }]
                }
            }
        });
    }

    // MAIN
    auto_refresh();
    perfy_chart_bw();
});
