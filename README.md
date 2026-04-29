OrderFlow API
A high-throughput order management REST API built with Node.js and Express. Includes a live dashboard UI showing real-time order tracking, status updates, and revenue stats.
Features

Full CRUD REST API for order management
Live dashboard with real-time stats
Status flow: placed → confirmed → preparing → out_for_delivery → delivered
Filter by status and city
In-memory store (swap with PostgreSQL for production)
Built-in API Explorer UI

API Endpoints
MethodEndpointDescriptionGET/api/ordersList all ordersPOST/api/ordersCreate orderGET/api/orders/:idGet order by IDPATCH/api/orders/:id/statusUpdate statusDELETE/api/orders/:idCancel orderGET/api/statsOrder statisticsGET/healthHealth check
Run locally
bashnpm install
npm start
# Visit http://localhost:3000
Deploy on Railway / Render

Push to GitHub
Connect on railway.app or render.com
Set start command: npm start
Deploy

Tech Stack

Node.js + Express.js
In-memory store (production-ready swap: PostgreSQL + Prisma)
Vanilla JS dashboard

Built by
Nikhil Pandey — nikhilpandey5270@gmail.com