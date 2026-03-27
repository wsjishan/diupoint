"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
function loadHasher() {
    try {
        return require('bcrypt');
    }
    catch {
        return require('bcryptjs');
    }
}
const hasher = loadHasher();
function hashPassword(password) {
    return hasher.hash(password, 12);
}
function comparePassword(plainPassword, storedHash) {
    return hasher.compare(plainPassword, storedHash);
}
