// @flow

import { processFile } from './parser';
import { saveRecordInDatabase } from './mongoService';

processFile('./tests/data/studium_input.txt', saveRecordInDatabase);
