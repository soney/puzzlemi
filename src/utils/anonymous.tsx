import * as generate from "aaa2";

let dic = {};

export const getAnonym = (id) => {
    if(dic[id]) return dic[id]
    else {
        const result = generate(1);
        const animal = result.split('-')[1];
        dic[id] = animal;
        return animal;
    }
}