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
import { ISource, IGrader, IRunResult, IPerfspec, IOptions } from '../types';
export declare class Pitometer {
    private sources;
    private indicators;
    private graders;
    constructor();
    /**
     * Adds a metrics source
     *
     * @param id The source ID as referenced in the performance specification
     * @param source The source plugin
     */
    addSource(id: string, source: ISource): Pitometer;
    /**
     * Adds a grader
     * @param type The grader tyoe as referenced in the performance specification
     * @param grader The grader plugin
     */
    addGrader(type: string, grader: IGrader): Pitometer;
    /**
     * Executes a Monspec definition
     *
     * @param spec The monspec as object
     * @param options An option object
    */
    run(spec: IPerfspec, options: IOptions): Promise<IRunResult>;
}
