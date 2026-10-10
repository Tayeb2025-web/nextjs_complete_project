const mongoose = require('mongoose')
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectMongo = async () => {
    try {
        if(mongoose.connections[0].readyState) {
            return true;
        } else {
            await mongoose.connect(process.env.MONGO_URL)
            console.log('connect to DB successfully!');
        }
    } catch (error) {
        console.log('db connection has error ->' , error);
        
    }
}

export default connectMongo;