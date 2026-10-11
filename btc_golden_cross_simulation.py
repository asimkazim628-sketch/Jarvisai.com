import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_btc_data(days=60, initial_price=60000.0, annual_drift=0.15, annual_volatility=0.70, seed=42):
    """
    Simulates daily Bitcoin price data using Geometric Brownian Motion (GBM).

    Parameters:
        days (int): Number of days to simulate (default: 60)
        initial_price (float): Starting BTC price in USD
        annual_drift (float): Expected annual return
        annual_volatility (float): Annualized volatility
        seed (int): Random seed for reproducibility
    """
    np.random.seed(seed)
    dt = 1 / 365.0  # daily time step

    # Calculate daily parameters
    daily_drift = (annual_drift - 0.5 * annual_volatility**2) * dt
    daily_volatility = annual_volatility * np.sqrt(dt)

    # Generate daily returns
    random_shocks = np.random.normal(0, 1, days)
    price_paths = np.zeros(days)

    current_price = initial_price
    start_date = datetime.now().date() - timedelta(days=days)
    dates = [start_date + timedelta(days=i) for i in range(days)]

    for i in range(days):
        if i == 0:
            price_paths[i] = current_price
        else:
            daily_return = np.exp(daily_drift + daily_volatility * random_shocks[i])
            current_price *= daily_return
            price_paths[i] = current_price

    df = pd.DataFrame({
        'Date': dates,
        'Price': price_paths
    })
    df.set_index('Date', inplace=True)
    return df

def run_simulation():
    # 1. Generate 60 days of BTC price data
    df = generate_btc_data(days=60)

    # 2. Calculate 7-day and 30-day Moving Averages using pandas
    df['MA7'] = df['Price'].rolling(window=7).mean()
    df['MA30'] = df['Price'].rolling(window=30).mean()

    # 3. Implement Golden Cross / Death Cross Trading Algorithm
    initial_cash = 10000.0
    cash = initial_cash
    btc_position = 0.0

    ledger = []

    # Iterate through days
    for date, row in df.iterrows():
        price = row['Price']
        ma7 = row['MA7']
        ma30 = row['MA30']

        action = "HOLD"

        # Check signal if both MAs are calculated
        if not pd.isna(ma7) and not pd.isna(ma30):
            prev_idx = df.index.get_loc(date) - 1
            if prev_idx >= 0:
                prev_ma7 = df.iloc[prev_idx]['MA7']
                prev_ma30 = df.iloc[prev_idx]['MA30']

                # Check for Golden Cross (MA7 crosses above MA30)
                if prev_ma7 <= prev_ma30 and ma7 > ma30:
                    if cash > 0:
                        btc_position = cash / price
                        cash = 0.0
                        action = "BUY (Golden Cross)"

                # Check for Death Cross (MA7 crosses below MA30)
                elif prev_ma7 >= prev_ma30 and ma7 < ma30:
                    if btc_position > 0:
                        cash = btc_position * price
                        btc_position = 0.0
                        action = "SELL (Death Cross)"

        total_value = cash + (btc_position * price)

        ledger.append({
            'Date': date,
            'Price ($)': round(price, 2),
            'MA7 ($)': round(ma7, 2) if not pd.isna(ma7) else "N/A",
            'MA30 ($)': round(ma30, 2) if not pd.isna(ma30) else "N/A",
            'Action': action,
            'Cash ($)': round(cash, 2),
            'BTC Position': round(btc_position, 6),
            'Portfolio Value ($)': round(total_value, 2)
        })

    ledger_df = pd.DataFrame(ledger)

    # Print Daily Ledger
    print("\n" + "="*95)
    print(" DAILY TRADING LEDGER (60-Day BTC Golden Cross Simulation)")
    print("="*95)
    print(ledger_df.to_string(index=False))
    print("="*95)

    # 4. Final Portfolio Performance Summary
    final_price = df['Price'].iloc[-1]
    final_portfolio_val = ledger_df['Portfolio Value ($)'].iloc[-1]
    total_return_pct = ((final_portfolio_val - initial_cash) / initial_cash) * 100

    # Buy & Hold strategy comparison (buy on day 1 and hold)
    buy_hold_btc = initial_cash / df['Price'].iloc[0]
    buy_hold_final_val = buy_hold_btc * final_price
    buy_hold_return_pct = ((buy_hold_final_val - initial_cash) / initial_cash) * 100

    print("\n" + "="*60)
    print(" FINAL PORTFOLIO PERFORMANCE SUMMARY")
    print("="*60)
    print(f" Initial Investment:         ${initial_cash:,.2f}")
    print(f" Final Portfolio Value:      ${final_portfolio_val:,.2f}")
    print(f" Golden Cross Return:        {total_return_pct:+.2f}%")
    print("-" * 60)
    print(f" Initial BTC Price (Day 1):  ${df['Price'].iloc[0]:,.2f}")
    print(f" Final BTC Price (Day 60):  ${final_price:,.2f}")
    print(f" Buy & Hold Final Value:     ${buy_hold_final_val:,.2f}")
    print(f" Buy & Hold Return:          {buy_hold_return_pct:+.2f}%")
    print("="*60 + "\n")

if __name__ == "__main__":
    run_simulation()
