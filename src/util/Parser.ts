import { JSDOM } from "jsdom";

export default class Parser {

    private DOM!: JSDOM; 

    constructor(htmlRaw: string) {
        this.DOM = new JSDOM(htmlRaw);
    }

    public getElementByClassName(class_name: string) {
        return this.DOM.window.document.getElementsByClassName(class_name)[0]; 
    }

    public getElementByTagName(tag_name: string) {
        return this.DOM.window.document.getElementsByTagName(tag_name)[0];
    }

}