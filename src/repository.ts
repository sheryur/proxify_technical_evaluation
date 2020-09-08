export class Repository<T extends { id: number }> {
    constructor(private db: Array<T>) {}

    getItem(index: number) {
        return this.db[index];
    }

    updateItem(item: T) {
        const index = this.db.findIndex(el => el.id === item.id);

        this.db[index] = item;
    }

    getLength() {
        return this.db.length;
    }

    printAll() {
        console.table(this.db);
    }
}
