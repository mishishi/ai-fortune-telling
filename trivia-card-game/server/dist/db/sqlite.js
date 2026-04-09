"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSqlDb = initSqlDb;
exports.getDb = getDb;
exports.saveDb = saveDb;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '../../../data/game.db');
let db = null;
async function initSqlDb() {
    const SQL = await (0, sql_js_1.default)();
    if (fs_1.default.existsSync(DB_PATH)) {
        const buffer = fs_1.default.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    }
    else {
        db = new SQL.Database();
    }
    return db;
}
function getDb() {
    if (!db)
        throw new Error('Database not initialized. Call initSqlDb() first.');
    return db;
}
function saveDb() {
    if (!db) {
        console.warn('saveDb() called but db is null');
        return;
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    const dir = path_1.default.dirname(DB_PATH);
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    fs_1.default.writeFileSync(DB_PATH, buffer);
}
