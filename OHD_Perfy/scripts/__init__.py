import pandas as pd
from django.views.decorators.csrf import csrf_exempt
from ..models import TasksInfo , SystemsInfo , LogsContent , LogsInfo
from django.shortcuts import get_object_or_404
from django.http import HttpResponse  , HttpResponseBadRequest
from django.db import connections
from bs4 import BeautifulSoup
import os

def pandasArray_to_html(df:pd.DataFrame,columns : str,log_id : list = None,base_url = None):
    """
    Input:
        df : the dataframe for the format that you want to display
        columns: all the columns
    Return: 
        <HTML string>
        For example: 
        <table>
            <thead>
            <tr>
                <th>
                    processor_num
                </th>
                ...
            </tr>
            </thead>
        </table>
    """
    # find the tbody
    html_table = df.to_html()
    soup = BeautifulSoup(html_table, 'html.parser')
    tbody = soup.find("tbody")
    
    # get the thead
    soup = BeautifulSoup()
    table = soup.new_tag('table')
    thead = soup.new_tag('thead')
    tr = soup.new_tag('tr')
    for col in columns:
        th = soup.new_tag('th')
        th.string = col
        tr.append(th)
    thead.append(tr)
    
    
    # add them into the table
    table.append(thead)
    table.append(tbody)
    
    
    # add log_info to every raw
    if log_id:
        marked_ids = set([int(i.id) for i in LogsInfo.objects.filter(marked = True)])
        for row , id in zip(tbody.find_all("tr"),log_id):
            log_url = os.path.join(base_url,"perfy","log",str(int(id)))
            row.attrs['onclick'] = f"window.open('{log_url}')"
            if int(id) in marked_ids:
                for cell in row.find_all("td"):
                    cell.attrs['class'] = "marked"
    return str(table)


def query_table(connection,table_name):
    query = f"SELECT * FROM {table_name}"
    df = pd.read_sql_query(query, connection)
    return df

def delete_table(connection,table_name):
    with connection.cursor() as cursor:
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        
@csrf_exempt
def delete_logs(log_id):
    logs_info = get_object_or_404(LogsInfo, id=log_id)
    logs_content = LogsContent.objects.filter(log_id=log_id)
    logs_info.delete()
    logs_content.delete()
    return