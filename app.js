const swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const express = require('express')
const crypto = require('crypto')
const app = express()


let LPs = new Map()


const peers = {}
/**************************** */



/******************************mongodb */


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:33033/mydb";

/* initialize database */ 
/*
let obj = [
  {"pair1":"A", "pair2":"B", "price":0.5, "fee":0.002, "qty":100},
  {"pair1":"B","pair2":"J","price":0.2,"fee":0.006,"qty":200},
  {"pair1":"A","pair2":"M","price":0.6,"fee":0.004,"qty":300}

]

MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db("LP");
  dbo.collection("liquidityProvider").insertMany(obj,function(err, result) {
    if (err) throw err;
    console.log('inserted !');
    db.close();
  });
});
*/

//db.liquidityProvider.insert({"pair1":"ltc", "pair2":"xrp", "price": 1, "fee": 1, "qty": 20})


app.get('/pairs', (req, res) => {
MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("LP");
    dbo.collection("liquidityProvider").find({}).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      res.send(result)
      
      db.close();
    });
  });
})


app.get('/:pair1/:pair2', (req, res) => {

    MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("LP");
      //console.log(" xx "+req.params.pair1,req.params.pair2)
      var query = { pair1: req.params.pair1,pair2:req.params.pair2 };
      dbo.collection("liquidityProvider").find(query,{projection :{pair1:1,pair2:1,_id:0}}).toArray(function(err, result) {
        if (err) throw err;
        //console.log(result);
        res.send(result)
        db.close();
      });
    });
   }
    )
    app.get('/list', (req, res) => {
        result=[]
        iterator=LPs.values()
        for (let index = 0; index < LPs.size; index++) {
          x=iterator.next().value
          console.log("x: ",x.toString());
          
          result.push(x.toString())
          
        }
        res.send(result)
      
       }
        )
/**************************************** */



/****************** */
// Counter for connections, used for identify connections
let connSeq = 0

const myId = crypto.randomBytes(32)
console.log('Your identity: ' + myId.toString('hex'))

const config = defaults({
  // peer-id
  id: myId,
})

/**
 * discovery-swarm library establishes a TCP p2p connection and uses
 * discovery-channel library for peer discovery
 */
var sw = swarm(config)






;(async ()=>{  

// Choose a random unused port for listening TCP peer connections
const port= await getPort()
//const portExpress= await getPort()
const portExpress = 3000

sw.listen(port)
console.log('Socket Listening to port: ' + port)
/**
   * The channel we are connecting to.
   * Peers should discover other peers in this channel
   */
sw.join('ramirez') // can be any id/name/hash

sw.on('connection', (conn, info)=> {

  //clients.push(client)
// Connection id
  const seq = connSeq
  const peerId = info.id.toString('hex')
// Save the connection
  if (!peers[peerId]) {
    peers[peerId] = {}
  }
  peers[peerId].conn = conn
  peers[peerId].seq = seq
  //LPs.set(conn,'http://'+info.host+':'+portExpress);
  connSeq++

  //console.log(info);
  //console.log(conn);
  console.log(`Connected #${seq} to peer: ${peerId}`)
  //console.log(`LPs: ${Array.from(LPs)} `);
  




    conn.write(`http://localhost:${portExpress}`)
    
    
  

// Keep alive TCP connection with peer
if (info.initiator) {
  try {
    conn.setKeepAlive(true, 600)
  } catch (exception) {
    console.log('exception', exception)
  }
}

conn.on('data', (data) => {
  LPs.set(conn,data)
  console.log(LPs.size);
   
  //fs.appendFileSync('peers.txt',LPs.get(conn)+'\n')
  //fs.appendFileSync('peers.txt',data+'\n')
  console.log("hosts:"+Array.from(LPs));
  console.log('Received Message from peer ' + peerId,
  '----> ' + data.toString());
})
  
  //conn.write('hello network')

  conn.on('close', () => {
    // Here we handle peer disconnection
    console.log(`Connection ${seq} closed, peer id: ${peerId}`)
    LPs.delete(conn)
    console.log("hosts:"+Array.from(LPs));
    console.log(LPs.size);
    
    //clients.pop(conn)
    // If the closing connection is the last connection with the peer, removes the peer
    if (peers[peerId].seq === seq) {
      delete peers[peerId]
      //LPs.delete(conn)

    }
    //console.log(`LPs: ${Array.from(LPs)} `);

  })




})

app.listen(portExpress, function () {
  console.log(`express app listening on port ${portExpress}!`)
})

})()
