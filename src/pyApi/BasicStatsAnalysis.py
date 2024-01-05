import mysql.connector
import pandas as pd
from statsmodels.tsa.stattools import adfuller
import sys
import numpy as np
import statsmodels.api as sm
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.arima.model import ARIMA
from datetime import datetime, timedelta
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

currency_id = sys.argv[1]
days=sys.argv[2]
# Pobranie danych z bazy danych dla określonego currencyId
mycursor = mydb.cursor()
mycursor.execute(f"SELECT * FROM currencysnapshot where currencyId={currency_id} order by snapshotDate desc limit {days} ")
data_first_currency  = mycursor.fetchall()
df_first_currency  = pd.DataFrame(data_first_currency, columns=[i[0] for i in mycursor.description])
df_first_currency.sort_values('snapshotDate', inplace=True)#sortowanie po dacie

#utility test

result = adfuller(df_first_currency['price'])




#podstawowe parametry
def calculate_basic_statistics(df):
    basic_stats = {
        'mean': df['price'].mean(),
        'std': df['price'].std(),
        'min': df['price'].min(),
        'max': df['price'].max(),
        'median': df['price'].median(),
        'quantiles': df['price'].quantile([0.25, 0.5, 0.75]).tolist()
    }
    return basic_stats


basic_stats = calculate_basic_statistics(df_first_currency)
print(basic_stats)

check_query = f"SELECT id FROM CurrencyStatistics WHERE currencyId = {int(currency_id)} LIMIT 1"
mycursor.execute(check_query)
existing_entry = mycursor.fetchone()

if existing_entry:
    # Jeśli istnieje, usuń go
    delete_query = f"DELETE FROM CurrencyStatistics WHERE currencyId = {int(currency_id)}"
    mycursor.execute(delete_query)
    mydb.commit()

# Tworzenie instancji modelu CurrencyStatistics
currency_statistics_values = (
    basic_stats['mean'],
    basic_stats['std'],
    basic_stats['min'],
    basic_stats['max'],
    basic_stats['median'],
    basic_stats['quantiles'][0],
    basic_stats['quantiles'][1],
    basic_stats['quantiles'][2],
    int(currency_id)
)

# Tworzenie zapytania SQL do wstawienia danych
insert_query = """
    INSERT INTO CurrencyStatistics (mean, stdDev, min, max, median, quantile25, quantile50, quantile75, currencyId)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# Wykonanie zapytania SQL
mycursor.execute(insert_query, currency_statistics_values)

# Potwierdzenie zmian w bazie danych
mydb.commit()

# Zamknięcie kursora i połączenia
mycursor.close()
mydb.close()

