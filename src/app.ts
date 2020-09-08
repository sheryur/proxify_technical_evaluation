import { DBItem } from './models/db';
import { Repository } from './repository';
import { Worker } from 'cluster';

const DP_PATH = './db.json';
const WORKER_PATH = './worker';
const cluster = require('cluster');
const db: Array<DBItem> = require(DP_PATH);
const fs = require('fs');
const numCPUs = require('os').cpus().length;

const repo = new Repository<DBItem>(db);

const update = (item: DBItem) => {
    try {
        const writeStream = fs.createWriteStream(DP_PATH);
        const pathName = writeStream.path;

        repo.updateItem(item);
        repo.printAll();

        writeStream.write(JSON.stringify(db));

        writeStream.on('finish', () => {
            console.log(`Wrote all the array data to file ${pathName}`);
        });

        writeStream.on('error', (e: Error) => {
            console.error(`There is an error writing the file ${pathName} => ${e}`)
        });

        writeStream.end();
    } catch (e) {
        console.error(e);
    }
};

const start = () => {
    if (cluster.isMaster) {
        const workers = [];
        const maxWorkersAmount = Math.min(numCPUs, repo.getLength());

        for (let i = 0; i < maxWorkersAmount; i++) {
            const worker = cluster.fork();

            workers.push(worker);

            worker.on('message', (msg: DBItem) => {
                update(msg);
            })
        }

        for (let i = 0, j = 0, il = repo.getLength(); i < il; i++) {
            if (j == workers.length) {
                j = 0;
            }

            workers[j].send(repo.getItem(i));
        }


        cluster.on('exit', (worker: Worker) => {
            console.log(`worker ${worker.process.pid} died`);
        });
    } else {
        import(WORKER_PATH);
        console.log(`Worker ${process.pid} started`);
    }
};

start();
