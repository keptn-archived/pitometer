"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2019, keptn Authors
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
class Spec {
    constructor(specjson, { sources }) {
        this.spec = '';
        this.sources = [];
        const definition = JSON.parse(specjson);
        definition.sources.forEach((source) => {
            this.sources.push(new Source(source.id, source.metrics));
        });
        console.log(this.sources);
    }
}
exports.Spec = Spec;
//# sourceMappingURL=Spec.js.map