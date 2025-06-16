import {Transform} from '../core/math/transform.ts';

export interface IObject {
    name: string;
    transform: Transform;
    update() : void;

}