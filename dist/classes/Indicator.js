"use strict";
/**
 * Copyright 2019, Dynatrace
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Indicator {
    /**
     * Constructor
     *
     * @param indicatorDefinition
     */
    constructor(indicatorDefinition) {
        this.id = indicatorDefinition.id;
        this.query = indicatorDefinition.query;
        this.grading = indicatorDefinition.grading;
        this.metadata = indicatorDefinition.metadata;
    }
    /**
     * Sets a source
     *
     * @param source
     */
    setSource(source) {
        this.source = source;
    }
    /**
     * Sets a grade
     *
     * @param grader
     */
    setGrader(grader) {
        this.grader = grader;
    }
    /**
     * Fetch and grade metrics
     * @param context The optional context that was passed to the run function
     */
    get(context = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.source.fetch(this.query);
            const grade = this.grader.grade(this.id, value, this.grading, context);
            return grade;
        });
    }
}
exports.Indicator = Indicator;
//# sourceMappingURL=Indicator.js.map