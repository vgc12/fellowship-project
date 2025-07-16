import type {IPredicate} from "@/core/state-machine/IPredicate.ts";

export class FuncPredicate implements IPredicate {
    private readonly _predicate: () => boolean;

    constructor(func: () => boolean) {
        this._predicate = func;
    }

    evaluate(): boolean {
        return this._predicate();
    }
}