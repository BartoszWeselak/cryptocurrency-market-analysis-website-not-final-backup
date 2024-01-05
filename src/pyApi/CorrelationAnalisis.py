import mysql.connector
import pandas as pd
from statsmodels.tsa.stattools import adfuller
import sys
import numpy as np
import statsmodels.api as sm
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.arima.model import ARIMA
from datetime import datetime, timedelta

import json

# Ustawienia połączenia
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1111",
    database="dev_project"
)

# Sprawdzenie czy podano  argument
if len(sys.argv) < 2:
    print("no argument given.")
    sys.exit(1)

# Sprawdzenie czy podano drugi argument
if len(sys.argv) < 3:
    print("need second arg")
    sys.exit(1)

# Pobranie argumentu
currency_id = sys.argv[1]
days=sys.argv[2]

# Pobranie danych z bazy danych dla określonego currencyId
mycursor = mydb.cursor()
mycursor.execute(f"SELECT * FROM currencysnapshot where currencyId={currency_id} order by snapshotDate desc limit {days} ")
data_first_currency  = mycursor.fetchall()
df_first_currency  = pd.DataFrame(data_first_currency, columns=[i[0] for i in mycursor.description])
df_first_currency.sort_values('snapshotDate', inplace=True)#sortowanie po dacie
# Wybór danych dla wybranej kryptowaluty
selected_currency_data = df_first_currency[['snapshotDate', 'price']].copy()
selected_currency_data.set_index('snapshotDate', inplace=True)

# Pobranie danych dla wszystkich kryptowalut z bazy danych
all_currencies_query = "SELECT DISTINCT currencyId FROM currencysnapshot"
mycursor.execute(all_currencies_query)
all_currencies = [result[0] for result in mycursor.fetchall()]

# Inicjalizacja DataFrame dla korelacji
correlation_data = pd.DataFrame(index=selected_currency_data.index)
print(df_first_currency.columns)

# Iteracja przez wszystkie kryptowaluty
for other_currency_id in all_currencies:
    if other_currency_id == currency_id:
        continue  # Pominięcie tej samej kryptowaluty
    query = f"SELECT snapshotDate, Price FROM currencysnapshot WHERE currencyId={other_currency_id} ORDER BY snapshotDate DESC LIMIT {days}"
    mycursor.execute(query)
    data_other_currency = mycursor.fetchall()
    df_other_currency = pd.DataFrame(data_other_currency, columns=[i[0] for i in mycursor.description])
    df_other_currency.set_index('snapshotDate', inplace=True)

    # Dołączenie danych dla obecnej kryptowaluty i obliczenie korelacji
    correlation_data[f'correlation_{other_currency_id}'] = selected_currency_data['Price'].corr(df_other_currency['Price'])

# Wyświetlenie wyników
print(correlation_data)
