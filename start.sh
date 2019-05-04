#!/bin/bash

mongod --port 33033&
sleep 5s
mongo --port 33033 LP --eval 'db.runCommand({insert: "liquidityProvider", documents: [ { pair1: "waves", pair2: "neo", price: 1 , fee: 5 , qty: 10}]});'
mongo --port 33033 LP --eval 'db.runCommand({insert: "liquidityProvider", documents: [ { pair1: "waves", pair2: "ltc", price: 1 , fee: 1 , qty: 20 }]});'


npm start
