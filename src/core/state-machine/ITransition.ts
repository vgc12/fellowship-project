import type {IPredicate} from "@/core/state-machine/IPredicate.ts";
import type {IState} from "@/core/state-machine/IState.ts";

export interface ITransition {

    to: IState;
    predicate: IPredicate;

}