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
const Indicator_1 = require("./Indicator");
class Pitometer {
    constructor() {
        this.sources = [];
        this.indicators = [];
        this.graders = [];
    }
    /**
     * Adds a metrics source
     *
     * @param id The source ID as referenced in the performance specification
     * @param source The source plugin
     */
    addSource(id, source) {
        this.sources[id] = source;
        return this;
    }
    /**
     * Adds a grader
     * @param type The grader tyoe as referenced in the performance specification
     * @param grader The grader plugin
     */
    addGrader(type, grader) {
        this.graders[type] = grader;
        return this;
    }
    /**
     * Executes a Monspec definition
     *
     * @param spec The monspec as object
     * @param options An option object
    */
    run(spec, options) {
        return __awaiter(this, void 0, void 0, function* () {
            spec.indicators.forEach((idcdef) => {
                const indicator = new Indicator_1.Indicator(idcdef);
                if (this.sources[idcdef.source]) {
                    const src = this.sources[idcdef.source];
                    src.setOptions(options);
                    indicator.setSource(src);
                    const grader = this.graders[idcdef.grading.type];
                    indicator.setGrader(grader);
                    this.indicators[idcdef.id] = indicator;
                }
            });
            const promisedResults = Object.keys(this.indicators).map((key) => {
                const indicator = this.indicators[key];
                const indicatorResult = indicator.get(options.context);
                return indicatorResult;
            });
            const indicatorResults = yield Promise.all(promisedResults);
            const totalScore = indicatorResults.reduce((total, result) => {
                if (!result)
                    return total;
                return total + result.score;
            }, 0);
            const objectives = spec.objectives;
            if (objectives.pass <= totalScore) {
                return {
                    totalScore,
                    objectives,
                    indicatorResults,
                    result: 'pass',
                };
            }
            if (objectives.warning <= totalScore) {
                return {
                    totalScore,
                    objectives,
                    indicatorResults,
                    result: 'warning',
                };
            }
            return {
                totalScore,
                objectives,
                indicatorResults,
                result: 'fail',
            };
        });
    }
}
exports.Pitometer = Pitometer;
//# sourceMappingURL=Pitometer.js.map