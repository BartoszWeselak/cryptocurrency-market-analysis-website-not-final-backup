import unittest
from analysis import *

class TestTrendFunctions(unittest.TestCase):

    def setUp(self):
        # Tworzenie przykładowego DataFrame
        self.df = pd.DataFrame({'price': [3, 4, 2, 5, 6, 7, 8, 9, 10]})

    def test_linear_trend(self):
        y_pred, r2, rmse = calculate_linear_trend(self.df)
        self.assertIsNotNone(y_pred)
        self.assertIsNotNone(r2)
        self.assertIsNotNone(rmse)

    def test_logarithmic_trend(self):
        log_y_pred, log_r2, log_rmse = calculate_logarithmic_trend(self.df)
        self.assertIsNotNone(log_y_pred)
        self.assertIsNotNone(log_r2)
        self.assertIsNotNone(log_rmse)

    def test_power_trend(self):
        pow_y_pred, pow_r2, pow_rmse = calculate_power_trend(self.df)
        self.assertIsNotNone(pow_y_pred)
        self.assertIsNotNone(pow_r2)
        self.assertIsNotNone(pow_rmse)

    def test_exponential_trend(self):
        exp_y_pred, exp_r2, exp_rmse = calculate_exponential_trend(self.df)
        self.assertIsNotNone(exp_y_pred)
        self.assertIsNotNone(exp_r2)
        self.assertIsNotNone(exp_rmse)

    def test_compare_trends(self):
        r2_scores = [0.5, 0.6, 0.7, 0.8]
        rmse_scores = [0.1, 0.2, 0.15, 0.25]
        self.assertIsNotNone(compare_trends(r2_scores, rmse_scores))


if __name__ == '__main__':
    unittest.main()
