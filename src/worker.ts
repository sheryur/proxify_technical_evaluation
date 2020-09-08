import { DBItem, Statuses } from './models/db';
import { IncomingMessage } from 'http';

const http = require('http');
const https = require('https');

const processItem = (item: DBItem) => {
    if (!process || !process.send) {
        return;
    }

    if (item.status === Statuses.PROCESSING) {
        console.error(`Item: ${item.id} already in use`);
        return;
    }


    item.status = Statuses.PROCESSING;
    process.send(item);

    try {
        const url = item.url.startsWith('http') ? item.url : `http://${item.url}`;
        const protocol = url.startsWith('https') ? https : http;

        const request = protocol.get(item.url, (res: IncomingMessage) => {
            item.http_code = res.statusCode || null;
            item.status = Statuses.DONE;

            if (process && process.send) {
                process.send(item);
            }
        });

        request.on('error', () => {
            item.status = Statuses.ERROR;

            if (process && process.send) {
                process.send(item);
            }
        });

        request.end();
    } catch (e) {
        console.error(e);
        item.status = Statuses.ERROR;
        process.send(item);
    }
};

process.on('message', (item: DBItem) => {
    processItem(item);
});
