export class Utils {

    public isStringInArray(src: string, arr : string[]) : boolean {
        return arr.find(e => src.indexOf(e) > -1) !== undefined;
    }
}
