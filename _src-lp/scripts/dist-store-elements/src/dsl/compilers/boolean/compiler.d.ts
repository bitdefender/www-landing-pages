import { Ctx } from "../../../dsl/utilty.js";
type Params = {
    expr: string;
    ctx: Ctx;
};
export declare const compiler: ({ expr, ctx }: Params) => boolean;
export {};
