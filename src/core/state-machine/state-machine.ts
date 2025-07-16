import type { ITransition } from "./ITransition.ts";
import { StateNode } from "./state-node";
import type {IState} from "@/core/state-machine/IState.ts";
import type {IPredicate} from "@/core/state-machine/IPredicate.ts";

export class StateMachine {
    private _currentState: StateNode;
    private readonly _states: { [key: string]: StateNode };
    private readonly _anyTransition: Array<ITransition>;
    constructor() {

        this._states = {};
        this._anyTransition = [];
    }

    update() {
        const transition = this.getTransition();
        if (transition) {
            this.changeState(transition.to);

        }
        this._currentState.state.update();
    }

    getTransition() {
        for (const transition of this._currentState.transitions) {
            if (transition.predicate.evaluate()) {
                return transition;
            }
        }

        for (const transition of this._anyTransition) {
            if (transition.predicate.evaluate()) {
                return transition;
            }
        }

        return null;
    }

    private changeState(to: IState) {
        if (this._currentState.state === to) {
            return;
        }

        this._currentState = this._states[to.constructor.name];
    }

    setState(state: IState) {
        this._currentState = this._states[state.constructor.name];
    }

    addTransition(from: IState, to: IState, condition: IPredicate) {
        this.getOrAddNode(from).addTransition(to, condition);
    }

    addAnyTransition(to: IState, condition: IPredicate) {
        this._anyTransition.push({to, predicate: condition});
    }

    getOrAddNode(state: IState) {
        let node = this._states[state.constructor.name]
        if (!node) {
            node = new StateNode(state);
            this._states[state.constructor.name] = node;
        }

        return node;
    }
}