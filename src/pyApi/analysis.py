import mysql.connector
import pandas as pd
from statsmodels.tsa.stattools import adfuller
import sys
import numpy as np
import statsmodels.api as sm
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.arima.model import ARIMA

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
second_currency_id = None
#opcjonalny argument
if len(sys.argv) >= 4:
    second_currency_id = sys.argv[3]

#print(f" second currency {second_currency_id}")

# Pobranie danych z bazy danych dla określonego currencyId
mycursor = mydb.cursor()
mycursor.execute(f"SELECT * FROM currencysnapshot where currencyId={currency_id} order by snapshotDate desc limit {days} ")
data_first_currency  = mycursor.fetchall()
df_first_currency  = pd.DataFrame(data_first_currency, columns=[i[0] for i in mycursor.description])
df_first_currency.sort_values('snapshotDate', inplace=True)#sortowanie po dacie

#utility test
dates_frist_currency =  df_first_currency['snapshotDate'].astype(str).tolist()
#print(dates)


#pobieranie drugiej waluty
if second_currency_id:
    mycursor.execute(f"SELECT * FROM currencysnapshot WHERE currencyId={second_currency_id} ORDER BY snapshotDate DESC LIMIT {days}")
    data_second_currency = mycursor.fetchall()
    df_second_currency = pd.DataFrame(data_second_currency, columns=[i[0] for i in mycursor.description])
    df_second_currency.sort_values('snapshotDate', inplace=True)
    dates_second_currency =  df_second_currency['snapshotDate'].astype(str).tolist()

else:
    df_second_currency = None
    
    
# Zamknięcie połączenia
mydb.close()

# Test stacjonarności
result = adfuller(df_first_currency['price'])
#print('ADF statiscic:', result[0])
#print('p-value:', result[1])
#   Test stacjonarności dla drugiej waluty 
if second_currency_id:
    result_second_currency = adfuller(df_second_currency['price'])

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
def calculate_correlation(df1, df2):
      # Pobranie kolumny z ceną pierwszej kryptowaluty
    price_first_currency = df1['price']

    # Pobranie kolumny z ceną drugiej kryptowaluty
    price_second_currency = df2['price']

    # Obliczenie współczynnika korelacji
    correlation_coefficient = np.corrcoef(price_first_currency, price_second_currency)[0, 1]

    return correlation_coefficient

# Sprawdzenie wyniku testu i wypisanie komunikatu
#if result[1] <= 0.05:

last_30_days = df_first_currency.tail(30)
time_series = pd.Series(last_30_days['price'].values)
model = ARIMA(time_series, order=(14, 1, 1))  # Dostosuj te wartości
results = model.fit()
forecast_steps = 14
forecast = results.get_forecast(steps=forecast_steps)
   
forecast_predicted_mean_no_index = forecast.predicted_mean.values

basic_stats = calculate_basic_statistics(df_first_currency)


if result[1] <= 0.05:
    
    #model = auto_arima(df_first_currency['price'], suppress_warnings=True, seasonal=True, stepwise=True) 
    #p, d, q = model.order
    #future_steps = int(days)
    #forecast, conf_int = model.predict(n_periods=future_steps, return_conf_int=True)
 
   #test
   

   #test
    if second_currency_id and result_second_currency[1] <= 0.05:
       # basic_stats_second_currency = calculate_basic_statistics(df_second_currency)
       # model_second_currency = auto_arima(df_second_currency['price'], suppress_warnings=True, seasonal=True, stepwise=True)
       # p_second_currency, d_second_currency, q_second_currency = model_second_currency.order
       # future_steps_second_currency = int(days)
       # forecast_second_currency, conf_int_second_currency = model_second_currency.predict(n_periods=future_steps_second_currency, return_conf_int=True)
         correlation = calculate_correlation(df_first_currency, df_second_currency)
         last_30_days_second_currency = df_second_currency.tail(30)
         time_series_second_currency = pd.Series(last_30_days_second_currency['price'].values)
         model_second_currency = ARIMA(time_series_second_currency, order=(14, 1, 1))  # Dostosuj te wartości
         results_second_currency = model_second_currency.fit()
         forecast_steps_second_currency = 14
         forecast_second_currency = results_second_currency.get_forecast(steps=forecast_steps_second_currency)
         forecast_predicted_mean_no_index_second_currency = forecast_second_currency.predicted_mean.values
         basic_stats_second_currency=calculate_basic_statistics(df_second_currency)
         
         print(json.dumps({
         "status": "success",
         "message": "timeseries are stationary.", 
         "correlation":correlation,
         "basic_stats_first_currency":basic_stats,
         "basic_stats_second_currency":basic_stats_second_currency,
         "forecast_first_currency":forecast_predicted_mean_no_index.tolist(),
         "forecast_second_currency":forecast_predicted_mean_no_index_second_currency.tolist(),
    }))
    elif second_currency_id:
        print(json.dumps({
        "status": "success",
        "message": "first timeseries stationary and second is not."
    }))
    else:
         print(json.dumps({
             "status": "success",
             "message": "timeseries is stationary.",
             "basic_stats_first_currency":basic_stats,
             "forecast_first_currency":forecast_predicted_mean_no_index.tolist(),
              
    }))
else:
    #arima
    
    #print("timeseries is non stationary.")
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
    if second_currency_id and result_second_currency[1] >= 0.05:
        correlation = calculate_correlation(df_first_currency, df_second_currency)
        linear_trend_second_currency, r2_linear_second_currency, rmse_linear_second_currency = calculate_linear_trend(df_second_currency)
        log_trend_second_currency, r2_log_second_currency, rmse_log_second_currency = calculate_logarithmic_trend(df_second_currency)
        power_trend_second_currency, r2_power_second_currency, rmse_power_second_currency = calculate_power_trend(df_second_currency)
        exp_trend_second_currency, r2_exp_second_currency, rmse_exp_second_currency = calculate_exponential_trend(df_second_currency)
        r2_scores_second_currency = [r2_linear_second_currency, r2_log_second_currency, r2_power_second_currency, r2_exp_second_currency]
        rmse_scores_second_currency = [rmse_linear_second_currency, rmse_log_second_currency, rmse_power_second_currency, rmse_power_second_currency]
        compare_trends(r2_scores_second_currency, rmse_scores_second_currency)
        chosen_trend_second_currency, trend_function_second_currency, chosen_r2_second_currency, chosen_rmse_second_currency = get_chosen_trend(df_second_currency, r2_scores_second_currency, rmse_scores_second_currency)
        basic_stats_second_currency=calculate_basic_statistics(df_second_currency)

        
        #arima
        last_30_days_second_currency = df_second_currency.tail(30)
        time_series_second_currency = pd.Series(last_30_days_second_currency['price'].values)
        model_second_currency = ARIMA(time_series_second_currency, order=(14, 1, 1))  # Dostosuj te wartości
        results_second_currency = model_second_currency.fit()
        forecast_steps_second_currency = 14
        forecast_second_currency = results_second_currency.get_forecast(steps=forecast_steps_second_currency)
        forecast_predicted_mean_no_index_second_currency = forecast_second_currency.predicted_mean.values
   


        print(json.dumps({
            "status": "success",
            "message": "timeseries are non-stationary.",
            "correlation": correlation,
            "basic_stats_first_currency":basic_stats,
            "basic_stats_second_currency":basic_stats_second_currency,
            "first_currency": {
                "first": {"type":chosen_trend,"y_pred": trend_function.tolist(), "r2": chosen_r2, "rmse": chosen_rmse,"dates":dates_frist_currency},
            },
            "second_currency":{
                "second": {"type":chosen_trend_second_currency,"y_pred": trend_function_second_currency.tolist(), "r2": chosen_r2_second_currency, "rmse": chosen_rmse_second_currency,"dates":dates_second_currency},               
            },
            "forecast_first_currency":forecast_predicted_mean_no_index.tolist(),
            "forecast_second_currency":forecast_predicted_mean_no_index_second_currency.tolist(),

        }))
    elif second_currency_id:
        correlation = calculate_correlation(df_first_currency, df_second_currency)

        print(json.dumps({
        "status": "success",
        "message": "second timeseries stationary and first is not.",
        "correlation": correlation,
    })) 
    else:   
         print(json.dumps({
            "status": "success",
            "message": "timeseries is non-stationary.",
            "basic_stats_first_currency":basic_stats,
            "first_currency": {
                "first": {"type":chosen_trend,"y_pred": trend_function.tolist(), "r2": chosen_r2, "rmse": chosen_rmse,"dates":dates_frist_currency},
            },
            "forecast_first_currency":forecast_predicted_mean_no_index.tolist(),

        }))
