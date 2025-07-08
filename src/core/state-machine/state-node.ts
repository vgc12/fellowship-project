import type {ITransition} from "@/core/state-machine/ITransition.ts";
import type {IPredicate} from "@/core/state-machine/IPredicate.ts";
import type {IState} from "@/core/state-machine/IState.ts";

export class StateNode {

    state: IState;
    transitions: Array<ITransition>;

    constructor(state: IState) {
        this.state = state;
        this.transitions = [];
    }

    addTransition(to: IState, predicate: IPredicate) {
        const transition: ITransition = {to, predicate};
        this.transitions.push(transition);
    }


}