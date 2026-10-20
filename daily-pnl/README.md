# ALTRIX – Daily P&L image

Approved design – use exactly this layout for every daily post.

Input per day: date, STRIKE BOT profit ($), ALTRIX LIVE profit ($).

- STRIKE BOT: $1,000 portfolio → % = profit / 1000
- ALTRIX LIVE: $40,000 portfolio, RISK 3X → % = profit / 40000
- Total = sum of both

Edit in `template.html`: day name + date, both profits, both % (pill + meta box), total.
Render: `NODE_PATH=$(npm root -g) node shot.js $PWD/template.html $PWD/altrix-daily-DD.MM.YY.png`
