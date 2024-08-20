"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8082;
app.use(express_1.default.json());
const sequelize = new sequelize_1.Sequelize('postgres://postgres:password@db:5432/chat_db');
app.post('/api/store', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, sender_id, receiver_id } = req.body;
    try {
        yield sequelize.query('INSERT INTO messages (content, sender_id, receiver_id) VALUES ($1, $2, $3)', { bind: [message, sender_id, receiver_id] });
        res.status(200).send('Message stored');
    }
    catch (err) {
        console.error('Error storing message:', err);
        res.status(500).send('Error storing message');
    }
}));
app.listen(PORT, () => {
    console.log(`API Storage service running on port ${PORT}`);
});
