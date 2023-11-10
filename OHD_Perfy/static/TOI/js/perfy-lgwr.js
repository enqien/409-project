$(document).ready(function(){
    (function( $ ) {
        var get_rds_hist_data = function(cell_id, histogram) {
            $.ajax({
                url: "/perfy/rds_histogram",
                type: 'GET',
                dataType: "json", 
                data: { 
                    'data' : JSON.stringify({
                        'id': cell_id,
                    })
                },
                success: function(data) {
                    if(data['success']) {
                        //console.log(cell_id);
                        //console.log(data);
                        rds_labels = data['labels']
                        rds_values = data['values']
                        histogram.html("<div class='histogram-dialog'></div>");
                        histogram.find('.histogram-dialog').append('<canvas id="histogram-chart" width="800" height="450"></canvas>')
                        try {
                            new Chart(document.getElementById("histogram-chart"), {
                                type: 'bar',
                                data: {
                                  labels: rds_labels,
                                  datasets: [
                                    {
                                      label: "rds-stress latency (us)",
                                      backgroundColor: ["#3cba9f", "#3cba9f","#3cba9f", "#3cba9f",
                                                        "#3cba9f", "#3cba9f","#3cba9f", "#3cba9f",
                                                        "#3cba9f", "#3cba9f","#3cba9f", "#3cba9f",
                                                        "#3cba9f", "#3cba9f","#3cba9f", "#3cba9f"],
                                      data: rds_values,
                                    }
                                  ]
                                },
                                options: {
                                  legend: { display: false },
                                  title: {
                                    display: true,
                                    text: 'rds-stress latency histogram'
                                  }
                                }
                            });
                        } catch(err) {
                            console.log("Failed to render Chart");
                        }
                        histogram.find('.histogram-dialog').append('<table class="latency"><tr><th>Latency (us)</th><th>IOPS</th></tr></table>');
                        table = histogram.find('table.latency');
                        for(i=0;i<rds_labels.length;i++) {
                            table.append('<tr><td>'+rds_labels[i]+'</td><td>'+rds_values[i]+'</td>'); 
                        }
                        //for(i=0;i<data['data'].length;i++){
                            //console.log(data['data'][i]);
                        //}
                    } else {
                        alert("Error: Please contact sysadmin");
                    }
                },
                failure: function(data) {
                    alert("Failed:  Please contact sysadmin");
                },
                error: function(data) {
                    alert("Error:  Please contact sysadmin");
                },
            });
        }
        $.fn.histogram_rds = function(options) {
            var settings = $.extend({
            // These are the defaults.
              id: -1,
            }, options );
            return this.each(function() {
                // Tooltip logic
                get_rds_hist_data(settings.id, $(this));
            });
        };
    }( jQuery ));

    // MAIN
    $('.histogram').dialog({ 
      modal:true, 
      resizable:false,
      autoOpen: false ,
      show: "fade",
    });
    $('.histogram').parent().find('.ui-dialog-titlebar-close').hide();
    var delay=1000, setTimeoutConst;
    $( '[rds-data]' ).hover(function(e) {
        t=$(this)
        setTimeoutConst = setTimeout(function(){
            $('.histogram').dialog( "option", { position: { my: 'left', at: 'right', of: t } }).dialog( 'open' )
            $('.histogram').histogram_rds({ 'id': t.attr('cellid') });
        }, delay);
    },function() {
        clearTimeout(setTimeoutConst );
        $('.histogram').dialog( "close" );
    });
    try {
        colors = ["#00008b", "#f93416","#3cba9f", "#3cba9f","#3cba9f", "#3cba9f","#3cba9f", "#3cba9f"]
        chart_name = $('div.slider').find('label.selected').text().toLowerCase()
        rds_data_arr = []
        $('tr.cell-row').eq('0').find('td.cell.rds-data').each(function(){
            c=$(this).index('td.cell.rds-data')
            tmp = []
            $('tr.cell-row').each(function(){
                if(chart_name == "latency"){
                    tmp.push($(this).find('td.rds-data:eq('+c+')').next().next().text().trim())
                } else {
                    tmp.push($(this).find('td.rds-data:eq('+c+')').find('a').text().trim())
                }
            })
            rds_data_arr.push(tmp)
        })
        rds_data = []
        for(i=0;i<rds_data_arr.length;i++){
            data = rds_data_arr[i].map(function (x) {
                return parseInt(x, 10);
            })
            rds_data.push({
                'label': $('th[col]').eq(i).text().trim(),
                'backgroundColor': colors[i],
                'data': data
            })
        }
        row_names = []
        $('tr.cell-row').each(function(){
            tmp = []
            $(this).find('td.rds-data').each(function(){
                tmp.push($(this).attr('row'))
            })
            row_names.push(Array.from(new Set(tmp.filter(function(n){ return n != "" })))[0])
        });
        ylabel = "IOPs"
        yticks = {
          beginAtZero:true,
          scaleOverride : true,
          suggestedMin: 0, 
          scaleSteps : 10,
        }
        if(chart_name == "iops"){
           ylabel = "1M (Elephant) IOPs"
        }else if(chart_name == "throughput"){
           ylabel = "1M (Elephant) Throughput (GBps)"
        }else if(chart_name == "latency"){
           ylabel = "8K (Mice) Latency (us)"
           yticks['max'] = 200
        }else if(chart_name == "all"){
           chart_name=""
           ylabel = "1M (Elephant) Throughput (IOPs)"
        }
        new Chart(document.getElementById("rds-chart"), {
            type: 'bar',
            data: {
              labels: row_names,
              datasets: rds_data
            },
            options: {
              legend: { display: false },
              title: {
                display: true,
                text: 'Log Write (rds-stress) '+chart_name+' histogram'
              },
              scales: {
                  xAxes: [{
                    ticks: {
                      autoSkip: false,
                      maxRotation: 90,
                      minRotation: 90
                    }
                  }],
                  yAxes: [{
                    ticks: yticks,
                    scaleLabel: {
                      display: true,
                      labelString: ylabel
                    }
                  }]
              }
            }
        });
    } catch(err) {
        console.log("Failed to render Chart"+err);
    }
    $('div.slider').on({
        'click': function(e) {
            url=window.location.href
            p="?"
            if(url.indexOf('?') >= 0) {
                p="&"
            }

            if(url.indexOf(p+'t=') >= 0) {
                if(p=='?')
                    url=url.replace(/\?t=\w+/,'')
                else if(p=='&')
                    url=url.replace(/&t=\w+/,'')
            }
            window.location.href = url+p+"t="+$(this).attr('val');
        }
    },'label.opt');
});
