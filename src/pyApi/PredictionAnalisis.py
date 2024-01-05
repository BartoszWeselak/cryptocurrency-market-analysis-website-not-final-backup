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

#print(f" second currency {second_currency_id}")

# Pobranie danych z bazy danych dla określonego currencyId
mycursor = mydb.cursor()
mycursor.execute(f"SELECT * FROM currencysnapshot where currencyId={currency_id} order by snapshotDate desc limit {days} ")
data_first_currency  = mycursor.fetchall()
df_first_currency  = pd.DataFrame(data_first_currency, columns=[i[0] for i in mycursor.description])
df_first_currency.sort_values('snapshotDate', inplace=True)#sortowanie po dacie

#utility test
dates_frist_currency =  df_first_currency['snapshotDate'].astype(str).tolist()
#przyszle daty
last_date = datetime.strptime(dates_frist_currency[-1], "%Y-%m-%d")
future_dates_frist_currency = [last_date + timedelta(days=i) for i in range(1, 31)]
future_dates_frist_currency = [date.strftime("%Y-%m-%d") for date in future_dates_frist_currency]
result = adfuller(df_first_currency['price'])

#Trend liniowy
def calculate_linear_trend(df):
    x = np.arange(len(df['price']))
    y = df['price']
    slope, intercept = np.polyfit(x, y, 1)
    X = sm.add_constant(x)
    model = sm.OLS(y, X)
    results = model.fit()
    y_pred = results.predict(X)
    r2 = results.rsquared
    rmse = np.sqrt(results.mse_resid)
    return y_pred, r2, rmse
#logarytmiczny
def calculate_logarithmic_trend(df):
    x = np.arange(len(df['price']))
    log_y = np.log(df['price'])
    log_slope, log_intercept = np.polyfit(x, log_y, 1)
    log_y_pred = log_slope * x + log_intercept
    log_r2 = 1 - (sum((log_y - log_y_pred) ** 2) / ((len(log_y) - 1) * np.var(log_y, ddof=1)))
    log_rmse = np.sqrt(np.mean((log_y - log_y_pred) ** 2))
    return log_y_pred, log_r2, log_rmse
#potegowy
def calculate_power_trend(df):
    x = np.arange(len(df['price']))
    pow_y = np.power(df['price'], 2)  # kwadrat
    
    pow_slope, pow_intercept = np.polyfit(x, pow_y, 1)
    pow_y_pred = pow_slope * x + pow_intercept
    pow_r2 = 1 - (sum((pow_y - pow_y_pred) ** 2) / ((len(pow_y) - 1) * np.var(pow_y, ddof=1)))
    pow_rmse = np.sqrt(np.mean((pow_y - pow_y_pred) ** 2))
    return pow_y_pred, pow_r2, pow_rmse
#wykladniczy
def calculate_exponential_trend(df):
    x = np.arange(len(df['price']))
    normalized_data = (df['price'] - df['price'].min()) / (df['price'].max() - df['price'].min())
    exp_y = np.exp(normalized_data)
    exp_slope, exp_intercept = np.polyfit(x, exp_y, 1)
    exp_y_pred = exp_slope * x + exp_intercept
    exp_r2 = 1 - (sum((exp_y - exp_y_pred) ** 2) / ((len(exp_y) - 1) * np.var(exp_y, ddof=1)))
    exp_rmse = np.sqrt(np.mean((exp_y - exp_y_pred) ** 2))
    return exp_y_pred, exp_r2, exp_rmse

#Porównanie trendów
def compare_trends(r2_scores, rmse_scores):
    trends = ['linear', 'logarithmic', 'power', 'exponential']
    best_r2 = max(r2_scores)
    best_rmse = min(rmse_scores)

    best_trend_index_r2 = r2_scores.index(best_r2)
    best_trend_index_rmse = rmse_scores.index(best_rmse)

    if best_trend_index_r2 == best_trend_index_rmse:
        best_trend = trends[best_trend_index_r2]
       # print(f"best trend is: {best_trend} R^2: {best_r2} and RMSE: {best_rmse}")
    else:
        best_trend_r2 = trends[best_trend_index_r2]
        best_trend_rmse = trends[best_trend_index_rmse]
       # print(f"conflict: {best_trend_r2} (R^2) and {best_trend_rmse} (RMSE)")

#z
def get_chosen_trend(df, r2_scores, rmse_scores):
    best_trend_index_r2 = np.argmax(r2_scores)
    best_trend_index_rmse = np.argmin(rmse_scores)

    if best_trend_index_r2 == best_trend_index_rmse:
        if best_trend_index_r2 == 0:
            return 'Linear', linear_trend, r2_linear, rmse_linear
        elif best_trend_index_r2 == 1:
            return 'Logarithmic', log_trend, r2_log, rmse_log
        elif best_trend_index_r2 == 2:
            return 'Power', power_trend, r2_power, rmse_power
        elif best_trend_index_r2 == 3:
            return 'Exponential', exp_trend, r2_exp, rmse_exp
    else:
        return get_trend_based_on_r2(df, r2_scores, rmse_scores)

def get_trend_based_on_r2(df, r2_scores, rmse_scores):
    best_trend_index_r2 = np.argmax(r2_scores)
    
    if best_trend_index_r2 == 0:
        return 'Linear', linear_trend, r2_scores[0], rmse_scores[0]
    elif best_trend_index_r2 == 1:
        return 'Logarithmic', log_trend, r2_scores[1], rmse_scores[1]
    elif best_trend_index_r2 == 2:
        return 'Power', power_trend, r2_scores[2], rmse_scores[2]
    elif best_trend_index_r2 == 3:
        return 'Exponential', exp_trend, r2_scores[3], rmse_scores[3]
    


last_30_days = df_first_currency.tail(30)
time_series = pd.Series(last_30_days['price'].values)
model = ARIMA(time_series, order=(30, 1, 1))  # Dostosuj te wartości
results = model.fit()
forecast_steps = 30
forecast = results.get_forecast(steps=forecast_steps) 
forecast_predicted_mean_no_index = forecast.predicted_mean.values

if result[1] <= 0.05:
        
    
    print(forecast_predicted_mean_no_index)
else: 
    linear_trend, r2_linear, rmse_linear = calculate_linear_trend(df_first_currency)
    log_trend, r2_log, rmse_log = calculate_logarithmic_trend(df_first_currency)
    power_trend, r2_power, rmse_power = calculate_power_trend(df_first_currency)
    exp_trend, r2_exp, rmse_exp = calculate_exponential_trend(df_first_currency)
    # Przykładowe wyniki dla R^2 i RMSE dla różnych trendów
    r2_scores = [r2_linear, r2_log, r2_power, r2_exp]
    rmse_scores = [rmse_linear, rmse_log, rmse_power, rmse_power]
    # Porównanie trendów
    compare_trends(r2_scores, rmse_scores)
    chosen_trend, trend_function, chosen_r2, chosen_rmse = get_chosen_trend(df_first_currency, r2_scores, rmse_scores) 
    if  chosen_r2 > 0.71:
        print(chosen_rmse)
    else:
        print(forecast_predicted_mean_no_index)

delete_query = f"DELETE FROM CurrencyPrediction WHERE currencyId = {currency_id}"
mycursor.execute(delete_query)

# Zatwierdź zmiany w bazie danych
mydb.commit()



# Iteracja przez przewidywane wartości i daty
for i in range(len(forecast_predicted_mean_no_index)):
    predicted_price = forecast_predicted_mean_no_index[i]
    prediction_date = future_dates_frist_currency[i]
    
    # Wstaw dane do tabeli "Prediction"
    query = f"INSERT INTO CurrencyPrediction (price, predictionDate, currencyId) VALUES ({predicted_price}, '{prediction_date}', {currency_id})"
    mycursor.execute(query)

# Zatwierdź zmiany w bazie danych
mydb.commit()
mydb.close()

# Informacja o zapisaniu danych
print("Predictions saved to the 'Prediction' table")
