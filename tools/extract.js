const fs=require('fs'),vm=require('vm');
const s=fs.readFileSync(process.argv[2],'utf8').split('\n');
const a=s.findIndex(l=>/const ECONOMISTS = \[/.test(l)), b=s.findIndex(l=>/^\s*var BREAKS=/.test(l));
const code=s.slice(a,b).join('\n')+'\n;({ECONOMISTS,EDITORS_PICKS,REGIONS,TEXT,REGION_NAMES})';
fs.writeFileSync(process.argv[3],JSON.stringify(vm.runInNewContext(code,{})));
