import pymysql
import pandas as pd
import sys


class CSV_Reader(object):
    def __init__(self,database_connection,data_frame:pd.DataFrame,table_name,index_cols):
        self.connect = database_connection
        self.cursor = self.connect.cursor()
        self.data = data_frame
        self.table = table_name
        self.index_cols = index_cols
    def create_table(self):
        columns_cmd = []
        for col_name in self.data.columns:
            if col_name in self.index_cols:
                columns_cmd.append(f"`{col_name}` varchar(255)")
            else:
                columns_cmd.append(f"`{col_name}` FLOAT")
        columns_cmd = ",".join(columns_cmd)
        sql = f"create table if not exists `{self.table}`({columns_cmd})default charset=utf8;"
        self.cursor.execute(sql)
        self.commit()
        return f"Create {self.table}"
    def insert_data(self):
        columns_cmd = []
        for col_name in self.data.columns:
            columns_cmd.append(f"`{col_name}`")
        columns_cmd = ",".join(columns_cmd)
        for idx,line in enumerate(self.read_csv_values()):
            line = tuple([str(i) for i in line])
            sql = f"""insert into `{self.table}`({columns_cmd}) values {tuple(line)}"""
            self.cursor.execute(sql)
            self.commit()
        return f"Insert {idx + 1} lines in {self.table}"
    def __del__(self):
        self.connect.close()
        self.cursor.close()
    def read_csv_values(self):
        data_3 = list(self.data.values)
        return data_3
    def commit(self):
        self.connect.commit()
    def run(self):
        print(self.create_table())
        print(self.insert_data())
        


class JSON_Reader(object):
    def __init__(self,database_connection,json:dict,table_name,index_cols):
        self.connect = database_connection
        self.cursor = self.connect.cursor()
        self.data = json
        self.table = table_name
        self.index_cols = index_cols
    def create_table(self):
        columns_cmd = []
        for col_name in self.data:
            if col_name in self.index_cols:
                columns_cmd.append(f"`{col_name}` varchar(255)")
            else:
                columns_cmd.append(f"`{col_name}` FLOAT")
        columns_cmd = ",".join(columns_cmd)
        sql = f"create table if not exists `{self.table}`({columns_cmd})default charset=utf8;"
        self.cursor.execute(sql)
        self.commit()
        return f"Create {self.table}"
    def insert_data(self):
        columns_cmd = []
        value_cmd = []
        for col_name , value in self.data.items():
            if not value:
                continue
            columns_cmd.append(f"`{col_name}`")
            value_cmd.append(str(value))
        columns_cmd = ",".join(columns_cmd)
        sql = f"""insert into `{self.table}`({columns_cmd}) values {tuple(value_cmd)}"""
        self.cursor.execute(sql)
        self.commit()
        return f"Insert 1 lines in {self.table}"
    def __del__(self):
        self.connect.close()
        self.cursor.close()
    def read_csv_values(self):
        data_3 = list(self.data.values)
        return data_3
    def commit(self):
        self.connect.commit()
    def run(self):
        print(self.create_table())
        print(self.insert_data())