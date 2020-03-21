import { listenMessages } from './connection.js';
import { onMessage } from './on-message.js';

listenMessages( onMessage );
