import pandas as pd
from bs4 import BeautifulSoup
import os
def pandasArray_to_html(df:pd.DataFrame,columns:list,log_id : list = None,base_url = None):
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
        for row , id in zip(tbody.find_all("tr"),log_id):
            log_url = os.path.join(base_url,"perfy","log",str(int(id)))
            row.attrs['onclick'] = f"window.open('{log_url}')"
    
    return str(table)