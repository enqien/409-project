$(document).ready(function(){
    $(document).on({
        ajaxStart: function() { $(document).addClass('loading').addClass("load-modal");  },
        ajaxStop: function() { $(document).removeClass('loading').removeClass("load-modal"); }
    });
    jQuery.fn.extend({
        drag_me: function(opt) {
            args = {
                helper: function(e,ui) {
                    var clone = $(this).clone();
                    clone.find('p').text(clone.find('a').text());
                    clone.find('a').remove();
                    clone.css('list-style','none');
                    clone.css('z-index','102');
                    clone.css('background-color','#FFE6E6');
                    clone.css('border-radius','6px');
                    clone.css('padding','10px');
                    return clone;
                }
            }
            jQuery.extend(args, opt);
            $(this).draggable(args);
        }
    });
    var get_merge_type = function() {
        arr = $('div.merge-panel div.container ul.merge-ul li.merge-item').map(function(e) { 
            return $(this).attr('type'); 
        }).toArray();
        if(arr.length == 0) {
            return "ALL"
        }else{
            return arr.reduce(function(a, b){ 
                return (a === b) ? a : NaN; 
            }); 
        }
    }
    var get_curr_merge_ids = function() {
        return $('div.merge-panel div.container ul.merge-ul li.merge-item').map(function(e) { 
            return "#"+$(this).attr('id'); 
        }).toArray();
        //$('div.main li.matrix').not(arr.join(','))
    }
    var refresh_draggable = function() {
        type=get_merge_type();
        // Clear all draggable states first
        $('div.main li').css('background-color',''); 
        $('div.main li').drag_me({ disabled: true });
        
        // Make ALL draggable or if type exists in merge items then just enable
        // for that type and not the rest
        if(type != undefined  && ( type == NaN || type=="ALL")) {
            $('div.main li').css('background-color','#FFE6E6'); 
            $('div.main li').drag_me({ disabled: false, revert: "valid" });
        } else {
            $('div.main li.matrix[type="'+type+'"').not(get_curr_merge_ids().join(',')).css('background-color','#FFE6E6'); 
            $('div.main li.matrix[type="'+type+'"').not(get_curr_merge_ids().join(',')).drag_me({ disabled: false, revert: "valid" });
        }
    }
    var populate_cols = function(id, ul, a) {
        // POST get cols for matrix
        $.ajax({
            url: "/perfy/post_matrix_cols",
            type: 'POST',
            dataType: "json",
            data: {
                'data' : JSON.stringify({
                    'id': id,
                })
            },
            success: function(data) {
                if(data==undefined || !data['success']) {
                     alert("Invalid Matrix Data");
                     return;
                }
                li = "<li class='merge-item' id='"+id+"' type='"+type+"'>"+
                     "<div class='merge-item-div'>"+
                     "<p class='name'>"+a+"</p>"+
                     "<label class='delete'>x</label>"+
                     "</div><ul class='merge-cols'>";
                for(i=0; i<data['data'].length; i++) {
                     li += "<li class='col-item' id='"+data['data'][i]['col__id']+"'>"+
                           "<input type='checkbox' checked/>"+
                           "<p>"+data['data'][i]['col__name']+"</p></li>";
                }
                li += "</ul></li>";
                ul.append($(li));
                refresh_draggable();
            },
            failure: function(data) {
                alert("Error: Please contact sysadmin");
            },
            error: function(data) {
                alert("Error: Please contact sysadmin");
            }
        })
    }
    $('p.description.archived').click(function(){
        ol = $(this).next()
        if (undefined ==  $(this).attr('loaded')) {
            url_archived_matrices="/perfy/archived_matrices"
            $(document).addClass('loading').addClass("load-modal")
            $.ajax({
                url: "/perfy/archived_matrices",
                dataType: "json",
                data: {},
                success: function(data) {
                    $(document).removeClass('loading').removeClass("load-modal"); 
                    if(data==undefined || !data['success']) {
                         alert("Invalid Matrix Data");
                         return;
                    }
                    for(i=0; i<data['archived'].length; i++) {
                        li = "<li class='matrix' id='"+data['archived'][i]['id']+
                            "' type='"+data['archived'][i]['type']+"'>"+
                            "<a href='/perfy/matrix/"+data['archived'][i]['id']+"'>"+
                            data['archived'][i]['name']+"</a>"+
		            "<p>"+data['archived'][i]['updatedte']+"</p></li>"
                        ol.append(li)
                    }
                },
                failure: function(data) {
                    $(document).removeClass('loading').removeClass("load-modal"); 
                    alert("Error: Please contact sysadmin");
                },
                error: function(data) {
                    $(document).removeClass('loading').removeClass("load-modal"); 
                    alert("Error: Please contact sysadmin");
                }
            })
            $(this).attr('loaded','loaded')
        }
        ol.slideToggle()
    })
    $('p.merge-link').click(function(){
        if(!$('div.merge-panel div.container').is(':visible')) {
            refresh_draggable();
        }else{
           $('div.main li').css('background-color',''); 
           $('div.main li').draggable({ disabled: true });
        }
        $('div.merge-panel div.container').toggle("slide", {direction:'right'});
    });
    $( "#droppable" ).droppable({
          tolerance: 'pointer',
          hoverClass: "merge-drag",
          accept: function(d) {
            if(d.hasClass("matrix")){
                return true;
            }
          },       
          drop: function( event, ui ) {
            $(this).find('p.helper').hide();
            $('div.merge-panel p.submit').show();
            ul = $(this).find('ul.merge-ul');
            id = ui.draggable.attr('id')
            type = ui.draggable.attr('type')
            a = ui.draggable.find('a').text();
            populate_cols(id,ul,a);
          }
    });
    $('div.merge-panel').on({
        'click': function(){
            if(confirm('Remove matrix from merge list?')) {
                $(this).parent().parent().remove();
                refresh_draggable();
                if($('div.merge-panel ul.merge-ul').find('li').length == 0) {
                    $('div.merge-panel').find('p.helper').show();
                    $('div.merge-panel p.submit').hide();
                }
            }
        }
    }, 'label.delete');
    $('div.merge-panel').on({
        'click': function(){
            ret = []
            m_id = 0
            $('div.merge-panel').find('li.merge-item').each(function(){
                m_id = $(this).attr('id');
                $(this).find('li.col-item').each(function(){
                    c_id = $(this).attr('id');
                    if($(this).find('input').is(':checked'))
                        ret.push("col_"+m_id+"_"+c_id);
                });
            });
            if($('div.merge-panel').find('li.merge-item').length > 1)
                m_id = 0  
            window.location = "/perfy/matrix/0/?"+ret.join('&');
        }
    }, 'p.submit');
});

