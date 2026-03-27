"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClient = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = globalThis.__diupointPrisma__ ?? new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalThis.__diupointPrisma__ = exports.prisma;
}
var client_2 = require("@prisma/client");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return client_2.PrismaClient; } });
