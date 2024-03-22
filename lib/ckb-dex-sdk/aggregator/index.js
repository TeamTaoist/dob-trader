var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import { toCamelcase, toSnakeCase } from '../utils/case-parser';
export class Aggregator {
    constructor(url) {
        this.url = url;
    }
    baseRPC(method, req, url = this.url) {
        return __awaiter(this, void 0, void 0, function* () {
            let payload = {
                id: payloadId(),
                jsonrpc: '2.0',
                method,
                params: req ? toSnakeCase(req) : null,
            };
            const body = JSON.stringify(payload, null, '');
            try {
                let response = (yield axios({
                    method: 'post',
                    url,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 3000000,
                    data: body,
                })).data;
                if (response.error) {
                    console.error(response);
                }
                else {
                    return toCamelcase(response.result);
                }
            }
            catch (error) {
                console.error('error', error);
            }
        });
    }
    generateSubkeyUnlockSmt(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.baseRPC('generate_subkey_unlock_smt', req));
        });
    }
}
const payloadId = () => Date.now();
