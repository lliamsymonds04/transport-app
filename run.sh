#!/bin/bash

# Start the server in the background
cd server
npm run dev &

# Start the client
cd ../client
npm run dev
