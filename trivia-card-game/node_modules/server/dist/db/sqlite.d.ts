import { Database as SqlJsDatabase } from 'sql.js';
export declare function initSqlDb(): Promise<SqlJsDatabase>;
export declare function getDb(): SqlJsDatabase;
export declare function saveDb(): void;
