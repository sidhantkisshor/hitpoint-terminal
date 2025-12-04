# 🚀 Hitpoint Terminal - Live Crypto Intelligence Platform

A professional-grade, real-time crypto analytics terminal built with Next.js 15, featuring live WebSocket data feeds, stunning visualizations, and a modern glassmorphic UI.

## ✨ Features

### Real-Time Data Feeds

1. **Live BTC Price Ticker**
   - Binance WebSocket connection for millisecond-level price updates
   - Color-coded price changes (green for up, red for down)
   - Real-time 24h percentage change tracking

2. **Fear & Greed Index**
   - Alternative.me API integration
   - Beautiful circular gauge visualization
   - Color-coded sentiment levels (Fear → Greed)
   - Updates every 5 minutes

3. **Long/Short Ratio**
   - Bybit API for trader positioning data
   - Visual sentiment indicator (Bullish/Bearish/Neutral)
   - Dynamic progress bar showing long vs short positions
   - Updates every 5 minutes

4. **Liquidation Bubble Visualizer** ⭐ **Killer Feature**
   - Real-time Bybit WebSocket liquidation stream
   - Animated bubble visualization
   - Size = liquidation value (log scale)
   - Color = Side (Green for shorts liquidated, Red for longs)
   - Auto-fade animation over 5 seconds
   - Live stats overlay

5. **Funding Rates Dashboard**
   - Binance Futures API
   - Top 4 crypto assets (BTC, ETH, SOL, XRP)
   - Bullish/Bearish bias indicators
   - Updates every 8 hours (funding rate schedule)

6. **Market Heatmap**
   - CoinGecko API for top 12 cryptocurrencies
   - Color intensity based on 24h price change
   - Grid layout with varying sizes
   - Real-time updates every minute

7. **Market Dominance**
   - BTC, ETH, and Altcoin market cap percentages
   - CoinGecko Global API
   - Stacked bar visualization
   - Updates every 5 minutes

8. **Economic Calendar**
   - Major economic events (NFP, CPI, FOMC, GDP)
   - Countdown timer to next event
   - Impact level indicators (High/Medium/Low)

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS Variables
- **State Management:** Zustand with subscribeWithSelector middleware
- **Real-Time:** Native WebSocket API
- **APIs:**
  - Binance WebSocket (BTC Price)
  - Bybit WebSocket (Liquidations)
  - Bybit REST API (Long/Short Ratio)
  - Binance Futures API (Funding Rates)
  - CoinGecko API (Market Data & Dominance)
  - Alternative.me API (Fear & Greed Index)

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design Features

- **Glassmorphism UI** - Modern glass-effect cards with backdrop blur
- **Neon Accents** - Cyberpunk-inspired neon green primary color
- **Animated Background** - Moving grid pattern with floating orbs
- **Smooth Animations** - Cubic bezier transitions for premium feel
- **Responsive Grid** - Bento box layout that adapts to all screen sizes
- **Dark Theme** - Pure black background with subtle borders

## 📊 Data Update Frequencies

| Component | Update Frequency |
|-----------|-----------------|
| BTC Price | Real-time (milliseconds) |
| Liquidations | Real-time (instant) |
| Fear & Greed | 5 minutes |
| Long/Short Ratio | 5 minutes |
| Funding Rates | 8 hours |
| Market Heatmap | 1 minute |
| Market Dominance | 5 minutes |

## 🚀 Performance Optimizations

- **WebSocket Management:** Proper cleanup on unmount
- **State Optimization:** Zustand's subscribeWithSelector to prevent unnecessary re-renders
- **Selective Updates:** Only update UI when data actually changes
- **Efficient Animations:** CSS transitions instead of JavaScript animations
- **Code Splitting:** Next.js automatic code splitting for optimal loading

## 📝 API Rate Limits

- **CoinGecko Free Tier:** 10-30 calls/minute
- **Binance:** No auth required for public endpoints
- **Bybit:** No auth required for public endpoints
- **Alternative.me:** No rate limits on Fear & Greed endpoint

## 🎯 Use Cases

- **Livestreaming:** Perfect for crypto trading streams on YouTube/Twitch
- **Trading:** Real-time market intelligence for day traders
- **Research:** Monitor market sentiment and positioning
- **Education:** Learn about market dynamics visually

## 🔮 Future Enhancements

- [ ] Add TradingView Lightweight Charts for price history
- [ ] Implement drag-and-drop layout customization
- [ ] Add more crypto pairs (ETH, SOL, etc.)
- [ ] WebSocket reconnection logic with exponential backoff
- [ ] Export screenshots/recordings of the terminal
- [ ] Dark/Light theme toggle
- [ ] Mobile-optimized layout
- [ ] User authentication for layout persistence

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🙏 Credits

Built with inspiration from:
- Bloomberg Terminal
- Binance Pro Interface
- TradingView Platform
- Coinglass Analytics

---

**⚡ Built with Next.js 15, Zustand, and Real-Time WebSockets**
