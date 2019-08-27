"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const github = __importStar(require("@actions/github"));
const webhook_1 = require("@slack/webhook");
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK || '';
if (SLACK_WEBHOOK === '') {
    throw new Error('ERROR: Missing "SLACK_WEBHOOK"\nPlease configure "SLACK_WEBHOOK" as environment variable');
}
class Slack {
    constructor(icon_emoji, username, channel) {
        this.color = ['danger', 'good'];
        const params = {
            username,
            icon_emoji,
            channel
        };
        this.client = new webhook_1.IncomingWebhook(SLACK_WEBHOOK, params);
    }
    /**
     * Get slack blocks UI
     */
    get blocks() {
        const { sha, eventName, workflow, ref, action } = github.context;
        const { owner, repo } = github.context.repo;
        const blocks = {
            type: 'section',
            fields: [
                { type: 'mrkdwn', text: `*repo*\n${repo}` },
                { type: 'mrkdwn', text: `*sha*\n${sha}` },
                { type: 'mrkdwn', text: `*eventName*\n${eventName}` },
                { type: 'mrkdwn', text: `*workflow*\n${workflow}` },
                { type: 'mrkdwn', text: `*ref*\n${ref}` },
                { type: 'mrkdwn', text: `*action*\n${action}` }
            ]
        };
        return blocks;
    }
    /**
     * Generate slack payload
     */
    generatePayload(type, text) {
        const blocks = Object.assign({}, this.blocks, { text });
        const attachments = {
            color: this.color[type],
            blocks: [blocks]
        };
        const payload = {
            attachments: [attachments]
        };
        return payload;
    }
    /**
     * Notify information about github actions to Slack
     */
    notify(type, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const slack_text = { type: 'mrkdwn', text };
            let payload = this.generatePayload(type, slack_text);
            try {
                const result = yield this.client.send(payload);
                return result;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.Slack = Slack;