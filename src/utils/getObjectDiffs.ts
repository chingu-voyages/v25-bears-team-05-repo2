import gitDiff, { GitDiffOptions } from "git-diff";
import _ from "lodash";

var options: GitDiffOptions = { 
    color: true, // Add color to the git diff returned? 
    flags: null, // A space separated string of git diff flags from https://git-scm.com/docs/git-diff#_options 
    forceFake: true, // Do not try and get a real git diff, just get me a fake? Faster but may not be 100% accurate 
    noHeaders: true, // Remove the ugly @@ -1,3 +1,3 @@ header? 
    save: false, // Remember the options for next time? 
    wordDiff: false // Get a word diff instead of a line diff? 
}
    
const removedPreSequence = /\x1B\[31m-/g;
const addedPreSequence = /\x1B\[32m\+/g;
const noiseSequence = /\x1B\[\d\dm/g;

function getObjectDiffs(object: {[anything: string]: any}, base: {[anything: string]: any}) { 
    function changes(object: {[anything: string]: any}, base: {[anything: string]: any}) { 
        return _.transform(object, function(result: any, value, key) { 
            if (!_.isEqual(value, base[key])) { 
                const getAddedRemovedLog = () => {
                    const log: {added?: Array<string>, removed?: Array<string>} = {};
                    const diffString = gitDiff(base[key], value, options).replace(removedPreSequence, "!![[removed:").replace(addedPreSequence, "!![[added:").replace(noiseSequence, "");
                    const diffArray = diffString.split("!![[");
                    diffArray.forEach(item => {
                        const isAdded = item.match("added:");
                        const isRemoved = item.match("removed:");
                        if (isAdded) {
                            log.added = [...(log.added || []), item.replace("added:", "")];
                        }
                        if (isRemoved) {
                            log.removed = [...(log.removed || []), item.replace("removed:", "")];
                        }
                    });
                    console.log(log)
                    return log;
                };
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : getAddedRemovedLog(); 
            } 
        }); 
    } return changes(object, base);
}

export default getObjectDiffs;