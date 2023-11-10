$(document).ready(function(){
    var auto_refresh = function() {
        var REFRESH_TIMEOUT = 30000;
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
    var perfy_chart_verb_bw = function() {
        if($('table tr.data:eq(0)').find('td[type=Gbps]').length > 0) {
            $('div.chart-panel').append("<h2>Trend: Throughput</h2>");
            $('div.chart-panel').append("<canvas id='bwChart' width='600' height='400'></canvas>");
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
        $('table tr.data').find('th:eq(0) p').each(function(){
            row_labels.push($(this).html())
        });
        datasets = [];
        i=0;
        $('table tr.data:eq(0)').find('td[type=Gbps]').each(function(){
            ind = $(this).index()-1;
            th = $('table tr.header.last th:eq('+ind+')')
            box = $('<label class="box"></label');
            box.css('background-color',border_colors[i]);
            th.append(box);
            data = []
            $('table tr.data').find('td:eq('+ind+') a').each(function(j, e){
                val = $(this).html()
                console.log(val)
                if(val.trim() == "")
                    val = NaN
                data.push({ 
                    'x': row_labels[j],
                    'y': val,
                })
            });
            datasets.push({
                label: cols[ind],
                data: data,
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                borderColor: border_colors[i],
            })
            i++;
        });
        ylabel = 'Throughput (Gbps)'
        if($("div.chart-panel").find("h2").text().indexOf("lat") != -1)
            ylabel = 'Latency in micro-seconds (us)'
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
    var perfy_chart_verb_lat = function() {
        if($('table tr.data:eq(0)').find('td[type=us]').length > 0) {
            $('div.chart-panel').append("<h2>Trend: Latency</h2>");
            $('div.chart-panel').append("<canvas id='latChart' width='600' height='400'></canvas>");
        } else {
          return;
        }
        var ctx = document.getElementById("latChart").getContext('2d');
        var border_colors =  [
            //'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            //'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            //'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            //'rgba(55,199,122,1)',
            'rgba(154, 162, 35, 1)',
            //'rgba(55, 206, 186, 1)',
            'rgba(175, 19, 62, 1)',
            //'rgba(134, 124, 25, 1)',
            'rgba(89, 190, 164, 1)',
        ]
        row_labels = []
        $('table tr.data').find('th:eq(0) p').each(function(){
            row_labels.push($(this).html())
        });
        datasets = [];
        i=0;
        $('table tr.data:eq(0)').find('td[type=us]').each(function(){
            ind = $(this).index()-1;
            th = $('table tr.header.last th:eq('+ind+')')
            box = $('<label class="box"></label');
            box.css('background-color',border_colors[i]);
            th.append(box);
            data = []
            $('table tr.data').find('td:eq('+ind+') a').each(function(j, e){
                val = $(this).html()
                if(val.trim() == "")
                    val = NaN
                data.push({ 
                    'x': row_labels[j],
                    'y': val,
                })
            });
            datasets.push({
                label: cols[ind],
                data: data,
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                borderColor: border_colors[i],
            })
            i++;
        });
        ylabel = 'Latency (us)'
        if($("div.chart-panel").find("h2").text().indexOf("lat") != -1)
            ylabel = 'Latency (us)'
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
    perfy_chart_verb_bw();
    perfy_chart_verb_lat();
});
