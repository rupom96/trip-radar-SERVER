const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gxrbr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        console.log('db connected');

        const database = client.db("tripRadar");
        const serviceCollection = database.collection('services');
        const orderCollection = database.collection('orders');


        //GET services API
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })
        //GET single service API
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const single = await serviceCollection.findOne(query);
            res.json(single);
        })

        // //POST services API
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);

            const result = await serviceCollection.insertOne(service);
            console.log(result);
            res.json(result);
        })

        //GET orders API
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        //GET single order API
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific order', id);
            const query = { _id: ObjectId(id) };
            const singleOrder = await orderCollection.findOne(query);
            res.json(singleOrder);
        })


        // //POST ORDER API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('hit the order post api', order);

            const result = await orderCollection.insertOne(order);
            console.log(result);
            res.json(result);
        });

        //delete single order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            console.log('deleting order with id', result);
            res.json(result);
        });

        //update approval/status single order
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('updating order', id)
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Approved"
                },
            };
            const result = await orderCollection.updateOne(query, updateDoc, options);
            console.log('approving the order', result);

            res.json(result);
        })


    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Trip Radar server is running!')
});

app.listen(port, () => {
    console.log('Trip Radar server is running on port', port);
})