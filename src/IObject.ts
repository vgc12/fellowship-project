import {Transform} from './transform.ts';

export interface IObject {
    name: string;
    transform: Transform;
    update() : void;

}