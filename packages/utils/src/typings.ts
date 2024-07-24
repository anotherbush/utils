export type ObjectType = { [key: string | symbol]: any };

export type ArrayType = { [key: number]: any };

export type ValidKey = string | number | symbol | object;

export type ConstructorOf<T> = { new (...args: any[]): T };
