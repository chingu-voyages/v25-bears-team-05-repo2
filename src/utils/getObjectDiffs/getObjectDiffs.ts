import _ from "lodash";
const Diff = require('diff');

function getObjectDiffs(object: {[anything: string]: any}, base: {[anything: string]: any}, propertiesWhiteList: string[]) { 
    function changes(object: {[anything: string]: any}, base: {[anything: string]: any}) { 
        return _.transform(object, function(result: any, value, key) { 
            if (propertiesWhiteList.includes(key) && !_.isEqual(value, base[key])) { 
                const getDiffHTMLString = () => {
                    let diffString = "";
                    if (typeof base?.[key] === "string" && typeof value === "string") {
                        const diff = Diff.diffChars(base[key], value);
                        diff.forEach((part: any) => {
                            diffString += part.added ? `<span class="added">${part.value}</span>` :
                              part.removed ? `<span class="removed">${part.value}</span>` : part.value;
                          });
                    }
                    return diffString;
                };
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : getDiffHTMLString(); 
            } 
        }); 
    } 
    return changes(object, base);
}

export default getObjectDiffs;
