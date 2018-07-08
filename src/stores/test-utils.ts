import { mapValues } from 'lodash';

export const mock = <T>(instance: T, mock: NestedPartial<T>) => {
    for (let k in mock) {
        const descriptor = Object.getOwnPropertyDescriptor(instance, k);
        Object.defineProperties(instance, mapValues(mock, value => ({
            value,
            enumerable: descriptor!.enumerable,
            configurable: true,
            writable: true,
        })));
    }
    return instance;
};

const f = (a: any[], b: any[]): any[] =>
    [].concat(...a.map(a2 => b.map((b2: any) => [].concat(a2 as any, b2 as any) as any) as any));

export const product = (a: any[], b: any[], ...c: any[]): any[][] => {
    if (!b || b.length === 0) {
        return a;
    }
    const [b2, ...c2] = c;
    const fab = f(a, b);
    return product(fab, b2, ...c2);
};