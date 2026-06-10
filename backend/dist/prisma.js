"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
let _prisma = null;
function getPrisma() {
    if (!_prisma) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('[Prisma] DATABASE_URL environment variable is not set!');
        }
        console.log('[PRISMA INIT] Using @prisma/adapter-pg with native Node.js pg pool');
        // Use native pg Pool (Node.js TCP) instead of Prisma's Rust engine
        // This bypasses the Rust binary TCP connectivity issues
        const pool = new pg_1.Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        _prisma = new client_1.PrismaClient({ adapter });
    }
    return _prisma;
}
// Lazy proxy so all existing code using `prisma.user.findUnique()` etc. works unchanged
const prisma = new Proxy({}, {
    get(_target, prop) {
        return getPrisma()[prop];
    },
});
exports.default = prisma;
//# sourceMappingURL=prisma.js.map